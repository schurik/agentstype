import { ReactNode } from "react";

interface TerminalMockupProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * macOS-style terminal window component.
 * Renders children in a terminal-like container with traffic light buttons.
 */
export function TerminalMockup({
  children,
  title = "Terminal",
  className = "",
}: TerminalMockupProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl ${className}`}
    >
      {/* Title bar with traffic lights */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
        {/* Traffic light buttons */}
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        {/* Title centered */}
        <div className="flex-1 text-center text-xs text-zinc-500">{title}</div>
        {/* Spacer to balance title centering */}
        <div className="w-[52px]" />
      </div>

      {/* Content area */}
      <div className="p-4 font-mono text-sm text-zinc-300">{children}</div>
    </div>
  );
}
