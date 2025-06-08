import { z } from 'zod';

import { GenerationBatchModel } from '@/database/models/generationBatch';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const generationBatchProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      generationBatchModel: new GenerationBatchModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const generationBatchRouter = router({
  getGenerationBatches: generationBatchProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.generationBatchModel.queryGenerationBatchesByTopicIdWithGenerations(input.topicId);
    }),
});

export type GenerationBatchRouter = typeof generationBatchRouter;
