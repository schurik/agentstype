"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { usePageVisibility } from "./usePageVisibility";

// Heartbeat interval in ms (10 seconds, matching presence TTL)
const HEARTBEAT_INTERVAL = 10000;

// Session storage keys for stable IDs
const VIEWER_ID_KEY = "agentstype_viewer_id";
const SESSION_ID_KEY = "agentstype_session_id";

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
 * Get or create a stable session ID for this browser session.
 * Required by @convex-dev/presence heartbeat mutation.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return `session-ssr-${Math.random().toString(36).slice(2, 9)}`;
  }

  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
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

  // Store stable IDs (generated once per browser session)
  const viewerIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Query viewers for the room
  const viewers = useQuery(api.presence.listViewers, room ? { room } : "skip");

  // Send heartbeats only when tab is visible
  useEffect(() => {
    if (!room || !isVisible) return;

    // Get stable IDs (create once per session)
    if (!viewerIdRef.current) {
      viewerIdRef.current = getOrCreateViewerId();
    }
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
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
