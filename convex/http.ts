import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * HTTP endpoint for receiving Claude Code hook events.
 * POST /event - Accepts JSON event payload and stores in database.
 *
 * Always returns 200 to avoid triggering retries from the hook.
 * Errors are logged to console for debugging.
 */
http.route({
  path: "/event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const event = await request.json();
      await ctx.runMutation(internal.events.store, event);
      return new Response(null, { status: 200 });
    } catch (error) {
      // Log but return 200 to not trigger retries
      console.error("Event storage failed:", error);
      return new Response(null, { status: 200 });
    }
  }),
});

export default http;
