'use client'
import { useQueryState, parseAsString } from 'nuqs'

/**
 * Hook for URL-synced project filter state.
 * Uses nuqs to sync the 'project' query parameter with React state.
 *
 * @returns [project, setProject] tuple where:
 *   - project: string | null (null when no ?project= param)
 *   - setProject: function to update the filter (updates URL)
 *
 * @example
 * const [project, setProject] = useProjectFilter()
 * // ?project=agentstype -> project === "agentstype"
 * // no param -> project === null
 * setProject("myproject") // navigates to ?project=myproject
 * setProject(null) // removes the param
 */
export function useProjectFilter() {
  return useQueryState('project', parseAsString)
}
