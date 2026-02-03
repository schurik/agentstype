# Requirements: agentstype.dev

**Defined:** 2025-01-31
**Core Value:** The live feed - real-time Claude Code sessions with layered display (summary + technical depth)

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Live Feed - Core Display

- [x] **FEED-01**: Real-time event stream displays events as they happen
- [x] **FEED-02**: Each event shows timestamp (relative and absolute)
- [x] **FEED-03**: Connection status indicator shows "Live" / "Reconnecting..." / "Offline"
- [x] **FEED-04**: Event type styling visually distinguishes reads/writes/bash/errors
- [x] **FEED-05**: Session boundaries show when sessions start/end with duration
- [x] **FEED-06**: Active agents panel shows orchestrator + spawned subagents
- [x] **FEED-07**: Agent hierarchy displays as collapsible tree (orchestrator -> subagents)
- [x] **FEED-08**: "Thinking" indicator shows when Claude is processing (no event yet)

### Live Feed - Layered Display

- [x] **LAYER-01**: Events show summary by default (rule-based, not AI)
- [x] **LAYER-02**: Events expand to show full technical details on click
- [x] **LAYER-03**: Technical details include tool name, inputs, outputs
- [x] **LAYER-04**: "Currently" one-liner at top summarizes current activity

### Live Feed - Performance

- [ ] **PERF-01**: Event batching groups rapid events ("Read 15 files" expandable)
- [ ] **PERF-02**: Filter dropdown allows filtering by event type
- [ ] **PERF-03**: Virtualized list handles 100+ events without performance hit

### Live Feed - Session Features

- [x] **SESS-01**: Session goal (initial prompt) pinned at top of session
- [x] **SESS-02**: Session stats shown on completion (duration, event count, files, commits)
- [ ] **SESS-03**: Token/cost counter displays tokens consumed and estimated cost *(Deferred - not available via hooks)*
- [x] **SESS-04**: Commit markers highlight git commits as milestones

### Live Feed - Social

- [ ] **SOCL-01**: Viewer count shows how many people are watching

### Live Feed - Project Filtering

- [x] **PROJ-01**: Projects auto-discovered from Claude Code session cwd
- [x] **PROJ-02**: Project name derived from folder name
- [x] **PROJ-03**: Filter dropdown allows filtering feed by project
- [x] **PROJ-04**: URL reflects project filter (/live?project=meetrecap)

### Event Capture System

- [ ] **CAPT-01**: Claude Code hook captures all events (PreToolUse, PostToolUse, SessionStart, SessionEnd, etc.)
- [ ] **CAPT-02**: Hook extracts cwd to identify project
- [ ] **CAPT-03**: Secrets filtering removes sensitive info before push (CRITICAL)
- [ ] **CAPT-04**: Events pushed to Convex HTTP endpoint
- [ ] **CAPT-05**: Convex broadcasts events to connected clients in real-time

### Pages - Home

- [ ] **HOME-01**: Hero section with tagline and subheader
- [ ] **HOME-02**: Brief bio intro
- [ ] **HOME-03**: Live indicator shows if currently coding
- [ ] **HOME-04**: Latest event preview with link to full feed

### Pages - Live Feed

- [ ] **LIVE-01**: Full real-time stream with all feed features
- [ ] **LIVE-02**: Project filter accessible from this page

### Pages - About

- [ ] **ABOUT-01**: Full bio text
- [ ] **ABOUT-02**: GitHub link
- [ ] **ABOUT-03**: X/Twitter link

### Design

- [x] **DESGN-01**: Dark mode as default/only mode
- [x] **DESGN-02**: Monospace or code-inspired typography
- [x] **DESGN-03**: Generous whitespace
- [x] **DESGN-04**: Sharp clean lines, no gradients
- [x] **DESGN-05**: No generic AI illustrations or stock imagery
- [ ] **DESGN-06**: Mobile responsive

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Live Feed - Rich Content

- **RICH-01**: Code diff previews with syntax highlighting
- **RICH-02**: Error -> Resolution visual linking

### Live Feed - Advanced

- **ADV-01**: Pause/resume stream for viewers
- **ADV-02**: Time-lapse replay of past sessions at variable speed
- **ADV-03**: File activity indicator ("hot" files)

### Event Capture - AI

- **AI-01**: AI-generated plain English summaries via Claude skill

### Pages

- **PAGE-01**: Dedicated Projects page with cards (name, status, event count)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Blog / written content | Live feed is the content source |
| Comments / reactions | v1 is read-only, avoids moderation burden |
| User accounts / login | Public site, no auth needed |
| Mobile app | Web only for v1 |
| Multiple users / team | Personal site |
| Manual project curation | Projects auto-discovered only |
| Light mode | Dark mode only for v1 (dev audience) |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAPT-01 | Phase 1 | Complete |
| CAPT-02 | Phase 1 | Complete |
| CAPT-03 | Phase 1 | Complete |
| CAPT-04 | Phase 1 | Complete |
| CAPT-05 | Phase 1 | Complete |
| FEED-01 | Phase 2 | Complete |
| FEED-02 | Phase 2 | Complete |
| FEED-03 | Phase 2 | Complete |
| FEED-04 | Phase 2 | Complete |
| DESGN-01 | Phase 2 | Complete |
| DESGN-02 | Phase 2 | Complete |
| DESGN-03 | Phase 2 | Complete |
| DESGN-04 | Phase 2 | Complete |
| DESGN-05 | Phase 2 | Complete |
| LAYER-01 | Phase 3 | Complete |
| LAYER-02 | Phase 3 | Complete |
| LAYER-03 | Phase 3 | Complete |
| LAYER-04 | Phase 3 | Complete |
| PROJ-01 | Phase 3 | Complete |
| PROJ-02 | Phase 3 | Complete |
| PROJ-03 | Phase 3 | Complete |
| PROJ-04 | Phase 3 | Complete |
| FEED-05 | Phase 4 | Complete |
| FEED-06 | Phase 4 | Complete |
| FEED-07 | Phase 4 | Complete |
| FEED-08 | Phase 4 | Complete |
| SESS-01 | Phase 4 | Complete |
| SESS-02 | Phase 4 | Complete |
| SESS-03 | Phase 4 | Deferred |
| SESS-04 | Phase 4 | Complete |
| HOME-01 | Phase 5 | Pending |
| HOME-02 | Phase 5 | Pending |
| HOME-03 | Phase 5 | Pending |
| HOME-04 | Phase 5 | Pending |
| LIVE-01 | Phase 5 | Pending |
| LIVE-02 | Phase 5 | Pending |
| ABOUT-01 | Phase 5 | Pending |
| ABOUT-02 | Phase 5 | Pending |
| ABOUT-03 | Phase 5 | Pending |
| DESGN-06 | Phase 5 | Pending |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |
| SOCL-01 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0

---
*Requirements defined: 2025-01-31*
*Last updated: 2025-01-31 after roadmap creation*
