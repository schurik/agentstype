"use client";

import { useState, useCallback } from "react";
import { Header } from "@/app/components/ui/Header";
import { EventFeed } from "@/app/components/feed/EventFeed";
import { ProjectSidebar } from "@/app/components/sidebar/ProjectSidebar";
import { useProjectFilter } from "@/app/hooks/useProjectFilter";
import { useSessionFilter } from "@/app/hooks/useSessionFilter";

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
 * - Session filtering via URL (?session=id)
 * - Agent filtering via URL (?agent=id)
 * - Hierarchical navigation: Project > Session > Agent
 * - Session header with goal, status, stats when session selected
 * - Expand/collapse event cards
 * - Real-time event updates
 */
export function LiveFeedContent() {
  // Get URL state for context-aware guidance
  const [selectedProject] = useProjectFilter();
  const [selectedSession] = useSessionFilter();

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

  // Show guidance when project selected but no session
  const showSessionHint = selectedProject && !selectedSession;

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
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Session selection hint */}
          {showSessionHint && (
            <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs text-zinc-500">
              Select a session from the sidebar for detailed view with stats and timeline
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <EventFeed onExpandCollapseChange={handleExpandCollapseChange} />
          </div>
        </main>
      </div>
    </div>
  );
}
