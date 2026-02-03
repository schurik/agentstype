"use client";

import { useRelativeTime } from "./hooks/useRelativeTime";
import { useCollapse } from "react-collapsed";
import { ExpandedContent } from "./ExpandedContent";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMemo } from "react";

type Event = Doc<"events">;

/**
 * Detect if an event is a git commit.
 * Checks Bash tool commands for 'git commit'.
 */
function isCommitEvent(event: Event): boolean {
  if (event.tool !== "Bash") return false;
  const command =
    event.toolInput && typeof event.toolInput === "object"
      ? (event.toolInput as { command?: string }).command
      : undefined;
  return typeof command === "string" && command.includes("git commit");
}

/**
 * Extract commit message from a git commit command.
 * Parses -m "message" or -m 'message' from the command string.
 * Returns abbreviated message (first 50 chars) or null if not found.
 */
function extractCommitMessage(event: Event): string | null {
  if (!isCommitEvent(event)) return null;
  const command = (event.toolInput as { command?: string }).command;
  if (!command) return null;

  // Match -m "message" or -m 'message' patterns
  const match = command.match(/-m\s+["']([^"']+)["']/);
  if (match && match[1]) {
    const message = match[1];
    return message.length > 50 ? message.slice(0, 50) + "..." : message;
  }
  return null;
}

/**
 * Border colors by event type for visual distinction.
 * - Read: green (fetching data)
 * - Write: blue (modifying files)
 * - Bash: orange (shell commands)
 * - Errors: red (failures)
 * - Default: muted zinc
 */
const borderColors: Record<string, string> = {
  Read: "border-l-green-500",
  Write: "border-l-blue-500",
  Bash: "border-l-orange-500",
  Glob: "border-l-green-400",
  Grep: "border-l-green-400",
  Edit: "border-l-blue-400",
  post_tool_use_failure: "border-l-red-500",
  error: "border-l-red-500",
};

/**
 * Timestamp subcomponent with relative time display and absolute time on hover.
 */
function Timestamp({ value }: { value: number }) {
  const relative = useRelativeTime(value);
  const absolute = new Date(value).toLocaleString();

  return (
    <time
      dateTime={new Date(value).toISOString()}
      title={absolute}
      className="text-xs text-zinc-500 cursor-default"
    >
      {relative}
    </time>
  );
}

/**
 * Truncate long file paths by showing first and last parts.
 * Example: "src/components/very/long/path/Component.tsx" -> "src/.../Component.tsx"
 */
function truncatePath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) return path;

  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const first = parts[0];
  const last = parts[parts.length - 1];

  return `${first}/.../${last}`;
}

interface EventCardProps {
  event: Event;
  isNew?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Individual event display card with colored left border indicating event type.
 * Shows event label (tool name or type), optional file path, and relative timestamp.
 * Clicking the card toggles expanded view showing full tool inputs/outputs.
 */
export function EventCard({
  event,
  isNew = false,
  isExpanded,
  onToggle,
}: EventCardProps) {
  const { getCollapseProps, getToggleProps } = useCollapse({
    isExpanded,
    duration: 200,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  });

  // Check if this is a git commit event for milestone styling
  const isCommit = useMemo(() => isCommitEvent(event), [event]);
  const commitMessage = useMemo(
    () => (isCommit ? extractCommitMessage(event) : null),
    [event, isCommit]
  );

  // Determine border color - commits get special green accent
  const borderClass = isCommit
    ? "border-l-green-600"
    : borderColors[event.tool ?? event.type] ?? "border-l-zinc-600";

  // Extract file path from toolInput if available (for Read/Write/Edit operations)
  const filePath =
    event.toolInput &&
    typeof event.toolInput === "object" &&
    "file_path" in event.toolInput
      ? (event.toolInput as { file_path: string }).file_path
      : null;

  // Animation class only applied for new events
  const animationClass = isNew
    ? "animate-in fade-in slide-in-from-bottom-2 duration-300"
    : "";

  // Event label: prefer tool name over event type for clarity
  const label = event.tool ?? event.type;

  return (
    <div
      {...getToggleProps({
        onClick: onToggle,
        "aria-expanded": isExpanded,
        "aria-controls": `event-content-${event._id}`,
      })}
      className={`border-l-4 ${borderClass} bg-zinc-900/50 cursor-pointer hover:bg-zinc-900/70 transition-colors ${animationClass}`}
    >
      {/* Summary row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Chevron indicator */}
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {/* Git commit icon for milestone events */}
          {isCommit && (
            <svg
              className="w-4 h-4 text-green-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="4" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 2v6M12 16v6" />
            </svg>
          )}
          <span className="font-mono text-sm text-zinc-300 shrink-0">
            {label}
          </span>
          {/* Commit badge */}
          {isCommit && (
            <span className="text-xs bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded shrink-0">
              Commit
            </span>
          )}
          {/* Show commit message or file path */}
          {commitMessage ? (
            <span className="font-mono text-xs text-green-400/70 truncate">
              {commitMessage}
            </span>
          ) : (
            filePath && (
              <span className="font-mono text-xs text-zinc-500 truncate">
                {truncatePath(filePath)}
              </span>
            )
          )}
        </div>
        <Timestamp value={event.timestamp} />
      </div>

      {/* Expandable content */}
      <div
        {...getCollapseProps()}
        id={`event-content-${event._id}`}
        aria-hidden={!isExpanded}
      >
        <div className="px-3 pb-3 pt-1 border-t border-zinc-800">
          <ExpandedContent event={event} />
        </div>
      </div>
    </div>
  );
}
