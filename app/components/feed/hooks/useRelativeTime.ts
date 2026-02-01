"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

/**
 * Hook that formats a timestamp as relative time ("2 min ago") and refreshes periodically.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @param refreshInterval - How often to recalculate relative time (default 60s)
 * @returns Formatted relative time string with suffix (e.g., "2 minutes ago")
 */
export function useRelativeTime(
  timestamp: number,
  refreshInterval: number = 60000
): string {
  const [relative, setRelative] = useState(() =>
    formatDistanceToNow(timestamp, { addSuffix: true })
  );

  useEffect(() => {
    const update = () => {
      setRelative(formatDistanceToNow(timestamp, { addSuffix: true }));
    };

    const id = setInterval(update, refreshInterval);
    return () => clearInterval(id);
  }, [timestamp, refreshInterval]);

  return relative;
}
