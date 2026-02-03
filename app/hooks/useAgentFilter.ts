'use client'
import { useQueryState, parseAsString } from 'nuqs'

/**
 * Hook for URL-synced agent filter state.
 * Uses nuqs to sync the 'agent' query parameter with React state.
 *
 * @returns [agent, setAgent] tuple where:
 *   - agent: string | null (null when no ?agent= param)
 *   - setAgent: function to update the filter (updates URL)
 *
 * @example
 * const [agent, setAgent] = useAgentFilter()
 * // ?agent=agent-001 -> agent === "agent-001"
 * // no param -> agent === null
 * setAgent("agent-002") // navigates to ?agent=agent-002
 * setAgent(null) // removes the param
 */
export function useAgentFilter() {
  return useQueryState('agent', parseAsString)
}
