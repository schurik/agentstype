# Phase 3: Layered Display & Projects - Research

**Researched:** 2026-02-03
**Domain:** React expand/collapse UI, URL state sync, syntax highlighting, collapsible sidebar
**Confidence:** HIGH

## Summary

This phase implements progressive disclosure (expand/collapse event cards), project filtering with URL sync, and a "Currently" sticky indicator. The research identified established patterns and libraries for each requirement, with strong ecosystem support.

The standard approach for URL state management in Next.js App Router is **nuqs** - a type-safe library that wraps `useSearchParams` with better DX and handles the Suspense boundary complexity. For expand/collapse animations, **react-collapsed** provides a hook-based solution that handles the "height: auto" animation challenge without a heavy animation framework. Syntax highlighting should use **Shiki** for server-side rendering (zero client JS) or **prism-react-renderer** for client-side with theme control.

The collapsible sidebar pattern follows established VS Code-style UX: icons-only when collapsed, with state persisted to localStorage using a hydration-safe pattern.

**Primary recommendation:** Use nuqs for URL state, react-collapsed for expand/collapse animations, Shiki for syntax highlighting, and CSS grid-template-rows for lightweight collapse animations where react-collapsed is overkill.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| nuqs | ^2.x | URL query state sync | Type-safe, handles Suspense, works with App Router. Powers shareable URLs. |
| react-collapsed | ^4.x | Expand/collapse animation | Hook-based, animates height:auto, accessible out of the box |
| shiki | ^3.x | Syntax highlighting | VS Code-quality highlighting, zero client JS, server-side rendering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| prism-react-renderer | ^2.x | Client-side syntax highlighting | When you need client-side theme switching or lighter bundle |
| @react-hookz/web | ^24.x | useLocalStorageValue | Hydration-safe localStorage hook (optional - can hand-roll) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs | Native useSearchParams + useRouter | More boilerplate, manual Suspense handling, no type safety |
| react-collapsed | framer-motion | Heavier bundle, more powerful but overkill for collapse |
| react-collapsed | CSS grid 0fr/1fr | Pure CSS, great for simple cases, less control over callbacks |
| shiki | highlight.js | Smaller bundle but lower quality highlighting |

**Installation:**
```bash
bun add nuqs react-collapsed shiki
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── live/
│   └── page.tsx           # Uses nuqs for ?project= param
├── components/
│   ├── feed/
│   │   ├── EventCard.tsx       # Expand/collapse per card
│   │   ├── ExpandedContent.tsx # Tailored layouts per event type
│   │   └── CurrentlyIndicator.tsx  # Sticky "Currently" at top
│   ├── sidebar/
│   │   ├── ProjectSidebar.tsx  # Collapsible sidebar
│   │   └── ProjectItem.tsx     # Individual project with activity dot
│   └── ui/
│       └── CodeBlock.tsx       # Shiki-powered syntax highlighting
├── hooks/
│   ├── useExpandedEvents.ts    # Track which event IDs are expanded
│   ├── useKeyboardNavigation.ts # Arrow key navigation
│   └── useSidebarCollapse.ts   # Sidebar state + localStorage
└── lib/
    └── highlighter.ts          # Shiki singleton instance
```

### Pattern 1: URL State with nuqs
**What:** Type-safe URL query parameter state that syncs with React state
**When to use:** Project filter (?project=name), any shareable URL state
**Example:**
```typescript
// Source: https://github.com/47ng/nuqs
'use client'
import { useQueryState, parseAsString } from 'nuqs'

export function ProjectFilter() {
  const [project, setProject] = useQueryState(
    'project',
    parseAsString.withDefault('')
  )

  // project is typed as string, never null with default
  // setProject(null) removes from URL
  return <Sidebar selected={project} onSelect={setProject} />
}
```

