"use client";

import { useSyncExternalStore } from "react";

/**
 * Track whether the current tab is visible/active.
 * Uses Page Visibility API to detect tab switches, minimize, etc.
 *
 * Per CONTEXT.md: "Watching" = active tab only
 */
export function usePageVisibility(): boolean {
  return useSyncExternalStore(
    subscribeToVisibilityChange,
    getVisibilitySnapshot,
    getServerSnapshot
  );
}

function subscribeToVisibilityChange(callback: () => void): () => void {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilitySnapshot(): boolean {
  return document.visibilityState === "visible";
}

function getServerSnapshot(): boolean {
  // During SSR, assume visible (optimistic)
  return true;
}
