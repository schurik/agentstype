# Phase 6: Performance & Scale - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Feed handles rapid events smoothly and shows social proof. Performance optimizations through virtualization, event batching for information density, and viewer count display. Database read optimization is a key cost constraint.

</domain>

<decisions>
## Implementation Decisions

### Event Batching
- Batching happens at display (frontend), not at capture
- Batch only consecutive events of the same tool type from the same agent
- Agent boundaries are NOT crossed when batching - each agent's events batch separately
- Initial threshold: 2+ consecutive events triggers batching (revisit after data analysis)
- Pre and post tool events (same `toolUseId`) should be grouped as a single unit

### Event Type Filtering
- Filter UI lives in a floating filter bar below the header
- Filter state persists in URL (`/live?project=x&filter=Read,Write`)
- Single vs multi-select: Claude's discretion

### Viewer Count
- Live updates (real-time as people join/leave)
- Display in header as anonymous count only ("5 watching")
- "Watching" = active tab (tab must be visible/focused to count)

### Virtualization
- Events auto-collapse when scrolled out of view
- Infinite scroll for loading older events
- Keep current scroll behavior (newest at top, no auto-scroll disruption)
- Memory management: Claude's discretion

### Information Extraction
- Extract key fields only: file paths, commands, error messages
- Expanded view: formatted by default with toggle to show raw data

### Subagent Visualization
- Subagent events displayed nested/indented under parent
- Maximum two levels of visual nesting (main → subagent → sub-subagent)
- Always visible (not collapsible)
- Visual distinction: indent + colored left border accents per agent level (no explicit labels)

### Database Optimization
- Primary concern: reducing reads (cost control)
- Acceptable latency: 1-5 seconds (near-real-time)
- Server-side pre-aggregation of events for efficient feed queries
- Keep both raw events (for drilldown) and aggregated views (for feed display)

### Claude's Discretion
- Collapsed batch format (count only vs count + sample vs count + summary)
- Which tool types should be batchable
- Client-side vs server-side filtering
- Memory limits for virtualization
- Specific colors for agent level accents

</decisions>

<specifics>
## Specific Ideas

- Batching threshold (2+ events) is intentionally provisional - analyze real data patterns before finalizing
- Pre/post tool grouping by `toolUseId` reduces visual noise significantly
- Viewer count tied to active tab prevents inflated numbers from background tabs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-performance-scale*
*Context gathered: 2026-02-03*
