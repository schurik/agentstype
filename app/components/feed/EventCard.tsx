"use client";

import { useRelativeTime } from "./hooks/useRelativeTime";
import type { Doc } from "@/convex/_generated/dataModel";

type Event = Doc<"events">;

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
}

/**
 * Individual event display card with colored left border indicating event type.
 * Shows event label (tool name or type), optional file path, and relative timestamp.
 */
export function EventCard({ event, isNew = false }: EventCardProps) {
  // Determine border color from tool name or event type
  const borderClass =
    borderColors[event.tool ?? event.type] ?? "border-l-zinc-600";

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
      className={`border-l-4 ${borderClass} bg-zinc-900/50 px-3 py-2 ${animationClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm text-zinc-300 shrink-0">
            {label}
          </span>
          {filePath && (
            <span className="font-mono text-xs text-zinc-500 truncate">
              {truncatePath(filePath)}
            </span>
          )}
        </div>
        <Timestamp value={event.timestamp} />
      </div>
    </div>
  );
}
