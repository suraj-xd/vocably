import { ORPCError, os } from "@orpc/server";
import { env } from "@vocably/env/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  if (context.session.user.id !== env.ADMIN_USER_ID) {
    throw new ORPCError("FORBIDDEN");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const adminProcedure = publicProcedure.use(requireAdmin);
