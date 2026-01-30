# Stack Research

**Domain:** Real-time event streaming and display (live feed)
**Researched:** 2026-01-31
**Confidence:** HIGH (verified via npm, official docs, and recent community sources)

## Recommended Stack

### Core Technologies (Already in Place)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | App Router, RSC | Already installed. App Router enables server components for initial data fetch, client components for real-time subscriptions |
| React | 19.2.3 | UI framework | Already installed. React 19's improved streaming/Suspense works well with Convex real-time |
| Convex | ^1.31.6 | Real-time backend | Already installed. Native real-time subscriptions via `useQuery`, automatic reactivity, WebSocket-based |
| Tailwind CSS | ^4 | Styling | Already installed. v4's performance improvements pair well with frequent re-renders |
| TypeScript | ^5 | Type safety | Already installed. Essential for Convex's end-to-end type safety |

### Supporting Libraries (New)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| motion | ^12.26.2 | Animations | Entry/exit animations for feed items, expand/collapse transitions | HIGH |
| @tanstack/react-virtual | ^3.13.18 | Virtualized lists | Rendering long feed lists efficiently (100+ items) | HIGH |
| shiki | ^3.21.0 | Syntax highlighting | Code diff previews, syntax-highlighted code blocks | HIGH |
| react-diff-viewer-continued | ^3.4.0 | Diff visualization | Side-by-side and inline code diff previews | MEDIUM |
| react-arborist | ^3.4.3 | Tree visualization | Agent hierarchy display with expand/collapse | HIGH |
| zustand | ^5.0.10 | Local UI state | UI state (expanded items, filters, replay position) - NOT for server data | HIGH |
| date-fns | ^4.1.0 | Date formatting | Relative timestamps ("2 min ago"), time-lapse scrubbing | HIGH |
| clsx | ^2.1.1 | Class names | Conditional Tailwind classes | HIGH |
| tailwind-merge | ^3.4.0 | Class merging | Conflict resolution for component variants | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| convex dev | Backend dev server | Run alongside `bun dev` for real-time sync |
| TypeScript strict mode | Type checking | Already configured, essential for Convex types |

## Installation

```bash
# Core animation and UI
bun add motion @tanstack/react-virtual

# Syntax highlighting and diffs
bun add shiki react-diff-viewer-continued

# Tree visualization
bun add react-arborist

# State and utilities
bun add zustand date-fns clsx tailwind-merge
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| motion | framer-motion | Never - motion IS framer-motion rebranded; use new `motion/react` import |
| @tanstack/react-virtual | react-window | If you need simpler API and don't need dynamic sizing |
| @tanstack/react-virtual | react-virtualized | Never - aging architecture, maintenance slowed |
| shiki | react-syntax-highlighter | If bundle size is critical and you don't need VS Code accuracy |
| shiki | prism-react-renderer | If you need client-side highlighting with minimal config |
| react-diff-viewer-continued | react-diff-view | If you need more control over token-level styling |
| react-arborist | react-d3-tree | If you want D3-powered SVG tree with animations |
| zustand | jotai | If you prefer atomic state model over single store |
| date-fns | dayjs | If you want Moment.js-like chaining API |
| date-fns | luxon | If you need complex timezone handling |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| framer-motion import | Deprecated import path, library rebranded | `motion/react` import from `motion` package |
| react-virtualized | Maintenance slowed, aging architecture, many open issues | @tanstack/react-virtual or react-window |
| react-syntax-highlighter | Large bundle size (~400KB), less accurate than TextMate | shiki for accuracy, prism-react-renderer for small bundles |
| moment.js | Maintenance mode, large bundle, mutable state | date-fns or dayjs |
| react-diff-viewer (original) | No longer maintained | react-diff-viewer-continued (actively maintained fork) |
| Redux/Zustand for server data | Convex handles server state with built-in reactivity | Convex useQuery for server data, Zustand for UI-only state |
| TanStack Query for Convex data | Convex subscriptions are already reactive | Native Convex useQuery (or convex-react-query if you need caching across route nav) |
| Socket.io / manual WebSockets | Unnecessary complexity when using Convex | Convex handles WebSocket transport automatically |

## Stack Patterns by Feature

### Real-Time Event Feed

**Pattern:** Convex subscription + virtualized list + animations

```typescript
// Feed component pattern
import { useQuery } from "convex/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "motion/react";

