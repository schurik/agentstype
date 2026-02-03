---
phase: 04-session-features
plan: 05
subsystem: ui
tags: [react, convex, session-stats, event-count, hooks]

# Dependency graph
requires:
  - phase: 04-01
    provides: useSessionStats hook for computing session statistics
  - phase: 04-02
    provides: SessionHeader displaying stats in feed view
provides:
  - Accurate session event count in stats header (not limited by query pagination)
  - useSessionStats accepting totalEventCount parameter for accurate counts
affects: [future session analytics, metrics display]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pass accurate counts from aggregation queries to display hooks"
    - "Maintain backward compatibility with optional parameters"

key-files:
  created: []
  modified:
    - app/hooks/useSessionStats.ts
    - app/components/feed/EventFeed.tsx

key-decisions:
  - "Add optional totalEventCount to useSessionStats with fallback to computed count"
  - "Query listSessionsForProject in EventFeed for accurate eventCount"

patterns-established:
  - "Optional parameter with fallback: Use ?? operator to prefer provided value, compute if undefined"

# Metrics
duration: 3min
completed: 2026-02-03
---

# Phase 4 Plan 5: Session Stats Event Count Fix Summary

**Session stats now show accurate total event count from listSessionsForProject instead of limited 100-event array count**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-03
- **Completed:** 2026-02-03
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- useSessionStats now accepts optional totalEventCount parameter for accurate counts
- EventFeed queries listSessionsForProject to get accurate session eventCount
- Session header stats show total events (e.g., 247) not limited count (e.g., 100)
- Maintains backward compatibility - callers without totalEventCount get existing behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Update useSessionStats to accept totalEventCount** - `c8cae6c` (feat)
2. **Task 2: Wire session eventCount through EventFeed** - `8111e79` (fix)

## Files Created/Modified
- `app/hooks/useSessionStats.ts` - Added optional totalEventCount parameter with fallback
- `app/components/feed/EventFeed.tsx` - Query session data and pass accurate eventCount to stats hook

## Decisions Made
- Add optional third parameter to useSessionStats (backward compatible)
- Use listSessionsForProject query in EventFeed (Convex deduplicates with ProjectSidebar's query)
- Use nullish coalescing (??) to prefer provided count over computed count

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - TypeScript compilation passed on both tasks. Pre-existing lint warnings in other files unrelated to this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- UAT Test 7 issue resolved
- Session stats display accurate total event counts
- Ready for Phase 5 (Pages & Navigation)

---
*Phase: 04-session-features*
*Completed: 2026-02-03*
