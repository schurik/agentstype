'use client'

import { useState } from 'react'
import { ThinkingIndicator } from './ThinkingIndicator'
import { formatTime, formatDuration } from '@/app/lib/formatters'
import type { SessionStats } from '@/app/hooks/useSessionStats'
import type { SessionStatus } from '@/app/hooks/useSessionStatus'

interface SessionHeaderProps {
  goal: string | null
  stats: SessionStats | null
  status: SessionStatus
  latestEventTool?: string
}

/**
 * Rich session header card displayed at top of feed when a session is selected.
 *
 * Features:
 * - Status badge with pulse animation for live sessions
 * - Goal text (from initial prompt) with line-clamp
 * - Time range display (start/end or just start if ongoing)
 * - Collapsible stats section (events, files, commits, duration)
 * - Thinking indicator when session is live
 *
 * @param goal - Session goal (first user prompt)
 * @param stats - Computed session stats from useSessionStats
 * @param status - Live/completed status from useSessionStatus
 * @param latestEventTool - Latest event tool type for thinking context
 */
export function SessionHeader({
  goal,
  stats,
  status,
  latestEventTool,
}: SessionHeaderProps) {
  const [showStats, setShowStats] = useState(false)

  return (
    <div className="border-b border-zinc-800 bg-zinc-900 p-4">
      {/* Status badge row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status.isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'
          }`}
        />
        <span className="text-xs text-zinc-500">
          {status.isLive ? 'Live' : 'Completed'}
        </span>
        {stats?.isComplete && (
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
            Session completed
          </span>
        )}
      </div>

      {/* Goal (initial prompt) */}
      {goal && (
        <p className="text-sm text-zinc-300 mb-3 line-clamp-2">{goal}</p>
      )}

      {/* Time range */}
      <div className="text-xs text-zinc-500 mb-2">
        {stats?.isComplete
          ? `${formatTime(stats.startTime)} - ${formatTime(stats.endTime)} (${formatDuration(stats.duration)})`
          : `Started ${formatTime(stats?.startTime)}`}
      </div>

      {/* Collapsible stats button */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        {showStats ? 'Hide stats' : 'Show stats'}
      </button>

      {/* Stats grid (when expanded) */}
      {showStats && stats && (
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">Events:</span>{' '}
            <span className="text-zinc-300">{stats.eventCount}</span>
          </div>
          <div>
            <span className="text-zinc-500">Files:</span>{' '}
            <span className="text-zinc-300">{stats.filesCount}</span>
          </div>
          <div>
            <span className="text-zinc-500">Commits:</span>{' '}
            <span className="text-zinc-300">{stats.commitsCount}</span>
          </div>
          <div>
            <span className="text-zinc-500">Duration:</span>{' '}
            <span className="text-zinc-300">{formatDuration(stats.duration)}</span>
          </div>
        </div>
      )}

      {/* Thinking indicator when live */}
      {status.isLive && <ThinkingIndicator actionType={latestEventTool} />}
    </div>
  )
}
