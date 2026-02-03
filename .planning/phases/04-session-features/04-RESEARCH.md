# Phase 4: Session Features - Research

**Researched:** 2026-02-03
**Domain:** Session aggregation, sidebar hierarchy, thinking indicators, computed stats
**Confidence:** HIGH

## Summary

This phase implements session organization in the sidebar (Project > Session > Agents hierarchy), session header cards with stats, agent display, and thinking indicators. The research identified patterns that leverage existing infrastructure while adding session-level aggregation.

The key insight is that **token/cost data is NOT available through Claude Code hooks** - it's only accessible via the `/cost` and `/stats` CLI commands. This means SESS-03 (token/cost counter) cannot be implemented with real data in Phase 4. The recommendation is to either defer this requirement or display placeholder text directing users to the CLI command.

For session stats (duration, event count, files touched), these can be **computed client-side** from existing event data. Session boundaries are marked by `session_start` and `session_end` events already in the schema. Files touched can be counted from `pre_tool_use` events with `tool === 'Edit'|'Write'|'Read'`. Git commits can be detected from Bash commands containing `git commit`.

The sidebar hierarchy requires extending the existing `ProjectSidebar` component with nested collapsible sections for sessions and agents. The flat agent list (per CONTEXT.md decision) simplifies this significantly - no recursive tree needed, just two levels of nesting.

**Primary recommendation:** Use client-side aggregation for session stats, extend the existing sidebar with nuqs for session/agent URL state, and implement the thinking indicator as a shimmer animation in the session header card using Tailwind's animate-pulse extended with a custom shimmer gradient.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuqs | ^2.x (existing) | URL state for session/agent selection | Already installed, type-safe, handles ?session= and ?agent= params |
| react-collapsed | ^4.x (existing) | Sidebar section collapse | Already installed, handles height:auto animation |
| Tailwind CSS | v4 (existing) | Shimmer/pulse animations | Built-in animate-pulse, extendable for custom shimmer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | ^4.x | Duration formatting | Format "45 min" from timestamps |
| @convex-dev/aggregate | ^0.x | Server-side aggregation | Only if client-side becomes slow (>1000 events) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side stats | Convex aggregate component | More complex setup, needed for >1000 events per session |
| Custom shimmer | react-loading-skeleton | Adds dependency, animate-pulse is sufficient |
| Nested tree component | react-accessible-treeview | Overkill - flat agent list per CONTEXT.md |

**Installation:**
```bash
bun add date-fns
# Other dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── hooks/
│   ├── useSessionFilter.ts       # URL state for ?session= param
│   ├── useAgentFilter.ts         # URL state for ?agent= param
│   ├── useSessionStats.ts        # Compute stats from events
│   └── useSessionStatus.ts       # Derive live/completed status
├── components/
│   ├── sidebar/
│   │   ├── ProjectSidebar.tsx    # Extend with session/agent hierarchy
│   │   ├── SessionItem.tsx       # Session row with goal preview
│   │   └── AgentItem.tsx         # Agent row with event count
│   └── feed/
│       ├── SessionHeader.tsx     # Rich header card at top of feed
│       ├── ThinkingIndicator.tsx # Shimmer effect in header
│       └── EventFeed.tsx         # Filter by session/agent
convex/
├── events.ts                     # Add listSessions, listAgents queries
└── schema.ts                     # No changes needed (has sessionId, agentId)
```

### Pattern 1: URL State Hierarchy with nuqs
**What:** Three-level URL state: project, session, agent
**When to use:** All session/agent selection in sidebar
**Example:**
```typescript
// Source: Phase 3 research, extended
'use client'
import { useQueryState, parseAsString } from 'nuqs'

export function useSessionFilter() {
  return useQueryState('session', parseAsString)
}

export function useAgentFilter() {
  return useQueryState('agent', parseAsString)
}

// In EventFeed - filter cascade
const [project] = useProjectFilter()
const [session] = useSessionFilter()
const [agent] = useAgentFilter()

// Query filtered events
const events = useQuery(api.events.listEvents, {
  projectName: project ?? undefined,
  sessionId: session ?? undefined,
  agentId: agent ?? undefined,  // New filter
  limit: 100,
})
```

