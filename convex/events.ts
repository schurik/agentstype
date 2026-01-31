import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

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

/**
 * Query for listing events with optional filters.
 * Enables real-time frontend subscriptions via useQuery(api.events.listEvents).
 *
 * @param projectName - Filter by project name (uses by_project index)
 * @param sessionId - Filter by session ID (uses by_session index)
 * @param limit - Maximum number of events to return (default: 100)
 * @returns Array of event documents, ordered by timestamp DESC (most recent first)
 */
export const listEvents = query({
  args: {
    projectName: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    let events;

    if (args.projectName) {
      // Use by_project index for project-filtered queries
      events = await ctx.db
        .query("events")
        .withIndex("by_project", (q) => q.eq("projectName", args.projectName!))
        .order("desc")
        .take(limit);
    } else if (args.sessionId) {
      // Use by_session index for session-filtered queries
      events = await ctx.db
        .query("events")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId!))
        .order("desc")
        .take(limit);
    } else {
      // No filter - return most recent events across all projects
      events = await ctx.db.query("events").order("desc").take(limit);
    }

    return events;
  },
});
