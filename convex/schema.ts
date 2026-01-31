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
  })
    .index("by_project", ["projectName", "timestamp"])
    .index("by_session", ["sessionId", "timestamp"]),
});
