"use client";

import { useState, useCallback } from "react";
import { Header } from "@/app/components/ui/Header";
import { EventFeed } from "@/app/components/feed/EventFeed";
import { ProjectSidebar } from "@/app/components/sidebar/ProjectSidebar";

/**
 * Live feed content with project sidebar and event feed.
 *
 * Layout:
 * - ProjectSidebar on left (collapsible)
 * - Main content area with Header and EventFeed
 * - Full-height flex layout
 *
 * Features:
 * - Project filtering via URL (?project=name)
 * - Expand/collapse event cards
 * - "Currently" indicator
 * - Real-time event updates
 */
export function LiveFeedContent() {
  // Store expand/collapse handlers from EventFeed to pass to Header
  const [expandCollapseHandlers, setExpandCollapseHandlers] = useState<{
    expandAll: () => void;
    collapseAll: () => void;
  } | null>(null);

  const handleExpandCollapseChange = useCallback(
    (handlers: { expandAll: () => void; collapseAll: () => void }) => {
      setExpandCollapseHandlers(handlers);
    },
    []
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Project sidebar */}
      <ProjectSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onExpandAll={expandCollapseHandlers?.expandAll}
          onCollapseAll={expandCollapseHandlers?.collapseAll}
        />
        <main className="flex-1 overflow-hidden">
          <EventFeed onExpandCollapseChange={handleExpandCollapseChange} />
        </main>
      </div>
    </div>
  );
}
