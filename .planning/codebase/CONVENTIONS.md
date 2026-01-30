# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- PascalCase for components: `ConvexClientProvider.tsx`, `RootLayout.tsx`
- camelCase for utility and configuration files: `layout.tsx`, `page.tsx`, `globals.css`
- Directories use lowercase with hyphens where appropriate (Next.js App Router pattern)

**Functions:**
- camelCase for function names (arrow functions and declarations): `export default function Home()`, `export function ConvexClientProvider()`
- Named exports use PascalCase for React components: `export function ConvexClientProvider`
- Default exports for page components: `export default function RootLayout`

**Variables:**
- camelCase for constants and variables: `geistSans`, `geistMono`, `convex`, `children`
- SCREAMING_SNAKE_CASE is not used; configuration values use camelCase
- Single letter variables acceptable in component props destructuring

**Types:**
- TypeScript `type` keyword used for inline prop types
- Imported types use proper capitalization: `Metadata`, `ReactNode`
- Readonly modifier used for object type definitions: `Readonly<{ children: React.ReactNode }>`

## Code Style

**Formatting:**
- No specific formatter like Prettier is configured; ESLint handles linting
- Two-space indentation is standard in Next.js generated code
- Quotes: Double quotes for strings in JSX attributes
- Semicolons: Present at end of statements

**Linting:**
- ESLint 9 with flat config format (`eslint.config.mjs`)
- Configuration: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Core Web Vitals rules enforced for performance best practices
- TypeScript support enabled via `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Import Organization

**Order:**
1. External library imports (Next.js, React, third-party packages)
2. Internal imports from project structure (components, providers, styles)
3. Relative imports for local files

**Examples from codebase:**
```typescript
// External imports first
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Then internal/local imports
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
```

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json` under `compilerOptions.paths`)
- Used for cleaner imports across the project

## Error Handling

**Patterns:**
- Non-null assertion operator (`!`) used when type safety is guaranteed: `process.env.NEXT_PUBLIC_CONVEX_URL!`
- No try-catch blocks visible in current codebase; error boundaries likely handled at framework level
- React Error Boundaries expected to be used for error handling in components

## Logging

**Framework:** Native browser `console` object; no logging library configured

**Patterns:**
- `console.log()` used in examples (from Convex README)
- Limited logging in production code; development-focused logging in examples

## Comments

**When to Comment:**
- Minimal inline comments in source code
- File structure and purpose communicated through naming and organization
- JSDoc comments not observed in current codebase

**JSDoc/TSDoc:**
- Not actively used in current codebase
- Type annotations preferred over JSDoc-style documentation

## Function Design

**Size:** Functions are kept concise, typically 10-20 lines or less

**Parameters:**
- Destructuring used for component props: `({ children }: Readonly<{ children: React.ReactNode }>)`
- Arrow functions with implicit returns preferred for simple operations
- Named function declarations used for exported components

**Return Values:**
- React components return JSX elements
- Consistent return of rendered component trees
- No empty returns or null returns in current code

## Module Design

**Exports:**
- Named exports for utility components: `export function ConvexClientProvider`
- Default exports for page components (Next.js App Router convention): `export default function RootLayout`
- Mix of named and default exports used appropriately per context

**Barrel Files:**
- Not observed in current codebase
- Future implementations should follow Next.js conventions

## TypeScript Configuration

**Strict Mode:** Enabled (`"strict": true` in `tsconfig.json`)

**Key Settings:**
- `target: "ES2017"` for broad compatibility
- `module: "esnext"` for modern module resolution
- `jsx: "react-jsx"` for automatic JSX handling (React 17+)
- `isolatedModules: true` enforces each file can be safely transpiled in isolation
- `resolveJsonModule: true` allows importing JSON files
- `moduleResolution: "bundler"` uses bundler-style resolution

---

*Convention analysis: 2026-01-30*
