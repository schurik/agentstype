# Phase 2: Core Feed Display - Research

**Researched:** 2026-02-01
**Domain:** Real-time event feed with React/Convex/Tailwind
**Confidence:** HIGH

## Summary

This phase builds a real-time event feed displaying Claude Code activity. The existing Convex backend provides event storage with `listEvents` query supporting real-time subscriptions. The frontend needs: event display components, connection status monitoring, smart auto-scroll behavior, and animation for new events.

The standard approach combines Convex's built-in real-time subscriptions (`useQuery`), a custom hook wrapping `useConvexConnectionState` for connection status, `react-intersection-observer` for scroll position detection, and `tw-animate-css` for Tailwind v4-compatible entrance animations. Relative timestamps use `date-fns` v4's `formatDistanceToNow` with the native `Intl.RelativeTimeFormat` under the hood.

The project already has Geist Mono font configured and Tailwind v4 CSS-first setup with the correct dark background (#0a0a0a). The implementation follows React 19's client component patterns since all feed functionality requires client-side interactivity.

**Primary recommendation:** Use Convex's native real-time subscriptions with `useQuery`, implement smart auto-scroll using intersection observer pattern, and leverage tw-animate-css for entrance animations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| convex/react | ^1.31.6 | Real-time data subscriptions | Already installed; provides useQuery, useConvexConnectionState |
| date-fns | ^4.1.0 | Relative time formatting | Modern, tree-shakable, uses native Intl.RelativeTimeFormat |
| react-intersection-observer | ^9.x | Scroll position detection | Lightweight (~1.15kB), hook-based, standard for viewport detection |
| tw-animate-css | ^1.x | Entrance animations | Native Tailwind v4 support, CSS-first, no JS plugin needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | ^19 | TypeScript types | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Native Intl.RelativeTimeFormat | date-fns abstracts unit selection; native requires manual unit calculation |
| react-intersection-observer | Manual scroll event listeners | Intersection observer is more performant, declarative |
| tw-animate-css | Custom @keyframes | tw-animate-css provides composable animate-in/out vocabulary |

**Installation:**
```bash
bun add date-fns react-intersection-observer tw-animate-css
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── page.tsx                    # Main feed page (Server Component shell)
├── layout.tsx                  # Root layout (already exists)
├── globals.css                 # Tailwind config + animations import
└── components/
    ├── feed/
    │   ├── EventFeed.tsx       # Client component - main feed container
    │   ├── EventCard.tsx       # Individual event display
    │   ├── ConnectionStatus.tsx # Live/Reconnecting/Offline indicator
    │   ├── NewEventsIndicator.tsx # "5 new events" floating badge
    │   └── hooks/
    │       ├── useConnectionStatus.ts  # Wraps useConvexConnectionState
    │       ├── useAutoScroll.ts        # Smart scroll behavior
    │       └── useRelativeTime.ts      # Relative timestamp with refresh
    └── ui/
        └── Header.tsx          # Header bar with status indicator
```

### Pattern 1: Client Component Feed with Convex Subscription
**What:** The feed is a client component that subscribes to real-time events
**When to use:** Any component that needs live data updates
**Example:**
```typescript
// Source: https://docs.convex.dev/client/react
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EventFeed() {
  const events = useQuery(api.events.listEvents, { limit: 100 });

  if (events === undefined) {
    return <FeedSkeleton />;
  }

  return (
    <div className="flex flex-col gap-1">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
```

### Pattern 2: Connection Status Hook
**What:** Custom hook wrapping Convex connection state for UI status
**When to use:** Display connection status indicator
**Example:**
```typescript
// Source: https://docs.convex.dev/api/modules/react
"use client";

import { useConvexConnectionState } from "convex/react";

type Status = "live" | "reconnecting" | "offline" | "idle";

export function useConnectionStatus(): Status {
  const connectionState = useConvexConnectionState();

  // ConnectionState has: isWebSocketConnected, hasInflightRequests,
  // connectionRetries, hasEverConnected, connectionCount

  if (!connectionState.hasEverConnected) {
    return "offline";
  }

  if (!connectionState.isWebSocketConnected) {
    return connectionState.connectionRetries > 0 ? "reconnecting" : "offline";
  }

  // Could add idle detection based on recent events
  return "live";
}
```

### Pattern 3: Smart Auto-Scroll with Intersection Observer
**What:** Auto-scroll to new events only when user is near bottom
**When to use:** Chat-like feeds where user may scroll up to read history
**Example:**
```typescript
// Source: https://github.com/thebuilder/react-intersection-observer
"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export function useAutoScroll<T>(items: T[]) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [newItemCount, setNewItemCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Detect if bottom anchor is visible
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    setIsAtBottom(inView);
  }, [inView]);

  // When new items arrive
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNewItemCount(0);
    } else {
      // User has scrolled up - increment counter
      setNewItemCount((prev) => prev + 1);
    }
  }, [items.length, isAtBottom]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewItemCount(0);
  };

  return { bottomRef, sentinelRef, newItemCount, scrollToBottom, isAtBottom };
}
```

### Pattern 4: Relative Time with Refresh
**What:** Display "2 min ago" that updates periodically
**When to use:** Event timestamps
**Example:**
```typescript
// Source: https://date-fns.org/docs/formatDistanceToNow
"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export function useRelativeTime(timestamp: number, refreshInterval = 60000) {
  const [relative, setRelative] = useState(() =>
    formatDistanceToNow(timestamp, { addSuffix: true })
  );

  useEffect(() => {
    const update = () => {
      setRelative(formatDistanceToNow(timestamp, { addSuffix: true }));
    };

    const id = setInterval(update, refreshInterval);
    return () => clearInterval(id);
  }, [timestamp, refreshInterval]);

  return relative;
}
```

### Anti-Patterns to Avoid
- **Rendering all events without virtualization:** For feeds with 1000+ events, virtualize with react-window or paginate
- **Using useState for scroll position tracking:** Use intersection observer instead; scroll events fire frequently and cause performance issues
- **Not cleaning up intervals:** Always return cleanup function from useEffect for timestamp refreshers
- **Forcing dark mode with media query only:** Set explicit dark class on html element for reliable dark mode

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative time formatting | Manual date math with unit selection | `date-fns formatDistanceToNow` | Unit selection (seconds vs minutes vs hours) has edge cases; locale support |
| Scroll position detection | Manual scroll event listeners with throttling | `react-intersection-observer` | More performant, handles edge cases, declarative API |
| Entrance animations | Custom CSS keyframes from scratch | `tw-animate-css` | Provides composable animate-in/out pattern that works with Tailwind v4 |
| Real-time subscriptions | WebSocket management, reconnection logic | Convex `useQuery` | Convex handles connection, reconnection, and consistency automatically |
| Connection status | Custom WebSocket monitoring | `useConvexConnectionState` | Already tracks retries, connection count, and WebSocket state |

**Key insight:** Convex already handles the hardest parts (real-time sync, consistency, reconnection). The UI layer should use standard patterns rather than custom implementations.

## Common Pitfalls

### Pitfall 1: useQuery Returns Undefined During Loading
**What goes wrong:** Component crashes or shows wrong state when events is undefined
**Why it happens:** Convex useQuery returns undefined before first data load
**How to avoid:** Always check for undefined before rendering
**Warning signs:** "Cannot read property 'map' of undefined" errors
```typescript
// WRONG
return events.map(...) // Crashes

// RIGHT
if (events === undefined) return <Loading />;
return events.map(...)
```

### Pitfall 2: Auto-Scroll Triggering on Every Render
**What goes wrong:** User can't read history because view keeps jumping to bottom
**Why it happens:** Using items.length in useEffect dependency without checking scroll position
**How to avoid:** Use intersection observer to detect if user is at bottom before auto-scrolling
**Warning signs:** Users complain about jumpy scrolling when reading older events

### Pitfall 3: Connection Status Flapping
**What goes wrong:** Status indicator rapidly toggles between states
**Why it happens:** ConnectionState updates frequently (e.g., on every inflight request)
**How to avoid:** Debounce status changes or only show status transitions that persist > 1 second
**Warning signs:** Status indicator flickering

### Pitfall 4: Memory Leaks from Timestamp Refresh Intervals
**What goes wrong:** Multiple intervals accumulate, causing memory issues
**Why it happens:** Not cleaning up setInterval in useEffect
**How to avoid:** Return cleanup function: `return () => clearInterval(id)`
**Warning signs:** Increasing memory usage over time, timestamp updates speed up

### Pitfall 5: Dark Mode Not Applied Consistently
**What goes wrong:** Some components show light mode styles
**Why it happens:** Using prefers-color-scheme media query instead of explicit dark mode
**How to avoid:** Set `class="dark"` on html element; use `dark:` variants consistently
**Warning signs:** Visual inconsistencies, flash of light mode

### Pitfall 6: Animation on Initial Load
**What goes wrong:** All events animate in on page load, causing visual noise
**Why it happens:** Entrance animation applied to all items including initially loaded ones
**How to avoid:** Track which events are "new" (arrived after initial load) and only animate those
**Warning signs:** Page load looks chaotic with many simultaneous animations

## Code Examples

Verified patterns from official sources:

### Event Card with Colored Border
```typescript
// Design decision: colored left border for event type distinction
const borderColors: Record<string, string> = {
  Read: "border-l-green-500",
  Write: "border-l-blue-500",
  Bash: "border-l-orange-500",
  post_tool_use_failure: "border-l-red-500",
};

function EventCard({ event }: { event: Event }) {
  const borderClass = borderColors[event.tool ?? event.type] ?? "border-l-zinc-600";

  return (
    <div className={`border-l-4 ${borderClass} bg-zinc-900/50 px-3 py-2`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-zinc-300">
          {event.tool ?? event.type}
        </span>
        <Timestamp value={event.timestamp} />
      </div>
    </div>
  );
}
```

### Entrance Animation with tw-animate-css
```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";
```

```typescript
// Only animate events that arrive after initial load
function EventCard({ event, isNew }: { event: Event; isNew: boolean }) {
  return (
    <div className={isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}>
      {/* card content */}
    </div>
  );
}
```

### Connection Status Indicator
```typescript
// Source: Design decision from CONTEXT.md
function ConnectionStatus() {
  const status = useConnectionStatus();

  const config = {
    live: { dot: "bg-green-500 animate-pulse", text: "Live" },
    reconnecting: { dot: "bg-yellow-500", text: "Reconnecting..." },
    offline: { dot: "bg-red-500", text: "Offline" },
    idle: { dot: "bg-zinc-500", text: "Idle" },
  };

  const { dot, text } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-sm text-zinc-400">{text}</span>
    </div>
  );
}
```

### Timestamp with Hover for Absolute Time
```typescript
// Design decision: relative + absolute on hover
function Timestamp({ value }: { value: number }) {
  const relative = useRelativeTime(value);
  const absolute = new Date(value).toLocaleString();

  return (
    <time
      dateTime={new Date(value).toISOString()}
      title={absolute}
      className="text-xs text-zinc-500 cursor-default"
    >
      {relative}
    </time>
  );
}
```

### Path Truncation (Middle Ellipsis)
```typescript
// Design decision: truncate long paths in the middle
function truncatePath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) return path;

  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const first = parts[0];
  const last = parts[parts.length - 1];

  return `${first}/.../${last}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config.js plugins | CSS-first @theme blocks | Tailwind v4 (2024) | Animations defined in CSS, not JS |
| moment.js for dates | date-fns v4 with native Intl | date-fns v4 (2024) | Smaller bundle, native i18n |
| Manual WebSocket handling | Convex built-in real-time | - | No custom connection management |
| Class-based scroll detection | Intersection Observer | 2019+ | Better performance, declarative |

**Deprecated/outdated:**
- **tailwindcss-animate plugin:** Replaced by tw-animate-css for Tailwind v4
- **moment.js:** Large bundle, mutable API; use date-fns instead
- **Scroll event listeners for position:** Use Intersection Observer instead

## Open Questions

Things that couldn't be fully resolved:

1. **Idle state detection**
   - What we know: ConnectionState tracks WebSocket connection, not Claude session activity
   - What's unclear: How to detect "no active Claude session" vs "connected but idle"
   - Recommendation: For Phase 2, treat "connected with no recent events" as idle; refine in later phases if needed

2. **Event virtualization threshold**
   - What we know: Without virtualization, 1000+ items cause performance issues
   - What's unclear: When to switch from simple rendering to virtualized list
   - Recommendation: Start simple; add react-window if performance issues arise. The 100-event default limit should be sufficient for Phase 2

3. **Animation timing preferences**
   - What we know: tw-animate-css defaults to 150ms duration
   - What's unclear: Optimal timing for "terminal-like" feel
   - Recommendation: Start with 200-300ms for entrance animations; iterate based on feel

## Sources

### Primary (HIGH confidence)
- [Convex React documentation](https://docs.convex.dev/client/react) - useQuery, real-time patterns
- [Convex API reference](https://docs.convex.dev/api/modules/react) - useConvexConnectionState, ConnectionState type
- [Convex ConnectionState type](https://docs.convex.dev/api/modules/browser#connectionstate) - isWebSocketConnected, connectionRetries, hasEverConnected
- [date-fns v4 blog](https://blog.date-fns.org/v40-with-time-zone-support/) - Current version, features
- [tw-animate-css GitHub](https://github.com/Wombosvideo/tw-animate-css) - Installation, usage for Tailwind v4
- [react-intersection-observer GitHub](https://github.com/thebuilder/react-intersection-observer) - useInView hook API

### Secondary (MEDIUM confidence)
- [Tailwind CSS animation docs](https://tailwindcss.com/docs/animation) - v4 CSS-first approach
- [MDN Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat) - Native API
- [React 19 patterns](https://react.dev/reference/rsc/server-components) - Client/Server component patterns

### Tertiary (LOW confidence)
- Chat scroll patterns from various blog posts - General approach confirmed, specifics vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official sources and GitHub
- Architecture: HIGH - Patterns from official Convex and React documentation
- Pitfalls: MEDIUM - Based on general React patterns; Convex-specific pitfalls less documented

**Research date:** 2026-02-01
**Valid until:** 30 days (stable libraries, no rapid changes expected)
