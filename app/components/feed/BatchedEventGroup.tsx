"use client";

import { useState } from "react";
import { useCollapse } from "react-collapsed";
import { ChevronRight, File } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import { useRelativeTime } from "./hooks/useRelativeTime";

type Event = Doc<"events">;

interface BatchedEventGroupProps {
  /** Tool type (Read, Glob, etc.) */
  tool: string;
  /** All events in this batch */
  events: Event[];
  /** Number of events */
  count: number;
  /** Whether this batch should animate as new */
  isNew?: boolean;
}

// Tool type to border color mapping (matches EventCard)
const TOOL_COLORS: Record<string, string> = {
  Read: "border-l-green-500",
  Glob: "border-l-green-400",
  Grep: "border-l-emerald-500",
  Write: "border-l-blue-500",
  Edit: "border-l-blue-400",
  Bash: "border-l-orange-500",
  WebSearch: "border-l-purple-500",
  WebFetch: "border-l-purple-400",
};

/**
 * Extract file path from event toolInput.
 * Handles various input structures.
 */
function extractFilePath(event: Event): string | null {
  const input = event.toolInput as Record<string, unknown> | null;
  if (!input) return null;

  // Common patterns
  if (typeof input.file_path === "string") return input.file_path;
  if (typeof input.path === "string") return input.path;
  if (typeof input.pattern === "string") return input.pattern;

  return null;
}

/**
 * Get short filename from full path.
 * Uses middle truncation for long paths: "src/.../file.tsx"
 */
function getShortPath(fullPath: string): string {
  const parts = fullPath.split("/");
  if (parts.length <= 2) return fullPath;

  const filename = parts[parts.length - 1];
  const parent = parts[parts.length - 2];

  if (fullPath.length > 40) {
    return `${parts[0]}/.../${parent}/${filename}`;
  }
  return fullPath;
}

/**
 * Collapsible group for batched events.
 * Shows count and sample file paths, expands to show all events.
 */
export function BatchedEventGroup({
  tool,
  events,
  count,
  isNew = false,
}: BatchedEventGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getCollapseProps, getToggleProps } = useCollapse({
    isExpanded,
    duration: 200,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  });

  // Get timestamp from first event (use 0 as fallback - component shouldn't render without events)
  const timestamp = events[0]?.timestamp ?? 0;
  const relativeTime = useRelativeTime(timestamp);

  // Extract sample file paths for preview (first 3)
  const samplePaths = events
    .slice(0, 3)
    .map(extractFilePath)
    .filter((p): p is string => p !== null)
    .map((p) => p.split("/").pop() ?? p);

  const borderColor = TOOL_COLORS[tool] ?? "border-l-zinc-500";

  return (
    <div
      className={`border-l-4 ${borderColor} bg-zinc-900/50 rounded-r ${
        isNew ? "animate-fade-in" : ""
      }`}
    >
      {/* Collapsed header - clickable to expand */}
      <button
        {...getToggleProps({ onClick: () => setIsExpanded(!isExpanded) })}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-900/70 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Expand indicator */}
          <ChevronRight
            className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />

          {/* Tool name */}
          <span className="font-mono text-sm text-zinc-300">{tool}</span>

          {/* Count badge */}
          <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded flex-shrink-0">
            {count} files
          </span>

          {/* Sample file names */}
          <span className="text-xs text-zinc-500 truncate">
            {samplePaths.join(", ")}
            {count > 3 && "..."}
          </span>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-zinc-600 flex-shrink-0 ml-2">
          {relativeTime}
        </span>
      </button>

      {/* Expanded content - list of all files */}
      <div {...getCollapseProps()}>
        <div className="px-3 pb-2 space-y-1 border-t border-zinc-800/50">
          {events.map((event) => {
            const filePath = extractFilePath(event);
            return (
              <div
                key={event._id}
                className="flex items-center gap-2 text-xs text-zinc-400 pl-6 py-1"
              >
                <File className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                <span className="font-mono truncate">
                  {filePath ? getShortPath(filePath) : event.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
