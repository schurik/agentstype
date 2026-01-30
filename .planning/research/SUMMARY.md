# Project Research Summary

**Project:** agentstype.dev
**Domain:** Real-time developer portfolio with live Claude Code session streaming
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

This project builds a real-time activity feed that streams Claude Code session events to a public portfolio site. The technical approach is well-established: Convex provides native real-time subscriptions via WebSocket, eliminating the need for custom WebSocket infrastructure or polling. A shell hook captures Claude Code events locally, POSTs them to Convex HTTP actions, and React components subscribe to automatic updates. This architecture is proven for live feeds at scale.

The primary challenge is not technical complexity but rather operational discipline. The existing `vibecraft-hook.sh` already captures events correctly, but three critical risks require immediate attention: (1) secrets filtering must happen in the hook before data reaches Convex to prevent credential leaks, (2) the hook must remain non-blocking with aggressive timeouts to avoid degrading Claude Code performance, and (3) UI event aggregation is essential to prevent information overload during rapid tool usage. These aren't speculative concerns—they represent common pitfalls with severe consequences.

The recommended build sequence follows natural dependencies: hook infrastructure and data model first (foundation), basic read/display path second (validation), then layered enhancements. Starting with progressive disclosure or code diffs before establishing the core pipeline would be premature optimization. The stack is already in place (Next.js 16, React 19, Convex, Tailwind v4), requiring only targeted library additions for animation, virtualization, and syntax highlighting.

## Key Findings

### Recommended Stack

**The existing stack is well-suited for this project.** Next.js 16 with App Router enables server components for initial page load while client components maintain WebSocket subscriptions. Convex's native real-time capabilities (useQuery hooks, automatic reactivity) eliminate manual subscription management. React 19's improved Suspense/streaming integrates cleanly with Convex's data loading patterns.

**Core technologies:**
- **Convex 1.31.6**: Real-time backend with automatic subscriptions—the WebSocket transport is handled entirely by the library, just write mutations and queries
- **Next.js 16.1.6**: App Router separates static portfolio pages (Server Components) from live feed (Client Components with real-time updates)
- **React 19.2.3**: Concurrent features and improved Suspense work seamlessly with Convex's streaming data model
- **Tailwind CSS v4**: Performance improvements in v4 handle frequent re-renders from live updates without layout thrashing

**New libraries needed (verified compatible):**
- **motion 12.26.2**: Entry/exit animations for feed items, expandable card transitions (framer-motion rebranded with cleaner imports)
- **@tanstack/react-virtual 3.13.18**: Virtualized list rendering for feeds with 100+ events to prevent DOM bloat and maintain scroll performance
- **shiki 3.21.0**: VS Code-quality syntax highlighting for code snippets and diffs—works with Next.js RSC patterns
- **zustand 5.0.10**: UI-only state (expanded items, filters, replay position)—NOT for server data, which Convex handles natively

### Expected Features

**Must have (table stakes):**
- **Real-time event updates** — users expect live feeds to be actually live; page refresh requirement feels broken
- **Connection status indicator** — users must know if data is live or stale; critical for trust
- **Chronological ordering with timestamps** — standard mental model for activity feeds (newest first)
- **Event type indicators** — visual differentiation between file edits, tool use, commits (icons + color coding)
- **Session boundaries** — clear visual separation between work sessions creates narrative structure
- **Mobile responsiveness** — 50%+ traffic is mobile; broken mobile experience disqualifies the product
- **Empty state design** — first impression when no sessions active; cannot be blank
- **Dark mode** — nearly table stakes for developer audiences; matches IDE aesthetic

**Should have (competitive advantage):**
- **Progressive disclosure / expandable events** — summary visible by default, details on demand; reduces cognitive load
- **Code diff previews with syntax highlighting** — shows actual work, not just descriptions; unique value proposition
- **Agent hierarchy visualization** — shows parent/child agent relationships; unique to Claude Code's architecture
- **Session stats** — aggregate metrics (duration, files touched, lines changed) make work tangible and impressive
- **Time-lapse replay** — watch completed sessions as accelerated playback; creates replayable content

**Defer (v2+):**
- **Live viewer count** — requires presence system, adds complexity without core value
- **Smooth animations** — polish feature, add after functionality complete
- **Complex filtering** — premature optimization; simple project filter initially

**Anti-features (deliberately NOT building):**
- **Real-time chat/comments** — massive moderation burden, scope creep, security risks
- **User accounts/authentication** — unnecessary friction for read-only showcase
- **Bidirectional communication** — security nightmare; keep feed one-way
- **AI-powered summarization** — adds latency, can misrepresent work

### Architecture Approach

