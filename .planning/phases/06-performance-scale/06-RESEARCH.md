# Phase 6: Performance & Scale - Research

**Researched:** 2026-02-03
**Domain:** Virtualization, event batching, real-time presence, URL-based filtering
**Confidence:** HIGH

## Summary

Phase 6 focuses on four core areas: (1) virtualizing the event feed for smooth 100+ event scrolling, (2) batching consecutive same-type events for information density, (3) displaying real-time viewer count, and (4) adding event type filtering. The research confirms standard solutions exist for each requirement.

For virtualization, **@tanstack/react-virtual** is the recommended library. It's headless, lightweight (10-15kb), supports variable-height items via `measureElement`, and integrates well with React 19. The current feed renders all events directly, which works for <100 items but degrades performance beyond that. TanStack Virtual's overscan feature ensures smooth scrolling without visible rendering gaps.

For viewer count, **@convex-dev/presence** is Convex's official component. It implements efficient presence via scheduled functions (no polling), handles heartbeats automatically, and integrates with the Page Visibility API for "active tab" detection per CONTEXT.md requirements. The package provides a `usePresence` hook that manages all the complexity.

Event batching is a **frontend display concern** per CONTEXT.md decisions - raw events remain unbatched in storage. The batching algorithm groups consecutive events by `tool` + `agentId`, collapsing them into expandable summaries like "Read 15 files". Pre/post tool events sharing the same `toolUseId` should be grouped as a single logical unit before batching.

Event type filtering extends the existing nuqs URL state pattern with `parseAsArrayOf(parseAsString)` for multi-select support. The decision between client-side vs server-side filtering is left to Claude's discretion - client-side is simpler for the current data volumes.

**Primary recommendation:** Install @tanstack/react-virtual and @convex-dev/presence. Implement batching as a pure client-side transformation layer between Convex data and rendered components.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-virtual | ^3.13 | List virtualization | Headless, 10-15kb, supports variable heights, React 19 compatible |
| @convex-dev/presence | ^0.x | Real-time viewer count | Official Convex component, scheduled functions (no polling), handles heartbeats |
| nuqs | ^2.8 (existing) | URL state for filters | Already installed, supports arrays via parseAsArrayOf |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Page Visibility API | Browser native | Active tab detection | Viewer count should only count visible tabs |
| react-intersection-observer | ^10.x (existing) | Infinite scroll trigger | Load older events when scrolling to bottom |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-virtual | react-window | react-window has fixed-size-list by default; TanStack is more flexible for variable heights |
| @tanstack/react-virtual | react-virtuoso | react-virtuoso is larger (~35kb) but has reverse infinite scroll built-in |
| @convex-dev/presence | Custom heartbeat system | Presence component handles edge cases (tab close, reconnection) |

**Installation:**
```bash
bun add @tanstack/react-virtual @convex-dev/presence
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── hooks/
│   ├── useEventFilter.ts         # URL state for ?filter=Read,Write
│   ├── useViewerCount.ts         # Wraps presence for viewer count
│   ├── useBatchedEvents.ts       # Transform events into batched display
│   └── usePageVisibility.ts      # Active tab detection
├── components/
│   ├── feed/
│   │   ├── VirtualizedEventFeed.tsx  # Replace EventFeed with virtualized version
│   │   ├── BatchedEventGroup.tsx     # Collapsible batch display
│   │   └── FilterBar.tsx             # Floating filter bar
│   └── ui/
│       └── Header.tsx                # Add viewer count display
convex/
├── convex.config.ts              # Add presence component
├── presence.ts                   # Presence wrapper functions
└── events.ts                     # Add by_tool index for filtered queries
```

### Pattern 1: Virtualized Event Feed
**What:** Replace simple map with virtualized list
**When to use:** When displaying more than ~50 events
**Example:**
```typescript
// Source: https://tanstack.com/virtual/latest/docs/framework/react/examples/dynamic
'use client'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function VirtualizedEventFeed({ events }: { events: Event[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated collapsed height
    overscan: 5, // Render 5 extra items above/below viewport
  })

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <EventCard event={events[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Pattern 2: Client-Side Event Batching
**What:** Transform event array into batched groups for display
**When to use:** Before rendering, not at storage time
**Example:**
```typescript
// hooks/useBatchedEvents.ts
import { useMemo } from 'react'
import type { Doc } from '@/convex/_generated/dataModel'

