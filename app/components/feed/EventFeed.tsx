"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { EventCard } from "./EventCard";
import { NewEventsIndicator } from "./NewEventsIndicator";
import { CurrentlyIndicator } from "./CurrentlyIndicator";
import { SessionHeader } from "./SessionHeader";
import { useNewEventsIndicator } from "./hooks/useNewEventsIndicator";
import { useExpandedEvents } from "@/app/hooks/useExpandedEvents";
import { useProjectFilter } from "@/app/hooks/useProjectFilter";
import { useSessionFilter } from "@/app/hooks/useSessionFilter";
import { useAgentFilter } from "@/app/hooks/useAgentFilter";
import { useSessionStats } from "@/app/hooks/useSessionStats";
import { useSessionStatus } from "@/app/hooks/useSessionStatus";

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

  // Compute session stats and status for header
  const stats = useSessionStats(events, selectedSession);
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

  // Empty state - different messages based on selection context
  if (events.length === 0) {
    let emptyMessage = "No events yet.";
    let emptyHint = "Events will appear here when Claude Code is active.";

    if (selectedSession) {
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
