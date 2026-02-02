"use client";

interface NewEventsIndicatorProps {
  count: number;
  onClick: () => void;
}

/**
 * Banner showing number of new events when user has scrolled down.
 * Clicking scrolls to top to see the newest events.
 * Rendered above the scroll container for guaranteed visibility.
 */
export function NewEventsIndicator({ count, onClick }: NewEventsIndicatorProps) {
  // Don't render if no new events
  if (count <= 0) return null;

  const label = count === 1 ? "1 new event" : `${count} new events`;

  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 text-center cursor-pointer transition-colors text-sm font-medium"
    >
      ↑ {label} — click to scroll to top
    </button>
  );
}
