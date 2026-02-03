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

    // Tool-specific (for pre_tool_use, post_tool_use, post_tool_use_failure, permission_request)
    tool: v.optional(v.string()),
    toolInput: v.optional(v.any()),
    toolResponse: v.optional(v.any()),
    toolUseId: v.optional(v.string()),
    success: v.optional(v.boolean()),

    // Error info (for post_tool_use_failure)
    error: v.optional(v.string()),
    isInterrupt: v.optional(v.boolean()),

    // User prompt (for user_prompt_submit)
    prompt: v.optional(v.string()),

    // Response (for stop, subagent_stop)
    response: v.optional(v.string()),
    stopHookActive: v.optional(v.boolean()),

    // Session events
    source: v.optional(v.string()), // for session_start: startup, resume, clear, compact
    reason: v.optional(v.string()), // for session_end: clear, logout, etc.

    // Notification (for notification)
    message: v.optional(v.string()),
    notificationType: v.optional(v.string()),

    // Pre-compact (for pre_compact)
    trigger: v.optional(v.string()), // manual, auto
    customInstructions: v.optional(v.string()),

    // Subagent (for subagent_start, subagent_stop)
    agentId: v.optional(v.string()),
    agentType: v.optional(v.string()),

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
      toolResponse: args.toolResponse,
      toolUseId: args.toolUseId,
      success: args.success,
      error: args.error,
      isInterrupt: args.isInterrupt,
      prompt: args.prompt,
      response: args.response,
      stopHookActive: args.stopHookActive,
      source: args.source,
      reason: args.reason,
      message: args.message,
      notificationType: args.notificationType,
      trigger: args.trigger,
      customInstructions: args.customInstructions,
      agentId: args.agentId,
      agentType: args.agentType,
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
    agentId: v.optional(v.string()),
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

    // Post-filter by agentId if provided (no index, but fine for small datasets)
    if (args.agentId) {
      events = events.filter((e) => e.agentId === args.agentId);
    }

    return events;
  },
});

/**
 * Query for listing unique projects with their most recent activity.
 * Enables project filter dropdown population.
 *
 * @returns Array of { name: string, lastActivity: number } sorted by lastActivity DESC
 */
export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    // Get all events to extract unique projects
    const events = await ctx.db.query("events").collect();

    // Reduce to unique projects with most recent timestamp
    const projectMap = new Map<string, number>();
    for (const event of events) {
      const existing = projectMap.get(event.projectName) ?? 0;
      if (event.timestamp > existing) {
        projectMap.set(event.projectName, event.timestamp);
      }
    }

    // Convert to array and sort by lastActivity DESC
    return Array.from(projectMap.entries())
      .map(([name, lastActivity]) => ({ name, lastActivity }))
      .sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

/**
 * Query for listing sessions within a project with aggregated metadata.
 * Enables sidebar session list population.
 *
 * @param projectName - The project to get sessions for
 * @returns Array of session objects sorted by lastTimestamp DESC (most recent first)
 */
export const listSessionsForProject = query({
  args: {
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all events for project using index
    const events = await ctx.db
      .query("events")
      .withIndex("by_project", (q) => q.eq("projectName", args.projectName))
      .collect();

    // Reduce to unique sessions with metadata
    const sessionMap = new Map<
      string,
      {
        sessionId: string;
        firstTimestamp: number;
        lastTimestamp: number;
        eventCount: number;
        goal: string | null;
        hasEnded: boolean;
      }
    >();

    for (const event of events) {
      const existing = sessionMap.get(event.sessionId);
      if (!existing) {
        sessionMap.set(event.sessionId, {
          sessionId: event.sessionId,
          firstTimestamp: event.timestamp,
          lastTimestamp: event.timestamp,
          eventCount: 1,
          goal:
            event.type === "user_prompt_submit" ? event.prompt ?? null : null,
          hasEnded: event.type === "session_end",
        });
      } else {
        existing.eventCount++;
        if (event.timestamp < existing.firstTimestamp) {
          existing.firstTimestamp = event.timestamp;
        }
        if (event.timestamp > existing.lastTimestamp) {
          existing.lastTimestamp = event.timestamp;
        }
        if (event.type === "user_prompt_submit" && !existing.goal) {
          existing.goal = event.prompt ?? null;
        }
        if (event.type === "session_end") {
          existing.hasEnded = true;
        }
      }
    }

    // Sort by most recent activity
    return Array.from(sessionMap.values()).sort(
      (a, b) => b.lastTimestamp - a.lastTimestamp
    );
  },
});

/**
 * Query for listing agents within a session with event counts.
 * Enables sidebar agent list population.
 *
 * @param sessionId - The session to get agents for
 * @returns Array of agent objects with agentId, agentType, and eventCount
 */
export const listAgentsForSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all events for session using index
    const events = await ctx.db
      .query("events")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Find subagent_start events to get agents
    const agentMap = new Map<
      string,
      {
        agentId: string;
        agentType: string | null;
        eventCount: number;
      }
    >();

    for (const event of events) {
      // Register agent from subagent_start event
      if (event.type === "subagent_start" && event.agentId) {
        if (!agentMap.has(event.agentId)) {
          agentMap.set(event.agentId, {
            agentId: event.agentId,
            agentType: event.agentType ?? null,
            eventCount: 0,
          });
        }
      }
      // Count events per agent
      if (event.agentId) {
        const agent = agentMap.get(event.agentId);
        if (agent) {
          agent.eventCount++;
        }
      }
    }

    return Array.from(agentMap.values());
  },
});
