"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { usePageVisibility } from "./usePageVisibility";

// Heartbeat interval in ms (10 seconds, matching presence TTL)
const HEARTBEAT_INTERVAL = 10000;

// Session storage key for stable viewer ID
const VIEWER_ID_KEY = "agentstype_viewer_id";

/**
 * Get or create a stable viewer ID for this browser session.
 * Stored in sessionStorage so it persists across page reloads but not tabs.
 */
function getOrCreateViewerId(): string {
  if (typeof window === "undefined") {
    return `viewer-ssr-${Math.random().toString(36).slice(2, 9)}`;
  }

  let viewerId = sessionStorage.getItem(VIEWER_ID_KEY);
  if (!viewerId) {
    viewerId = `viewer-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(VIEWER_ID_KEY, viewerId);
  }
  return viewerId;
}

/**
 * Generate a unique session ID for a specific room.
 * @convex-dev/presence requires sessionId to be unique per room/user combination.
 * We generate a new sessionId each time the room changes.
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Track and display real-time viewer count for a room.
 *
 * Per CONTEXT.md decisions:
 * - Only sends heartbeats when tab is visible
 * - Returns count of active viewers
 * - Uses stable anonymous viewer IDs (no auth required)
 *
 * @param room - Room identifier (e.g., "projectName" or "projectName:sessionId")
 * @returns Number of active viewers (0 if room is null/undefined)
 */
export function useViewerCount(room: string | null | undefined): number {
  const isVisible = usePageVisibility();
  const heartbeat = useMutation(api.presence.heartbeat);

  // Store stable viewer ID (generated once per browser session)
  const viewerIdRef = useRef<string | null>(null);
  // Track the current room to detect changes
  const currentRoomRef = useRef<string | null>(null);
  // Session ID is unique per room/user - regenerated when room changes
  const sessionIdRef = useRef<string | null>(null);

  // Query viewers for the room
  const viewers = useQuery(api.presence.listViewers, room ? { room } : "skip");

  // Send heartbeats only when tab is visible
  useEffect(() => {
    if (!room || !isVisible) return;

    // Get stable viewer ID (create once per session)
    if (!viewerIdRef.current) {
      viewerIdRef.current = getOrCreateViewerId();
    }

    // Generate new sessionId when room changes (required by @convex-dev/presence)
    if (currentRoomRef.current !== room) {
      currentRoomRef.current = room;
      sessionIdRef.current = generateSessionId();
    }

    const sendHeartbeat = () => {
      heartbeat({
        room,
        userId: viewerIdRef.current!,
        sessionId: sessionIdRef.current!,
      }).catch(() => {
        // Silently ignore heartbeat errors (network issues, etc.)
      });
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [room, isVisible, heartbeat]);

  return viewers?.length ?? 0;
}
