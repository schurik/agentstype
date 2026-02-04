"use client";

import { useState, useEffect } from "react";

/**
 * Track whether the current tab is visible/active.
 * Uses Page Visibility API to detect tab switches, minimize, etc.
 *
 * Per CONTEXT.md: "Watching" = active tab only
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initial state
    setIsVisible(document.visibilityState === "visible");

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
