import { getServerDB } from '@/database/core/db-adaptor';

import { asyncAuth } from './asyncAuth';
import { asyncTrpc } from './init';

export const publicProcedure = asyncTrpc.procedure;

export const asyncRouter = asyncTrpc.router;

const dbMiddleware = asyncTrpc.middleware(async (opts) => {
  const serverDB = await getServerDB();

  return opts.next({
    ctx: { serverDB },
  });
});

export const asyncAuthedProcedure = asyncTrpc.procedure.use(dbMiddleware).use(asyncAuth);

export const createAsyncCallerFactory = asyncTrpc.createCallerFactory;