**Standard pattern: HTTP ingestion → Convex mutations → automatic subscriptions → reactive UI.** Claude Code hooks POST events to Convex HTTP actions, which validate and store via mutations. React components use `useQuery` hooks that automatically re-render when underlying data changes. No manual WebSocket code, no polling, no subscription management—Convex handles the transport layer entirely.

**Major components:**
1. **vibecraft-hook.sh** — captures Claude Code events, filters secrets, transforms to JSON, POSTs to Convex (already exists, needs endpoint URL update and secrets filtering)
2. **HTTP Action (http.ts)** — receives webhook, validates payload structure, calls mutation (thin layer, no business logic)
3. **Mutation (events.ingest)** — validates event against schema, stores in events table, updates session state (core ingestion logic)
4. **Query Functions (events.ts, sessions.ts)** — read events with filtering/pagination, automatic subscriptions for connected clients
5. **LiveFeed Component** — renders real-time stream with usePaginatedQuery, infinite scroll, virtualization for performance
6. **EventItem / SessionCard** — display individual events and session summaries with appropriate styling and expand/collapse

**Data model:** Events table (append-only log with indexes for session/type/timestamp queries), Sessions table (aggregated state with event counts), Projects table (metadata/display config). Critical decision: split event documents into metadata (small, queried often) vs. payload (large, fetched on demand) to avoid Convex bandwidth explosion.

### Critical Pitfalls

1. **Hook Blocking Claude Code Sessions** — synchronous work in the hook (HTTP requests, JSON parsing, file I/O) degrades Claude responsiveness. Prevention: fire-and-forget with aggressive timeouts (1s connect, 2s max), background processing, test p99 latency under load (100+ rapid tool calls). Warning: users report Claude feels sluggish after enabling hook.

2. **Secrets Leaking into Public Feed** — tool inputs/outputs contain API keys, tokens, passwords that flow unfiltered to Convex and display publicly. Prevention: filter at hook level BEFORE data leaves local machine, multi-layered detection (regex + entropy + keyword context), redact toolInput/toolResponse content aggressively by default. NEVER store raw tool_response for file-reading tools. This is a security incident waiting to happen.

3. **Transcript File Race Conditions** — reading transcript file while Claude Code writes causes partial JSON parsing failures, stale data, corrupted reads. Prevention: treat transcript reads as best-effort enrichment (not required data), add retry logic with exponential backoff, log parse failures to detect systemic issues. Current implementation uses `|| echo ""` which silently swallows errors.

4. **Event Storm Overwhelming UI** — rapid activity (search touching 50 files) generates 50+ events in seconds, feed becomes unreadable blur, React re-renders thrash. Prevention: event coalescing in UI layer (batch updates within 100-200ms window), aggregation logic ("Read 47 files" instead of 47 separate events), virtualization for feed rendering, debounce Convex subscription updates.

5. **Convex Bandwidth Explosion from Full Payloads** — storing complete toolInput/toolResponse JSON causes bandwidth costs to explode (100KB+ per Read tool response). Prevention: split event documents (metadata vs. payload), store only summaries in primary table, full payloads in separate table fetched on demand, set explicit field size limits in schema validation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Hook Infrastructure & Data Foundation
**Rationale:** Nothing else works without secure, reliable event capture and storage. The hook already exists but needs hardening (secrets filtering, performance optimization). The Convex schema must be designed correctly upfront because changing it later means data migration.

**Delivers:**
- Hardened hook with secrets filtering and performance guarantees
- Convex schema (events, sessions, projects tables with proper indexes)
- HTTP ingestion endpoint with validation
- Basic mutation functions for storing events

**Addresses:**
- Secrets filtering (FEATURES.md anti-feature: no security vulnerabilities)
- Hook performance (PITFALLS: hook blocking Claude)
- Data model design (PITFALLS: bandwidth explosion)

**Avoids:**
- Critical Pitfall #1 (hook blocking)
- Critical Pitfall #2 (secrets leaking)
- Critical Pitfall #5 (bandwidth explosion)

**Research needed:** None—well-documented patterns. Hook already exists, schema follows standard Convex patterns, secrets filtering uses established regex libraries.

---

### Phase 2: Basic Read Path & Display
**Rationale:** Validate the core pipeline works before adding enhancements. Build the minimal useful feed: show events in chronological order with timestamps and type indicators. This proves WebSocket subscriptions work and reveals actual performance characteristics.

**Delivers:**
- Query functions (listRecent, listBySession) with pagination
- LiveFeed component with usePaginatedQuery
- EventItem component with basic styling
- /feed page with dark mode
- Empty state design

**Uses:**
- Convex reactive queries (STACK: useQuery pattern)
- Next.js Client Components for real-time UI (ARCHITECTURE: component boundaries)
- Basic Tailwind styling (already configured)

**Implements:**
- Real-time event updates (FEATURES: table stakes)
- Chronological ordering with timestamps (FEATURES: table stakes)
- Event type indicators (FEATURES: table stakes)
- Connection status indicator (FEATURES: table stakes)

