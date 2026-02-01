"use client";

import { useConvexConnectionState } from "convex/react";

export type ConnectionStatus = "live" | "reconnecting" | "offline" | "idle";

/**
 * Hook that wraps Convex connection state to provide UI-friendly status.
 *
 * Status logic:
 * - "offline": Never connected or WebSocket disconnected with no retries
 * - "reconnecting": WebSocket disconnected but actively retrying
 * - "live": WebSocket connected (idle detection deferred to later phase)
 */
export function useConnectionStatus(): ConnectionStatus {
  const connectionState = useConvexConnectionState();

  // ConnectionState has: isWebSocketConnected, hasInflightRequests,
  // connectionRetries, hasEverConnected, connectionCount

  if (!connectionState.hasEverConnected) {
    return "offline";
  }

  if (!connectionState.isWebSocketConnected) {
    return connectionState.connectionRetries > 0 ? "reconnecting" : "offline";
  }

  // Idle detection will be refined in later phases based on recent event activity
  return "live";
}
