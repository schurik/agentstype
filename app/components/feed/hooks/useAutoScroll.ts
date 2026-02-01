"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";

export interface AutoScrollResult<T extends HTMLElement = HTMLDivElement> {
  /** Ref for the bottom anchor element (for scrollIntoView) */
  bottomRef: React.RefObject<T | null>;
  /** Ref callback for the sentinel element (intersection observer target) */
  sentinelRef: (node: Element | null) => void;
  /** Number of new items since user scrolled away from bottom */
  newItemCount: number;
  /** Scroll to bottom and reset new item count */
  scrollToBottom: () => void;
  /** Whether user is currently at/near bottom */
  isAtBottom: boolean;
}

/**
 * Smart auto-scroll hook for chat-like feeds.
 *
 * - Auto-scrolls to new items if user is at bottom
 * - Pauses auto-scroll when user scrolls up to read history
 * - Tracks count of new items that arrived while paused
 * - Only counts items beyond initial load size as "new"
 *
 * @param items - Array of items being displayed
 * @param initialLoadSize - Number of items in initial load (don't count these as "new")
 */
export function useAutoScroll<T>(
  items: T[],
  initialLoadSize: number
): AutoScrollResult {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [newItemCount, setNewItemCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevItemsLength = useRef(items.length);
  const hasInitialized = useRef(false);

  // Detect if bottom anchor is visible using intersection observer
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
  });

  // Update isAtBottom when inView changes
  useEffect(() => {
    setIsAtBottom(inView);
  }, [inView]);

  // Track initial load completion
  useEffect(() => {
    if (!hasInitialized.current && items.length > 0) {
      hasInitialized.current = true;
      prevItemsLength.current = items.length;
    }
  }, [items.length]);

  // When new items arrive
  useEffect(() => {
    // Skip during initial load
    if (!hasInitialized.current) return;

    const newItems = items.length - prevItemsLength.current;

    if (newItems > 0) {
      if (isAtBottom) {
        // Auto-scroll to bottom
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setNewItemCount(0);
      } else {
        // User has scrolled up - only count items beyond initial load
        const itemsBeyondInitial = items.length - initialLoadSize;
        if (itemsBeyondInitial > 0) {
          setNewItemCount(itemsBeyondInitial);
        }
      }
    }

    prevItemsLength.current = items.length;
  }, [items.length, isAtBottom, initialLoadSize]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewItemCount(0);
  }, []);

  return { bottomRef, sentinelRef, newItemCount, scrollToBottom, isAtBottom };
}
