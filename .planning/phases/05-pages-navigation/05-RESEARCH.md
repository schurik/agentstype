# Phase 05: Pages & Navigation - Research

**Researched:** 2026-02-03
**Domain:** Next.js App Router multi-page navigation, responsive layouts, terminal UI styling
**Confidence:** HIGH

## Summary

This phase adds Home and About pages plus site-wide navigation to the existing Live Feed page. The established approach is to use Next.js App Router's layout system for shared navigation, the `<Link>` component with `usePathname()` for active link styling, and Tailwind CSS for responsive design including a mobile bottom navigation bar.

The terminal mockup for the hero section should be built with pure CSS/Tailwind (traffic light buttons, dark background, monospace font) rather than importing a heavy library. Page transitions are experimental in Next.js 16 via View Transitions API, but for this phase, simple CSS transitions using the existing `tw-animate-css` library are sufficient and production-ready.

**Primary recommendation:** Use Next.js layouts for shared navigation, `lucide-react` for icons, Tailwind responsive utilities for mobile/desktop breakpoints, and hand-craft the terminal mockup with Tailwind CSS.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, Link, layouts | Framework already in use |
| React | 19.2.3 | Component architecture | Framework already in use |
| Tailwind CSS | 4.x | Responsive styling | Already configured |
| tw-animate-css | 1.4.0 | Enter/exit animations | Already installed, tree-shakable |

### Add for This Phase
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lucide-react | ^0.562.0 | Navigation icons (Home, Radio, User) | Tree-shakable, Tailwind-friendly, 1.3k+ icons |

### Not Needed
| Library | Reason to Skip |
|---------|----------------|
| Framer Motion | Overkill for simple transitions; exit animations require complex setup with App Router |
| Magic UI Terminal | Heavy dependency for what can be done with 20 lines of Tailwind |
| react-terminal-ui | Interactive terminal not needed; this is display-only mockup |
| HeroUI/NextUI | Full component library not needed; Tailwind is sufficient |

**Installation:**
```bash
bun add lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx              # Root layout - add Navigation component
├── page.tsx                # Home page (replace redirect)
├── about/
│   └── page.tsx            # About page
├── live/
│   ├── page.tsx            # Live feed page (exists)
│   └── LiveFeedContent.tsx # (exists)
├── components/
│   ├── ui/
│   │   ├── Header.tsx      # Existing - repurpose or replace
│   │   ├── Navigation.tsx  # NEW: Desktop header + mobile bottom nav
│   │   └── TerminalMockup.tsx # NEW: Hero visual component
│   └── home/
│       ├── Hero.tsx        # NEW: Hero section
│       └── FeatureCards.tsx # NEW: 3 feature highlight cards
```

### Pattern 1: Shared Navigation in Root Layout

**What:** Place navigation component in `app/layout.tsx` so it persists across all pages without re-rendering.

**When to use:** Always for site-wide navigation elements.

**Example:**
```tsx
// app/layout.tsx
import { Navigation } from "@/app/components/ui/Navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>
          <NuqsAdapter>
            <Navigation />
            {children}
          </NuqsAdapter>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: Active Link Styling with usePathname

**What:** Use `usePathname()` to detect current route and apply active styles.

**When to use:** For navigation links that need visual indication of current page.

**Example:**
```tsx
// app/components/ui/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/about", label: "About", icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  // Exact match for home, startsWith for others
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop: sticky header */}
      <header className="sticky top-0 z-50 hidden md:flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
        <Link href="/" className="text-lg font-bold text-zinc-100">
          agentstype.dev
        </Link>
        <nav className="flex gap-6">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                isActive(href) ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile: bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 items-center justify-around border-t border-zinc-800 bg-zinc-950 safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 ${
              isActive(href) ? "text-zinc-100" : "text-zinc-500"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
```

### Pattern 3: Terminal Mockup with Pure Tailwind

**What:** Create macOS-style terminal window with traffic lights using only Tailwind classes.

**When to use:** For display-only terminal visuals in hero sections or documentation.

**Example:**
```tsx
// app/components/ui/TerminalMockup.tsx
interface TerminalMockupProps {
  children: React.ReactNode;
  title?: string;
}

export function TerminalMockup({ children, title = "Terminal" }: TerminalMockupProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl">
      {/* Title bar with traffic lights */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-zinc-700">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="flex-1 text-center text-xs text-zinc-500">{title}</span>
      </div>
      {/* Terminal content */}
      <div className="p-4 font-mono text-sm text-zinc-300">
        {children}
      </div>
    </div>
  );
}
```

### Pattern 4: Responsive Grid for Feature Cards

**What:** Use Tailwind's responsive grid utilities for adaptive layouts.

**When to use:** For feature sections, card grids, any multi-column content.

**Example:**
```tsx
// Mobile: 1 column, Tablet+: 3 columns
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {features.map((feature) => (
    <div key={feature.title} className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/50">
      <feature.icon className="h-8 w-8 text-emerald-500 mb-4" />
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feature.title}</h3>
      <p className="text-sm text-zinc-400">{feature.description}</p>
    </div>
  ))}
