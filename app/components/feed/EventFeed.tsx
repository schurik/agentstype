"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EventCard } from "./EventCard";
import { NewEventsIndicator } from "./NewEventsIndicator";
import { CurrentlyIndicator } from "./CurrentlyIndicator";
import { SessionHeader } from "./SessionHeader";
import { BatchedEventGroup } from "./BatchedEventGroup";
import { useNewEventsIndicator } from "./hooks/useNewEventsIndicator";
import { useExpandedEvents } from "@/app/hooks/useExpandedEvents";
import { useProjectFilter } from "@/app/hooks/useProjectFilter";
import { useSessionFilter } from "@/app/hooks/useSessionFilter";
import { useAgentFilter } from "@/app/hooks/useAgentFilter";
import { useSessionStats } from "@/app/hooks/useSessionStats";
import { useSessionStatus } from "@/app/hooks/useSessionStatus";
import { useBatchedEvents } from "@/app/hooks/useBatchedEvents";
import { useEventFilter } from "@/app/hooks/useEventFilter";

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
  // Get selected project, session, and agent from URL
  const [selectedProject] = useProjectFilter();
  const [selectedSession] = useSessionFilter();
  const [selectedAgent] = useAgentFilter();

  // Track which events were present on initial load
  const [initialEventIds, setInitialEventIds] = useState<Set<string>>(
    new Set()
  );
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Subscribe to real-time events (newest first / DESC order), filtered by project/session/agent
  const events = useQuery(api.events.listEvents, {
    projectName: selectedProject ?? undefined,
    sessionId: selectedSession ?? undefined,
    agentId: selectedAgent ?? undefined,
    limit: 100,
  });

  // Get filters from URL and transform events with batching
  const [filters] = useEventFilter();
  const batchedEvents = useBatchedEvents(events, filters);

  // Fetch session data to get accurate eventCount (not limited by listEvents pagination)
  const sessionData = useQuery(
    api.events.listSessionsForProject,
    selectedProject ? { projectName: selectedProject } : "skip"
  );

  // Find the selected session to get its accurate eventCount
  const currentSession = useMemo(() => {
    if (!sessionData || !selectedSession) return null;
    return sessionData.find((s) => s.sessionId === selectedSession) ?? null;
  }, [sessionData, selectedSession]);

  // Compute session stats and status for header
  // Pass accurate eventCount from session data (not limited by 100-event query)
  const stats = useSessionStats(events, selectedSession, currentSession?.eventCount);
  const status = useSessionStatus(events, selectedSession);

  // Extract goal from first user_prompt_submit event
  const goal = useMemo(() => {
    if (!events || !selectedSession) return null;
    const promptEvent = events.find(
      (e) => e.sessionId === selectedSession && e.type === "user_prompt_submit"
    );
    // Look from oldest to newest (reverse since events are DESC)
    const sessionEvents = events
      .filter((e) => e.sessionId === selectedSession)
      .reverse();
    const firstPrompt = sessionEvents.find(
      (e) => e.type === "user_prompt_submit"
    );
    if (firstPrompt && firstPrompt.prompt && typeof firstPrompt.prompt === "string") {
      return firstPrompt.prompt;
    }
    return null;
  }, [events, selectedSession]);

  // Extract latest event tool for thinking context
  const latestEventTool = useMemo(() => {
    if (!events || events.length === 0) return undefined;
    // Find most recent event with a tool (skip session_start/session_end)
    const toolEvent = events.find(
      (e) => e.tool && !["session_start", "session_end"].includes(e.type)
    );
    return toolEvent?.tool ?? undefined;
  }, [events]);

  // Track expanded/collapsed state for each event
  const { isExpanded, toggle, expandAll, collapseAll } = useExpandedEvents();

  // Expose expand/collapse handlers to parent (Header)
  // Use batched event IDs for expand/collapse state
  useEffect(() => {
    if (onExpandCollapseChange && batchedEvents.length > 0) {
      onExpandCollapseChange({
        expandAll: () => expandAll(batchedEvents.map((b) => b.id)),
        collapseAll,
      });
    }
  }, [onExpandCollapseChange, batchedEvents, expandAll, collapseAll]);

  // Capture initial event IDs on first data load
  // Track batched event IDs for correct animation of new batches
  useEffect(() => {
    if (!hasInitialLoad && events !== undefined && batchedEvents.length > 0) {
      setInitialEventIds(new Set(batchedEvents.map((b) => b.id)));
      setHasInitialLoad(true);
    }
  }, [events, batchedEvents, hasInitialLoad]);

  // Track new events when user has scrolled down (using batched event IDs)
  const batchedEventIds = batchedEvents.map((b) => b.id);
  const { containerRef, newEventCount, scrollToTop } =
    useNewEventsIndicator(batchedEventIds);

  // Create ref for virtualization container
  const parentRef = useRef<HTMLDivElement>(null);

  // Set up virtualizer for smooth scrolling with 100+ events
  const virtualizer = useVirtualizer({
    count: batchedEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated collapsed height
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

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

  // Empty state - different messages based on selection context
  if (events.length === 0 || batchedEvents.length === 0) {
    let emptyMessage = "No events yet.";
    let emptyHint = "Events will appear here when Claude Code is active.";

    // Filtered but no matches
    if (events.length > 0 && batchedEvents.length === 0 && filters.length > 0) {
      emptyMessage = "No matching events.";
      emptyHint = `No events match the current filter. Try adjusting your filters.`;
    } else if (selectedSession) {
      emptyMessage = "No events in this session.";
      emptyHint = "This session may have just started.";
    } else if (selectedProject) {
      emptyMessage = `No events yet for ${selectedProject}.`;
    }

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-center py-8">
            {emptyMessage}
            <br />
            <span className="text-sm">{emptyHint}</span>
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
      {/* Session header when session is selected */}
      {selectedSession && (
        <SessionHeader
          goal={goal}
          stats={stats}
          status={status}
          latestEventTool={latestEventTool}
        />
      )}

      {/* Currently indicator (show when no session selected, or as secondary info) */}
      {!selectedSession && (
        <CurrentlyIndicator
          event={latestEvent}
          isReceivingEvents={isReceivingEvents}
        />
      )}

      {/* New events banner - above scroll container for visibility */}
      <NewEventsIndicator count={newEventCount} onClick={scrollToTop} />

      {/* Virtualized event list */}
      <div
        ref={(el) => {
          // Share ref between containerRef (callback ref for new events indicator) and parentRef (for virtualizer)
          containerRef(el);
          (parentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className="flex-1 overflow-y-auto px-4 py-2"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = batchedEvents[virtualRow.index];
            return (
              <div
                key={item.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === "batch" ? (
                  <BatchedEventGroup
                    tool={item.tool!}
                    events={item.events}
                    count={item.count}
                    isNew={hasInitialLoad && !initialEventIds.has(item.id)}
                  />
                ) : (
                  <EventCard
                    event={item.events[0]}
                    isNew={hasInitialLoad && !initialEventIds.has(item.id)}
                    isExpanded={isExpanded(item.id)}
                    onToggle={() => toggle(item.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