function EventFeed() {
  const events = useQuery(api.events.list); // Auto-subscribes to real-time updates
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: events?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimate row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <AnimatePresence>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <motion.div
            key={events[virtualItem.index]._id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <EventCard event={events[virtualItem.index]} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

**Why:** Convex subscriptions push updates automatically. Virtualization prevents DOM bloat with many items. AnimatePresence handles smooth entry/exit.

### Layered Display (Summary + Technical Details)

**Pattern:** Expandable cards with motion layout animations

```typescript
import { motion } from "motion/react";
import { useState } from "react";

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout // Smooth height transitions
      onClick={() => setExpanded(!expanded)}
    >
      <EventSummary event={event} />
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TechnicalDetails event={event} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Why:** Motion's layout prop handles height changes smoothly. Local state for UI interaction doesn't need global store.

### Code Diff Preview

**Pattern:** Shiki for syntax highlighting + react-diff-viewer-continued for diffs

```typescript
import ReactDiffViewer from "react-diff-viewer-continued";
import { useShikiHighlighter } from "react-shiki";

function CodeDiff({ oldCode, newCode, language }) {
  const { highlightCode } = useShikiHighlighter({
    theme: "github-dark",
    langs: [language],
  });

  return (
    <ReactDiffViewer
      oldValue={oldCode}
      newValue={newCode}
      splitView={false}
      useDarkTheme={true}
      renderContent={(content) => highlightCode(content, language)}
    />
  );
}
```

**Why:** react-diff-viewer-continued handles diff computation and layout. Shiki provides VS Code-quality highlighting via the renderContent prop.

### Agent Hierarchy Visualization

**Pattern:** react-arborist tree with custom node rendering

```typescript
import { Tree } from "react-arborist";

function AgentHierarchy({ agents }) {
  return (
    <Tree
      data={agents}
      openByDefault={false}
      width={300}
      height={400}
      rowHeight={36}
    >
      {({ node, style }) => (
        <div style={style} className="flex items-center gap-2">
          <AgentIcon type={node.data.type} />
          <span>{node.data.name}</span>
          {node.data.status === "running" && <StatusIndicator />}
        </div>
      )}
    </Tree>
  );
}
```

**Why:** react-arborist provides virtualization for large trees, built-in keyboard nav, and full control over node rendering.

### Time-Lapse Replay

**Pattern:** Convex historical query + controlled playback

```typescript
import { useQuery } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { create } from "zustand";

// UI-only state in Zustand
const useReplayStore = create((set) => ({
  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1,
  setPlaying: (playing) => set({ isPlaying: playing }),
  setTime: (time) => set({ currentTime: time }),
}));

function SessionReplay({ sessionId }) {
  const { isPlaying, currentTime, playbackSpeed, setTime } = useReplayStore();

  // Fetch events up to currentTime
  const events = useQuery(api.events.listUntil, {
    sessionId,
    until: currentTime
  });

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime((t) => t + 100 * playbackSpeed);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  return (
    <>
      <TimelineSlider value={currentTime} onChange={setTime} />
      <EventFeed events={events} />
    </>
  );
}
```

**Why:** Convex query with timestamp filter fetches historical data. Zustand stores playback state (UI-only, not persisted). No WebSocket complexity needed - Convex handles subscription updates.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| motion@^12 | React 18.2+ | Must use React 18.2 or higher |
| @tanstack/react-virtual@^3 | React 19 | Set `useFlushSync: false` to avoid console warning in React 19 |
| shiki@^3 | Next.js 16+ | Works with RSC; cache highlighter instance |
| react-arborist@^3.4 | react-window@1.8.11 | Uses react-window internally for virtualization |
| react-diff-viewer-continued@^3 | emotion | Uses emotion for styling - compatible with Tailwind |
| zustand@^5 | React 18+, 19 | Works with concurrent features |

## Convex Real-Time Patterns

### Subscription Best Practices

1. **Use `useQuery` for automatic subscriptions** - Components auto-subscribe and re-render on data changes
2. **Use "skip" for conditional queries** - `useQuery(api.fn, condition ? args : "skip")`
3. **Use `usePaginatedQuery` for infinite scroll** - Handles cursor management and reactive page updates
4. **Avoid time-based queries that change frequently** - Use coarser time buckets or explicit timestamps from client

### Event Streaming Architecture

```
Claude Code Hook (local)
    -> HTTP Action (Convex)
        -> Mutation (writes to DB)
            -> All `useQuery` subscribers auto-update
```

**No SSE/WebSocket code needed.** Convex handles the transport layer. Write mutations, read with queries.

### Memory Management for Long Sessions

For sessions with 1000+ events:
1. Use `usePaginatedQuery` with `loadMore` button or intersection observer
2. Consider windowing pattern - keep only N pages in state
3. Virtualize the list to avoid DOM bloat

## Sources

- [TanStack Virtual Official Docs](https://tanstack.com/virtual/latest) - Version 3.13.18, HIGH confidence
- [Motion.dev Official Docs](https://motion.dev/docs) - Version 12.26.2, HIGH confidence
- [Shiki Official Docs](https://shiki.style/) - Version 3.21.0, HIGH confidence
- [react-shiki npm](https://www.npmjs.com/package/react-shiki) - Version 0.9.1, HIGH confidence
- [react-diff-viewer-continued GitHub](https://github.com/Aeolun/react-diff-viewer-continued) - Version 3.4.0, MEDIUM confidence
- [react-arborist GitHub](https://github.com/brimdata/react-arborist) - Version 3.4.3, HIGH confidence
- [Convex Real-Time Docs](https://docs.convex.dev/realtime) - HIGH confidence
- [Convex Pagination Docs](https://docs.convex.dev/database/pagination) - HIGH confidence
- [Zustand npm](https://www.npmjs.com/package/zustand) - Version 5.0.10, HIGH confidence
- [npm-compare date libraries](https://npm-compare.com/date-fns,dayjs,luxon,moment) - HIGH confidence
- [tailwind-merge npm](https://www.npmjs.com/package/tailwind-merge) - Version 3.4.0, HIGH confidence

---
*Stack research for: Real-time event streaming and display (live feed)*
*Researched: 2026-01-31*