</div>
```

### Pattern 5: Mobile-Safe Bottom Padding

**What:** Add padding to main content so mobile bottom nav doesn't obscure content.

**When to use:** Any page with scrollable content when mobile bottom nav is present.

**Example:**
```tsx
// In page component or layout
<main className="pb-20 md:pb-0">
  {/* Content */}
</main>
```

### Anti-Patterns to Avoid
- **Hamburger menu on mobile:** User decision explicitly chose bottom nav for app-like UX
- **Complex page transitions:** View Transitions API is experimental; keep it simple
- **Using Route Handlers for data:** Server Components can fetch directly
- **Importing full icon libraries:** Only import specific icons from lucide-react
- **Nesting layouts deeply:** This app has simple hierarchy; avoid over-nesting

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route-aware active links | Custom route matching logic | `usePathname()` from next/navigation | Handles all edge cases, works with App Router |
| Icon rendering | Custom SVG components | lucide-react | Tree-shakable, accessible, consistent |
| Enter/exit animations | CSS keyframes from scratch | tw-animate-css (already installed) | Production-tested, integrates with Tailwind |
| Responsive breakpoints | Custom media queries | Tailwind responsive prefixes (md:, lg:) | Consistent with existing styles |
| Client-side navigation | Custom router logic | Next.js `<Link>` component | Automatic prefetching, instant navigation |

**Key insight:** The project already has the animation and styling tools needed. The main additions are structural (pages, layout changes) and a few small UI components (Navigation, TerminalMockup).

## Common Pitfalls

### Pitfall 1: Forgetting "use client" for Navigation
**What goes wrong:** Build error or hydration mismatch when using `usePathname()` in a Server Component.
**Why it happens:** `usePathname()` is a client-side hook; Server Components can't use hooks.
**How to avoid:** Always add `"use client"` directive to components using navigation hooks.
**Warning signs:** Error message mentioning "usePathname" or "client-only hook".

### Pitfall 2: Mobile Bottom Nav Overlapping Content
**What goes wrong:** Last items on page hidden behind fixed bottom navigation.
**Why it happens:** Fixed positioning removes element from document flow.
**How to avoid:** Add `pb-20 md:pb-0` to main content containers.
**Warning signs:** Users reporting they can't see or tap bottom content on mobile.

### Pitfall 3: Active Link Logic for Nested Routes
**What goes wrong:** "/live" stays highlighted when viewing "/live?project=foo" (correct), but also when on "/live-alternative" (wrong).
**Why it happens:** Using `startsWith()` without considering route boundaries.
**How to avoid:** For home, use exact match (`pathname === "/"`). For others, use `startsWith(href)` but ensure routes don't share prefixes.
**Warning signs:** Multiple nav items appearing active simultaneously.

### Pitfall 4: Layout Re-renders on Navigation
**What goes wrong:** Navigation component flashes or re-renders when changing pages.
**Why it happens:** Placing navigation inside page components instead of layout.
**How to avoid:** Navigation must be in `app/layout.tsx`, not in individual pages.
**Warning signs:** Visible re-render of nav when clicking links; state loss in nav.

### Pitfall 5: Missing Safe Area for Mobile Notches
**What goes wrong:** Bottom nav obscured by iPhone home indicator or similar.
**Why it happens:** Not accounting for safe area insets.
**How to avoid:** Use `pb-[env(safe-area-inset-bottom)]` or Tailwind's `safe-area-inset-bottom` (may need plugin) on fixed bottom elements.
**Warning signs:** Navigation looks cut off on newer iPhones.

### Pitfall 6: Terminal Mockup Click Not Working
**What goes wrong:** Terminal preview in hero doesn't navigate to /live when clicked.
**Why it happens:** Inner content receives click events, not the wrapper.
**How to avoid:** Wrap entire TerminalMockup in `<Link>` or use `onClick` with `router.push()`.
**Warning signs:** Clicking terminal does nothing; user expects navigation per spec.

## Code Examples

Verified patterns from official sources:

### Next.js Link Component
```tsx
// Source: https://nextjs.org/docs/app/getting-started/layouts-and-pages
import Link from "next/link";

