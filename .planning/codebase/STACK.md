# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- TypeScript 5.x - All source code, strict mode enabled

**Secondary:**
- JavaScript - Node.js tooling and configuration files

## Runtime

**Environment:**
- Node.js (managed by Bun)

**Package Manager:**
- Bun - Primary package manager and runtime
- Lockfile: `bun.lock` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router pattern
- React 19.2.3 - UI library and component framework
- React DOM 19.2.3 - DOM rendering for React

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework via PostCSS plugin
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind

**Backend/BaaS:**
- Convex 1.31.6 - Real-time database, API backend, and sync solution

**Development:**
- ESLint 9.x - JavaScript/TypeScript linting
- eslint-config-next 16.1.6 - Next.js-specific ESLint configuration

## Key Dependencies

**Critical:**
- convex 1.31.6 - Database, queries, mutations, and real-time sync. Provides `ConvexReactClient` for client-side integration and `@generated/server` utilities for backend functions.
- next 16.1.6 - Full-stack web framework. Provides routing, SSR, static generation, and image optimization.
- react 19.2.3 - Core UI library with hooks and server component support

**Infrastructure:**
- @types/node 20.x - TypeScript definitions for Node.js
- @types/react 19.x - TypeScript definitions for React
- @types/react-dom 19.x - TypeScript definitions for React DOM

## Configuration

**Environment:**
- `.env.local` - Contains `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` for Convex cloud instance
- Convex deployment: `dev:affable-canary-809` (team: alexander-buss, project: agentstype)

**Build:**
- `tsconfig.json` - TypeScript compilation with `strict: true`, `noEmit: true`, `isolatedModules: true`. Path aliases: `@/*` maps to project root
- `next.config.ts` - Next.js configuration (currently minimal)
- `postcss.config.mjs` - PostCSS config for Tailwind CSS v4
- `eslint.config.mjs` - ESLint configuration with Next.js core-web-vitals and TypeScript support

## Platform Requirements

**Development:**
- Bun runtime
- Node.js 18+ (implicit via Bun)
- TypeScript 5.x

**Production:**
- Next.js deployment target (Vercel, self-hosted Node.js, or edge runtime compatible)
- Convex cloud backend (no self-hosting required)

## Build & Runtime Commands

```bash
bun dev          # Development server on http://localhost:3000
bunx convex dev  # Convex backend development server
bun run build    # Production build
bun run start    # Start production server
bun run lint     # Run ESLint
```

---

*Stack analysis: 2026-01-30*
