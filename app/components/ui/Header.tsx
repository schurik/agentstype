"use client";

import { ConnectionStatus } from "../feed/ConnectionStatus";

interface HeaderProps {
  /** Number of new events to display when user has scrolled up */
  newEventCount?: number;
}

/**
 * Header bar with application title and connection status.
 * Sticky at top with dark background matching terminal aesthetic.
 */
export function Header({ newEventCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="font-mono font-semibold text-zinc-100">
          agentstype.dev
        </h1>
        <div className="flex items-center gap-4">
          {newEventCount !== undefined && newEventCount > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
              {newEventCount} new
            </span>
          )}
          <ConnectionStatus />
        </div>
      </div>
    </header>
  );
}
