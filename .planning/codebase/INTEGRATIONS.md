# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**Backend & Database:**
- Convex - Primary backend as a service
  - SDK/Client: `convex` (1.31.6)
  - React bindings: `convex/react`
  - Deployment: Cloud-hosted at `https://affable-canary-809.convex.cloud`
  - Configuration: `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`
  - Functions accessed via: `api` generated types from `convex/_generated/api.d.ts`

**Fonts:**
- Google Fonts - Via Next.js font optimization
  - Integrated: Geist and Geist Mono fonts loaded in `app/layout.tsx`
  - Method: Next.js `next/font/google` module

## Data Storage

**Databases:**
- Convex database (cloud-hosted)
  - Connection: Environment variable `NEXT_PUBLIC_CONVEX_URL`
  - Client: `ConvexReactClient` initialized in `app/ConvexClientProvider.tsx`
  - Schema: Defined in `convex/` directory (currently empty, generated types in `convex/_generated/dataModel.d.ts`)
  - Real-time sync: Built-in via Convex React client

**File Storage:**
- Not currently configured - Local filesystem only for development

**Caching:**
- Not explicitly configured - Next.js default caching and Convex built-in caching

## Authentication & Identity

**Auth Provider:**
- Not currently implemented
- Status: None configured
- Future integration point: Would be configured in Convex backend and passed to client via `ConvexClientProvider`

## Monitoring & Observability

**Error Tracking:**
- Not configured

**Logs:**
- Console logging only (client and server logs via Next.js dev server)

## CI/CD & Deployment

**Hosting:**
- Not deployed - Development environment only
- Recommended: Vercel (native Next.js support) or self-hosted Node.js
- Backend: Convex cloud (no deployment required beyond CLI pushes)

**CI Pipeline:**
- Not configured

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL (public, exposed to client)
- `CONVEX_DEPLOYMENT` - Convex deployment identifier for CLI operations

**Secrets location:**
- `.env.local` - Local development only (in `.gitignore`)
- Convex credentials: Managed by Convex CLI, not exposed in repository

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Integration Points in Code

**Client Provider:**
- Location: `app/ConvexClientProvider.tsx`
- Wraps entire application with `ConvexProvider`
- Initializes `ConvexReactClient` with environment URL

**Root Layout Integration:**
- Location: `app/layout.tsx`
- Uses `ConvexClientProvider` as wrapper for all routes
- Applies Geist fonts from Google Fonts

## Convex-Specific Setup

**CLI Commands:**
```bash
bunx convex dev      # Start Convex backend (run alongside bun dev)
bunx convex docs     # Open Convex documentation
bunx convex -h       # Show Convex CLI help
```

**Generated Types:**
- `convex/_generated/api.d.ts` - Type-safe API client
- `convex/_generated/server.d.ts` - Server-side utilities
- `convex/_generated/dataModel.d.ts` - Database type definitions

---

*Integration audit: 2026-01-30*
