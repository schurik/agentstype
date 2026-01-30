# Architecture Research

**Domain:** Real-time event streaming for developer portfolio live feed
**Researched:** 2026-01-31
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+------------------------------------------------------------------+
|                      EXTERNAL DATA SOURCE                         |
+------------------------------------------------------------------+
|  +-----------------+                                              |
|  | Claude Code CLI |  (fires hooks on events)                     |
|  +--------+--------+                                              |
|           |                                                       |
|           v                                                       |
|  +------------------+                                             |
|  | vibecraft-hook.sh|  (transforms, enriches events)              |
|  +--------+---------+                                             |
|           |                                                       |
+-----------+------------------------------------------------------ +
            | HTTP POST
            v
+-------------------------------------------------------------------+
|                      CONVEX BACKEND                                |
+-------------------------------------------------------------------+
|  +------------------+     +------------------+                     |
|  | HTTP Action      |---->| Mutation         |                     |
|  | (convex/http.ts) |     | (ingestEvent)    |                     |
|  +------------------+     +--------+---------+                     |
|                                    |                               |
|                                    v                               |
|  +------------------------------------------------+               |
|  |              Convex Database                    |               |
|  |  +------------+  +------------+  +------------+ |               |
|  |  | events     |  | sessions   |  | projects   | |               |
|  |  | (log)      |  | (state)    |  | (config)   | |               |
|  |  +------------+  +------------+  +------------+ |               |
|  +----------------------+-------------------------+               |
|                         |                                          |
|          Automatic dependency tracking                             |
|                         |                                          |
|                         v                                          |
|  +------------------+                                              |
|  | Query Functions  |  (listEvents, getSession, etc.)              |
|  +--------+---------+                                              |
|           |                                                        |
+-----------+--------------------------------------------------------+
            | WebSocket (automatic subscriptions)
            v
+--------------------------------------------------------------------+
|                      NEXT.JS FRONTEND                               |
+--------------------------------------------------------------------+
|  +------------------+     +------------------+                      |
|  | ConvexClient     |     | useQuery hooks   |                      |
|  | Provider         |---->| (reactive)       |                      |
|  +------------------+     +--------+---------+                      |
|                                    |                                |
|                                    v                                |
|  +------------------+     +------------------+     +---------------+ |
|  | LiveFeed         |     | SessionCard      |     | EventItem     | |
|  | Component        |---->| Component        |---->| Component     | |
|  +------------------+     +------------------+     +---------------+ |
|                                                                     |
+---------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| vibecraft-hook.sh | Capture Claude Code events, transform to JSON, POST to backend | Bash script already exists in codebase |
| HTTP Action (http.ts) | Receive external webhooks, validate payload, call mutations | Convex httpAction + httpRouter |
| Mutation (ingestEvent) | Validate event, store in DB, update session state | Convex mutation function |
| Events Table | Append-only log of all events with timestamps | Convex table with by_session and by_timestamp indexes |
| Sessions Table | Track active sessions, aggregate stats | Convex table with by_project index |
| Projects Table | Project metadata (name, path, display config) | Convex table |
| Query Functions | Read events/sessions with filtering and pagination | Convex query functions with reactive subscriptions |
| LiveFeed Component | Render real-time event stream with infinite scroll | React Client Component with usePaginatedQuery |
| SessionCard | Display session summary with live event count | React Client Component with useQuery |
| EventItem | Render individual event with appropriate styling | React component |

## Recommended Project Structure

