"use client";

import { ConnectionStatus } from "../feed/ConnectionStatus";
import { useViewerCount } from "@/app/hooks/useViewerCount";
import { Eye } from "lucide-react";

interface HeaderProps {
  /** Callback when "Expand all" button is clicked */
  onExpandAll?: () => void;
  /** Callback when "Collapse all" button is clicked */
  onCollapseAll?: () => void;
  /** Room for viewer count (projectName or projectName:sessionId) */
  viewerRoom?: string | null;
}

/**
 * Header bar with application title, connection status, viewer count, and expand/collapse controls.
 * Sticky at top with dark background matching terminal aesthetic.
 */
export function Header({ onExpandAll, onCollapseAll, viewerRoom }: HeaderProps) {
  // Track viewer count for the current room (project or session)
  const viewerCount = useViewerCount(viewerRoom);

  return (
    <header className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-zinc-100">agentstype.dev</h1>
          <ConnectionStatus />
          {viewerCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Eye className="w-3 h-3" />
              <span>{viewerCount} watching</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse buttons - only show when handlers provided */}
        {(onExpandAll || onCollapseAll) && (
          <div className="flex items-center gap-2">
            {onExpandAll && (
              <button
                onClick={onExpandAll}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Expand all
              </button>
            )}
            {onExpandAll && onCollapseAll && (
              <span className="text-zinc-700">|</span>
            )}
            {onCollapseAll && (
              <button
                onClick={onCollapseAll}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Collapse all
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
