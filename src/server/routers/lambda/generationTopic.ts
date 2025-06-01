import { z } from 'zod';

import { GenerationTopicModel } from '@/database/models/generationTopic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const generationTopicProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: { generationTopicModel: new GenerationTopicModel(ctx.serverDB, ctx.userId) },
  });
});

export const generationTopicRouter = router({
  createTopic: generationTopicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.generationTopicModel.create(input.title);
      return data.id;
    }),
  getAllGenerationTopics: generationTopicProcedure.query(async ({ ctx }) => {
    return ctx.generationTopicModel.queryAll();
  }),
});

export type GenerationTopicRouter = typeof generationTopicRouter;
