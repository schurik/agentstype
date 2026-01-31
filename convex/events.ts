import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Internal mutation for storing events from the HTTP endpoint.
 * Not exposed to clients - only callable via ctx.runMutation(internal.events.store, ...)
 */
export const store = internalMutation({
  args: {
    // Identity
    eventId: v.optional(v.string()),
    sessionId: v.string(),
    projectName: v.string(),

    // Event data
    type: v.string(),
    timestamp: v.number(),

    // Tool-specific (optional)
    tool: v.optional(v.string()),
    toolInput: v.optional(v.any()),
    toolOutput: v.optional(v.any()),

    // Content (optional)
    prompt: v.optional(v.string()),
    response: v.optional(v.string()),

    // Metadata
    cwd: v.optional(v.string()),
    redacted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Generate eventId server-side if not provided
    const eventId = args.eventId ?? crypto.randomUUID();

    const id = await ctx.db.insert("events", {
      eventId,
      sessionId: args.sessionId,
      projectName: args.projectName,
      type: args.type,
      timestamp: args.timestamp,
      tool: args.tool,
      toolInput: args.toolInput,
      toolOutput: args.toolOutput,
      prompt: args.prompt,
      response: args.response,
      cwd: args.cwd,
      redacted: args.redacted,
    });

    return eventId;
  },
});