### Pattern 2: Client-Side Session Stats Computation
**What:** Derive stats from event list without server aggregation
**When to use:** Sessions with <500 events (typical)
**Example:**
```typescript
// hooks/useSessionStats.ts
export function useSessionStats(events: Event[] | undefined, sessionId: string | null) {
  return useMemo(() => {
    if (!events || !sessionId) return null

    const sessionEvents = events.filter(e => e.sessionId === sessionId)
    const startEvent = sessionEvents.find(e => e.type === 'session_start')
    const endEvent = sessionEvents.find(e => e.type === 'session_end')

    // Duration
    const startTime = startEvent?.timestamp ?? sessionEvents[sessionEvents.length - 1]?.timestamp
    const endTime = endEvent?.timestamp ?? sessionEvents[0]?.timestamp
    const durationMs = endTime - startTime

    // Event count (excluding session_start/end)
    const eventCount = sessionEvents.filter(e =>
      !['session_start', 'session_end'].includes(e.type)
    ).length

    // Files touched (unique paths from Edit/Write/Read)
    const filePaths = new Set<string>()
    sessionEvents.forEach(e => {
      if (['Edit', 'Write', 'Read'].includes(e.tool ?? '')) {
        const path = e.toolInput?.file_path
        if (path) filePaths.add(path)
      }
    })

    // Commits (Bash commands with 'git commit')
    const commits = sessionEvents.filter(e =>
      e.tool === 'Bash' &&
      e.toolInput?.command?.includes('git commit')
    ).length

    return {
      duration: durationMs,
      eventCount,
      filesCount: filePaths.size,
      commitsCount: commits,
      isComplete: !!endEvent,
      startTime,
      endTime,
    }
  }, [events, sessionId])
}
```

### Pattern 3: Session Status Derivation
**What:** Determine if session is live or completed
**When to use:** Session status indicators, header badge
**Example:**
```typescript
// hooks/useSessionStatus.ts
const ACTIVITY_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export function useSessionStatus(events: Event[] | undefined, sessionId: string | null) {
  return useMemo(() => {
    if (!events || !sessionId) return { isLive: false, lastActivity: null }

    const sessionEvents = events.filter(e => e.sessionId === sessionId)
    if (sessionEvents.length === 0) return { isLive: false, lastActivity: null }

    // Check for explicit session_end
    const hasEnded = sessionEvents.some(e => e.type === 'session_end')
    if (hasEnded) return { isLive: false, lastActivity: sessionEvents[0].timestamp }

    // Check recency (within 5 min threshold)
    const latestTimestamp = sessionEvents[0].timestamp
    const isRecent = Date.now() - latestTimestamp < ACTIVITY_THRESHOLD_MS

    return {
      isLive: isRecent,
      lastActivity: latestTimestamp,
    }
  }, [events, sessionId])
}
```

### Pattern 4: Shimmer Thinking Indicator
**What:** Animated shimmer effect when Claude is processing
**When to use:** Session header when no recent event but session is live
**Example:**
```typescript
// components/feed/ThinkingIndicator.tsx
// Source: https://www.slingacademy.com/article/tailwind-css-creating-shimmer-loading-placeholder-skeleton/
export function ThinkingIndicator({ actionType }: { actionType?: string }) {
  const label = actionType || 'Thinking...'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-md">
      {/* Shimmer bar */}
      <div className="relative h-2 w-24 bg-zinc-700 rounded overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 animate-shimmer" />
      </div>
      <span className="text-sm text-zinc-400">{label}</span>
    </div>
  )
}

// tailwind.config.ts extension:
// extend: {
//   animation: {
//     shimmer: 'shimmer 2s linear infinite',
//   },
//   keyframes: {
//     shimmer: {
//       '0%': { transform: 'translateX(-100%)' },
//       '100%': { transform: 'translateX(100%)' },
//     },
//   },
// }
```

