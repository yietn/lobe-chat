import debug from 'debug';
import { z } from 'zod';

import { AsyncTaskModel } from '@/database/models/asyncTask';
import { GenerationModel } from '@/database/models/generation';
import { CreateImageParams } from '@/libs/model-runtime/types/image';
import { asyncAuthedProcedure, asyncRouter as router } from '@/libs/trpc/async';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import {
  transformImageForGeneration,
  uploadImageForGeneration,
} from '@/server/services/generation';
import { AsyncTaskError, AsyncTaskStatus } from '@/types/asyncTask';

const log = debug('lobe-image:async');

const imageProcedure = asyncAuthedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
      generationModel: new GenerationModel(ctx.serverDB, ctx.userId),
    },
  });
});

const createImageInputSchema = z.object({
  taskId: z.string(),
  generationId: z.string(),
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
    })
    .passthrough(),
});

export const imageRouter = router({
  createImage: imageProcedure.input(createImageInputSchema).mutation(async ({ input, ctx }) => {
    const { taskId, generationId, provider, model, params } = input;

    log('Starting async image generation: %O', {
      taskId,
      generationId,
      provider,
      model,
      prompt: params.prompt,
      imageParams: { width: params.width, height: params.height, steps: params.steps },
    });

    log('Updating task status to Processing: %s', taskId);
    await ctx.asyncTaskModel.update(taskId, { status: AsyncTaskStatus.Processing });

    try {
      log('Initializing agent runtime for provider: %s', provider);
      const agentRuntime = await initAgentRuntimeWithUserPayload(provider, ctx.jwtPayload);

      log('Agent runtime initialized, calling createImage');
      const response = await agentRuntime.createImage({
        model,
        params: params as unknown as CreateImageParams,
      });

      if (!response) {
        log('Create image response is empty');
        throw new Error('Create image response is empty');
      }

      log('Image generation successful: %O', {
        imageUrl: response.imageUrl,
        width: response.width,
        height: response.height,
      });

      const { imageUrl, width, height } = response;
      const { image, thumbnailImage } = await transformImageForGeneration(imageUrl);
      const { imageUrl: uploadedImageUrl, thumbnailImageUrl } = await uploadImageForGeneration(
        image,
        thumbnailImage,
      );

      log('Updating generation asset: %s', generationId);
      await ctx.generationModel.update(generationId, {
        asset: {
          originalUrl: imageUrl,
          url: uploadedImageUrl,
          width: width ?? image.width,
          height: height ?? image.height,
          thumbnailUrl: thumbnailImageUrl,
        },
      });

      log('Updating task status to Success: %s', taskId);
      await ctx.asyncTaskModel.update(taskId, {
        status: AsyncTaskStatus.Success,
      });

      log('Async image generation completed successfully: %s', taskId);
    } catch (e) {
      log('Async image generation failed: %O', {
        taskId,
        generationId,
        error: (e as Error).message,
      });

      await ctx.asyncTaskModel.update(taskId, {
        error: new AsyncTaskError((e as Error).name, (e as Error).message),
        status: AsyncTaskStatus.Error,
      });

      log('Task status updated to Error: %s', taskId);
    }
  }),
});