type Event = Doc<'events'>

interface BatchedEvent {
  type: 'single' | 'batch'
  events: Event[]
  tool: string | null
  agentId: string | null
  count: number
}

const BATCHABLE_TOOLS = ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch']
const MIN_BATCH_SIZE = 2

export function useBatchedEvents(events: Event[] | undefined): BatchedEvent[] {
  return useMemo(() => {
    if (!events) return []

    // First pass: group pre/post events by toolUseId
    const toolUseGroups = new Map<string, Event[]>()
    const standaloneEvents: Event[] = []

    for (const event of events) {
      if (event.toolUseId) {
        const group = toolUseGroups.get(event.toolUseId) || []
        group.push(event)
        toolUseGroups.set(event.toolUseId, group)
      } else {
        standaloneEvents.push(event)
      }
    }

    // Convert toolUseId groups to single logical events (use first event as representative)
    const logicalEvents: Event[] = []
    for (const [, group] of toolUseGroups) {
      // Sort by timestamp, take earliest as representative
      group.sort((a, b) => a.timestamp - b.timestamp)
      logicalEvents.push(group[0])
    }
    logicalEvents.push(...standaloneEvents)
    logicalEvents.sort((a, b) => b.timestamp - a.timestamp) // DESC order

    // Second pass: batch consecutive same-tool, same-agent events
    const batched: BatchedEvent[] = []
    let currentBatch: Event[] = []
    let currentTool: string | null = null
    let currentAgent: string | null = null

    for (const event of logicalEvents) {
      const tool = event.tool ?? null
      const agent = event.agentId ?? null
      const isBatchable = tool && BATCHABLE_TOOLS.includes(tool)

      if (
        isBatchable &&
        tool === currentTool &&
        agent === currentAgent
      ) {
        currentBatch.push(event)
      } else {
        // Flush previous batch
        if (currentBatch.length > 0) {
          if (currentBatch.length >= MIN_BATCH_SIZE) {
            batched.push({
              type: 'batch',
              events: currentBatch,
              tool: currentTool,
              agentId: currentAgent,
              count: currentBatch.length,
            })
          } else {
            // Not enough for batch, add as singles
            for (const e of currentBatch) {
              batched.push({
                type: 'single',
                events: [e],
                tool: e.tool ?? null,
                agentId: e.agentId ?? null,
                count: 1,
              })
            }
          }
        }

        // Start new batch or add single
        if (isBatchable) {
          currentBatch = [event]
          currentTool = tool
          currentAgent = agent
        } else {
          currentBatch = []
          currentTool = null
          currentAgent = null
          batched.push({
            type: 'single',
            events: [event],
            tool: tool,
            agentId: agent,
            count: 1,
          })
        }
      }
    }

    // Flush final batch
    if (currentBatch.length >= MIN_BATCH_SIZE) {
      batched.push({
        type: 'batch',
        events: currentBatch,
        tool: currentTool,
        agentId: currentAgent,
        count: currentBatch.length,
      })
    } else {
      for (const e of currentBatch) {
        batched.push({
          type: 'single',
          events: [e],
          tool: e.tool ?? null,
          agentId: e.agentId ?? null,
          count: 1,
        })
      }
    }

    return batched
  }, [events])
}
```

### Pattern 3: Presence-Based Viewer Count
**What:** Real-time count of active viewers using Convex presence
**When to use:** Display in header as "X watching"
**Example:**
```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import presence from "@convex-dev/presence/convex.config.js";

const app = defineApp();
app.use(presence);
export default app;

// convex/presence.ts
import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";

const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    projectName: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { projectName, sessionId }) => {
    // Room = project:session for granular presence
    const roomId = `${projectName}:${sessionId}`;
    const userId = crypto.randomUUID(); // Anonymous user
    return await presence.heartbeat(ctx, roomId, userId, sessionId, 5000);
  },
});

export const listViewers = query({
  args: {
    projectName: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { projectName, sessionId }) => {
    const roomId = `${projectName}:${sessionId}`;
    return await presence.list(ctx, roomId);
  },
});

// hooks/useViewerCount.ts
'use client'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect, useState } from 'react'

