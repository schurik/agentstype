import { useMemo } from 'react'
import type { Doc } from '@/convex/_generated/dataModel'

type Event = Doc<'events'>

export interface SessionStats {
  duration: number
  eventCount: number
  filesCount: number
  commitsCount: number
  isComplete: boolean
  startTime: number | undefined
  endTime: number | undefined
}

/**
 * Compute session statistics from event list.
 *
 * @param events - Array of events (from listEvents query)
 * @param sessionId - Session ID to filter and compute stats for
 * @param totalEventCount - Optional total event count for the session (from listSessionsForProject).
 *                          If provided, used instead of computing from events array, which may be
 *                          limited by query pagination.
 * @returns SessionStats object or null if no events/sessionId
 */
export function useSessionStats(
  events: Event[] | undefined,
  sessionId: string | null,
  totalEventCount?: number
): SessionStats | null {
  return useMemo(() => {
    if (!events || !sessionId) return null

    // Filter events to this session
    const sessionEvents = events.filter((e) => e.sessionId === sessionId)
    if (sessionEvents.length === 0) return null

    // Find start and end events
    const startEvent = sessionEvents.find((e) => e.type === 'session_start')
    const endEvent = sessionEvents.find((e) => e.type === 'session_end')

    // Duration calculation
    // Events come DESC (newest first), so last element is oldest
    const startTime = startEvent?.timestamp ?? sessionEvents[sessionEvents.length - 1]?.timestamp
    const endTime = endEvent?.timestamp ?? sessionEvents[0]?.timestamp
    const durationMs = (endTime ?? 0) - (startTime ?? 0)

    // Event count (excluding session_start/session_end)
    // Use totalEventCount if provided (accurate count from session query),
    // otherwise fall back to computing from events array (may be limited by pagination)
    const eventCount = totalEventCount ?? sessionEvents.filter(
      (e) => !['session_start', 'session_end'].includes(e.type)
    ).length

    // Files touched (unique paths from Edit/Write/Read tools)
    const filePaths = new Set<string>()
    sessionEvents.forEach((e) => {
      if (['Edit', 'Write', 'Read'].includes(e.tool ?? '')) {
        const path = e.toolInput?.file_path
        if (typeof path === 'string') {
          filePaths.add(path)
        }
      }
    })

    // Commits (Bash commands containing 'git commit')
    const commits = sessionEvents.filter(
      (e) =>
        e.tool === 'Bash' &&
        typeof e.toolInput?.command === 'string' &&
        e.toolInput.command.includes('git commit')
    ).length

    return {
      duration: durationMs,
      eventCount,
      filesCount: filePaths.size,
      commitsCount: commits,
      isComplete: !!endEvent,
      startTime,
      endTime,
    }
  }, [events, sessionId, totalEventCount])
}
