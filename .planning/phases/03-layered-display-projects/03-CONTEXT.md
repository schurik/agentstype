# Phase 3: Layered Display & Projects - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Progressive disclosure of event details and project-based filtering. Users see minimal summaries by default, expand for full technical details on click, and filter the feed by project via a collapsible sidebar. URL reflects project filter for shareability.

</domain>

<decisions>
## Implementation Decisions

### Summary vs Detail View
- Collapsed: Icon + action only (e.g., 📄 Read src/app/page.tsx)
- Expanded: Full tool inputs + outputs — show everything
- Syntax highlighting for code/file content in expanded view
- Copy button on code blocks (appears on hover)
- Write events: Show new content only (not diffs)
- Bash events: Show command + full stdout/stderr output
- Tailored layouts per event type (Read shows file content, Bash shows terminal-style, etc.)

### Expand/Collapse Behavior
- Click anywhere on card to toggle expand
- Multiple events can be expanded independently (not accordion)
- Smooth slide animation for expand/collapse
- Rotating chevron indicates expand state
- New events always arrive collapsed
- Keyboard navigation: arrow keys to navigate, Enter to toggle expand
- Expanded state persists when scrolling away and back
- "Expand all" / "Collapse all" button in header

### "Currently" Indicator
- Shows latest event summary (e.g., "Reading src/app/page.tsx")
- Sticky at top of feed, always visible when scrolling
- Hidden when no active session
- Subtle pulse animation when actively receiving events

### Project Filter
- Sidebar list (not dropdown or tabs)
- No "All projects" option — must select a project
- Projects show name + activity indicator (dot/pulse for active)
- URL syncs: /live?project=name for shareable links
- Invalid project URL shows empty state message
- Projects ordered by most recent activity
- Default on /live without param: most recently active project
- Mobile: Convert sidebar to dropdown
- Desktop: Collapsible via toggle button + keyboard shortcut
- Collapsed state: Icons only for each project
- Collapse preference persists in localStorage

### Claude's Discretion
- Error styling in expanded view
- Exact keyboard shortcut for sidebar toggle
- Animation timing and easing
- Icon choices for collapsed sidebar

</decisions>

<specifics>
## Specific Ideas

- Event cards should be clickable anywhere (large touch target)
- Sidebar feels like VS Code's file explorer — collapsible, icons when narrow
- "Currently" indicator should feel alive — subtle pulse when active

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-layered-display-projects*
*Context gathered: 2026-02-02*