// Basic navigation
<Link href="/about">About</Link>

// Prefetch control (disable for rarely-used links)
<Link href="/terms" prefetch={false}>Terms</Link>
```

### Lucide React Icons
```tsx
// Source: https://lucide.dev/guide/packages/lucide-react
import { Home, Radio, User } from "lucide-react";

// With Tailwind styling
<Home className="h-6 w-6 text-zinc-400" />

// With props
<Radio size={24} color="currentColor" strokeWidth={2} />
```

### tw-animate-css Enter Animation
```tsx
// Source: https://github.com/Wombosvideo/tw-animate-css
// Fade and scale in
<div className="animate-in fade-in zoom-in duration-300">
  Content appears smoothly
</div>

// Slide up from bottom
<div className="animate-in slide-in-from-bottom duration-500">
  Content slides up
</div>
```

### Tailwind Responsive Grid
```tsx
// Source: https://tailwindcss.com/docs/responsive-design
// 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hamburger menu for mobile nav | Bottom tab bar | 2023-2024 | Better thumb reachability, app-like UX |
| Framer Motion for page transitions | View Transitions API (experimental) | Next.js 15.2+ | Native browser support, but still experimental |
| tailwindcss-animate plugin | tw-animate-css CSS-only | Tailwind v4 | Works with new CSS-first architecture |
| Pages Router | App Router | Next.js 13+ | Layouts persist, better streaming |

**Deprecated/outdated:**
- `getStaticProps`/`getServerSideProps`: Replaced by async Server Components
- `next/router`: Replaced by `next/navigation` hooks in App Router
- JavaScript-based Tailwind plugins: Prefer CSS-first approach in Tailwind v4

## Open Questions

Things that couldn't be fully resolved:

1. **Safe Area Inset Handling**
   - What we know: iOS devices need safe area padding for bottom nav
   - What's unclear: Whether Tailwind v4 has built-in `safe-area-inset-bottom` utility or needs custom CSS
   - Recommendation: Start with `pb-[env(safe-area-inset-bottom)]` custom value; add proper utility if issues arise

2. **View Transitions for Subtle Page Fade**
   - What we know: Experimental in Next.js 16, requires config flag
   - What's unclear: Stability for production use
   - Recommendation: Skip View Transitions for now; use simple CSS transitions via tw-animate-css

## Sources

### Primary (HIGH confidence)
- [Next.js Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) - Layout patterns, page creation
- [Next.js Linking and Navigation](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating) - Link component, usePathname
- [Next.js Templates](https://nextjs.org/docs/app/api-reference/file-conventions/template) - Template vs layout differences
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design) - Breakpoint system
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) - Icon usage and props
- [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) - Animation utilities

### Secondary (MEDIUM confidence)
- [Vercel: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Pitfalls verified against official docs
- [Mobile Navigation UX Best Practices](https://www.designstudiouiux.com/blog/mobile-navigation-ux/) - Bottom nav patterns
- [Hero Section Best Practices](https://blog.logrocket.com/ux-design/hero-section-examples-best-practices/) - Split layout guidance
- [Tailwindflex Terminal Mockup](https://tailwindflex.com/@manon-daniel/mac-terminal-mockup) - Tailwind terminal styling

### Tertiary (LOW confidence - not used in recommendations)
- Magic UI Terminal component - Not recommended due to dependency overhead
- Next.js View Transitions experimental - Mentioned but deferred

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against official documentation
- Architecture: HIGH - Patterns from Next.js official docs and Vercel blog
- Pitfalls: MEDIUM - Combination of official warnings and community experience

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable domain)
