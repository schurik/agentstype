# Feature Research

**Domain:** Real-time activity feed / Developer portfolio with live Claude Code session streaming
**Researched:** 2026-01-31
**Confidence:** MEDIUM (based on web search findings, cross-referenced across multiple sources)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real-time event updates | Users expect live feeds to actually be live; page refresh requirement feels broken | MEDIUM | Convex provides this natively via subscriptions. Instant feedback is critical - studies show 35% of users disengage after a single connection drop |
| Chronological ordering | Standard mental model for activity feeds; newest first is the default expectation | LOW | Basic query ordering. Consider reverse-chronological with "new activity" indicators |
| Timestamp display | Users need temporal context for when events occurred | LOW | Use relative time (e.g., "2m ago") with hover for absolute time. Correct abbreviations matter ("min" not "m") |
| Event type indicators | Visual differentiation between event types (file edit, tool use, commit, etc.) | LOW | Icons + color coding. Maintain consistent styling across types for scannability |
| Actor identification | Users need to know who/what performed the action | LOW | For Claude Code, this means identifying agent/tool context. Avatar-equivalent for quick scanning |
| Connection status indicator | Users must know if they're seeing live data or stale content | LOW | Visual indicator for connected/disconnected/reconnecting states. Critical for trust |
| Mobile responsiveness | 50%+ traffic is mobile; broken mobile experience is disqualifying | MEDIUM | Use responsive layouts, touch-friendly elements (min 44px targets), readable font sizes |
| Empty state design | First impression when no sessions are active; cannot be blank | LOW | Design intentionally, not as afterthought. Show what to expect, create anticipation |
| Basic error handling | Graceful degradation when things go wrong | LOW | User-friendly error messages, retry mechanisms, don't crash on edge cases |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but create memorable experiences.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Progressive disclosure / Expandable events** | Shows summary by default, reveals details on demand. Reduces cognitive load while enabling depth | MEDIUM | Key UX pattern. Display hierarchy: summary visible, code/diffs expandable. Limit to 2 levels of disclosure max |
| **Session boundaries with stats** | Clear visual separation between work sessions with aggregate metrics (duration, files touched, lines changed) | MEDIUM | Creates narrative structure. Makes work tangible and impressive. Similar to GitHub contribution visualization |
| **Code diff previews with syntax highlighting** | Inline code changes with proper highlighting - shows actual work, not just descriptions | HIGH | Use libraries like diff2html or Shiki. Offer unified vs side-by-side toggle. Character-level highlighting adds polish |
| **Project filtering** | Filter feed by project when multiple projects exist | LOW | Essential at scale but differentiating for simplicity of implementation. Tag-based filtering |
| **Agent hierarchy visualization** | Show parent/child agent relationships, spawned sub-agents | MEDIUM | Unique to Claude Code's agent architecture. No direct competitors do this. Tree visualization |
| **Live viewer count** | Social proof - shows others are watching, creates "live event" feeling | MEDIUM | Requires presence tracking. Streamlabs-style implementation. Proven to increase engagement and perceived value |
| **Time-lapse replay** | Watch completed sessions as accelerated playback | HIGH | Similar to session replay tools (PostHog, LogRocket). Unique in this context. Creates replayable content |
| **"Building in public" narrative** | Contextualize work with explanations of what's being built and why | LOW-MEDIUM | 30% higher community engagement for public projects (Indie Hackers 2025). Add optional session titles/descriptions |
| **Smooth animations and transitions** | Polished micro-interactions for new events appearing, expanding, filtering | MEDIUM | Creates premium feel. Use CSS transitions or Framer Motion. New items should animate in, not pop |
| **Dark mode / IDE-aesthetic** | Match developer aesthetic expectations; feels native to coding environment | LOW | Many dev portfolios use IDE-inspired themes. Dark mode is nearly table stakes for dev audiences |
| **Connection recovery with catchup** | Auto-reconnect and replay missed events seamlessly | MEDIUM | Exponential backoff for reconnection. Queue missed events. Users shouldn't know connection dropped |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems - deliberately NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time chat/comments** | Social engagement, community feel | Massive moderation burden; scope creep; security risks | Link to external channels (Discord, Twitter/X) |
| **User accounts/authentication** | Personalization, saved preferences | Adds friction; unnecessary for read-only showcase; privacy/security burden | Optional local storage for preferences |
| **Notifications/alerts** | Don't miss new sessions | Spammy; users don't want portfolio push notifications | RSS feed for power users |
| **Leaderboards/metrics comparison** | Gamification appeal | Encourages vanity metrics over quality; contribution graphs are "easy to game" | Focus on narrative, not competition |
| **Full video recording** | Richer content than text feed | Storage costs; bandwidth; CDN complexity; privacy concerns | Time-lapse replay of event stream is sufficient |
| **Infinite scroll without boundaries** | "Never ending content" | Destroys scannability; users get lost; performance degrades | Paginate by session with clear boundaries |
| **Every action logged** | Completeness | Information overload kills usability. "Oversaturation reduces utility" | Aggregate similar actions, show highlights |
| **Bidirectional communication (visitors to agent)** | Interactive experience | Security nightmare; scope explosion; distraction from showcase purpose | One-way feed only |
| **AI-powered event summarization** | Reduce noise | Adds latency; can misrepresent work; black box | Manual session descriptions where needed |
| **Complex filtering/faceted search** | Power user feature | Premature optimization; adds UI complexity | Simple project filter initially, expand based on real usage |

