import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { runAgent } from "./adk-agent";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Accessibility agent router
  agent: router({
    query: publicProcedure
      .input(
        z.object({
          query: z.string().min(1, "Query cannot be empty"),
          sessionId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id.toString() || "anonymous";
        const sessionId = input.sessionId || `session_${Date.now()}`;

        try {
          const result = await runAgent(input.query, sessionId, userId);

          if (!result.success) {
            throw new Error(result.error || "Agent failed to process query");
          }

          return {
            success: true,
            response: result.response || "No response generated",
            sessionId: result.session_id,
          };
        } catch (error) {
          console.error("Agent error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Failed to process query"
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
