---
phase: 06-performance-scale
plan: 01
subsystem: infra
tags: [convex, presence, virtualization, react-virtual, real-time]

# Dependency graph
requires:
  - phase: 05-pages-navigation
    provides: Core app structure and pages
provides:
  - "@tanstack/react-virtual library for event feed virtualization"
  - "@convex-dev/presence for real-time viewer tracking"
  - "heartbeat mutation and listViewers query for presence"
affects: [06-02, 06-03]

# Tech tracking
tech-stack:
  added: ["@tanstack/react-virtual ^3.13.18", "@convex-dev/presence ^0.3.0"]
  patterns: ["Convex component registration via app.use()"]

key-files:
  created: ["convex/convex.config.ts", "convex/presence.ts"]
  modified: ["package.json"]

key-decisions:
  - "heartbeat requires sessionId parameter (per @convex-dev/presence API)"
  - "listViewers uses listRoom with onlineOnly=true for active viewers"
  - "10 second heartbeat interval (2.5x timeout = 25s stale removal)"

patterns-established:
  - "Convex component pattern: defineApp() + app.use(component)"
  - "Presence wrapper functions: mutation for heartbeat, query for listing"

# Metrics
duration: 3min
completed: 2026-02-04
---

# Phase 6 Plan 1: Dependencies & Presence Summary

**Installed @tanstack/react-virtual and @convex-dev/presence, configured Convex presence component with heartbeat mutation and listViewers query**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-04T21:40:00Z
- **Completed:** 2026-02-04T21:43:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Installed @tanstack/react-virtual ^3.13.18 for event feed virtualization (to be used in 06-02)
- Installed @convex-dev/presence ^0.3.0 for real-time viewer tracking
- Configured Convex app with presence component via convex.config.ts
- Created presence.ts with heartbeat mutation and listViewers query

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies** - `3cfaa40` (chore)
2. **Task 2: Configure Convex presence component** - `dc43a50` (feat)

## Files Created/Modified
- `package.json` - Added @tanstack/react-virtual and @convex-dev/presence dependencies
- `convex/convex.config.ts` - Convex app configuration with presence component
- `convex/presence.ts` - Presence heartbeat mutation and listViewers query

## Decisions Made
- heartbeat mutation requires sessionId parameter (not optional) - per @convex-dev/presence library API
- listViewers uses listRoom() with onlineOnly=true instead of list() which requires roomToken
- 10 second heartbeat interval - presence auto-removes stale entries at 2.5x interval (25s)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed presence.heartbeat API call**
- **Found during:** Task 2 (Configure Convex presence component)
- **Issue:** Plan specified `presence.heartbeat(ctx, room, userId, {}, 10000)` but @convex-dev/presence API requires `sessionId` as 4th string parameter, not an object
- **Fix:** Updated to `presence.heartbeat(ctx, room, userId, sessionId, 10000)` and added sessionId to mutation args
- **Files modified:** convex/presence.ts
- **Verification:** `bunx convex dev --once` deploys successfully
- **Committed in:** dc43a50

**2. [Rule 3 - Blocking] Fixed listViewers to use listRoom instead of list**
- **Found during:** Task 2 (Configure Convex presence component)
- **Issue:** Plan specified `presence.list(ctx, room)` but list() requires a roomToken (returned from heartbeat), not a roomId
- **Fix:** Used `presence.listRoom(ctx, room, true)` which takes roomId directly and returns online users
- **Files modified:** convex/presence.ts
- **Verification:** TypeScript compiles, Convex deploys
- **Committed in:** dc43a50

---

**Total deviations:** 2 auto-fixed (2 blocking - API signature corrections)
**Impact on plan:** Both fixes were necessary to match the actual @convex-dev/presence library API. No scope change, just correct API usage.

## Issues Encountered
None beyond the API signature corrections documented above.

## User Setup Required
None - no external service configuration required. Presence component auto-deploys with Convex.

## Next Phase Readiness
- @tanstack/react-virtual ready for virtualized event feed in 06-02
- Presence component deployed and ready for viewer count UI in 06-03
- heartbeat mutation ready to accept room, userId, sessionId from client
- listViewers query ready to return online users for a room

---
*Phase: 06-performance-scale*
*Completed: 2026-02-04*