## Feature Dependencies

```
[Connection Status] (foundation)
    |
    v
[Real-time Event Updates] (core subscription)
    |
    +--> [Chronological Ordering]
    |         |
    |         v
    |    [Timestamp Display]
    |         |
    |         v
    |    [Session Boundaries] (requires grouping events by session)
    |              |
    |              v
    |         [Session Stats] (requires session boundary)
    |              |
    |              v
    |         [Time-lapse Replay] (requires complete session)
    |
    +--> [Event Type Indicators]
    |         |
    |         v
    |    [Progressive Disclosure / Expandable Events]
    |         |
    |         +--> [Code Diff Previews] (enhancement to expandable events)
    |
    +--> [Actor Identification]
              |
              v
         [Agent Hierarchy Visualization] (builds on actor identification)

[Project Filtering] (independent, can be added anytime)

[Live Viewer Count] (independent, requires separate presence system)

[Dark Mode / Styling] (independent, can be added anytime)
```

### Dependency Notes

- **Real-time updates require connection status:** Must have connection awareness before claiming "real-time"
- **Session boundaries require event grouping:** Can't show session stats without knowing where sessions start/end
- **Time-lapse replay requires complete sessions:** Can only replay finished sessions, not in-progress
- **Code diff previews enhance expandable events:** Diffs are a type of expanded content
- **Agent hierarchy builds on actor identification:** Must identify agents before showing relationships
- **Live viewer count is independent:** Separate presence system, no dependency on feed features

## MVP Definition

### Launch With (v1)

Minimum viable product - what's needed to validate the concept and be useful.

- [x] **Real-time event stream** - Core value proposition; if this doesn't work, nothing else matters
- [x] **Connection status indicator** - Users must trust the data is live
- [x] **Chronological ordering with timestamps** - Basic usability requirement
- [x] **Event type indicators** - Visual differentiation between file edits, tool use, commits, etc.
- [x] **Mobile-responsive layout** - Can't exclude half of potential traffic
- [x] **Empty state** - Graceful handling when no active session
- [x] **Session boundaries** - Group events by session for narrative structure
- [x] **Dark mode** - Match developer aesthetic expectations; nearly table stakes for this audience

### Add After Validation (v1.x)

Features to add once core is working and people are actually using it.

