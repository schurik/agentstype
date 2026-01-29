# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start development server (http://localhost:3000)
bunx convex dev  # Start Convex dev server (run alongside bun dev)
bun run build    # Production build
bun run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 project using the App Router pattern with React 19 and Convex backend.

- **app/**: App Router directory containing routes and layouts
  - `layout.tsx`: Root layout with Geist font configuration and ConvexClientProvider
  - `page.tsx`: Home page component
  - `ConvexClientProvider.tsx`: Client-side Convex provider wrapper
  - `globals.css`: Global styles with Tailwind CSS v4
- **convex/**: Convex backend functions and schema
  - `schema.ts`: Database schema definitions
- **public/**: Static assets

## Key Technologies

- **Next.js 16** with App Router
- **React 19**
- **Convex** for backend (database, functions, real-time sync)
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **TypeScript** with strict mode
- **Bun** as package manager (see `bun.lock`)

## Path Aliases

`@/*` maps to the project root (configured in `tsconfig.json`).
