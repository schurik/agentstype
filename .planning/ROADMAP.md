# Roadmap: agentstype.dev

## Overview

This roadmap delivers a real-time live feed exposing Claude Code sessions to the public. We start with the event capture infrastructure (the hook that captures events and pushes them to Convex), then build the core feed display, add layered disclosure and project filtering, implement session features, construct the supporting pages, and finish with performance optimization. The live feed is the core value - everything else supports it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Event Capture Infrastructure** - Hook captures events securely and pushes to Convex
- [ ] **Phase 2: Core Feed Display** - Real-time event stream with basic styling and connection status
- [ ] **Phase 3: Layered Display & Projects** - Progressive disclosure and project filtering
- [ ] **Phase 4: Session Features** - Session boundaries, stats, and agent hierarchy
- [ ] **Phase 5: Pages & Navigation** - Home, Live Feed, and About pages with full design system
- [ ] **Phase 6: Performance & Scale** - Event batching, virtualization, and viewer count

## Phase Details

### Phase 1: Event Capture Infrastructure
**Goal**: Events from Claude Code sessions are captured, filtered for secrets, and stored in Convex
**Depends on**: Nothing (first phase)
**Requirements**: CAPT-01, CAPT-02, CAPT-03, CAPT-04, CAPT-05
**Success Criteria** (what must be TRUE):
  1. Claude Code hook captures events and POSTs them to Convex endpoint
  2. Sensitive information (API keys, tokens, passwords) is filtered before leaving local machine
  3. Events appear in Convex database within seconds of tool use
  4. Project is correctly derived from working directory
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Core Feed Display
**Goal**: Users can see a real-time event stream with visual distinction between event types
**Depends on**: Phase 1
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04, DESGN-01, DESGN-02, DESGN-03, DESGN-04, DESGN-05
**Success Criteria** (what must be TRUE):
  1. Events appear in the feed within seconds of capture (real-time)
  2. Connection status shows "Live" / "Reconnecting..." / "Offline"
  3. Event types (reads, writes, bash, errors) are visually distinct
  4. Timestamps show both relative ("2 min ago") and absolute on hover
  5. Dark mode styling with monospace typography and clean aesthetic
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Layered Display & Projects
**Goal**: Users can expand events for technical details and filter by project
**Depends on**: Phase 2
**Requirements**: LAYER-01, LAYER-02, LAYER-03, LAYER-04, PROJ-01, PROJ-02, PROJ-03, PROJ-04
**Success Criteria** (what must be TRUE):
  1. Events show summary by default, expand to full technical details on click
  2. Technical details include tool name, inputs, and outputs
  3. "Currently" one-liner at top shows current activity
  4. Projects appear in filter dropdown as they are discovered
  5. URL reflects project filter (/live?project=meetrecap)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Session Features
**Goal**: Users can see session boundaries, stats, and agent relationships
**Depends on**: Phase 3
**Requirements**: FEED-05, FEED-06, FEED-07, FEED-08, SESS-01, SESS-02, SESS-03, SESS-04
**Success Criteria** (what must be TRUE):
  1. Session boundaries clearly show when sessions start/end with duration
  2. Session goal (initial prompt) is pinned at top of each session
  3. Session stats show on completion (duration, event count, files, commits)
  4. Token/cost counter displays tokens consumed and estimated cost
  5. Agent hierarchy shows orchestrator and spawned subagents as collapsible tree
  6. "Thinking" indicator shows when Claude is processing
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Pages & Navigation
**Goal**: Users can navigate between Home, Live Feed, and About pages
**Depends on**: Phase 4
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, LIVE-01, LIVE-02, ABOUT-01, ABOUT-02, ABOUT-03, DESGN-06
**Success Criteria** (what must be TRUE):
  1. Home page shows hero with tagline, bio intro, and link to live feed
  2. Home page shows live indicator and latest event preview when session active
  3. Live Feed page contains the full real-time stream with all features
  4. About page shows full bio with GitHub and X/Twitter links
  5. All pages are mobile responsive
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Performance & Scale
**Goal**: Feed handles rapid events smoothly and shows social proof
**Depends on**: Phase 5
**Requirements**: PERF-01, PERF-02, PERF-03, SOCL-01
**Success Criteria** (what must be TRUE):
  1. Rapid events are batched ("Read 15 files" expandable to see individual files)
  2. Filter dropdown allows filtering by event type
  3. Feed with 100+ events scrolls smoothly (virtualized list)
  4. Viewer count shows how many people are watching
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Event Capture Infrastructure | 0/2 | Not started | - |
| 2. Core Feed Display | 0/2 | Not started | - |
| 3. Layered Display & Projects | 0/2 | Not started | - |
| 4. Session Features | 0/2 | Not started | - |
| 5. Pages & Navigation | 0/2 | Not started | - |
| 6. Performance & Scale | 0/2 | Not started | - |

---
*Roadmap created: 2025-01-31*
*Coverage: 44/44 v1 requirements mapped*
