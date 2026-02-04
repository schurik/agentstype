"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";

/**
 * URL-synced event type filter.
 * State persists in URL as ?filter=Read,Write,Bash
 * Empty array = show all events (no filtering)
 */
export function useEventFilter() {
  return useQueryState(
    "filter",
    parseAsArrayOf(parseAsString).withDefault([])
  );
}
