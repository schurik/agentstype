# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Next.js 16 App Router with Convex Backend

**Key Characteristics:**
- Full-stack TypeScript application with strict type checking
- Frontend-backend separation via Convex as backend-as-a-service
- Client-side React 19 with server-side rendering capabilities
- Real-time data synchronization through Convex
- Single-page application structure with App Router pattern

## Layers

**Client Layer (Frontend):**
- Purpose: User interface and client-side React components
- Location: `app/` directory
- Contains: React components, pages, layouts, styles
- Depends on: React 19, Next.js 16, Convex React client
- Used by: Browser requests, HTTP clients

**Provider Layer (Context):**
- Purpose: Global state management and Convex initialization
- Location: `app/ConvexClientProvider.tsx`
- Contains: Convex React provider wrapping application
- Depends on: Convex React SDK, React context
- Used by: Root layout, all child components

**Server-Side Functions Layer (Backend):**
- Purpose: Database queries, mutations, business logic
- Location: `convex/` directory
- Contains: Query and mutation function definitions
- Depends on: Convex SDK, database schema
- Used by: Frontend React components via Convex hooks

**Database Layer:**
- Purpose: Data persistence and real-time synchronization
- Location: Managed by Convex service
- Contains: Schema definitions and document storage
- Depends on: Convex backend infrastructure
- Used by: Server-side functions, queries, mutations

## Data Flow

**Query Flow (Read Operations):**

1. React component calls `useQuery(api.functionName, args)` hook
2. Convex client sends query request to backend
3. Backend function executes on Convex server
4. Function reads from Convex database
5. Result returned to client with real-time subscription
6. Component state updated and UI re-renders

**Mutation Flow (Write Operations):**

1. React component calls `useMutation(api.functionName)` hook
2. User triggers mutation function with arguments
3. Convex client sends mutation request to backend
4. Backend function executes transaction on server
5. Function writes to Convex database
6. Optional return value passed back to client
7. Component handles mutation result or error
8. Subscribed queries automatically update

**State Management:**
- Frontend state: React component state and Convex hooks (`useQuery`, `useMutation`)
- Backend state: Convex database documents
- Real-time sync: Convex automatically synchronizes subscriptions
- No Redux, Zustand, or other client state management layer

## Key Abstractions

**ConvexClientProvider:**
- Purpose: Wraps React application with Convex context
- Examples: `app/ConvexClientProvider.tsx`
- Pattern: React Context Provider pattern
- Responsible for initializing Convex client with `NEXT_PUBLIC_CONVEX_URL`

**Convex Functions:**
- Purpose: Encapsulate backend logic with argument validation
- Examples: Query and mutation functions in `convex/` (not yet created)
- Pattern: Function wrapper pattern with validators
- Contains: `args` (argument validators), `handler` (async implementation)

**Server/Client Boundaries:**
- Purpose: Clear separation between server and client code
- Examples: `"use client"` directive in `app/ConvexClientProvider.tsx`
- Pattern: Next.js App Router with explicit client/server directives
- All Convex functions are server-side; client components use hooks

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Initial page load, navigation between routes
- Responsibilities: Initialize HTML structure, apply global fonts, wrap with ConvexClientProvider

**Home Page:**
- Location: `app/page.tsx`
- Triggers: User navigates to `/` or app home
- Responsibilities: Render default home page template (currently Next.js boilerplate)

**Convex Backend Init:**
- Location: `app/ConvexClientProvider.tsx`
- Triggers: App hydration on client side
- Responsibilities: Create ConvexReactClient instance, initialize Convex provider

## Error Handling

**Strategy:** Async error handling through Convex SDK

**Patterns:**
- Query/mutation hooks return `isLoading`, `error` states
- Convex SDK provides error information in hook states
- Components responsible for handling and displaying errors
- Server-side function errors propagate as promise rejections

## Cross-Cutting Concerns

**Logging:** Via `console.log()` and browser DevTools (frontend) or Convex dashboard (backend)

**Validation:** Convex validators in function args definitions using Convex value validators (`v.string()`, `v.number()`, etc.)

**Authentication:** Not yet implemented; ready for integration via Convex auth providers (Clerk, Auth0, custom)

**Type Safety:** TypeScript strict mode enabled; Convex generates type definitions in `convex/_generated/`

---

*Architecture analysis: 2026-01-30*
