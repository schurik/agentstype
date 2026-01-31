---
phase: 01-event-capture-infrastructure
plan: 01
subsystem: api
tags: [convex, http-actions, real-time, events, database]

# Dependency graph
requires: []
provides:
  - Convex events table with schema and indexes
  - HTTP POST /event endpoint for receiving hook events
  - listEvents query for real-time frontend subscription
affects: [02-hook-script, frontend-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Convex httpAction for external HTTP endpoints
    - Convex internalMutation for HTTP-triggered writes
    - Convex query for real-time subscriptions

key-files:
  created:
    - convex/schema.ts
    - convex/events.ts
    - convex/http.ts
  modified: []

key-decisions:
  - "Generate eventId server-side if not provided (crypto.randomUUID)"
  - "Return 200 even on errors to prevent hook retries"
  - "Use by_project and by_session indexes for efficient filtering"

patterns-established:
  - "HTTP endpoints return 200 on errors for fire-and-forget hooks"
  - "Internal mutations for HTTP-triggered database writes"
  - "Public queries for frontend real-time subscriptions"

# Metrics
duration: 2min
completed: 2026-01-31
---

# Phase 01 Plan 01: Convex Event Infrastructure Summary

**Convex HTTP endpoint at /event with events table, dual indexes, and real-time listEvents query for frontend subscription**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-31T23:01:49Z
- **Completed:** 2026-01-31T23:04:20Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments
- Events table schema with required and optional fields for all Claude Code event types
- HTTP POST /event endpoint for receiving hook events with fire-and-forget semantics
- Real-time listEvents query with optional projectName, sessionId, and limit filters
- Dual indexes (by_project, by_session) for efficient queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Create events schema with indexes** - `a265df6` (feat)
2. **Task 2: Create HTTP endpoint and event mutation** - `f4ef585` (feat)
3. **Task 3: Create listEvents query for frontend subscription** - `094d15f` (feat)

## Files Created/Modified
- `convex/schema.ts` - Events table definition with indexes
- `convex/events.ts` - Internal store mutation and public listEvents query
- `convex/http.ts` - HTTP router with POST /event endpoint

## Decisions Made
- Generate eventId server-side using crypto.randomUUID if client doesn't provide one
- Always return HTTP 200 even on errors to avoid triggering retries from the hook
- Use by_project and by_session indexes for filtered queries
- Default listEvents limit to 100 events, ordered by timestamp DESC

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully with passing verification.

## User Setup Required

None - no external service configuration required. Convex deployment is already configured.

## Next Phase Readiness
- HTTP endpoint ready at https://affable-canary-809.convex.site/event
- Plan 01-02 can now build the Claude Code hook script to POST events to this endpoint
- Frontend can subscribe to events via `useQuery(api.events.listEvents)`

---
*Phase: 01-event-capture-infrastructure*
*Completed: 2026-01-31*