### Pattern 2: Expand/Collapse with react-collapsed
**What:** Hook-based collapse animation handling height:auto
**When to use:** Individual event card expand/collapse
**Example:**
```typescript
// Source: https://github.com/roginfarrer/collapsed
import { useCollapse } from 'react-collapsed'

function EventCard({ event }: { event: Event }) {
  const [isExpanded, setExpanded] = useState(false)
  const { getCollapseProps, getToggleProps } = useCollapse({
    isExpanded,
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })

  return (
    <div
      {...getToggleProps({ onClick: () => setExpanded(prev => !prev) })}
      className="cursor-pointer"
    >
      <SummaryView event={event} isExpanded={isExpanded} />
      <div {...getCollapseProps()}>
        <div className="pt-3"> {/* Padding on inner element, not collapse */}
          <ExpandedContent event={event} />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 3: Keyboard Navigation with Roving TabIndex
**What:** Arrow key navigation through event list with Enter to toggle
**When to use:** Event feed accessibility
**Example:**
```typescript
// Source: MDN ARIA keyboard patterns
function useKeyboardNavigation(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, itemCount - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        // Toggle expand on focused item
        break
    }
  }

  return { focusedIndex, handleKeyDown }
}
```

### Pattern 4: Hydration-Safe localStorage
**What:** Persist UI state without hydration mismatch
**When to use:** Sidebar collapse preference
**Example:**
```typescript
// Source: https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed))
    }
  }, [isCollapsed, hasMounted])

  return { isCollapsed, setIsCollapsed, hasMounted }
}
```

### Pattern 5: Pure CSS Grid Collapse (Lightweight Alternative)
**What:** CSS-only height animation using grid-template-rows
**When to use:** Simple expand/collapse without callbacks, lighter than react-collapsed
**Example:**
```typescript
// Source: https://css-tricks.com/css-grid-can-do-auto-height-transitions/
function CollapsibleSection({ isOpen, children }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-200"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Padding on collapse container:** Apply padding to inner element, not the element with getCollapseProps(). Padding expands even at height:0.
- **max-height animation:** Don't use max-height for collapse animation. It doesn't respect timing functions and causes janky animations.
- **useSearchParams without Suspense:** Always wrap useSearchParams in Suspense boundary or use nuqs which handles this.
- **localStorage in initial render:** Never read localStorage during SSR/initial render. Use useEffect or hydration-safe pattern.
- **Accordion behavior when multi-expand needed:** Decision says "multiple events can be expanded independently" - don't use accordion pattern.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL query state sync | Custom useSearchParams wrapper | nuqs | Handles Suspense, type safety, shallow updates, history modes |
| Height:auto animation | CSS max-height hack | react-collapsed or CSS grid 0fr/1fr | CSS max-height is janky, doesn't respect timing |
| Syntax highlighting | Custom regex tokenizer | Shiki or prism-react-renderer | TextMate grammars are complex, edge cases everywhere |
| Keyboard navigation | Custom keydown handler | Roving tabindex pattern | Accessibility requirements (tabindex, aria-*) are subtle |
| localStorage with SSR | Direct localStorage access | Hydration-safe pattern with useEffect | Hydration mismatch errors |

**Key insight:** The "height: auto" animation problem has been solved many ways but react-collapsed and CSS grid 0fr/1fr are the modern solutions. Don't use max-height workarounds.

## Common Pitfalls

### Pitfall 1: Suspense Boundary for useSearchParams
**What goes wrong:** Build fails with "Missing Suspense boundary with useSearchParams" error
**Why it happens:** useSearchParams opts page into client-side rendering; Next.js requires Suspense for static optimization
**How to avoid:** Use nuqs (handles internally) or wrap component using useSearchParams in Suspense
**Warning signs:** Works in dev, fails in production build

### Pitfall 2: Padding on Collapse Container
**What goes wrong:** Animation "jumps" at end of collapse
**Why it happens:** Padding adds height even when container height is 0
**How to avoid:** Apply padding to nested inner element, not the collapse container
**Warning signs:** Content snaps instead of smooth animation

### Pitfall 3: overflow:hidden on Sticky Parent
**What goes wrong:** Sticky "Currently" indicator doesn't stick
**Why it happens:** overflow:hidden/auto/scroll creates new scroll context, sticky checks against that instead of viewport
**How to avoid:** Ensure no ancestor of sticky element has overflow set (except the scroll container itself)
**Warning signs:** Sticky element scrolls away instead of sticking

### Pitfall 4: localStorage Hydration Mismatch
**What goes wrong:** "Text content does not match server-rendered HTML" error
**Why it happens:** Server renders default state, client reads different state from localStorage
**How to avoid:** Initialize with default, update in useEffect after mount, use hasMounted guard
**Warning signs:** Console hydration error, flash of incorrect state

### Pitfall 5: Flex Stretch Breaking Sticky
**What goes wrong:** Sticky header doesn't stick in flex container
**Why it happens:** Flex children stretch by default, sticky needs space to scroll within
**How to avoid:** Add `align-self: flex-start` or `align-items: start` to prevent stretch
**Warning signs:** Sticky element same height as container

### Pitfall 6: Zero-Height Accessibility
**What goes wrong:** Screen readers can still access collapsed content
**Why it happens:** height:0 + overflow:hidden is visual only, not semantic
**How to avoid:** Add aria-hidden="true" to collapsed content, use aria-expanded on trigger
**Warning signs:** NVDA/VoiceOver reads hidden content

## Code Examples

Verified patterns from official sources:

### nuqs Setup (App Router)
```typescript
// Source: https://github.com/47ng/nuqs
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

### nuqs Project Filter
```typescript
// Source: https://github.com/47ng/nuqs
'use client'
import { useQueryState, parseAsString } from 'nuqs'

export function useProjectFilter() {
  return useQueryState('project', parseAsString)
}

// In component:
const [project, setProject] = useProjectFilter()
// project is string | null
// setProject('my-project') sets ?project=my-project
// setProject(null) removes param
```

### Shiki Server-Side Highlighting
```typescript
// Source: https://shiki.style/packages/next
import { codeToHtml } from 'shiki'

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-dark'
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

### react-collapsed with Accessibility
```typescript
// Source: https://github.com/roginfarrer/collapsed
import { useCollapse } from 'react-collapsed'

function Expandable({ id, title, children }) {
  const [isExpanded, setExpanded] = useState(false)
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded })

  return (
    <div>
      <button
        {...getToggleProps({
          onClick: () => setExpanded(prev => !prev),
          'aria-expanded': isExpanded,
          'aria-controls': `content-${id}`,
        })}
      >
        {title}
        <ChevronIcon className={isExpanded ? 'rotate-180' : ''} />
      </button>
      <div
        {...getCollapseProps()}
        id={`content-${id}`}
        aria-hidden={!isExpanded}
      >
        <div className="pt-2">{children}</div>
      </div>
    </div>
  )
}
```

### Sticky Header Pattern
```typescript
// Source: https://css-tricks.com/position-sticky-and-table-headers/
function CurrentlyIndicator({ event }: { event: Event | null }) {
  if (!event) return null

  return (
    <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="animate-pulse w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-zinc-300">
          {getSummary(event)}
        </span>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| max-height animation | CSS grid 0fr/1fr or react-collapsed | 2023+ | Smooth animations without hardcoded heights |
| dangerouslySetInnerHTML highlighting | Shiki with HAST | 2024+ | Type-safe, no XSS risk, better React integration |
| Next.js pages router query state | nuqs with App Router adapters | 2024+ | Type-safe, handles Suspense complexity |
| Manual Suspense boundaries | nuqs handles internally | 2024+ | Less boilerplate for URL state |

**Deprecated/outdated:**
- **react-syntax-highlighter:** Still works but poorly maintained, issues with Next.js static generation
- **max-height collapse animation:** Janky, doesn't respect timing functions
- **useSearchParams without library:** Too much boilerplate for production use

## Open Questions

Things that couldn't be fully resolved:

1. **React 19 compatibility for react-collapsed**
   - What we know: Library is actively maintained, no reported React 19 issues
   - What's unclear: No explicit React 19 compatibility statement in docs
   - Recommendation: Test during implementation, fallback to CSS grid if issues

2. **Shiki bundle size for client-side use**
   - What we know: Zero JS when server-rendered, but client bundle includes grammars
   - What's unclear: Exact bundle impact for client-side highlighting
   - Recommendation: Use server components for code blocks, fallback to prism-react-renderer for dynamic client content

## Sources

### Primary (HIGH confidence)
- nuqs GitHub - https://github.com/47ng/nuqs - Setup, API, parsers
- react-collapsed GitHub - https://github.com/roginfarrer/collapsed - Hook API, options
- Shiki official - https://shiki.style/ - Features, integration
- Next.js useSearchParams - https://nextjs.org/docs/app/api-reference/functions/use-search-params - Suspense requirements
- CSS-Tricks CSS Grid height - https://css-tricks.com/css-grid-can-do-auto-height-transitions/ - 0fr/1fr pattern
- MDN keyboard widgets - https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets - ARIA patterns

### Secondary (MEDIUM confidence)
- Josh Comeau localStorage pattern - https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/ - Hydration-safe pattern
- Frontend Masters sticky position - https://frontendmasters.com/blog/the-weird-parts-of-position-sticky/ - Gotchas
- LogRocket syntax highlighting - https://blog.logrocket.com/guide-syntax-highlighting-react/ - Library comparison

### Tertiary (LOW confidence)
- npm-compare syntax highlighters - General ecosystem comparison, not implementation details

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - nuqs, react-collapsed, shiki all have official docs and active maintenance
- Architecture: HIGH - Patterns verified against official examples
- Pitfalls: HIGH - Multiple sources confirm each pitfall (sticky overflow, padding on collapse, etc.)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable domain)
