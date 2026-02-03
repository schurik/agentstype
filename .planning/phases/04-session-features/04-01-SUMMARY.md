---
phase: 04-session-features
plan: 01
subsystem: api
tags: [convex, nuqs, url-state, session-filter, agent-filter]

# Dependency graph
requires:
  - phase: 03-layered-display-projects
    provides: nuqs URL state pattern (useProjectFilter), project sidebar
provides:
  - listSessionsForProject Convex query with session metadata
  - listAgentsForSession Convex query with agent info
  - listEvents agentId filter support
  - useSessionFilter URL state hook
  - useAgentFilter URL state hook
affects: [04-02, 04-03, sidebar-hierarchy, session-header]

# Tech tracking
tech-stack:
  added: [date-fns]
  patterns: [session-aggregation, nuqs-url-hierarchy]

key-files:
  created:
    - app/hooks/useSessionFilter.ts
    - app/hooks/useAgentFilter.ts
  modified:
    - convex/events.ts

key-decisions:
  - "Post-filter agentId (no index) since datasets are small"
  - "Session goal from first user_prompt_submit prompt field"
  - "hasEnded derived from session_end event presence"

patterns-established:
  - "URL state hierarchy: project > session > agent via nuqs"
  - "Server-side session aggregation via Map reduce pattern"

# Metrics
duration: 2min
completed: 2026-02-03
---

# Phase 04 Plan 01: Session and Agent Queries Summary

**Convex queries for session/agent aggregation plus nuqs URL hooks for hierarchical filtering**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-03T10:48:41Z
- **Completed:** 2026-02-03T10:51:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- listSessionsForProject query returns sessions with goal, eventCount, timestamps, hasEnded
- listAgentsForSession query returns agents with agentType and eventCount
- listEvents now accepts optional agentId for post-filtering
- useSessionFilter and useAgentFilter hooks follow existing nuqs pattern
- URL state hierarchy enables /live?project=foo&session=abc&agent=xyz

## Task Commits

Each task was committed atomically:

1. **Task 1: Install date-fns and create Convex queries** - `f14264d` (feat)
2. **Task 2: Create URL state hooks for session and agent** - `5d228c0` (feat)

## Files Created/Modified
- `convex/events.ts` - Added listSessionsForProject, listAgentsForSession queries and agentId filter
- `app/hooks/useSessionFilter.ts` - URL-synced session filter hook
- `app/hooks/useAgentFilter.ts` - URL-synced agent filter hook

## Decisions Made
- Post-filter agentId without index: Datasets are small (<500 events/session), no need for index overhead
- Session goal extraction: First user_prompt_submit event's prompt field captures initial intent
- Session end detection: Presence of session_end event type determines hasEnded boolean

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - date-fns was already installed from prior work, Convex codegen ran cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Convex queries ready for sidebar hierarchy (ProjectSidebar expansion)
- URL hooks ready for SessionItem and AgentItem click handlers
- listEvents agentId filter ready for EventFeed filtering

---
*Phase: 04-session-features*
*Completed: 2026-02-03*
