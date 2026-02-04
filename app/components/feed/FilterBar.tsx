"use client";

import { useEventFilter } from "@/app/hooks/useEventFilter";

// Available tool types with their display colors
const TOOL_TYPES = [
  { value: "Read", label: "Read", color: "bg-green-500" },
  { value: "Write", label: "Write", color: "bg-blue-500" },
  { value: "Edit", label: "Edit", color: "bg-blue-400" },
  { value: "Bash", label: "Bash", color: "bg-orange-500" },
  { value: "Glob", label: "Glob", color: "bg-green-400" },
  { value: "Grep", label: "Grep", color: "bg-emerald-500" },
] as const;

interface FilterBarProps {
  /** Optional className for positioning */
  className?: string;
}

/**
 * Floating filter bar for event type filtering.
 * Filter state persists in URL (?filter=Read,Write).
 * Multi-select: click to toggle individual filters.
 */
export function FilterBar({ className = "" }: FilterBarProps) {
  const [filters, setFilters] = useEventFilter();

  const toggleFilter = (value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter((f) => f !== value));
    } else {
      setFilters([...filters, value]);
    }
  };

  const clearFilters = () => setFilters([]);

  const hasActiveFilters = filters.length > 0;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 ${className}`}
    >
      <span className="text-xs text-zinc-500 mr-1">Filter:</span>

      {TOOL_TYPES.map(({ value, label, color }) => {
        const isActive = filters.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggleFilter(value)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isActive
                ? `${color} text-white`
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-zinc-500 hover:text-zinc-300 ml-2 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
