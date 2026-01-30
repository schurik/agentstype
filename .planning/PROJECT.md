# agentstype.dev

## What This Is

A personal brand website showcasing how I build software with AI agents. The centerpiece is a live feed that exposes my Claude Code sessions in real-time — the actual mechanics of agentic development, visible to anyone. Not tutorials, not polished content — the raw process as it happens.

Tagline: "17 years of code. Now the agents type."
Subheader: "Building with AI agents. Sharing the process."

## Core Value

The live feed. Everything else supports it. If the live feed works — real-time events from Claude Code sessions, summarized for accessibility, with full technical depth available — the site delivers its promise.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Live Feed (Core Feature)
- [ ] Real-time event stream from Claude Code sessions
- [ ] Layered display: plain English summary visible, technical details expandable
- [ ] Project filtering (view all or filter to one project)
- [ ] Agent hierarchy visualization (orchestrator → subagents as collapsible tree)
- [ ] Session boundaries with timing ("Session started 14 min ago")
- [ ] "Thinking" indicator when Claude is processing
- [ ] Event type styling (reads vs writes vs bash vs errors)
- [ ] Batch rapid events ("Read 15 files" expandable)
- [ ] Pause/resume stream for viewers
- [ ] Filter by event type (only bash, only edits, etc.)
- [ ] Session goal pinned at top (from initial prompt)
- [ ] Code diff previews for file edits (syntax highlighted)
- [ ] Commit markers as milestones
- [ ] Error → Resolution linking (visual narrative)
- [ ] Session stats on completion (duration, events, files, commits)
- [ ] Token/cost counter per session
- [ ] Viewer count ("12 watching")
- [ ] Time-lapse replay of past sessions
- [ ] File activity indicator (which files are "hot")
- [ ] "Currently" one-liner summary (sticky context for new arrivals)

#### Event Capture System
- [ ] Claude Code hook captures all events (tool use, sessions, prompts, stops)
- [ ] Project derived from cwd (current working directory)
- [ ] Claude Code skill generates plain English summaries
- [ ] Secrets/sensitive info filtered before push
- [ ] Events pushed to Convex HTTP endpoint
- [ ] Convex broadcasts to connected clients in real-time

#### Pages
- [ ] Home: Hero with tagline, bio intro, live indicator + latest event preview, link to feed
- [ ] Live Feed (/live): Full real-time stream with all features above
- [ ] Projects: Dynamic cards from discovered projects (name, status, count) → click filters feed
- [ ] About: Bio + GitHub + X/Twitter links

#### Projects System
- [ ] Projects auto-discovered from Claude Code session cwd
- [ ] Project name derived from folder name
- [ ] Activity status ("Active now" / "Last active 2h ago")
- [ ] Event count per project
- [ ] Clicking project card navigates to filtered live feed

#### Design
- [ ] Dark mode
- [ ] Monospace/code-inspired typography
- [ ] Generous whitespace
- [ ] Sharp clean lines
- [ ] No gradients, no generic AI illustrations, no stock imagery
- [ ] Developer's personal space aesthetic, not corporate portfolio

### Out of Scope

- Blog / written content — live feed is the content source
- Comments / reactions from viewers — v1 is read-only
- User accounts / authentication — public site, no login
- Mobile app — web only
- Multiple users / team features — this is a personal site
- Manual project curation — projects are auto-discovered only

## Context

**Who I am:** Software engineer with 17 years of experience, now focused on agentic AI development. Claude Code is my daily driver. I prompt, review, iterate. The agents handle the typing.

**Bio:**
> Been shipping software for 17 years. Then AI agents showed up and everything got way more fun. I went from curious to obsessed to this is actually how I work now. Claude Code is my copilot. I prompt, review, iterate. The agents handle the typing. This site is where I share the ride — what I'm building, how it actually looks (yes, live), the wins, the weird moments, all of it. Currently building MeetRecap, meeting notes that actually make sense.

**Tone:** Technical expert but curious experimenter. Pragmatic builder with casual fun vibe. Not corporate, not AI slop.

**Target audience:**
- Curious beginners wondering what agentic coding looks like
- Potential clients evaluating my work
- Other builders interested in AI-assisted development

**Current project:** MeetRecap — meeting transcription tool with AI-generated insights. This will be the first project visible in the live feed.

**Existing code:** This repo has a Next.js + Convex starter already set up. The codebase has been mapped (see .planning/codebase/).

**Reference:** vibecraft-hook.sh in this repo shows the hook pattern for capturing Claude Code events.

## Constraints

- **Tech stack**: Next.js + Tailwind (frontend), Convex (backend/real-time), Vercel (hosting) — already set up
- **Domain**: agentstype.dev
- **Hook mechanism**: Must work with Claude Code's hook system (PreToolUse, PostToolUse, SessionStart, etc.)
- **Security**: Must filter secrets/sensitive info before events hit Convex
- **Performance**: Live feed must handle rapid events without degrading UX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Convex for backend | Already set up, real-time subscriptions built-in, good DX | — Pending |
| Hook + skill for capture | Leverage Claude Code's existing hook system, use skill for summarization | — Pending |
| Projects auto-discovered | No manual curation, projects emerge from actual work | — Pending |
| Layered event display | Accessible to non-technical (summary) but valuable to technical (details) | — Pending |
| No user accounts | Public read-only site, simplifies v1 | — Pending |

---
*Last updated: 2025-01-31 after initialization*