**Avoids:**
- Premature optimization (ARCHITECTURE: anti-pattern of complex filtering before basic flow works)
- Building UI before data model proven (ARCHITECTURE: phase ordering)

**Research needed:** None—standard Convex query patterns, established React component architecture.

---

### Phase 3: Session Management & Boundaries
**Rationale:** Session boundaries create narrative structure and enable aggregate metrics. This builds on the working event pipeline from Phase 2 and provides foundation for session-specific features (stats, replay).

**Delivers:**
- Session state management (mutation updates on event ingestion)
- SessionCard component with live event counts
- Session filtering and selection UI
- Session duration and basic stats

**Addresses:**
- Session boundaries (FEATURES: table stakes)
- Session stats (FEATURES: differentiator)
- Project filtering (FEATURES: differentiator)

**Avoids:**
- Building session features before event pipeline proven (ARCHITECTURE: dependency ordering)

**Research needed:** None—session aggregation follows standard database patterns.

---

### Phase 4: Progressive Disclosure & Rich Content
**Rationale:** Users now understand the basic feed; add depth without overwhelming. Expandable events reduce information density while preserving access to details. Code diffs and syntax highlighting deliver unique value.

**Delivers:**
- Expandable event cards with motion animations
- Code diff previews with react-diff-viewer-continued
- Syntax highlighting with Shiki
- Two-level disclosure hierarchy (summary → details)

**Uses:**
- motion library for smooth expand/collapse (STACK: animation patterns)
- shiki for VS Code-quality highlighting (STACK: code diff pattern)
- react-diff-viewer-continued for diff layout (STACK: recommended over unmaintained original)

**Implements:**
- Progressive disclosure (FEATURES: key differentiator)
- Code diff previews (FEATURES: competitive advantage)

**Avoids:**
- Adding complexity before basic feed works (FEATURES: prioritization matrix)
- Building diffs before having events to display (ARCHITECTURE: dependency flow)

**Research needed:** Minimal—libraries well-documented, pattern straightforward. May need brief research on Shiki performance optimization for large files.

---

### Phase 5: Performance & Scale
**Rationale:** Once features are stable, optimize for scale. Event storms and long sessions reveal performance bottlenecks that weren't apparent in basic testing.

**Delivers:**
- Event aggregation logic ("Read 47 files" vs 47 separate events)
- UI debouncing/batching (100-200ms window for updates)
- Virtualized list rendering with @tanstack/react-virtual
- Mobile optimization and touch-friendly interactions

**Uses:**
- @tanstack/react-virtual for virtualization (STACK: recommended for 100+ items)
- Zustand for UI state management (STACK: local state pattern)

