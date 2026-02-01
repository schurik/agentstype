import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    // Identity
    eventId: v.string(),
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
  })
    .index("by_project", ["projectName", "timestamp"])
    .index("by_session", ["sessionId", "timestamp"]),
});
