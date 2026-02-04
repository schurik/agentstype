# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-01-31)

**Core value:** The live feed - real-time Claude Code sessions with layered display (summary + technical depth)
**Current focus:** Phase 6 in progress - Performance & Scale

## Current Position

Phase: 6 of 6 (Performance & Scale) - IN PROGRESS
Plan: 3 of 3 in current phase
Status: In progress
Last activity: 2026-02-04 - Completed 06-03-PLAN.md

Progress: [██████████████████] 95%

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 2.9 min
- Total execution time: 58 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-event-capture | 2 | 5 min | 2.5 min |
| 02-core-feed-display | 3 | 10 min | 3.3 min |
| 03-layered-display-projects | 4 | 12 min | 3.0 min |
| 04-session-features | 5 | 14 min | 2.8 min |
| 05-pages-navigation | 3 | 8 min | 2.7 min |
| 06-performance-scale | 3 | 9 min | 3.0 min |

**Recent Trend:**
- Last 5 plans: 05-03 (3 min), 06-01 (3 min), 06-02 (3 min), 06-03 (3 min)
- Trend: Consistent execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Context | Commit |
|----------|---------|--------|
| Generate eventId server-side if not provided | Ensures every event has unique ID even if hook doesn't supply one | 01-01 |
| Return HTTP 200 on errors | Fire-and-forget semantics, prevents hook retries | 01-01 |
| Dual indexes (by_project, by_session) | Efficient queries for both project and session filtering | 01-01 |
| Silent exit on missing jq | Don't block Claude if jq not installed | 01-02 |
| Fire-and-forget POST (1s/2s timeout) | Never block Claude workflow | 01-02 |
| Block entire file contents for sensitive types | Safer than trying to filter .env, .pem, .key files | 01-02 |
| Force dark mode via :root and className="dark" | Not media query dependent, consistent dark appearance | 02-01 |
| Monospace font as body default | Terminal-like feel per CONTEXT.md | 02-01 |
| Idle detection deferred | useConnectionStatus returns "live" when connected; refine later | 02-01 |
| Reverse DESC results for chat-like display | Events from Convex come newest first, reverse for newest at bottom | 02-02 |
| Track initial event IDs for animation | Only animate events that arrive after initial page load | 02-02 |
| Middle truncation for paths | Long paths as first/.../last preserves context | 02-02 |
| Newest events at top | Simpler than auto-scroll to bottom, more natural for feed | 02-03 |
| Track new events by ID set | Query limit keeps count at 100, so track by IDs instead | 02-03 |
| Banner above scroll container | Guarantees visibility when new events arrive | 02-03 |
| NuqsAdapter inside ConvexClientProvider | Proper provider nesting order for URL state | 03-01 |
| parseAsString for project filter | null when no param, string when set | 03-01 |
| Aggregate pattern for listProjects | Simple approach, can optimize with index later | 03-01 |
| Shiki highlighter singleton | Cached promise for reuse across components | 03-02 |
| github-dark theme for Shiki | Matches dark mode design | 03-02 |
| Controlled expand pattern | EventFeed owns state, EventCard receives props | 03-02 |
| 200ms cubic-bezier animation | Smooth expand/collapse per react-collapsed | 03-02 |
| Hydration-safe localStorage pattern | hasMounted flag to defer read until after hydration | 03-03 |
| 5-minute activity threshold | Projects show green pulse if active within 5 min | 03-03 |
| Auto-select most recent project | If no project selected, auto-select first | 03-03 |
| Cmd/Ctrl+B keyboard shortcut | Power user shortcut for sidebar toggle | 03-03 |
| Callback pattern for expand/collapse | EventFeed exposes handlers via callback, Header wires to buttons | 03-04 |
| Suspense boundary for URL state | useSearchParams/nuqs needs Suspense for SSR hydration | 03-04 |
| Post-filter agentId (no index) | Small datasets make post-filter acceptable | 04-01 |
| Session goal from first user_prompt_submit | Captures initial intent for session display | 04-01 |
| hasEnded from session_end event presence | Determines session completion status | 04-01 |
| Client-side stats computation via useMemo | No server aggregation needed for small datasets | 04-02 |
| 5-minute activity threshold for live status | Matches project activity threshold from 03-03 | 04-02 |
| Action-aware thinking indicator labels | Context-specific labels (Reading, Editing, etc.) | 04-02 |
| Widen sidebar from w-48 to w-56 | Accommodate nested hierarchy display | 04-03 |
| Conditional query with 'skip' | Avoid fetching sessions/agents for unselected items | 04-03 |
| Track expanded projects separately | Allows collapsing selected project | 04-03 |
| Prioritize sessionId over projectName in listEvents | More specific filter takes precedence | 04-04 |
| Session click always clears agent | Better UX for returning to full session view | 04-04 |
| Text shimmer via background-position animation | Gradient text animation instead of separate bar | 04-04 |
| Commit detection via 'git commit' in command | Simple string matching for milestone markers | 04-04 |
| Optional totalEventCount param with fallback | Backward compatible way to provide accurate counts | 04-05 |
| Query sessions in EventFeed for accurate count | Convex deduplicates with existing sidebar query | 04-05 |
| Bottom nav for mobile (not hamburger menu) | Modern app-like UX per CONTEXT.md | 05-01 |
| Exact pathname match for home, prefix for others | Accurate active state indication | 05-01 |
| Navigation in root layout | All-page consistency | 05-01 |
| 5-minute LIVE badge threshold | Matches existing activity detection threshold | 05-02 |
| Terminal mockup with traffic lights | macOS-style authenticity per CONTEXT.md | 05-02 |
| Mobile-first terminal positioning | Terminal above text on small screens | 05-02 |
| Grid layout with sticky sidebar | Social links in sticky sidebar on desktop | 05-03 |
| Placeholder pattern for customization | Bio contains instructive placeholder text | 05-03 |
| Server Components for static pages | No client state needed for About page | 05-03 |
| heartbeat requires sessionId parameter | Per @convex-dev/presence API, sessionId is required | 06-01 |
| listViewers uses listRoom with onlineOnly | listRoom takes roomId directly, list() requires token | 06-01 |
| 10 second heartbeat interval | Presence auto-removes at 2.5x interval (25s stale) | 06-01 |
| parseAsArrayOf for multi-select filter URL state | Enables comma-separated filter values (filter=Read,Write) | 06-02 |
| Two-pass batching algorithm | toolUseId grouping before consecutive batching | 06-02 |
| BATCHABLE_TOOLS limited to read-heavy ops | Read, Glob, Grep, WebSearch, WebFetch only | 06-02 |
| MIN_BATCH_SIZE = 2 | Per CONTEXT.md batching threshold | 06-02 |
| useSyncExternalStore for browser APIs | Proper React 18+ pattern for visibility detection | 06-03 |
| Dual IDs (viewerId + sessionId) for presence | Client generates both via sessionStorage | 06-03 |

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-04
Stopped at: Completed 06-03-PLAN.md
Resume file: None
Next: 06-04-PLAN.md (if exists) or Phase 6 complete
