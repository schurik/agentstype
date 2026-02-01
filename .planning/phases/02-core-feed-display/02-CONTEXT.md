# Phase 2: Core Feed Display - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Display a real-time event stream showing Claude Code activity. Users see events as they happen with visual distinction between types, connection status, and clean dark mode styling. Expanding events for details and project filtering are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Event card design
- Colored left border to distinguish event types (green=read, blue=write, orange=bash, red=error)
- Minimal card content by default: event type + timestamp only (details come in Phase 3)
- Truncate long paths in the middle (src/.../component.tsx)

### Feed behavior
- Smart auto-scroll: scroll to new events only if user is near bottom; pause if they've scrolled up
- When paused: floating badge at bottom ("5 new events ↓") AND counter in header for awareness
- New events animate in with fade + slide up effect

### Connection status UI
- Status indicator lives in header bar, always visible
- Live state: green pulsing dot + "Live" text
- Reconnecting/Offline: status changes to yellow/red respectively (no banner, just status replacement)
- Idle state: gray indicator showing "Idle" when no active Claude session

### Typography & spacing
- Terminal-like density: tight spacing, high density, more events visible at once
- Near-black background (#0a0a0a) — softer dark, easier on eyes
- No specific visual reference — interpret as clean dark mode

### Claude's Discretion
- Project/session badge on cards: decide based on what looks clean
- Initial event load count: pick a sensible default
- Font choice: mixed vs full monospace, whatever looks best
- Exact colors for event type borders
- Animation timing and easing

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants terminal-like feel but not a literal terminal emulator.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-feed-display*
*Context gathered: 2026-02-01*
