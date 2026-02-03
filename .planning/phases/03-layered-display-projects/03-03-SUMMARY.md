---
phase: 03-layered-display-projects
plan: 03
subsystem: ui
tags: [react, sidebar, localStorage, hydration, real-time]

# Dependency graph
requires:
  - phase: 03-01
    provides: useProjectFilter hook for URL state, listProjects query
provides:
  - ProjectSidebar with collapsible project list and activity indicators
  - ProjectItem with activity status (green pulse for active)
  - useSidebarCollapse hook with localStorage persistence
  - CurrentlyIndicator with live event summary
affects: [04-polish-ux, layout integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - hydration-safe localStorage hook pattern
    - sticky indicator with backdrop blur

key-files:
  created:
    - app/hooks/useSidebarCollapse.ts
    - app/components/sidebar/ProjectSidebar.tsx
    - app/components/sidebar/ProjectItem.tsx
    - app/components/feed/CurrentlyIndicator.tsx
  modified: []

key-decisions:
  - "Hydration-safe pattern: hasMounted flag to prevent SSR/client mismatch"
  - "5-minute threshold for 'active' project status"
  - "Auto-select most recent project if none selected"
  - "Cmd/Ctrl+B keyboard shortcut for sidebar toggle"

patterns-established:
  - "Hydration-safe localStorage: useState(default) + useEffect to read after mount"
  - "Activity pulse: green animate-pulse for active, zinc-600 for inactive"

# Metrics
duration: 3min
completed: 2026-02-03
---

# Phase 3 Plan 3: Sidebar and Currently Indicator Summary

**Collapsible project sidebar with activity indicators and sticky "Currently" indicator showing live event summaries**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-03T08:01:57Z
- **Completed:** 2026-02-03T08:05:14Z
- **Tasks:** 3
- **Files created:** 4

## Accomplishments
- Created useSidebarCollapse hook with hydration-safe localStorage persistence
- Built ProjectSidebar component with project list, activity indicators, and collapse toggle
- Built ProjectItem component showing project name, activity status, and selection state
- Created CurrentlyIndicator with event summary generation and pulse animation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useSidebarCollapse hook** - `686aca7` (feat)
2. **Task 2: Create ProjectSidebar and ProjectItem** - `e2baeb7` (feat)
3. **Task 3: Create CurrentlyIndicator** - `3e1afca` (feat)

## Files Created

- `app/hooks/useSidebarCollapse.ts` - Hydration-safe localStorage hook for sidebar collapse state
- `app/components/sidebar/ProjectSidebar.tsx` - Collapsible project list with URL filter integration
- `app/components/sidebar/ProjectItem.tsx` - Individual project row with activity indicator
- `app/components/feed/CurrentlyIndicator.tsx` - Sticky indicator showing current activity summary

## Decisions Made

1. **Hydration-safe pattern** - Use hasMounted flag to defer localStorage read until after hydration, preventing SSR/client mismatch
2. **5-minute activity threshold** - Projects show green pulse if last activity within 5 minutes
3. **Auto-select behavior** - If no project selected, auto-select the most recently active project
4. **Keyboard shortcut** - Cmd/Ctrl+B toggles sidebar collapse for power users
5. **Summary generation** - CurrentlyIndicator generates human-readable summaries based on tool type (e.g., "Reading src/app/page.tsx")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Components created but not yet integrated into layout:
- ProjectSidebar ready for placement in main layout
- CurrentlyIndicator ready for placement in feed area
- Both components export clean interfaces for integration

Next steps (likely 03-04 or layout update):
- Add ProjectSidebar to app layout
- Add CurrentlyIndicator to EventFeed
- Wire up isReceivingEvents detection for CurrentlyIndicator pulse

---
*Phase: 03-layered-display-projects*
*Completed: 2026-02-03*