export function useViewerCount(projectName: string | null, sessionId: string | null) {
  const [isVisible, setIsVisible] = useState(true)

  // Track page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const viewers = useQuery(
    api.presence.listViewers,
    projectName && sessionId ? { projectName, sessionId } : 'skip'
  )

  const heartbeat = useMutation(api.presence.heartbeat)

  // Send heartbeats only when tab is visible
  useEffect(() => {
    if (!projectName || !sessionId || !isVisible) return

    const sendHeartbeat = () => {
      heartbeat({ projectName, sessionId })
    }

    sendHeartbeat() // Initial
    const interval = setInterval(sendHeartbeat, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [projectName, sessionId, isVisible, heartbeat])

  return viewers?.length ?? 0
}
```

### Pattern 4: Multi-Select Event Type Filter
**What:** URL-synced filter for event types
**When to use:** Filter bar below header
**Example:**
```typescript
// hooks/useEventFilter.ts
'use client'
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'

const ALL_TOOL_TYPES = ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch']

export function useEventFilter() {
  return useQueryState(
    'filter',
    parseAsArrayOf(parseAsString).withDefault([])
  )
}

// Client-side filtering in useBatchedEvents or EventFeed
const [filters] = useEventFilter()

const filteredEvents = useMemo(() => {
  if (!events || filters.length === 0) return events
  return events.filter(e => {
    const tool = e.tool ?? e.type
    return filters.includes(tool)
  })
}, [events, filters])
```

### Pattern 5: Variable Height Virtualization
**What:** Handle EventCards that expand/collapse
**When to use:** When event cards have dynamic height
**Example:**
```typescript
// VirtualizedEventFeed with measureElement for dynamic heights
const virtualizer = useVirtualizer({
  count: events.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48, // Collapsed height estimate
  measureElement: (element) => {
    // Use measureElement callback for variable heights
    return element.getBoundingClientRect().height
  },
  overscan: 5,
})

// In render, pass measureElement ref
<div
  key={virtualRow.key}
  data-index={virtualRow.index}
  ref={virtualizer.measureElement}
  style={{...}}
>
  <EventCard
    event={events[virtualRow.index]}
    isExpanded={isExpanded(events[virtualRow.index]._id)}
    onToggle={() => toggle(events[virtualRow.index]._id)}
  />
</div>
```

### Anti-Patterns to Avoid
- **Storing batched events in database:** Batching is display-only; keep raw events for drilldown
- **Polling for presence:** Use Convex presence component with scheduled functions
- **Re-rendering entire list on filter change:** Memoize filtered/batched results
- **Measuring elements synchronously:** Use `measureElement` callback, not `getBoundingClientRect` on every render
- **Ignoring React 19 flushSync warning:** Set `useFlushSync: false` if console shows warnings

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| List virtualization | Manual slicing with scroll listeners | @tanstack/react-virtual | Handles overscan, dynamic sizing, scroll restoration |
| Presence/viewer count | Custom heartbeat with setInterval | @convex-dev/presence | Handles tab close, reconnection, scheduled cleanup |
| Active tab detection | Custom focus/blur listeners | Page Visibility API | Standard API, handles minimize/tab switch/lock screen |
| URL array state | Manual URLSearchParams parsing | nuqs parseAsArrayOf | Type-safe, handles encoding, syncs with React state |
| Infinite scroll trigger | Scroll position calculation | react-intersection-observer | Already installed, handles edge cases |

**Key insight:** The virtualization and presence patterns are well-established. Custom implementations typically miss edge cases (scroll position on resize, tab close cleanup, etc.) that libraries handle.

## Common Pitfalls

### Pitfall 1: Variable Height + Scroll Position Instability
**What goes wrong:** Expanding/collapsing events causes visible "jumping" in the list
**Why it happens:** TanStack Virtual needs to recalculate positions when sizes change
**How to avoid:** Always use `measureElement` ref callback; set reasonable `estimateSize` close to actual collapsed height
**Warning signs:** Visible scroll position changes when expanding items off-screen

### Pitfall 2: Batching Crosses Agent Boundaries
**What goes wrong:** Events from different agents get grouped together
**Why it happens:** Not checking `agentId` in batching logic
**How to avoid:** CONTEXT.md requires: "Batch only consecutive events of the same tool type from the same agent"
**Warning signs:** Batch shows "Read 10 files" but includes files from multiple agents

### Pitfall 3: Presence Inflated by Background Tabs
**What goes wrong:** Viewer count shows higher numbers than actual active viewers
**Why it happens:** Not checking Page Visibility API before sending heartbeats
**How to avoid:** Only send heartbeats when `document.visibilityState === 'visible'`
**Warning signs:** Viewer count doesn't decrease when users switch tabs

### Pitfall 4: Pre/Post Tool Events Not Grouped
**What goes wrong:** `pre_tool_use` and `post_tool_use` for same tool call shown separately
**Why it happens:** Not grouping by `toolUseId` before batching
**How to avoid:** First pass groups by `toolUseId`, second pass batches consecutive same-tool events
**Warning signs:** "Read" event followed immediately by "Read (success)" as separate items

### Pitfall 5: Filter State Lost on Navigation
**What goes wrong:** User selects filters, navigates away, comes back, filters gone
**Why it happens:** Not using URL state for filters
**How to avoid:** Use nuqs with `parseAsArrayOf` for filter state in URL
**Warning signs:** Filter UI resets on page refresh or browser back

### Pitfall 6: Virtualization with Infinite Scroll Conflict
**What goes wrong:** Loading more events causes scroll position jump
**Why it happens:** Prepending items without adjusting scroll position
**How to avoid:** Load older events at END of list (append), not beginning. With DESC order, "older" events are at bottom
**Warning signs:** Scroll jumps to top when loading more

## Code Examples

Verified patterns from official sources:

### Batched Event Group Component
```typescript
// components/feed/BatchedEventGroup.tsx
// Source: CONTEXT.md decisions
'use client'
import { useState } from 'react'
import { useCollapse } from 'react-collapsed'
import type { Doc } from '@/convex/_generated/dataModel'

type Event = Doc<'events'>

interface BatchedEventGroupProps {
  tool: string
  events: Event[]
  count: number
}

export function BatchedEventGroup({ tool, events, count }: BatchedEventGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getCollapseProps, getToggleProps } = useCollapse({
    isExpanded,
    duration: 200,
  })

  // Extract sample file paths for preview
  const samplePaths = events.slice(0, 3).map(e => {
    const input = e.toolInput as { file_path?: string } | null
    return input?.file_path?.split('/').pop() ?? 'file'
  })

  return (
    <div className="border-l-4 border-l-green-500 bg-zinc-900/50">
      <button
        {...getToggleProps({ onClick: () => setIsExpanded(!isExpanded) })}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-900/70"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-mono text-sm text-zinc-300">{tool}</span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
            {count} files
          </span>
          <span className="text-xs text-zinc-500 truncate max-w-[200px]">
            {samplePaths.join(', ')}
            {count > 3 && '...'}
          </span>
        </div>
      </button>

      <div {...getCollapseProps()}>
        <div className="px-3 pb-2 space-y-1">
          {events.map((event) => (
            <div key={event._id} className="text-xs text-zinc-400 pl-6">
              {(event.toolInput as { file_path?: string })?.file_path ?? event.type}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Filter Bar Component
```typescript
// components/feed/FilterBar.tsx
'use client'
import { useEventFilter } from '@/app/hooks/useEventFilter'

const TOOL_TYPES = [
  { value: 'Read', label: 'Read', color: 'bg-green-500' },
  { value: 'Write', label: 'Write', color: 'bg-blue-500' },
  { value: 'Edit', label: 'Edit', color: 'bg-blue-400' },
  { value: 'Bash', label: 'Bash', color: 'bg-orange-500' },
  { value: 'Glob', label: 'Glob', color: 'bg-green-400' },
  { value: 'Grep', label: 'Grep', color: 'bg-green-400' },
]

export function FilterBar() {
  const [filters, setFilters] = useEventFilter()

  const toggleFilter = (value: string) => {
    if (filters.includes(value)) {
      setFilters(filters.filter(f => f !== value))
    } else {
      setFilters([...filters, value])
    }
  }

  const clearFilters = () => setFilters([])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
      <span className="text-xs text-zinc-500">Filter:</span>
      {TOOL_TYPES.map(({ value, label, color }) => (
        <button
          key={value}
          onClick={() => toggleFilter(value)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            filters.includes(value)
              ? `${color} text-white`
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          {label}
        </button>
      ))}
      {filters.length > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs text-zinc-500 hover:text-zinc-300 ml-2"
        >
          Clear
        </button>
      )}
    </div>
  )
}
```

### Viewer Count Display
```typescript
// In Header.tsx
import { useViewerCount } from '@/app/hooks/useViewerCount'
import { useProjectFilter } from '@/app/hooks/useProjectFilter'
import { useSessionFilter } from '@/app/hooks/useSessionFilter'

export function Header() {
  const [project] = useProjectFilter()
  const [session] = useSessionFilter()
  const viewerCount = useViewerCount(project, session)

  return (
    <header className="...">
      <div className="flex items-center gap-3">
        {/* existing content */}
        {viewerCount > 0 && (
          <span className="text-xs text-zinc-500">
            {viewerCount} watching
          </span>
        )}
      </div>
    </header>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-virtualized | @tanstack/react-virtual | 2023+ | Smaller bundle, hooks-based, framework-agnostic |
| Custom WebSocket presence | Convex presence component | 2024+ | Scheduled functions, no polling, handles edge cases |
| Custom scroll position management | Intersection Observer | 2019+ | More reliable, less code |
| query string parsing with URLSearchParams | nuqs | 2024+ | Type-safe, React state sync, array support |

**Deprecated/outdated:**
- **react-virtualized:** Large bundle, class-based; prefer @tanstack/react-virtual
- **Custom polling for presence:** Use Convex scheduled functions for efficiency
- **Manual flushSync in TanStack Virtual:** React 19 warns about this; set `useFlushSync: false`

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal batch collapse format**
   - What we know: CONTEXT.md says Claude's discretion for "count only vs count + sample vs count + summary"
   - What's unclear: What looks best in practice
   - Recommendation: Start with "count + sample" (e.g., "Read 15 files: App.tsx, Header.tsx, ..."). Iterate based on user feedback.

2. **Memory limits for virtualization**
   - What we know: TanStack Virtual keeps all data in memory, only virtualizes DOM
   - What's unclear: When to implement true "windowed" data fetching
   - Recommendation: Monitor with 500+ events. Current limit of 100 events from `listEvents` is safe. Add pagination for historical browsing later.

3. **Server-side vs client-side filtering**
   - What we know: Client-side is simpler; server-side reduces data transfer
   - What's unclear: At what scale client-side filtering becomes slow
   - Recommendation: Start with client-side (filter after `useQuery`). Add index + server filter if profiling shows issues.

4. **Agent level accent colors**
   - What we know: CONTEXT.md says "colored left border accents per agent level"
   - What's unclear: Specific colors for main/subagent/sub-subagent
   - Recommendation: Use blue (main), purple (subagent), pink (sub-subagent) - visually distinct while staying in the same color family.

## Sources

### Primary (HIGH confidence)
- [TanStack Virtual GitHub](https://github.com/TanStack/virtual) - Official repo, latest version 3.13.18
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest) - API reference, examples
- [TanStack Virtual Dynamic Example](https://tanstack.com/virtual/latest/docs/framework/react/examples/dynamic) - Variable height pattern
- [Convex Presence Component](https://www.convex.dev/components/presence) - Official component page
- [Convex Presence GitHub](https://github.com/get-convex/presence) - Installation, API
- [Convex Pagination Docs](https://docs.convex.dev/database/pagination) - usePaginatedQuery API
- [nuqs Documentation](https://nuqs.dev/) - parseAsArrayOf, URL state
- [Page Visibility API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) - visibilitychange event

### Secondary (MEDIUM confidence)
- [Implementing Presence with Convex](https://stack.convex.dev/presence-with-convex) - Implementation patterns
- [Reverse Infinite Scroll in React using TanStack Virtual](https://medium.com/@rmoghariya7/reverse-infinite-scroll-in-react-using-tanstack-virtual-11a1fea24042) - Scroll direction patterns
- [npm trends comparison](https://npmtrends.com/@tanstack/react-virtual-vs-react-virtualized-vs-react-window) - Library comparison

### Tertiary (LOW confidence)
- Community discussions on TanStack Virtual GitHub - Edge cases, workarounds

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Convex component, well-documented TanStack Virtual
- Architecture: HIGH - Patterns from official docs and existing codebase
- Pitfalls: MEDIUM - Some based on community discussions, not official warnings

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days - stable libraries, monitor for presence component updates)
