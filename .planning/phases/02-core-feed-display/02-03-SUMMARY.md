---
phase: 02-core-feed-display
plan: 03
subsystem: ui
tags: [react, nextjs, convex, real-time, feed, page-composition]

# Dependency graph
requires:
  - phase: 02-02
    provides: EventFeed, Header components with real-time subscription
  - phase: 02-01
    provides: Dark mode, useConnectionStatus, useRelativeTime hooks
provides:
  - Main page composing Header and EventFeed
  - Full-height responsive layout
  - Newest-at-top event display pattern
  - New events indicator for tracking arrivals while scrolled
affects: [03-layered-display, project-filtering, session-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Newest-at-top feed display (simpler than auto-scroll)
    - Track new events by ID set (handles query limits correctly)
    - Banner above scroll container for visibility

key-files:
  created:
    - app/components/feed/hooks/useNewEventsIndicator.ts
  modified:
    - app/page.tsx
    - app/components/feed/EventFeed.tsx
    - app/components/feed/NewEventsIndicator.tsx

key-decisions:
  - "Display newest events at top instead of auto-scroll to bottom"
  - "Track new events by ID set, not count (query limit keeps count at 100)"
  - "Position new events banner above scroll container for guaranteed visibility"

patterns-established:
  - "Newest-at-top feed: simpler UX, no auto-scroll complexity"
  - "ID-based new event tracking: compare seen IDs set against current events"
  - "Banner positioning: above scroll area, not fixed/floating inside"

# Metrics
duration: 5min
completed: 2026-02-02
---

# Phase 02 Plan 03: Page Integration Summary

**Main page with Header and EventFeed, newest-at-top display with new events indicator**

## Performance

- **Duration:** ~5 min (including verification fixes)
- **Started:** 2026-02-01T22:28:00Z
- **Completed:** 2026-02-02T21:30:00Z
- **Tasks:** 2 (1 implementation + 1 visual verification)
- **Files created:** 1
- **Files modified:** 3

## Accomplishments

- Main page displays Header at top with EventFeed filling remaining viewport
- Switched to newest-at-top display (simpler than auto-scroll to bottom)
- New events indicator appears when scrolled down and new events arrive
- Clicking indicator scrolls to top and clears count
- Complete Phase 2 visual verification passed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create main page with Header and EventFeed** - `de5c955` (feat)
2. **Task 2: Visual verification checkpoint** - approved (human-verify)

**Fix commits during verification:**
- `a2fdf02` (fix) - Display newest events at top instead of auto-scroll
- `486bc80` (feat) - Add new events indicator for newest-at-top feed
- `8a4ba75` (fix) - Reposition new events banner above scroll container
- `481fd12` (fix) - Fix new events indicator tracking by ID

## Files Created

- `app/components/feed/hooks/useNewEventsIndicator.ts` - Hook tracking new events by comparing ID sets

## Files Modified

- `app/page.tsx` - Main page composing Header and EventFeed with full-height layout
- `app/components/feed/EventFeed.tsx` - Updated for newest-at-top display with indicator integration
- `app/components/feed/NewEventsIndicator.tsx` - Repositioned as banner above scroll container

## Decisions Made

1. **Display newest events at top** - Auto-scroll to bottom was complex and user feedback during verification showed newest-at-top is simpler and more natural for this feed type.

2. **Track new events by ID set, not count** - The Convex query has a limit of 100 events. Tracking by count would break when the count stays at 100 as new events push old ones out. Instead, compare current event IDs against a "seen" set to detect truly new arrivals.

3. **Position banner above scroll container** - Fixed positioning inside the scroll area was unreliable. Placing the banner outside and above the scroll container guarantees visibility when new events arrive.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Auto-scroll UX was complex and unintuitive**
- **Found during:** Task 2 (Visual verification)
- **Issue:** Auto-scroll to bottom with newest at bottom felt backwards for this feed type
- **Fix:** Changed to newest-at-top display, removed auto-scroll, removed reverse()
- **Files modified:** app/components/feed/EventFeed.tsx
- **Committed in:** a2fdf02

**2. [Rule 2 - Missing Critical] No way to see new events when scrolled down**
- **Found during:** Task 2 (Visual verification)
- **Issue:** With newest at top, user misses new events when scrolled down reading history
- **Fix:** Created useNewEventsIndicator hook and integrated with EventFeed
- **Files modified:** app/components/feed/EventFeed.tsx, app/components/feed/NewEventsIndicator.tsx, hooks/useNewEventsIndicator.ts
- **Committed in:** 486bc80

**3. [Rule 1 - Bug] New events banner not visible when scrolled**
- **Found during:** Task 2 (Visual verification)
- **Issue:** Fixed positioning inside scroll container was unreliable
- **Fix:** Repositioned banner above scroll container with high-visibility blue background
- **Files modified:** app/components/feed/EventFeed.tsx, app/components/feed/NewEventsIndicator.tsx
- **Committed in:** 8a4ba75

**4. [Rule 1 - Bug] New events count stuck at 0**
- **Found during:** Task 2 (Visual verification)
- **Issue:** Count tracking broke because query limit keeps event count at 100
- **Fix:** Track by event IDs using a Set, compare against seen IDs to detect new arrivals
- **Files modified:** app/components/feed/EventFeed.tsx, hooks/useNewEventsIndicator.ts
- **Committed in:** 481fd12

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 missing critical)
**Impact on plan:** All fixes improved UX based on visual verification feedback. No scope creep - all changes were necessary for correct operation.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 complete: Real-time event feed displays with proper styling
- Events appear within seconds, connection status works, visual distinction by type
- Ready for Phase 3: Layered disclosure and project filtering

---
*Phase: 02-core-feed-display*
*Completed: 2026-02-02*