- [ ] **Progressive disclosure / Expandable events** - Add when users complain about information density
- [ ] **Code diff previews** - Add when users want to see actual code changes
- [ ] **Project filtering** - Add when there are multiple projects to filter
- [ ] **Session stats** - Add when session boundaries are stable and users want summary metrics
- [ ] **Live viewer count** - Add when there's consistent traffic to show social proof
- [ ] **Agent hierarchy visualization** - Add when multi-agent sessions become common

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Time-lapse replay** - Complex feature; defer until core feed is polished and users request it
- [ ] **Connection recovery with event catchup** - Nice to have; users can refresh initially
- [ ] **RSS feed** - Power user feature; only if explicitly requested
- [ ] **Smooth animations** - Polish; add after functionality is complete

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Real-time event stream | HIGH | LOW (Convex native) | P1 |
| Connection status | HIGH | LOW | P1 |
| Timestamps | HIGH | LOW | P1 |
| Event type indicators | HIGH | LOW | P1 |
| Mobile responsive | HIGH | MEDIUM | P1 |
| Session boundaries | HIGH | MEDIUM | P1 |
| Empty state | MEDIUM | LOW | P1 |
| Dark mode | MEDIUM | LOW | P1 |
| Progressive disclosure | HIGH | MEDIUM | P2 |
| Code diff previews | HIGH | HIGH | P2 |
| Project filtering | MEDIUM | LOW | P2 |
| Session stats | MEDIUM | MEDIUM | P2 |
| Live viewer count | MEDIUM | MEDIUM | P2 |
| Agent hierarchy | MEDIUM | MEDIUM | P2 |
| Time-lapse replay | HIGH | HIGH | P3 |
| Smooth animations | LOW | MEDIUM | P3 |
| Connection recovery | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | GitHub Activity | Twitch/Live Coding | Session Replay Tools | Our Approach |
|---------|-----------------|-------------------|---------------------|--------------|
| Real-time updates | Delayed (not truly real-time) | Real-time | Post-hoc recording | **Truly real-time via Convex subscriptions** |
| Viewer count | Stars/watchers (static) | Live viewer count | N/A (internal tools) | **Optional live presence indicator** |
| Code visibility | Commits/diffs | Screen share (low res text) | Full replay | **Structured events with expandable diffs** |
| Session structure | Per-commit | Continuous stream | Session-based | **Clear session boundaries with stats** |
| Interactivity | Comments/reactions | Chat, bits, subs | Bug reports | **Read-only (deliberate constraint)** |
| Agent visibility | N/A | Streamer personality | N/A | **Agent hierarchy (unique differentiator)** |
| Time context | Contribution calendar | Live only | Full replay | **Live + completed session replay** |

### Key Competitive Insights

1. **No direct competitor** does exactly this - showing Claude Code sessions in real-time on a portfolio site
2. **GitHub** has delayed activity, not real-time - opportunity to be faster
3. **Twitch coding streams** have chat/social features we deliberately avoid
4. **Session replay tools** (PostHog, LogRocket) are internal/debugging focused, not public showcase
5. **Agent hierarchy visualization** is completely unique to Claude Code's architecture

## Sources

### Activity Feed Design
- [GetStream - Activity Feed Design Ultimate Guide](https://getstream.io/blog/activity-feed-design/)
- [UI Patterns - Activity Stream](https://ui-patterns.com/patterns/ActivityStream)
- [Aubergine - Guide to Designing Chronological Activity Feeds](https://www.aubergine.co/insights/a-guide-to-designing-chronological-activity-feeds)
- [SuprSend - What is an Activity Feed](https://www.suprsend.com/post/activity-feed)

### Developer Portfolios
- [Templyo - Web Developer Portfolio Examples 2026](https://templyo.io/blog/17-best-web-developer-portfolio-examples-for-2024)
- [WeAreDevelopers - Web Developer Portfolio Examples](https://www.wearedevelopers.com/en/magazine/161/web-developer-portfolio-examples)
- [Dev.to - The Anthology of a Creative Developer: A 2026 Portfolio](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)

### Build in Public
- [Medium - The Build in Public Boom: Why Transparency is the New Influence](https://medium.com/mynextdeveloper/the-build-in-public-boom-why-transparency-is-the-new-influence-8ac4c66fd1fa)
- [Dev.to - The Truth About Building in Public](https://dev.to/debuggingwithsim/the-truth-about-building-in-public-what-no-one-tells-you-2o2p)

### Real-time Technology
- [Ably - WebSockets vs SSE 2024](https://ably.com/blog/websockets-vs-sse)
- [Nimbleway - Server-Sent Events vs WebSockets 2026](https://www.nimbleway.com/blog/server-sent-events-vs-websockets-what-is-the-difference-2026-guide)
- [APIdog - WebSocket Reconnect Strategies](https://apidog.com/blog/websocket-reconnect/)

### Viewer Presence
- [Streamlabs - Real-time Viewer Count Widget](https://streamlabs.com/stream-widgets/viewer-counter)
- [SproutVideo - Live Stream Metrics](https://sproutvideo.com/blog/the-live-stream-metrics-that-matter.html)

### Gamification & Engagement
- [Trophy - GitHub Gamification Case Study 2025](https://trophy.so/blog/github-gamification-case-study)
- [Carl Sverre - Gamifying GitHub Contributions](https://carlsverre.com/writing/gamifying-github/)

### Progressive Disclosure
- [NN/g - Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Interaction Design Foundation - What is Progressive Disclosure](https://www.interaction-design.org/literature/topics/progressive-disclosure)

### Code Diff UX
- [diff2html](https://diff2html.xyz/)
- [VS Code Issue #34623 - Inline and side-by-side diff views](https://github.com/Microsoft/vscode/issues/34623)

---
*Feature research for: agentstype.dev live Claude Code session feed*
*Researched: 2026-01-31*
