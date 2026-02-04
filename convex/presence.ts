import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";

const presence = new Presence(components.presence);

// Send heartbeat to track viewer presence
// Room format: "projectName:sessionId" for granular tracking
// Client passes stable userId and sessionId (generated once per browser session via sessionStorage)
export const heartbeat = mutation({
  args: {
    room: v.string(), // Format: "projectName" or "projectName:sessionId"
    userId: v.string(), // Stable ID from client (e.g., "viewer-{random}")
    sessionId: v.string(), // Unique session ID (e.g., "session-{timestamp}-{random}")
  },
  handler: async (ctx, { room, userId, sessionId }) => {
    // Heartbeat with 10 second interval (presence auto-removes stale entries at 2.5x interval)
    return await presence.heartbeat(ctx, room, userId, sessionId, 10000);
  },
});

// List current viewers in a room
export const listViewers = query({
  args: {
    room: v.string(),
  },
  handler: async (ctx, { room }) => {
    // Use listRoom to get users by room ID directly (no token needed)
    return await presence.listRoom(ctx, room, true); // onlineOnly = true
  },
});
