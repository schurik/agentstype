"use client";

import { useConnectionStatus } from "./hooks/useConnectionStatus";

/**
 * Status configuration mapping connection state to visual styling.
 */
const statusConfig = {
  live: {
    dot: "bg-green-500 animate-pulse",
    text: "Live",
  },
  reconnecting: {
    dot: "bg-yellow-500",
    text: "Reconnecting...",
  },
  offline: {
    dot: "bg-red-500",
    text: "Offline",
  },
  idle: {
    dot: "bg-zinc-500",
    text: "Idle",
  },
} as const;

/**
 * Connection status indicator showing live/reconnecting/offline/idle state.
 * Displays a colored dot (pulsing for live) and status text.
 */
export function ConnectionStatus() {
  const status = useConnectionStatus();
  const { dot, text } = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-sm text-zinc-400">{text}</span>
    </div>
  );
}