**Addresses:**
- Event storm overwhelm (PITFALLS: critical #4)
- Mobile responsiveness (FEATURES: table stakes)
- Performance at scale (PITFALLS: performance traps)

**Avoids:**
- Premature optimization before knowing bottlenecks (ARCHITECTURE: scaling priorities)

**Research needed:** None initially. May need research on specific aggregation strategies if event patterns are unusual.

---

### Phase 6: Advanced Features
**Rationale:** Polish and differentiators after core functionality is solid. These features create memorable experiences but aren't essential for launch.

**Delivers:**
- Agent hierarchy visualization with react-arborist
- Time-lapse replay with playback controls
- Smooth animations for feed updates
- Connection recovery with event catchup

**Uses:**
- react-arborist for tree visualization (STACK: agent hierarchy pattern)
- Zustand for replay state management (STACK: time-lapse pattern)
- date-fns for time scrubbing UI (STACK: recommended over moment.js)

**Implements:**
- Agent hierarchy visualization (FEATURES: unique differentiator)
- Time-lapse replay (FEATURES: v2+ consideration)

**Research needed:** Likely for Phase 6—agent hierarchy visualization is unique to Claude Code's architecture. May need deeper research on best practices for tree rendering at scale.

---

### Phase Ordering Rationale

**Why this order:**
1. **Data foundation first** — schema changes cascade everywhere; get it right upfront
2. **Secrets filtering cannot wait** — single leak causes security incident; must be in hook from day one
3. **Basic flow before enhancements** — validate WebSocket subscriptions work before adding complexity
4. **Session boundaries after events** — can't group what doesn't exist yet
5. **Progressive disclosure after basic display** — need working feed to understand information density problems
6. **Performance after features** — premature optimization is waste; optimize when bottlenecks are known
7. **Advanced features last** — polish when core is stable

**How this avoids pitfalls:**
- Phase 1 addresses all critical security/performance pitfalls before any data flows
- Phase 2 validates architecture patterns before committing to complex features
- Phase 5 explicitly tackles event storm and UI performance issues before they become user-facing problems
- Agent hierarchy deferred to Phase 6 because it's unique (no established patterns) and not table stakes

**Dependencies respected:**
- HTTP ingestion → queries → UI (ARCHITECTURE: data flow)
- Events → sessions → stats (ARCHITECTURE: aggregation dependency)
- Basic display → rich content → animations (FEATURES: progressive enhancement)
- Working pipeline → performance optimization (ARCHITECTURE: scaling priorities)

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Hook infrastructure—existing hook provides blueprint, Convex schema patterns well-documented
- **Phase 2:** Basic queries/display—standard Convex reactive query patterns, established React component architecture
- **Phase 3:** Session management—straightforward database aggregation, session state is common pattern
- **Phase 4:** Diffs/highlighting—libraries well-documented (shiki, react-diff-viewer-continued have extensive docs)
- **Phase 5:** Performance—established virtualization patterns, TanStack Virtual has comprehensive guides

**Phases likely needing deeper research:**
- **Phase 6:** Agent hierarchy visualization—unique to Claude Code's multi-agent architecture, no direct precedent. Research topics: optimal tree layout for N-level hierarchies, handling dynamic agent spawning, visualizing parent/child context flow. Recommend `/gsd:research-phase` when starting Phase 6.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified via npm, official docs, and compatibility matrices. Versions confirmed compatible with existing Next.js 16 + React 19 + Convex stack. |
| Features | MEDIUM | Based on web search across activity feed design guides, developer portfolio analysis, and build-in-public best practices. Cross-referenced multiple sources but no single authoritative reference. MVP definition is well-supported. |
| Architecture | HIGH | Convex real-time patterns documented extensively in official docs and Stack blog posts. HTTP ingestion → mutation → subscription flow is proven architecture for webhook-driven live feeds. |
| Pitfalls | HIGH | Verified against existing vibecraft-hook.sh implementation (codebase evidence), cross-referenced with webhook scaling guides, secrets detection best practices, and React performance optimization patterns. |

**Overall confidence:** HIGH

### Gaps to Address

**Gap 1: Actual event volume patterns**
- **What's unknown:** Real-world distribution of event types and frequencies during typical Claude Code sessions
- **Why it matters:** Affects aggregation strategy, virtualization settings, and whether event coalescing is essential or nice-to-have
- **How to handle:** Build basic feed first (Phase 2), instrument to collect metrics on actual usage, adjust Phase 5 implementation based on data

**Gap 2: Secrets filtering effectiveness**
- **What's unknown:** Coverage of current regex patterns against actual tool outputs from Claude Code
- **Why it matters:** Single missed secret pattern causes security incident
- **How to handle:** Build comprehensive test suite in Phase 1 with known secret formats (API keys, tokens, JWTs, etc.), run against sample tool outputs, iterate until coverage is verified. Consider adding entropy-based detection as second layer.

**Gap 3: Agent hierarchy complexity**
- **What's unknown:** Maximum depth and breadth of agent trees in practice, patterns of agent spawning/termination
- **Why it matters:** Affects tree visualization library choice and UI design
- **How to handle:** Defer to Phase 6, add instrumentation in earlier phases to track agent relationships, use real data to inform visualization design

**Gap 4: Mobile UX for code diffs**
- **What's unknown:** How code diffs render on small screens, whether side-by-side or unified view is better for mobile
- **Why it matters:** 50%+ traffic is mobile; broken diff experience undermines core value prop
- **How to handle:** Test on actual devices during Phase 4 implementation, be prepared to adjust diff layout responsively (side-by-side desktop, unified mobile)

## Sources

### Primary (HIGH confidence)
- Convex Official Documentation (realtime, HTTP actions, pagination, schemas, indexes)
- Next.js Official Documentation (App Router, Server Components, Client Components)
- TanStack Virtual Official Docs (v3.13.18)
- Motion.dev Official Docs (v12.26.2)
- Shiki Official Documentation (v3.21.0)
- Existing codebase: vibecraft-hook.sh, CLAUDE.md, convex/schema.ts

### Secondary (MEDIUM confidence)
- GetStream Activity Feed Design Guide
- SuprSend Activity Feed Best Practices
- UI Patterns Activity Stream Guidelines
- Hookdeck Webhooks at Scale
- Convex Stack Blog (fully reactive pagination, query performance)
- GitHub Secrets Patterns Database
- GitGuardian Secrets Detection Methodology

### Tertiary (LOW confidence, cross-verified)
- Web developer portfolio examples (Templyo, WeAreDevelopers)
- Build-in-public case studies (Medium, Dev.to)
- Real-time tech comparisons (WebSockets vs SSE)
- Gamification analysis (Trophy.so GitHub case study)

---
*Research completed: 2026-01-31*
*Ready for roadmap: yes*
