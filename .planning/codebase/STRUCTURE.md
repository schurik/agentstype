# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
agentstype/
├── app/                           # Next.js App Router - Frontend
│   ├── layout.tsx                 # Root layout with ConvexClientProvider
│   ├── page.tsx                   # Home page component
│   ├── ConvexClientProvider.tsx   # Client-side Convex provider
│   ├── globals.css                # Global styles with Tailwind CSS v4
│   └── favicon.ico                # App icon
├── convex/                        # Convex Backend - Functions & Schema
│   ├── _generated/                # Auto-generated Convex types (do not edit)
│   ├── schema.ts                  # Database schema definitions (not yet created)
│   ├── tsconfig.json              # TypeScript config for Convex
│   └── README.md                  # Convex setup documentation
├── public/                        # Static assets
├── node_modules/                  # Dependencies (git ignored)
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── eslint.config.mjs              # ESLint configuration
├── postcss.config.mjs             # PostCSS configuration for Tailwind
├── bun.lock                       # Bun lock file
├── CLAUDE.md                      # Claude Code instructions
└── .planning/                     # GSD planning documents
    └── codebase/                  # Generated analysis documents
```

## Directory Purposes

**app/:**
- Purpose: React components and Next.js App Router pages
- Contains: Pages, layouts, client components, styles
- Key files: `layout.tsx` (root), `page.tsx` (home), `ConvexClientProvider.tsx` (context)

**convex/:**
- Purpose: Backend functions and database schema for Convex
- Contains: Query/mutation function definitions, schema definitions, type definitions
- Key files: `schema.ts` (database definition, not yet created), generated types in `_generated/`

**convex/_generated/:**
- Purpose: Auto-generated Convex type definitions and API client
- Contains: `api.d.ts`, `dataModel.d.ts`, `server.d.ts`
- Generated: Yes (do not manually edit)
- Committed: Yes (required for TypeScript support)

**public/:**
- Purpose: Static assets served at app root
- Contains: Images, SVGs, icons, other static files
- Key files: `next.svg`, `vercel.svg` (from template)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML structure and provider wrapping
- `app/page.tsx`: Home page content
- `app/ConvexClientProvider.tsx`: Convex client initialization (client-side)

**Configuration:**
- `tsconfig.json`: TypeScript configuration with path aliases (`@/*`)
- `next.config.ts`: Next.js configuration (currently minimal)
- `eslint.config.mjs`: ESLint rules for linting
- `postcss.config.mjs`: PostCSS setup for Tailwind CSS v4
- `package.json`: Dependencies and build scripts

**Core Logic:**
- `convex/`: All backend functions and schema (not yet implemented)
- `app/`: All frontend components and pages

**Styling:**
- `app/globals.css`: Global styles with Tailwind CSS v4 import

**Testing:**
- Not yet implemented; ready for addition

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `ConvexClientProvider.tsx`)
- Pages: lowercase with extension (e.g., `page.tsx`)
- Styles: lowercase with `.css` extension (e.g., `globals.css`)
- Convex functions: lowercase with `.ts` extension (e.g., `tasks.ts`)

**Directories:**
- App Router segments: lowercase, kebab-case for multi-word (e.g., `app/dashboard`, `app/user-profile`)
- Feature directories: lowercase, descriptive names
- Convex functions: flat structure in `convex/` root (no subdirectories by convention)

**Exports:**
- React components: `export default` or named `export`
- Convex functions: named `export const functionName = query/mutation({...})`
- Utilities: named `export` with descriptive names

## Where to Add New Code

**New Feature:**
- Primary code: `app/[feature-name]/` directory with page/component files
- Backend support: `convex/[feature-name].ts` with functions
- Tests: Co-located with component or in dedicated test file (when testing framework added)

**New Component/Module:**
- Implementation: `app/` if UI component, `convex/` if backend function
- Client components: Use `"use client"` directive if required
- Shared utilities: Create `app/lib/` or `convex/lib/` as needed (directory not yet present)

**New Convex Function:**
- Location: `convex/[domain].ts` (e.g., `convex/tasks.ts`, `convex/users.ts`)
- Pattern: Export named `query` or `mutation` with argument validators and handler
- Registration: Auto-discovered; no manual registration needed

**Utilities & Helpers:**
- Shared frontend utilities: `app/lib/` (directory not yet created)
- Shared backend utilities: `convex/lib/` (directory not yet created)

**Styles:**
- Component styles: Use Tailwind CSS classes inline or in CSS modules in component directory
- Global styles: `app/globals.css`

## Special Directories

**.planning/codebase/:**
- Purpose: GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (created by analysis tools)
- Committed: Yes

**convex/_generated/:**
- Purpose: Auto-generated Convex type definitions from function definitions
- Generated: Yes (by Convex CLI during dev/deployment)
- Committed: Yes (safe to commit)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (git ignored)

**node_modules/:**
- Purpose: NPM/Bun dependencies
- Generated: Yes
- Committed: No (git ignored)

---

*Structure analysis: 2026-01-30*
