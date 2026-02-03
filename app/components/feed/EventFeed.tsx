"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { EventCard } from "./EventCard";
import { NewEventsIndicator } from "./NewEventsIndicator";
import { CurrentlyIndicator } from "./CurrentlyIndicator";
import { useNewEventsIndicator } from "./hooks/useNewEventsIndicator";
import { useExpandedEvents } from "@/app/hooks/useExpandedEvents";
import { useProjectFilter } from "@/app/hooks/useProjectFilter";

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

interface EventFeedProps {
  /** Callback to expose expand/collapse handlers to parent */
  onExpandCollapseChange?: (handlers: {
    expandAll: () => void;
    collapseAll: () => void;
  }) => void;
}

/**
 * Main event feed container with real-time subscription.
 *
 * Features:
 * - Real-time event subscription via Convex useQuery
 * - Project filtering via URL query param
 * - Newest events appear at top
 * - "X new events" badge when scrolled down and new events arrive
 * - Loading and empty states
 * - Animation for new events (after initial load)
 * - Expand/collapse to show event details
 * - CurrentlyIndicator showing latest activity
 */
export function EventFeed({ onExpandCollapseChange }: EventFeedProps) {
  // Get selected project from URL
  const [selectedProject] = useProjectFilter();

  // Track which events were present on initial load
  const [initialEventIds, setInitialEventIds] = useState<Set<string>>(
    new Set()
  );
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Subscribe to real-time events (newest first / DESC order), filtered by project
  const events = useQuery(api.events.listEvents, {
    projectName: selectedProject ?? undefined,
    limit: 100,
  });

  // Track expanded/collapsed state for each event
  const { isExpanded, toggle, expandAll, collapseAll } = useExpandedEvents();

  // Expose expand/collapse handlers to parent (Header)
  useEffect(() => {
    if (onExpandCollapseChange && events) {
      onExpandCollapseChange({
        expandAll: () => expandAll(events.map((e) => e._id)),
        collapseAll,
      });
    }
  }, [onExpandCollapseChange, events, expandAll, collapseAll]);

  // Capture initial event IDs on first data load
  useEffect(() => {
    if (!hasInitialLoad && events !== undefined) {
      setInitialEventIds(new Set(events.map((e) => e._id)));
      setHasInitialLoad(true);
    }
  }, [events, hasInitialLoad]);

  // Track new events when user has scrolled down
  const eventIds = events?.map((e) => e._id) ?? [];
  const { containerRef, newEventCount, scrollToTop } =
    useNewEventsIndicator(eventIds);

  // Track if we're actively receiving events (for CurrentlyIndicator pulse)
  const [isReceivingEvents, setIsReceivingEvents] = useState(false);
  const [lastEventTime, setLastEventTime] = useState(0);

  useEffect(() => {
    if (events && events.length > 0) {
      const latestTimestamp = events[0].timestamp;
      if (latestTimestamp > lastEventTime) {
        setLastEventTime(latestTimestamp);
        setIsReceivingEvents(true);
        // Clear "receiving" state after 10 seconds of no new events
        const timeout = setTimeout(() => setIsReceivingEvents(false), 10000);
        return () => clearTimeout(timeout);
      }
    }
  }, [events, lastEventTime]);

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
            No events yet{selectedProject ? ` for ${selectedProject}` : ""}.
            <br />
            <span className="text-sm">
              Events will appear here when Claude Code is active.
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Get latest event for CurrentlyIndicator
  const latestEvent = events[0];

  // Events are already in DESC order (newest first) from Convex
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Currently indicator */}
      <CurrentlyIndicator
        event={latestEvent}
        isReceivingEvents={isReceivingEvents}
      />

      {/* New events banner - above scroll container for visibility */}
      <NewEventsIndicator count={newEventCount} onClick={scrollToTop} />

      {/* Event list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
      >
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            isNew={hasInitialLoad && !initialEventIds.has(event._id)}
            isExpanded={isExpanded(event._id)}
            onToggle={() => toggle(event._id)}
          />
        ))}
      </div>
    </div>
  );
}
