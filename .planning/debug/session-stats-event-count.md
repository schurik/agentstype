---
status: diagnosed
trigger: "Investigate why the session stats event count shows only the filtered max 100 events instead of the total session event count"
created: 2026-02-03T10:00:00Z
updated: 2026-02-03T10:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Stats are computed from the limited 100-event array passed from EventFeed
test: Read useSessionStats.ts, EventFeed.tsx, and convex/events.ts to trace data flow
expecting: Find that stats hook receives only 100 events due to query limit
next_action: Read useSessionStats.ts to understand stats computation

## Symptoms

expected: Session stats event count should show total events captured during entire session
actual: Event count shows only the filtered max 100 events
errors: None (logic issue, not error)
reproduction: Open a session with >100 events, observe stats show 100 instead of total
started: User reported observation

## Eliminated

## Evidence

- timestamp: 2026-02-03T10:01:00Z
  checked: useSessionStats.ts lines 44-47
  found: eventCount is computed by filtering and counting the events array passed in
  implication: If events array is limited, eventCount will be limited

- timestamp: 2026-02-03T10:01:30Z
  checked: EventFeed.tsx lines 66-74
  found: EventFeed queries with `limit: 100` and passes `events` directly to `useSessionStats(events, selectedSession)`
  implication: Stats hook only sees 100 events maximum

- timestamp: 2026-02-03T10:02:00Z
  checked: convex/events.ts listEvents query lines 102-141
  found: Query applies `.take(limit)` where limit defaults to 100, returns only 100 events
  implication: Even if session has 500 events, only 100 are returned

- timestamp: 2026-02-03T10:02:30Z
  checked: convex/events.ts listSessionsForProject query lines 178-236
  found: This query uses `.collect()` (no limit) and computes accurate eventCount per session
  implication: Correct count IS computed in backend but not exposed to stats hook

## Resolution

root_cause: useSessionStats computes eventCount by counting the events array from EventFeed, which is limited to 100 events by the listEvents query limit
fix:
verification:
files_changed: []
