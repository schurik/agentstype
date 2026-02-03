import { useMemo } from 'react'
import type { Doc } from '@/convex/_generated/dataModel'

type Event = Doc<'events'>

// Session is considered "live" if last activity within 5 minutes
const ACTIVITY_THRESHOLD_MS = 5 * 60 * 1000

export interface SessionStatus {
  isLive: boolean
  lastActivity: number | null
}

/**
 * Derive session live/completed status from events.
 *
 * A session is considered "live" if:
 * - It has no session_end event, AND
 * - The most recent event is within the activity threshold (5 minutes)
 *
 * @param events - Array of events (from listEvents query)
 * @param sessionId - Session ID to check status for
 * @returns SessionStatus with isLive boolean and lastActivity timestamp
 */
export function useSessionStatus(
  events: Event[] | undefined,
  sessionId: string | null
): SessionStatus {
  return useMemo(() => {
    if (!events || !sessionId) {
      return { isLive: false, lastActivity: null }
    }

    // Filter events to this session
    const sessionEvents = events.filter((e) => e.sessionId === sessionId)
    if (sessionEvents.length === 0) {
      return { isLive: false, lastActivity: null }
    }

    // Check for explicit session_end
    const hasEnded = sessionEvents.some((e) => e.type === 'session_end')
    // Events come DESC (newest first), so first element is most recent
    const latestTimestamp = sessionEvents[0].timestamp

    if (hasEnded) {
      return { isLive: false, lastActivity: latestTimestamp }
    }

    // Check recency (within 5 min threshold)
    const isRecent = Date.now() - latestTimestamp < ACTIVITY_THRESHOLD_MS

    return {
      isLive: isRecent,
      lastActivity: latestTimestamp,
    }
  }, [events, sessionId])
}
