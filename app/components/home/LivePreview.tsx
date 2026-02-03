"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

/**
 * Border/indicator colors by tool type - matches EventCard color scheme.
 */
const toolColors: Record<string, string> = {
  Read: "bg-green-500",
  Write: "bg-blue-500",
  Bash: "bg-orange-500",
  Glob: "bg-green-400",
  Grep: "bg-green-400",
  Edit: "bg-blue-400",
};

/**
 * Get a brief action description for an event.
 * Simplifies event data to a readable summary.
 */
function getEventSummary(event: {
  type: string;
  tool?: string | null;
  toolInput?: unknown;
}): string {
  const tool = event.tool;

  if (tool === "Read" || tool === "Glob" || tool === "Grep") {
    const input = event.toolInput as { file_path?: string; pattern?: string };
    if (input?.file_path) {
      const parts = input.file_path.split("/");
      return `Reading ${parts[parts.length - 1]}`;
    }
    if (input?.pattern) {
      return `Searching for "${input.pattern}"`;
    }
    return "Reading files";
  }

  if (tool === "Write" || tool === "Edit") {
    const input = event.toolInput as { file_path?: string };
    if (input?.file_path) {
      const parts = input.file_path.split("/");
      return `Editing ${parts[parts.length - 1]}`;
    }
    return "Editing file";
  }

  if (tool === "Bash") {
    const input = event.toolInput as { command?: string };
    if (input?.command) {
      const cmd = input.command.split(" ")[0];
      return `Running ${cmd}`;
    }
    return "Running command";
  }

  // Session events
  if (event.type === "user_prompt_submit") return "New prompt received";
  if (event.type === "session_start") return "Session started";
  if (event.type === "session_end") return "Session ended";

  return event.tool || event.type;
}

/**
 * LivePreview component for the home page hero.
 * Shows the latest events in a simplified terminal-style display.
 * Links to /live when clicked.
 */
export function LivePreview() {
  const events = useQuery(api.events.listEvents, { limit: 3 });

  // Determine if session is live (any event within 5 minutes)
  const isLive =
    events &&
    events.length > 0 &&
    Date.now() - events[0].timestamp < 5 * 60 * 1000;

  return (
    <Link
      href="/live"
      className="block relative hover:opacity-90 transition-opacity"
    >
      {/* LIVE badge when session active */}
      {isLive && (
        <div className="absolute -top-2 -right-2 z-10 animate-pulse bg-red-600 text-white text-xs px-2 py-0.5 rounded font-medium">
          LIVE
        </div>
      )}

      {/* Events preview */}
      <div className="space-y-2 min-h-[100px]">
        {events === undefined ? (
          // Loading state
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-zinc-700" />
                <div className="h-4 w-32 bg-zinc-800 rounded" />
                <div className="h-4 w-16 bg-zinc-800 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          // No events - waiting state
          <div className="text-zinc-500 text-center py-6">
            Waiting for coding session...
          </div>
        ) : (
          // Show events
          events.map((event) => {
            const colorClass = toolColors[event.tool ?? ""] ?? "bg-zinc-500";
            const summary = getEventSummary(event);
            const relative = formatDistanceToNow(event.timestamp, {
              addSuffix: true,
            });

            return (
              <div
                key={event._id}
                className="flex items-center gap-3 text-sm"
              >
                {/* Tool type indicator */}
                <div className={`h-2 w-2 rounded-full ${colorClass} shrink-0`} />
                {/* Summary */}
                <span className="text-zinc-300 truncate flex-1">{summary}</span>
                {/* Relative time */}
                <span className="text-zinc-500 text-xs shrink-0">{relative}</span>
              </div>
            );
          })
        )}
      </div>
    </Link>
  );
}
