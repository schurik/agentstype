"use client";

interface NewEventsIndicatorProps {
  count: number;
  onClick: () => void;
}

/**
 * Floating badge showing number of new events when user has scrolled down.
 * Clicking scrolls to top to see the newest events.
 */
export function NewEventsIndicator({ count, onClick }: NewEventsIndicatorProps) {
  // Don't render if no new events
  if (count <= 0) return null;

  const label = count === 1 ? "1 new event" : `${count} new events`;

  return (
    <button
      onClick={onClick}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-20 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 shadow-lg cursor-pointer hover:bg-zinc-700 transition-colors animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <span className="text-sm text-zinc-200">
        <span className="text-zinc-400">↑</span> {label}
      </span>
    </button>
  );
}
