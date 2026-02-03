'use client'
import { useQueryState, parseAsString } from 'nuqs'

/**
 * Hook for URL-synced session filter state.
 * Uses nuqs to sync the 'session' query parameter with React state.
 *
 * @returns [session, setSession] tuple where:
 *   - session: string | null (null when no ?session= param)
 *   - setSession: function to update the filter (updates URL)
 *
 * @example
 * const [session, setSession] = useSessionFilter()
 * // ?session=abc123 -> session === "abc123"
 * // no param -> session === null
 * setSession("xyz789") // navigates to ?session=xyz789
 * setSession(null) // removes the param
 */
export function useSessionFilter() {
  return useQueryState('session', parseAsString)
}
