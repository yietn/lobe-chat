import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { AsyncTaskModel } from '@/database/models/asyncTask';
import { GenerationModel } from '@/database/models/generation';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { FileService } from '@/server/services/file';
import { AsyncTaskError, AsyncTaskStatus } from '@/types/asyncTask';
import { Generation } from '@/types/generation';

const generationProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
      generationModel: new GenerationModel(ctx.serverDB, ctx.userId),
      fileService: new FileService(ctx.serverDB, ctx.userId),
    },
  });
});

export type GetGenerationStatusResult = {
  status: AsyncTaskStatus;
  generation: Generation | null;
  error: AsyncTaskError | null;
};

export const generationRouter = router({
  getGenerationStatus: generationProcedure
    .input(z.object({ generationId: z.string(), asyncTaskId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check for timeout tasks before querying
      await ctx.asyncTaskModel.checkTimeoutTasks([input.asyncTaskId]);

      const asyncTask = await ctx.asyncTaskModel.findById(input.asyncTaskId);
      if (!asyncTask) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Async task not found' });
      }

      const { status, error } = asyncTask;
      const result: GetGenerationStatusResult = {
        status: status as AsyncTaskStatus,
        generation: null,
        error: null,
      };

      if (asyncTask.status === AsyncTaskStatus.Success) {
        const generation = await ctx.generationModel.findByIdAndTransform(input.generationId);
        if (!generation) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Generation not found' });
        }

        result.generation = generation;
      } else if (asyncTask.status === AsyncTaskStatus.Error) {
        result.error = error as AsyncTaskError;
      }

      return result;
    }),

  deleteGeneration: generationProcedure
    .input(z.object({ generationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.generationModel.deleteGenerationAndFile(input.generationId);

      if (!result) return;

      // If there's an associated file that was deleted, also delete it from S3
      if (result.deletedFile) {
        await ctx.fileService.deleteFile(result.deletedFile.url!);
      }
    }),
});

export type GenerationRouter = typeof generationRouter;