```
agentstype/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with ConvexClientProvider
│   ├── page.tsx                   # Home page (may be static portfolio)
│   ├── ConvexClientProvider.tsx   # Client-side Convex wrapper (exists)
│   ├── feed/                      # Live feed route
│   │   └── page.tsx               # LiveFeed page (Client Component)
│   └── components/                # Shared UI components
│       ├── LiveFeed.tsx           # Main feed container
│       ├── SessionCard.tsx        # Session summary card
│       ├── EventItem.tsx          # Individual event display
│       └── EventTimeline.tsx      # Timeline visualization
├── convex/                        # Convex backend
│   ├── _generated/                # Auto-generated (exists)
│   ├── schema.ts                  # Database schema (NEW)
│   ├── http.ts                    # HTTP endpoints (NEW)
│   ├── events.ts                  # Event mutations/queries (NEW)
│   ├── sessions.ts                # Session mutations/queries (NEW)
│   └── projects.ts                # Project mutations/queries (NEW)
├── lib/                           # Shared utilities
│   ├── eventTypes.ts              # TypeScript types for events
│   └── formatters.ts              # Display formatters
└── vibecraft-hook.sh              # Event capture hook (exists)
```

### Structure Rationale

- **app/feed/**: Dedicated route for live feed keeps portfolio page static/fast
- **convex/*.ts**: One file per domain entity (events, sessions, projects) keeps concerns separated
- **lib/**: Shared types and utilities avoid duplication between frontend and Convex functions

## Architectural Patterns

### Pattern 1: HTTP Ingestion with Mutation Pipeline

**What:** External events arrive via HTTP POST, get validated, then stored via mutation
**When to use:** Receiving webhooks from external systems (Claude Code hooks)
**Trade-offs:**
- Pro: Clean separation between ingestion and storage
- Pro: HTTP layer can handle auth/validation before touching DB
- Con: Additional network hop vs direct mutation access

**Example:**
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/ingest",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await request.json();

    // Validate event structure
    if (!event.type || !event.sessionId || !event.timestamp) {
      return new Response("Invalid event", { status: 400 });
    }

    // Store via mutation
    await ctx.runMutation(internal.events.ingest, { event });

    return new Response(null, { status: 200 });
  }),
});

export default http;
```

### Pattern 2: Reactive Queries with Automatic Subscriptions

**What:** Frontend uses useQuery hooks that automatically re-render when underlying data changes
**When to use:** Any UI that displays data from Convex (all live feed components)
**Trade-offs:**
- Pro: Zero manual subscription management
- Pro: Automatic consistency across all clients
- Con: All clients see updates simultaneously (may want staggered display for UX)

**Example:**
```typescript
// Frontend component
"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveFeed() {
  const events = useQuery(api.events.listRecent, { limit: 50 });

  // events automatically updates when new events are stored
  return (
    <div>
      {events?.map(event => <EventItem key={event._id} event={event} />)}
    </div>
  );
}
```

### Pattern 3: Paginated Queries with Reactive Updates

**What:** Use usePaginatedQuery for infinite scroll while maintaining real-time updates
**When to use:** Event lists that grow large over time
**Trade-offs:**
- Pro: Handles unbounded data gracefully
- Pro: New items appear at top without breaking scroll position
- Con: Page sizes may fluctuate as items are added (Convex pins endpoints, not counts)

**Example:**
```typescript
// convex/events.ts
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const listBySession = query({
  args: {
    sessionId: v.string(),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, { sessionId, paginationOpts }) => {
    return await ctx.db
      .query("events")
      .withIndex("by_session", q => q.eq("sessionId", sessionId))
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Frontend
const { results, status, loadMore } = usePaginatedQuery(
  api.events.listBySession,
  { sessionId },
  { initialNumItems: 20 }
);
```

## Data Flow

### Event Ingestion Flow

```
[Claude Code Event]
    |
    | Hook fires (stdin JSON)
    v
[vibecraft-hook.sh]
    |
    | Transform & enrich
    | - Add event ID
    | - Add timestamp (ms)
    | - Map event type
    | - Extract tool/session info
    v
[HTTP POST to Convex]
    |
    | POST https://<deployment>.convex.site/ingest
    v
[HTTP Action Handler]
    |
    | Validate payload structure
    | Optional: Authenticate (API key header)
    v
[ctx.runMutation(internal.events.ingest)]
    |
    | Validate against schema
    | Insert into events table
    | Update session state (if needed)
    v
[Convex Database]
    |
    | Automatic dependency tracking
    v
[All subscribed queries re-execute]
    |
    | Push updates via WebSocket
    v
[All connected clients update]
```

### Client Subscription Flow

```
[User opens /feed page]
    |
    v
[ConvexReactClient connects via WebSocket]
    |
    v
[useQuery(api.events.listRecent) called]
    |
    | Client subscribes to query result
    v
[Convex executes query, tracks dependencies]
    |
    | Returns initial data
    v
[React renders events]

... later ...

[New event inserted via mutation]
    |
    | Convex detects dependency overlap
    v
[Query re-executes automatically]
    |
    | New result pushed via WebSocket
    v
[useQuery returns new data]
    |
    v
[React re-renders with new event]
```

### Key Data Flows

1. **Ingestion Flow:** Hook -> HTTP -> Mutation -> Database -> Subscriptions -> Clients
2. **Subscription Flow:** Client Component mounts -> useQuery subscribes -> WebSocket receives updates -> React re-renders
3. **Historical Replay:** Client requests paginated query -> Convex returns page + cursor -> loadMore fetches next page

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k events/day | Current design sufficient. Single Convex deployment handles everything. |
| 1k-100k events/day | Add event batching in hook (collect N events, POST once). Consider event aggregation for display. |
| 100k+ events/day | Add event sampling or aggregation. Consider separate "hot" and "archive" tables. Paginate aggressively. |

### Scaling Priorities

1. **First bottleneck: Client rendering**
   - Many events appearing rapidly can cause excessive re-renders
   - **Fix:** Debounce/batch UI updates, virtualize long lists, aggregate similar events

2. **Second bottleneck: Database query performance**
   - Queries scanning large event tables slow down
   - **Fix:** Add indexes, paginate aggressively, use time-bounded queries (last 24h)

3. **Third bottleneck: WebSocket fanout**
   - Many connected clients multiply update traffic
   - **Fix:** Convex handles this automatically with subscription aggregation

## Anti-Patterns

### Anti-Pattern 1: Fetching All Events on Page Load

**What people do:** Query all events without pagination or limits
**Why it's wrong:** Page load time degrades linearly with event count; memory usage grows unbounded
**Do this instead:** Use usePaginatedQuery with reasonable initial count (20-50), infinite scroll for more

### Anti-Pattern 2: Polling Instead of Subscriptions

**What people do:** setInterval to refetch data periodically
**Why it's wrong:** Wastes bandwidth, creates inconsistent state windows, higher latency for updates
**Do this instead:** Use Convex's automatic subscriptions via useQuery - updates push instantly

### Anti-Pattern 3: Storing Unbounded Data Per Event

**What people do:** Store full file contents or large tool outputs in event documents
**Why it's wrong:** Event table becomes massive, queries slow down, WebSocket payloads grow large
**Do this instead:** Store summaries/excerpts in events, link to separate storage for full content if needed

### Anti-Pattern 4: Using Server Components for Live Feed

**What people do:** Put useQuery in Server Components expecting real-time updates
**Why it's wrong:** Server Components don't maintain WebSocket connections; data is static after SSR
**Do this instead:** Use Client Components ("use client") for any reactive UI, Server Components only for initial data preload

## Convex Schema Design

### Recommended Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Append-only event log
  events: defineTable({
    // Event identification
    eventId: v.string(),        // Unique ID from hook
    type: v.string(),           // pre_tool_use, post_tool_use, session_start, etc.
    timestamp: v.number(),      // Unix ms timestamp

    // Session/project context
    sessionId: v.string(),      // Claude Code session ID
    projectId: v.optional(v.id("projects")),
    cwd: v.optional(v.string()),

    // Event-specific payload (varies by type)
    tool: v.optional(v.string()),
    toolInput: v.optional(v.any()),
    toolResponse: v.optional(v.any()),
    success: v.optional(v.boolean()),
    prompt: v.optional(v.string()),
    response: v.optional(v.string()),

    // Display metadata
    summary: v.optional(v.string()),  // AI-generated summary
  })
    .index("by_session", ["sessionId"])
    .index("by_type", ["type"])
    .index("by_session_and_time", ["sessionId", "timestamp"]),

  // Session state (one per Claude Code session)
  sessions: defineTable({
    sessionId: v.string(),          // Claude Code session ID (unique)
    projectId: v.optional(v.id("projects")),
    status: v.string(),             // active, ended
    startedAt: v.number(),          // Timestamp
    endedAt: v.optional(v.number()),
    eventCount: v.number(),         // Denormalized for quick display
    lastEventAt: v.number(),        // For ordering active sessions
    cwd: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  // Project configuration
  projects: defineTable({
    name: v.string(),               // Display name
    path: v.string(),               // Working directory path
    description: v.optional(v.string()),
    isPublic: v.boolean(),          // Show in public feed
  })
    .index("by_path", ["path"]),
});
```

### Schema Rationale

- **events**: Append-only log with indexes for session-scoped queries. `_creationTime` automatically added for chronological ordering.
- **sessions**: Denormalized event count avoids expensive COUNT queries. Status index enables "active sessions" query.
- **projects**: Simple lookup table. Path index lets hook find project by cwd.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Claude Code CLI | Shell hook -> HTTP POST | Hook already exists (vibecraft-hook.sh), needs endpoint URL update |
| AI Summarization | Optional: Action calls external API | Could use Claude API or Anthropic SDK in Convex action |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Hook -> Backend | HTTP POST to /ingest | Fire-and-forget, no blocking Claude Code |
| Backend -> Frontend | WebSocket via Convex client | Automatic, no manual subscription management |
| Frontend Components | React props/context | Standard React patterns |

## Build Order Implications

Based on dependencies between components:

1. **Phase 1: Schema & Ingestion** (backend foundation)
   - Define schema.ts
   - Create http.ts with /ingest endpoint
   - Create events.ts mutation
   - Update vibecraft-hook.sh with Convex endpoint URL
   - **Dependency:** Nothing else works without data storage

2. **Phase 2: Basic Queries** (read path)
   - Create events.ts query functions (listRecent, listBySession)
   - Create sessions.ts queries
   - **Dependency:** Requires schema from Phase 1

3. **Phase 3: Frontend Components** (display layer)
   - Create LiveFeed component with usePaginatedQuery
   - Create EventItem component
   - Create /feed page
   - **Dependency:** Requires queries from Phase 2

4. **Phase 4: Session Management** (state aggregation)
   - Add session state updates to event ingestion
   - Create SessionCard component
   - Add active sessions sidebar
   - **Dependency:** Requires basic flow from Phases 1-3

5. **Phase 5: Polish & Advanced Features**
   - Event summarization (AI integration)
   - Historical replay controls
   - Event filtering/search
   - **Dependency:** All prior phases

## Sources

- [Convex Realtime Documentation](https://docs.convex.dev/realtime)
- [Convex HTTP Actions](https://docs.convex.dev/functions/http-actions)
- [Convex Paginated Queries](https://docs.convex.dev/database/pagination)
- [Convex Schemas](https://docs.convex.dev/database/schemas)
- [Convex Indexes](https://docs.convex.dev/database/reading-data/indexes/)
- [Next.js App Router with Convex](https://docs.convex.dev/client/nextjs/app-router/)
- [Fully Reactive Pagination](https://stack.convex.dev/fully-reactive-pagination)
- [Real-Time Database Guide](https://stack.convex.dev/real-time-database)

---
*Architecture research for: Real-time event streaming portfolio live feed*
*Researched: 2026-01-31*
