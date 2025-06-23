import { TRPCError } from '@trpc/server';

import { serverDBEnv } from '@/config/db';
import { UserModel } from '@/database/models/user';
import { LobeChatDatabase } from '@/database/type';

import { asyncTrpc } from './init';

export const asyncAuth = asyncTrpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (ctx.secret !== serverDBEnv.KEY_VAULTS_SECRET || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const result = await UserModel.findById(ctx.serverDB as LobeChatDatabase, ctx.userId);

  if (!result) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'user is invalid' });
  }

  return opts.next({
    ctx: { userId: ctx.userId },
  });
});
