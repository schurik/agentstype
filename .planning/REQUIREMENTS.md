# Requirements: agentstype.dev

**Defined:** 2025-01-31
**Core Value:** The live feed — real-time Claude Code sessions with layered display (summary + technical depth)

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Live Feed — Core Display

- [ ] **FEED-01**: Real-time event stream displays events as they happen
- [ ] **FEED-02**: Each event shows timestamp (relative and absolute)
- [ ] **FEED-03**: Connection status indicator shows "Live" / "Reconnecting..." / "Offline"
- [ ] **FEED-04**: Event type styling visually distinguishes reads/writes/bash/errors
- [ ] **FEED-05**: Session boundaries show when sessions start/end with duration
- [ ] **FEED-06**: Active agents panel shows orchestrator + spawned subagents
- [ ] **FEED-07**: Agent hierarchy displays as collapsible tree (orchestrator → subagents)
- [ ] **FEED-08**: "Thinking" indicator shows when Claude is processing (no event yet)

### Live Feed — Layered Display

- [ ] **LAYER-01**: Events show summary by default (rule-based, not AI)
- [ ] **LAYER-02**: Events expand to show full technical details on click
- [ ] **LAYER-03**: Technical details include tool name, inputs, outputs
- [ ] **LAYER-04**: "Currently" one-liner at top summarizes current activity

### Live Feed — Performance

- [ ] **PERF-01**: Event batching groups rapid events ("Read 15 files" expandable)
- [ ] **PERF-02**: Filter dropdown allows filtering by event type
- [ ] **PERF-03**: Virtualized list handles 100+ events without performance hit

### Live Feed — Session Features

- [ ] **SESS-01**: Session goal (initial prompt) pinned at top of session
- [ ] **SESS-02**: Session stats shown on completion (duration, event count, files, commits)
- [ ] **SESS-03**: Token/cost counter displays tokens consumed and estimated cost
- [ ] **SESS-04**: Commit markers highlight git commits as milestones

### Live Feed — Social

- [ ] **SOCL-01**: Viewer count shows how many people are watching

### Live Feed — Project Filtering

- [ ] **PROJ-01**: Projects auto-discovered from Claude Code session cwd
- [ ] **PROJ-02**: Project name derived from folder name
- [ ] **PROJ-03**: Filter dropdown allows filtering feed by project
- [ ] **PROJ-04**: URL reflects project filter (/live?project=meetrecap)

### Event Capture System

- [ ] **CAPT-01**: Claude Code hook captures all events (PreToolUse, PostToolUse, SessionStart, SessionEnd, etc.)
- [ ] **CAPT-02**: Hook extracts cwd to identify project
- [ ] **CAPT-03**: Secrets filtering removes sensitive info before push (CRITICAL)
- [ ] **CAPT-04**: Events pushed to Convex HTTP endpoint
- [ ] **CAPT-05**: Convex broadcasts events to connected clients in real-time

### Pages — Home

- [ ] **HOME-01**: Hero section with tagline and subheader
- [ ] **HOME-02**: Brief bio intro
- [ ] **HOME-03**: Live indicator shows if currently coding
- [ ] **HOME-04**: Latest event preview with link to full feed

### Pages — Live Feed

- [ ] **LIVE-01**: Full real-time stream with all feed features
- [ ] **LIVE-02**: Project filter accessible from this page

### Pages — About

- [ ] **ABOUT-01**: Full bio text
- [ ] **ABOUT-02**: GitHub link
- [ ] **ABOUT-03**: X/Twitter link

### Design

- [ ] **DESGN-01**: Dark mode as default/only mode
- [ ] **DESGN-02**: Monospace or code-inspired typography
- [ ] **DESGN-03**: Generous whitespace
- [ ] **DESGN-04**: Sharp clean lines, no gradients
- [ ] **DESGN-05**: No generic AI illustrations or stock imagery
- [ ] **DESGN-06**: Mobile responsive

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Live Feed — Rich Content

- **RICH-01**: Code diff previews with syntax highlighting
- **RICH-02**: Error → Resolution visual linking

### Live Feed — Advanced

- **ADV-01**: Pause/resume stream for viewers
- **ADV-02**: Time-lapse replay of past sessions at variable speed
- **ADV-03**: File activity indicator ("hot" files)

### Event Capture — AI

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
| (To be populated by roadmapper) | | |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35 ⚠️

---
*Requirements defined: 2025-01-31*
*Last updated: 2025-01-31 after initial definition*
