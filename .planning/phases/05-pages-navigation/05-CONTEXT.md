# Phase 5: Pages & Navigation - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can navigate between Home, Live Feed, and About pages. Home page serves as entry point with hero, bio intro, and live feed preview. About page provides full bio with social links. All pages mobile responsive. The Live Feed page already exists from previous phases — this phase adds Home, About, and navigation.

</domain>

<decisions>
## Implementation Decisions

### Home page hero
- Split layout: text content on left, terminal mockup with live feed preview on right
- Tagline tone: mix of curious/inviting and technical precision (not just punchy, not just descriptive)
- CTA button: "Enter the Stream" — prominent, links to /live
- Bio intro: short paragraph (2-3 sentences) about who I am and what this is

### Terminal preview (hero visual)
- Shows actual live feed data in terminal mockup styling
- When live: LIVE badge overlaid, latest 2-3 events updating in real-time
- When idle: shows last few events from most recent session, no badge
- Clickable — navigates to /live (same as CTA)

### Feature highlights (below fold)
- 3 cards below hero fold
- Card 1: **Real-time Events** — "Watch file reads, edits, and commands as they happen"
- Card 2: **Session Context** — "See what I'm building, how long it takes, what gets committed"
- Card 3: **Agent Depth** — "Peek under the hood when Claude spawns sub-agents for complex tasks"

### About page
- Photo/avatar prominently displayed with long-form bio (full story: journey, philosophy, what drives you)
- Social links (GitHub, X/Twitter) in sidebar/aside alongside bio
- No dedicated CTA to live feed — just navigation bar

### Navigation
- Full header with presence: logo, site name, nav links (Home, Live, About)
- Sticky on scroll
- Mobile: bottom nav bar with icons for Home, Live, About (not hamburger menu)

### Claude's Discretion
- Feature card styling (icon + title + description density)
- Page transition animations
- Exact header height and spacing
- About page photo size and placement

</decisions>

<specifics>
## Specific Ideas

- Terminal mockup should feel like a real terminal window, not just a styled box
- "Enter the Stream" has immersive connotation — lean into that
- Bottom nav on mobile is modern app-like pattern (vs hamburger which feels dated)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-pages-navigation*
*Context gathered: 2026-02-03*
