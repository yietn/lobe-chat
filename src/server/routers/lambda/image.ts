import debug from 'debug';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { JWTPayload } from '@/const/auth';
import { AsyncTaskModel } from '@/database/models/asyncTask';
import {
  NewGeneration,
  NewGenerationBatch,
  generationBatches,
  generations,
} from '@/database/schemas';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { keyVaults, serverDatabase } from '@/libs/trpc/lambda/middleware';
import { createAsyncServerClient } from '@/server/routers/async';
import {
  AsyncTaskError,
  AsyncTaskErrorType,
  AsyncTaskStatus,
  AsyncTaskType,
} from '@/types/asyncTask';

// Create debug logger
const log = debug('lobe-image:lambda');

const imageProcedure = authedProcedure
  .use(serverDatabase)
  .use(keyVaults)
  .use(async (opts) => {
    const { ctx } = opts;

    return opts.next({
      ctx: {
        asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
      },
    });
  });

const createImageInputSchema = z.object({
  generationTopicId: z.string(),
  provider: z.string(),
  model: z.string(),
  params: z
    .object({
      prompt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      seed: z.number().nullable().optional(),
      steps: z.number().optional(),
      cfg: z.number().optional(),
      // 其他标准化参数...
    })
    .passthrough(), // 允许其他未定义的参数通过
});

export type CreateImageServicePayload = z.infer<typeof createImageInputSchema>;

export const imageRouter = router({
  createImage: imageProcedure.input(createImageInputSchema).mutation(async ({ input, ctx }) => {
    const { userId, serverDB, asyncTaskModel } = ctx;
    const { generationTopicId, provider, model, params } = input;

    log('Starting image creation process: %O', {
      userId,
      generationTopicId,
      provider,
      model,
      prompt: params.prompt,
      imageParams: { width: params.width, height: params.height, steps: params.steps },
    });

    // 在事务中创建 generationBatch 和 4 个 generation
    const result = await serverDB.transaction(async (tx) => {
      log('Starting database transaction for image generation');

      // 1. 创建 generationBatch
      const newBatch: NewGenerationBatch = {
        userId,
        generationTopicId,
        provider,
        model,
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        config: params, // 将整个 params 作为 config 存储
      };

      log('Creating generation batch: %O', {
        generationTopicId,
        provider,
        model,
        prompt: params.prompt,
      });

      const [createdBatch] = await tx.insert(generationBatches).values(newBatch).returning();

      log('Generation batch created successfully: %s', createdBatch.id);

      // 2. 创建 4 个 generation（一期固定生成 4 张）
      const newGenerations: NewGeneration[] = Array.from({ length: 4 }, () => ({
        userId,
        generationBatchId: createdBatch.id,

        // FIXME: 后面单独会修这块问题，先不管
        // seed: params.seed?.toString(), // 每个 generation 可以有不同的 seed
      }));

      log('Creating %d generations for batch: %s', newGenerations.length, createdBatch.id);

      const createdGenerations = await tx.insert(generations).values(newGenerations).returning();

      log(
        'Generations created successfully: %O',
        createdGenerations.map((g) => g.id),
      );

      // 3. 并发为每个 generation 创建 asyncTask 并触发异步生图
      log('Creating async tasks for generations');

      const asyncTasks = await Promise.all(
        createdGenerations.map(async (generation) => {
          // 创建 asyncTask
          const asyncTaskId = await asyncTaskModel.create({
            status: AsyncTaskStatus.Pending,
            type: AsyncTaskType.ImageGeneration,
          });

          log('Created async task %s for generation %s', asyncTaskId, generation.id);

          // 更新 generation 的 asyncTaskId
          await tx
            .update(generations)
            .set({ asyncTaskId })
            .where(and(eq(generations.id, generation.id), eq(generations.userId, userId)));

          return { generation, asyncTaskId };
        }),
      );

      log('All async tasks created, preparing to trigger image generation');

      // 4. 并发触发所有异步生图任务
      const asyncCaller = await createAsyncServerClient(userId, ctx.jwtPayload as JWTPayload);
      log('Async caller created, jwtPayload: %O', ctx.jwtPayload);

      log('Triggering %d async image generation tasks', asyncTasks.length);

      await Promise.all(
        asyncTasks.map(async ({ generation, asyncTaskId }) => {
          try {
            log('Triggering async task %s for generation %s', asyncTaskId, generation.id);

            await asyncCaller.image.createImage.mutate({
              taskId: asyncTaskId,
              generationId: generation.id,
              provider,
              model,
              params,
            });

            log('Successfully triggered async task %s', asyncTaskId);
          } catch (e) {
            log('Failed to trigger async task %s: %O', asyncTaskId, e);
            console.error('[createImage] async task trigger error:', e);

            await asyncTaskModel.update(asyncTaskId, {
              error: new AsyncTaskError(
                AsyncTaskErrorType.TaskTriggerError,
                'trigger image generation async task error. Please make sure the APP_URL is available from your server.',
              ),
              status: AsyncTaskStatus.Error,
            });
          }
        }),
      );

      log('All async tasks triggered, transaction completed');

      return {
        batch: createdBatch,
        generations: createdGenerations,
      };
    });

    log('Image creation process completed successfully: %O', {
      batchId: result.batch.id,
      generationCount: result.generations.length,
      generationIds: result.generations.map((g) => g.id),
    });

    return {
      success: true,
      data: result,
    };
  }),
});

export type ImageRouter = typeof imageRouter;
