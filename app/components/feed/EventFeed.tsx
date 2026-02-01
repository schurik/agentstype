"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { EventCard } from "./EventCard";
import { NewEventsIndicator } from "./NewEventsIndicator";
import { useAutoScroll } from "./hooks/useAutoScroll";

/**
 * Loading skeleton for event cards during initial data fetch.
 */
function EventSkeleton() {
  return (
    <div className="border-l-4 border-l-zinc-700 bg-zinc-900/50 px-3 py-2 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-20 bg-zinc-800 rounded" />
        <div className="h-3 w-16 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

/**
 * Main event feed container with real-time subscription and smart auto-scroll.
 *
 * Features:
 * - Real-time event subscription via Convex useQuery
 * - Smart auto-scroll: scrolls to new events only when at bottom
 * - New events indicator when user has scrolled up
 * - Loading and empty states
 * - Animation for new events (after initial load)
 */
export function EventFeed() {
  // Track which events were present on initial load
  const [initialEventIds, setInitialEventIds] = useState<Set<string>>(
    new Set()
  );
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Subscribe to real-time events (newest first / DESC order)
  const events = useQuery(api.events.listEvents, { limit: 100 });

  // Capture initial event IDs on first data load
  useEffect(() => {
    if (!hasInitialLoad && events !== undefined) {
      setInitialEventIds(new Set(events.map((e) => e._id)));
      setHasInitialLoad(true);
    }
  }, [events, hasInitialLoad]);

  // For chat-like display with newest at bottom, reverse the DESC-ordered results
  const displayEvents = events ? [...events].reverse() : [];

  // Smart auto-scroll behavior
  const { bottomRef, sentinelRef, newItemCount, scrollToBottom } =
    useAutoScroll(displayEvents, initialEventIds.size);

  // Loading state
  if (events === undefined) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {[...Array(5)].map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-center py-8">
            No events yet.
            <br />
            <span className="text-sm">
              Events will appear here when Claude Code is active.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {displayEvents.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            isNew={hasInitialLoad && !initialEventIds.has(event._id)}
          />
        ))}
        {/* Sentinel element for intersection observer */}
        <div ref={sentinelRef} className="h-1" />
        {/* Bottom anchor for scrollIntoView */}
        <div ref={bottomRef} />
      </div>
      <NewEventsIndicator count={newItemCount} onClick={scrollToBottom} />
    </div>
  );
}
