'use client'

import { formatTime } from '@/app/lib/formatters'

interface SessionItemProps {
  sessionId: string
  goal: string | null
  firstTimestamp: number
  hasEnded: boolean
  eventCount: number
  isSelected: boolean
  isCollapsed: boolean
  onClick: () => void
}

export function SessionItem({
  goal,
  firstTimestamp,
  hasEnded,
  eventCount,
  isSelected,
  isCollapsed,
  onClick,
}: SessionItemProps) {
  // Active if not ended AND recent (within 5 min)
  const isRecent = Date.now() - firstTimestamp < 5 * 60 * 1000
  const isActive = !hasEnded && isRecent

  // Format time label: "Session 2:30pm"
  const timeLabel = `Session ${formatTime(firstTimestamp)}`

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left pl-6
        ${isSelected ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
        ${isCollapsed ? 'justify-center pl-2' : ''}`}
      title={goal || timeLabel}
    >
      {/* Status dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
        }`}
      />

      {!isCollapsed && (
        <>
          {/* Time label */}
          <span className="font-mono text-xs truncate flex-1">{timeLabel}</span>

          {/* Event count badge */}
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {eventCount}
          </span>
        </>
      )}
    </button>
  )
}