### Pattern 5: Session Header Card
**What:** Rich header at top of feed showing session info
**When to use:** When a session is selected
**Example:**
```typescript
// components/feed/SessionHeader.tsx
interface SessionHeaderProps {
  goal: string | null
  stats: SessionStats | null
  status: { isLive: boolean; lastActivity: number | null }
}

export function SessionHeader({ goal, stats, status }: SessionHeaderProps) {
  const [showStats, setShowStats] = useState(false)

  return (
    <div className="border-b border-zinc-800 bg-zinc-900 p-4">
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${status.isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
        <span className="text-xs text-zinc-500">
          {status.isLive ? 'Live' : 'Completed'}
        </span>
        {stats?.isComplete && (
          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
            Session completed
          </span>
        )}
      </div>

      {/* Goal (initial prompt) */}
      {goal && (
        <p className="text-sm text-zinc-300 mb-3 line-clamp-2">{goal}</p>
      )}

      {/* Time range */}
      <div className="text-xs text-zinc-500 mb-2">
        {stats?.isComplete
          ? `${formatTime(stats.startTime)} - ${formatTime(stats.endTime)} (${formatDuration(stats.duration)})`
          : `Started ${formatTime(stats?.startTime)}`
        }
      </div>

      {/* Collapsible stats */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="text-xs text-zinc-500 hover:text-zinc-400"
      >
        {showStats ? 'Hide stats' : 'Show stats'}
      </button>

      {showStats && stats && (
        <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
          <div><span className="text-zinc-500">Events:</span> {stats.eventCount}</div>
          <div><span className="text-zinc-500">Files:</span> {stats.filesCount}</div>
          <div><span className="text-zinc-500">Commits:</span> {stats.commitsCount}</div>
          <div><span className="text-zinc-500">Duration:</span> {formatDuration(stats.duration)}</div>
        </div>
      )}

      {/* Thinking indicator when live but no recent event */}
      {status.isLive && <ThinkingIndicator />}
    </div>
  )
}
```

