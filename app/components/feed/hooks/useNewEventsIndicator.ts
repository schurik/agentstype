"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";

export interface NewEventsIndicatorResult {
  /** Ref for the scroll container */
  containerRef: RefObject<HTMLDivElement | null>;
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
 * - Tracks if user has scrolled away from top (> 100px threshold)
 * - Counts new events that arrive while scrolled down
 * - Provides scrollToTop to jump back and see new events
 *
 * @param eventCount - Current total number of events
 * @param initialEventCount - Number of events on initial load (don't count these as "new")
 */
export function useNewEventsIndicator(
  eventCount: number,
  initialEventCount: number
): NewEventsIndicatorResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [newEventCount, setNewEventCount] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const prevEventCount = useRef(eventCount);
  const hasInitialized = useRef(false);

  // Track scroll position to determine if user is at top
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Consider "at top" if within 100px of top
      const atTop = container.scrollTop < 100;
      setIsAtTop(atTop);

      // If user scrolled back to top, clear the count
      if (atTop) {
        setNewEventCount(0);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Track initial load completion
  useEffect(() => {
    if (!hasInitialized.current && eventCount > 0 && initialEventCount > 0) {
      hasInitialized.current = true;
      prevEventCount.current = eventCount;
    }
  }, [eventCount, initialEventCount]);

  // When new events arrive
  useEffect(() => {
    // Skip during initial load
    if (!hasInitialized.current) return;

    const newEvents = eventCount - prevEventCount.current;

    if (newEvents > 0) {
      if (!isAtTop) {
        // User has scrolled down - increment new event count
        setNewEventCount((prev) => prev + newEvents);
      }
      // If at top, user sees new events immediately - no need to track
    }

    prevEventCount.current = eventCount;
  }, [eventCount, isAtTop]);

  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setNewEventCount(0);
  }, []);

  return { containerRef, newEventCount, scrollToTop, isAtTop };
}
