---
phase: 03-layered-display-projects
plan: 01
subsystem: ui
tags: [nuqs, react-collapsed, shiki, url-state, convex]

# Dependency graph
requires:
  - phase: 02-core-feed-display
    provides: Live event feed with real-time updates
provides:
  - nuqs URL state infrastructure
  - listProjects Convex query
  - useProjectFilter hook for URL-synced project filtering
affects: [03-02, 03-03, project-filtering, event-expansion]

# Tech tracking
tech-stack:
  added: [nuqs@2.8.8, react-collapsed@4.2.0, shiki@3.22.0]
  patterns: [URL state via nuqs useQueryState, NuqsAdapter wrapper pattern]

key-files:
  created: [app/hooks/useProjectFilter.ts]
  modified: [package.json, app/layout.tsx, convex/events.ts]

key-decisions:
  - "NuqsAdapter inside ConvexClientProvider - proper provider nesting order"
  - "parseAsString for project filter - null when no param, string when set"
  - "Aggregate all events for listProjects - simple approach, can optimize later with dedicated index"

patterns-established:
  - "URL state hooks in app/hooks/ directory"
  - "nuqs useQueryState for URL-synced component state"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 3 Plan 01: Dependencies and URL State Infrastructure Summary

**Installed nuqs/react-collapsed/shiki and configured URL state management with NuqsAdapter wrapper and useProjectFilter hook**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-03T07:56:12Z
- **Completed:** 2026-02-03T07:57:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Installed three Phase 3 dependencies (nuqs, react-collapsed, shiki)
- Configured NuqsAdapter in app layout for URL state synchronization
- Created listProjects Convex query returning unique projects sorted by activity
- Created useProjectFilter hook for ?project= URL parameter sync

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and configure NuqsAdapter** - `56d548f` (feat)
2. **Task 2: Create listProjects query and useProjectFilter hook** - `41a7217` (feat)

## Files Created/Modified
- `package.json` - Added nuqs, react-collapsed, shiki dependencies
- `app/layout.tsx` - Added NuqsAdapter import and wrapper around children
- `convex/events.ts` - Added listProjects query for unique projects
- `app/hooks/useProjectFilter.ts` - URL-synced project filter hook using nuqs

## Decisions Made
- **NuqsAdapter inside ConvexClientProvider:** Maintains proper provider hierarchy
- **parseAsString for project:** Returns null when no param (all projects), string when filtered
- **Aggregate pattern for listProjects:** Queries all events and reduces to unique projects with most recent timestamp; simple but effective for current scale

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- URL state infrastructure ready for project filter UI
- listProjects query available for dropdown population
- react-collapsed ready for expand/collapse animations
- shiki ready for syntax highlighting

---
*Phase: 03-layered-display-projects*
*Completed: 2026-02-03*