### Pattern 6: Sidebar Session Hierarchy
**What:** Nested sidebar with Project > Session > Agents
**When to use:** Main sidebar navigation
**Example:**
```typescript
// components/sidebar/ProjectSidebar.tsx (extended)
// Each project expands to show sessions
// Each session expands to show agents
// Selecting any level filters the feed

function ProjectItem({ project, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(isSelected)
  const sessions = useQuery(api.events.listSessionsForProject, { projectName: project.name })

  return (
    <div>
      <button onClick={() => { onSelect(project.name); setIsExpanded(!isExpanded) }}>
        {project.name}
      </button>

      {isExpanded && sessions?.map(session => (
        <SessionItem
          key={session.sessionId}
          session={session}
          projectName={project.name}
        />
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Server-side aggregation for small datasets:** Don't add Convex aggregate component complexity for <500 events per session
- **Nested tree for flat agent list:** CONTEXT.md specifies agents are flat under session, not nested tree
- **Token/cost from hooks:** This data is NOT available - don't try to capture it
- **Polling for "thinking" state:** Derive from event timestamps and session status instead
- **Storing computed stats:** Compute client-side from events, don't denormalize

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL state for session/agent | Custom useRouter logic | nuqs (already installed) | Type-safe, handles Suspense |
| Duration formatting | Manual calculation | date-fns formatDuration | Edge cases (hours, days, etc.) |
| Shimmer animation | CSS keyframes from scratch | Tailwind animate-pulse + custom shimmer | Built-in, configurable |
| Session list query | Scan all events client-side | Convex query with index | by_session index exists |
| Collapse animation | max-height hack | react-collapsed (already installed) | Proper height:auto handling |

**Key insight:** Most infrastructure is already in place from Phase 3. This phase is primarily about extending existing patterns (nuqs for more URL params, sidebar for more hierarchy levels) rather than introducing new libraries.

## Common Pitfalls

### Pitfall 1: Trying to Get Token/Cost Data
**What goes wrong:** Attempting to capture token usage through hooks
**Why it happens:** Assumption that all Claude Code data is available via hooks
**How to avoid:** Accept that `/cost` and `/stats` are CLI-only. Either defer SESS-03 or show "Use /cost in Claude Code" placeholder
**Warning signs:** Searching hooks docs for "token", "cost", "usage"

### Pitfall 2: Over-Engineering Agent Hierarchy
**What goes wrong:** Building recursive tree component for agents
**Why it happens:** Misreading requirement as "nested tree" when CONTEXT.md says "flat under session"
**How to avoid:** Re-read CONTEXT.md: "Agents listed flat under session (not nested tree)"
**Warning signs:** Installing react-accessible-treeview or building recursive component

### Pitfall 3: Session Stats Performance
**What goes wrong:** Slow UI when computing stats from many events
**Why it happens:** Recomputing on every render, not memoizing
**How to avoid:** Use useMemo with proper dependencies (events array, sessionId)
**Warning signs:** Laggy stats update, React DevTools showing excessive re-renders

### Pitfall 4: Thinking Indicator False Positives
**What goes wrong:** Shimmer shows when Claude isn't actually thinking
**Why it happens:** Only checking "no recent event" without session end check
**How to avoid:** Check both: session not ended AND recent activity threshold exceeded
**Warning signs:** Thinking indicator on completed sessions

### Pitfall 5: Session Goal Extraction
**What goes wrong:** No goal shown because first prompt wasn't captured
**Why it happens:** user_prompt_submit might be missing or prompt field empty
**How to avoid:** Fall back to session description or "Session started at {time}" if no prompt
**Warning signs:** Empty goal in header for valid sessions

### Pitfall 6: URL State Conflicts
**What goes wrong:** Selecting agent doesn't work when session not selected
**Why it happens:** Agent filter applied without session context
**How to avoid:** Clear agent filter when session changes, enforce hierarchy: project > session > agent
**Warning signs:** Agent filter showing events from wrong session

## Code Examples

Verified patterns from official sources:

### Session List Query (Convex)
```typescript
// convex/events.ts - add new query
// Source: existing listProjects pattern in codebase

export const listSessionsForProject = query({
  args: {
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all events for project
    const events = await ctx.db
      .query("events")
      .withIndex("by_project", (q) => q.eq("projectName", args.projectName))
      .collect()

    // Reduce to unique sessions with metadata
    const sessionMap = new Map<string, {
      sessionId: string
      firstTimestamp: number
      lastTimestamp: number
      eventCount: number
      goal: string | null
      hasEnded: boolean
    }>()

    for (const event of events) {
      const existing = sessionMap.get(event.sessionId)
      if (!existing) {
        sessionMap.set(event.sessionId, {
          sessionId: event.sessionId,
          firstTimestamp: event.timestamp,
          lastTimestamp: event.timestamp,
          eventCount: 1,
          goal: event.type === 'user_prompt_submit' ? event.prompt ?? null : null,
          hasEnded: event.type === 'session_end',
        })
      } else {
        existing.eventCount++
        if (event.timestamp < existing.firstTimestamp) {
          existing.firstTimestamp = event.timestamp
        }
        if (event.timestamp > existing.lastTimestamp) {
          existing.lastTimestamp = event.timestamp
        }
        if (event.type === 'user_prompt_submit' && !existing.goal) {
          existing.goal = event.prompt ?? null
        }
        if (event.type === 'session_end') {
          existing.hasEnded = true
        }
      }
    }

    // Sort by most recent activity
    return Array.from(sessionMap.values())
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
  },
})
```

### Agent List Query (Convex)
```typescript
// convex/events.ts - add new query
export const listAgentsForSession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()

    // Find subagent_start events to get agents
    const agentMap = new Map<string, {
      agentId: string
      agentType: string | null
      eventCount: number
    }>()

    for (const event of events) {
      if (event.type === 'subagent_start' && event.agentId) {
        agentMap.set(event.agentId, {
          agentId: event.agentId,
          agentType: event.agentType ?? null,
          eventCount: 0,
        })
      }
      // Count events per agent
      if (event.agentId) {
        const agent = agentMap.get(event.agentId)
        if (agent) {
          agent.eventCount++
        }
      }
    }

    return Array.from(agentMap.values())
  },
})
```

### Custom Shimmer Keyframes (Tailwind v4)
```css
/* app/globals.css - add to existing */
/* Source: https://www.slingacademy.com/article/tailwind-css-creating-shimmer-loading-placeholder-skeleton/ */

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}
```

### Date Formatting Helpers
```typescript
// lib/formatters.ts
// Source: date-fns documentation
import { formatDistanceToNow, format } from 'date-fns'

