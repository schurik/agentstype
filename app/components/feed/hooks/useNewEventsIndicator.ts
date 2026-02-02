"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface NewEventsIndicatorResult {
  /** Callback ref for the scroll container */
  containerRef: (node: HTMLDivElement | null) => void;
  /** Number of new events since user scrolled away from top */
  newEventCount: number;
  /** Scroll to top and reset count */
  scrollToTop: () => void;
  /** Whether user is currently at/near top */
  isAtTop: boolean;
}

/**
 * Hook for tracking new events when user has scrolled down.
 * Designed for "newest at top" feeds.
 *
 * Tracks by event IDs (not count) because the query has a limit
 * and new events push old ones out, keeping count constant.
 *
 * @param eventIds - Array of current event IDs (newest first)
 */
export function useNewEventsIndicator(
  eventIds: string[]
): NewEventsIndicatorResult {
  const [newEventCount, setNewEventCount] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const seenEventIds = useRef<Set<string> | null>(null);
  const isAtTopRef = useRef(true); // Mirror state for use in effect

  // Keep ref in sync with state
  useEffect(() => {
    isAtTopRef.current = isAtTop;
  }, [isAtTop]);

  // Callback ref to attach scroll listener when element mounts
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    // Clean up old listener
    if (containerNodeRef.current) {
      containerNodeRef.current.removeEventListener("scroll", handleScroll);
    }

    containerNodeRef.current = node;

    if (node) {
      node.addEventListener("scroll", handleScroll, { passive: true });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerNodeRef.current;
    if (!container) return;

    // Consider "at top" if within 100px of top
    const atTop = container.scrollTop < 100;
    setIsAtTop(atTop);

    // If user scrolled back to top, clear the count
    if (atTop) {
      setNewEventCount(0);
    }
  }, []);

  // Track new events by ID
  useEffect(() => {
    if (eventIds.length === 0) return;

    // Initialize on first load
    if (seenEventIds.current === null) {
      seenEventIds.current = new Set(eventIds);
      return;
    }

    // Find new events (IDs we haven't seen before)
    const newIds = eventIds.filter(id => !seenEventIds.current!.has(id));

    if (newIds.length > 0) {
      // Add new IDs to seen set
      newIds.forEach(id => seenEventIds.current!.add(id));

      // Only increment count if user is scrolled down
      if (!isAtTopRef.current) {
        setNewEventCount(prev => prev + newIds.length);
      }
    }
  }, [eventIds]);

  const scrollToTop = useCallback(() => {
    containerNodeRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setNewEventCount(0);
  }, []);

  return { containerRef, newEventCount, scrollToTop, isAtTop };
}
