---
phase: 06-performance-scale
plan: 03
subsystem: ui
tags: [presence, hooks, react, visibility-api, convex]

# Dependency graph
requires:
  - phase: 06-01
    provides: Convex presence backend (heartbeat, listViewers mutations)
provides:
  - usePageVisibility hook for active tab detection
  - useViewerCount hook with real-time presence tracking
  - BatchedEventGroup component for expandable batched events
affects: [06-04-PLAN, integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useSyncExternalStore for browser API hooks
    - sessionStorage for stable anonymous viewer IDs

key-files:
  created:
    - app/hooks/usePageVisibility.ts
    - app/hooks/useViewerCount.ts
    - app/components/feed/BatchedEventGroup.tsx
  modified: []

key-decisions:
  - "useSyncExternalStore over useState+useEffect for page visibility"
  - "Dual IDs (viewerId + sessionId) for presence heartbeat"
  - "10-second heartbeat interval matching presence TTL"

patterns-established:
  - "useSyncExternalStore for browser APIs (visibility, etc.)"
  - "sessionStorage for stable anonymous client IDs"

# Metrics
duration: 3min
completed: 2026-02-04
---

# Phase 6 Plan 3: Viewer Count and Batched Events Summary

**Real-time viewer count via useSyncExternalStore-based visibility detection and Convex presence, plus expandable BatchedEventGroup component for batched event display**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-04T20:48:35Z
- **Completed:** 2026-02-04T20:51:52Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- usePageVisibility hook with Page Visibility API via useSyncExternalStore
- useViewerCount hook tracking real-time viewer count with presence heartbeats
- BatchedEventGroup component showing collapsed count + sample files, expandable to full list

## Task Commits

Each task was committed atomically:

1. **Task 1: Create viewer count and page visibility hooks** - `418580b` (feat)
2. **Task 2: Create BatchedEventGroup component** - `799b293` (feat)
3. **Bug fix: useSyncExternalStore for page visibility** - `08d757b` (fix)

## Files Created/Modified
- `app/hooks/usePageVisibility.ts` - Active tab detection via Page Visibility API
- `app/hooks/useViewerCount.ts` - Real-time viewer count with Convex presence heartbeats
- `app/components/feed/BatchedEventGroup.tsx` - Expandable batch display component

## Decisions Made
- **useSyncExternalStore over useState+useEffect:** Plan originally used useState+useEffect pattern, but this triggers lint errors for setState in effect body. useSyncExternalStore is the proper React 18+ pattern for subscribing to external browser APIs.
- **Dual IDs (viewerId + sessionId):** Per 06-01 findings, the @convex-dev/presence heartbeat mutation requires both userId and sessionId parameters. Client generates both via sessionStorage for stability across page reloads.
- **10-second heartbeat interval:** Matches the presence TTL configured in 06-01 (presence auto-removes stale entries at 2.5x interval = 25s).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed lint error in usePageVisibility**
- **Found during:** Task 1 verification
- **Issue:** useState+useEffect pattern triggers lint error for setState in effect body
- **Fix:** Refactored to useSyncExternalStore with separate snapshot functions
- **Files modified:** app/hooks/usePageVisibility.ts
- **Verification:** Lint passes with no errors for new files
- **Committed in:** 08d757b

**2. [Rule 1 - Bug] Fixed Date.now() impure function call in BatchedEventGroup**
- **Found during:** Task 2 verification
- **Issue:** `Date.now()` as fallback in render triggers lint error for impure function
- **Fix:** Changed fallback to 0 (component shouldn't render without events anyway)
- **Files modified:** app/components/feed/BatchedEventGroup.tsx
- **Verification:** Lint passes
- **Committed in:** 799b293 (part of task commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for lint compliance. No scope creep.

## Issues Encountered
None - execution proceeded smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Viewer count hook ready for integration into EventFeed
- BatchedEventGroup component ready for use with useBatchedEvents hook
- All hooks export cleanly for consumption

---
*Phase: 06-performance-scale*
*Completed: 2026-02-04*