export function formatTime(timestamp: number | null | undefined): string {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'h:mma').toLowerCase()
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server aggregation for counts | Client-side useMemo | 2024+ | Simpler, no extra queries for small datasets |
| Spinner loading indicator | Shimmer/skeleton UI | 2023+ | Better perceived performance |
| Polling for status | Event-driven derivation | 2024+ | No unnecessary requests |
| Separate state for each level | nuqs URL state hierarchy | 2024+ | Shareable URLs, browser navigation works |

**Deprecated/outdated:**
- **Spinner for thinking state:** Shimmer provides better UX
- **Server-side computed fields:** Overkill for this use case with small event counts

## Open Questions

Things that couldn't be fully resolved:

1. **Token/Cost Data (SESS-03)**
   - What we know: NOT available through hooks, only via `/cost` CLI command
   - What's unclear: Whether Anthropic will add token data to hooks in future
   - Recommendation: Defer SESS-03 or show placeholder "Use /cost in Claude Code to see token usage"

2. **Agent Task/Purpose Display**
   - What we know: `agentType` field exists (e.g., "Explore", "Plan", "Bash")
   - What's unclear: Whether task description is available in hook data
   - Recommendation: Use agentType as label, derive purpose from first prompt if subagent

3. **Session Goal Edge Cases**
   - What we know: user_prompt_submit has `prompt` field
   - What's unclear: Is first prompt always the goal? What about resumed sessions?
   - Recommendation: Use first user_prompt_submit per session, fall back to timestamp label

4. **Thinking Indicator Action Context**
   - What we know: CONTEXT.md wants "Reading files..." / "Writing code..." context
   - What's unclear: How to detect "currently processing" without polling
   - Recommendation: Use latest event's tool type as context while session is live

## Sources

### Primary (HIGH confidence)
- Claude Code Hooks Reference: https://code.claude.com/docs/en/hooks - Full event schemas, confirmed token data not available
- Claude Code Costs: https://code.claude.com/docs/en/costs - Confirmed /cost is CLI-only
- nuqs GitHub - https://github.com/47ng/nuqs - URL state patterns (used in Phase 3)
- Tailwind CSS Animation - https://tailwindcss.com/docs/animation - Built-in animate-pulse
- date-fns - https://date-fns.org/ - Duration formatting

### Secondary (MEDIUM confidence)
- Sling Academy Shimmer - https://www.slingacademy.com/article/tailwind-css-creating-shimmer-loading-placeholder-skeleton/ - Shimmer keyframes
- MUI X Tree View - https://mui.com/x/react-tree-view/ - Expansion patterns (adapted for simpler use)

### Tertiary (LOW confidence)
- npm-compare tree view libraries - General ecosystem comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed or well-documented
- Architecture: HIGH - Extends existing Phase 3 patterns
- Pitfalls: HIGH - Token/cost limitation confirmed from official docs

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days - stable domain, but check for hook API updates)
