# Phase 4: Session Features - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see session boundaries, stats, and agent relationships. Sessions are independent units of work within a project — they can run in parallel and are not chronologically ordered. The sidebar becomes a hierarchical browser: Projects > Sessions > Agents.

</domain>

<decisions>
## Implementation Decisions

### Session Organization Model
- Sessions are grouped under projects in the sidebar
- Sessions are independent (not chronological) — can run in parallel
- Selecting a session filters the feed to only that session's events
- One session displayed at a time in the main feed

### Sidebar Hierarchy
- Projects contain sessions (nested in sidebar)
- Sessions shown as timestamp-based labels (e.g., "Session 2:30pm")
- Session goal shown on hover
- Green dot indicator for live sessions, gray for completed
- Selecting a session auto-expands its agent list

### Session Header Card
- Rich header card at top of feed when session selected
- Shows: goal, live/completed status, time range
- Time range format: "Started 2:30pm" while active, "2:30pm - 3:15pm (45 min)" when complete
- Stats in header: event count, files touched, token/cost, duration
- Token/cost collapsed by default (expandable "Stats" section)
- Completed sessions show "Session completed" badge + outcome info (commits made, etc.)

### Default View
- Empty state prompt when no session selected: "Select a session from the sidebar"
- New session notification: banner appears "New session started", user clicks to jump

### Agent Hierarchy
- Agents listed flat under session (not nested tree)
- Each agent shows event count in sidebar
- Selecting an agent filters feed to that agent's events only
- Clicking session name shows all agents' events combined
- Agent header shows task/purpose: "Explorer: Find authentication files"
- Agents auto-expand when session is selected

### Thinking Indicator
- Displayed in session header (not as feed event)
- Shimmer effect animation
- Shows action type context: "Reading files..." / "Writing code..." / "Searching..."

### Claude's Discretion
- Stats update frequency for live sessions (real-time vs periodic)
- Idle state behavior (when Claude hasn't acted for a while)

</decisions>

<specifics>
## Specific Ideas

- Sidebar hierarchy: Project > Session > Agents — each level filters the feed
- Sessions labeled by timestamp with goal on hover for quick scanning
- "It should be possible to switch between different sessions and display only the live stream of one selected session"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-session-features*
*Context gathered: 2026-02-03*
