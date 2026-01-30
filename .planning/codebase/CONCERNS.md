# Codebase Concerns

**Analysis Date:** 2026-01-30

## Test Coverage Gaps

**Missing Test Infrastructure:**
- What's not tested: No test framework configured; 0 test files exist in the codebase
- Files: `package.json` (no test dependencies), no `.test.ts` or `.spec.ts` files anywhere
- Risk: All functionality is untested. Critical bugs in client components, layout, and Convex integration could ship unnoticed. Convex functions especially need validation.
- Priority: **High**

**Untested Core Components:**
- What's not tested: `app/ConvexClientProvider.tsx`, `app/layout.tsx`, `app/page.tsx` have no unit or integration tests
- Files: `app/ConvexClientProvider.tsx`, `app/layout.tsx`, `app/page.tsx`
- Risk: Provider setup errors, metadata issues, or client initialization failures won't be caught before deployment
- Priority: **High**

## Missing Critical Features

**Empty Backend Implementation:**
- Problem: No Convex schema, functions, or mutations have been implemented despite Convex dependency being installed
- Files: `convex/` directory only contains README and tsconfig, missing `schema.ts` and function files
- Blocks: No data persistence, no backend API, no real functionality possible
- Risk: Prototype-stage codebase with no backend - cannot support real features

**Placeholder Homepage:**
- Problem: `app/page.tsx` contains boilerplate "Getting Started" template with hardcoded links to Next.js and Vercel documentation
- Files: `app/page.tsx`
- Blocks: Users see generic template content instead of application-specific UI
- Impact: Not production-ready; needs complete redesign

## Configuration Debt

**Missing Environment Variables Documentation:**
- Issue: `.env.local` exists but is not committed (in `.gitignore`); no `.env.example` file for reference
- Files: `.env.local` (not committed), `.gitignore`
- Impact: New developers don't know what env vars are required. NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOYMENT must be manually configured from Convex dashboard
- Fix approach: Create `.env.example` with required variables documented

**Incomplete Next.js Configuration:**
- Issue: `next.config.ts` is empty with only a comment placeholder and exports default config
- Files: `next.config.ts`
- Impact: Image optimization, security headers, redirects, and other critical Next.js features are not configured
- Fix approach: Add necessary config for production (image domains, security headers, compression, etc.)

**Missing Build Optimization:**
- Issue: No `next/image` optimization settings; `app/page.tsx` uses Next.js Image but no `images` config
- Files: `next.config.ts`, `app/page.tsx`
- Impact: Images may not be optimized for different screen sizes/formats; worse performance for users
- Fix approach: Configure `images.domains` and responsive image handling in `next.config.ts`

## Security Considerations

**Non-null Assertion in Client Provider:**
- Risk: `process.env.NEXT_PUBLIC_CONVEX_URL!` uses non-null assertion without fallback or error handling
- Files: `app/ConvexClientProvider.tsx` (line 6)
- Current mitigation: Environment variable must exist; crashes at runtime if missing
- Recommendations: Add explicit validation and error message if env var missing; provide fallback error boundary

**Public Secrets in Environment:**
- Risk: CONVEX_DEPLOYMENT value is visible in `.env.local` and could be committed accidentally
- Files: `.env.local`
- Current mitigation: File is gitignored, but no pre-commit hook to prevent accidental commits
- Recommendations: Add husky pre-commit hook to prevent `.env.local` from being staged; use `.env.example` for reference

**Missing Security Headers:**
- Risk: No Content-Security-Policy, X-Frame-Options, or other security headers configured
- Files: `next.config.ts` (empty config)
- Current mitigation: None - relying on Next.js defaults only
- Recommendations: Add `headers()` configuration in `next.config.ts` for security headers

## Fragile Areas

**ConvexClientProvider Initialization:**
- Files: `app/ConvexClientProvider.tsx`
- Why fragile: Single string initialization with no error boundaries, no fallback for Convex connection failures, and non-null assertion on env var
- Safe modification: Wrap with React error boundary in `layout.tsx`; add explicit env var validation with user-facing error message
- Test coverage: Zero tests - critical path with no validation

**Layout Metadata:**
- Files: `app/layout.tsx`
- Why fragile: Generic "Create Next App" metadata will appear in all SEO/social sharing until manually updated
- Safe modification: Update `metadata` object with actual application values; use generateMetadata function if dynamic metadata needed
- Test coverage: No tests for metadata generation

**Styles and Theme:**
- Files: `app/globals.css`
- Why fragile: Hard-coded color scheme with fallback to Arial/Helvetica instead of declared Geist fonts; uses `@theme inline` which may not support all future Tailwind features
- Safe modification: Test dark mode thoroughly; ensure font-sans and font-mono CSS variables are properly injected from layout
- Test coverage: No visual regression tests

## Scaling Limits

**Single Client Instance:**
- Current capacity: One ConvexReactClient created at module level in `ConvexClientProvider.tsx`
- Limit: If client needs to be reconfigured (e.g., switching deployments), entire app must unmount
- Scaling path: Wrap client instance in context with provider state management if multi-deployment support needed

**No Data Persistence Layer:**
- Current capacity: Zero - no Convex schema means no data storage
- Limit: Cannot scale beyond static pages; no user data, sessions, or real-time features possible
- Scaling path: Design and implement Convex schema for core entities; add mutations and queries

## Dependencies at Risk

**Convex at Edge of Stability:**
- Risk: `convex@^1.31.6` is a minor version bump dependency; Convex 2.x may have breaking changes
- Impact: Major version bump could break entire backend integration
- Migration plan: Lock to `convex@^1.31.6` until migration path to 2.x is clear; monitor Convex changelog

**React 19 Recent Release:**
- Risk: `react@19.2.3` is a very recent version; ecosystem compatibility not fully established
- Impact: Third-party libraries may not support React 19; potential dependency conflicts
- Migration plan: Monitor for library incompatibilities; consider pinning to `19.2.3` instead of caret range

**Missing ESLint Rules:**
- Risk: ESLint config uses only Next.js defaults; custom rules for code quality not enforced
- Impact: No enforcement of naming conventions, import ordering, or other code standards
- Migration plan: Add custom ESLint rules for React best practices, unused imports, and accessibility

## Missing Critical Features

**No Error Boundary or Error Handling:**
- Problem: No error boundary component wrapping children in layout; Convex client failure crashes entire app
- Files: `app/layout.tsx`, `app/ConvexClientProvider.tsx`
- Blocks: Cannot gracefully handle backend connection failures or unexpected errors

**No Loading States or Suspense:**
- Problem: No Suspense boundaries or loading components; Convex queries will block rendering
- Files: `app/page.tsx` (and all future pages)
- Blocks: User experience degradation if Convex is slow; no perceived responsiveness

**No Authentication System:**
- Problem: No auth provider setup despite Convex support for Convex Auth
- Files: Project-wide - no auth middleware, no session management
- Blocks: Cannot build features requiring user identification or data isolation

## Tech Debt

**Boilerplate-Heavy Codebase:**
- Issue: Project contains generic create-next-app templates that need complete replacement
- Files: `app/page.tsx`, `app/layout.tsx` (metadata), `README.md`
- Impact: Each new feature requires clearing away boilerplate first
- Fix approach: Clean up page content, update metadata, remove placeholder links

**Unused Dependencies:**
- Issue: `@types/node` and `@types/react-dom` are listed but may be unnecessary with Next.js 16's built-in types
- Files: `package.json` (devDependencies)
- Impact: Minimal but adds to bundle/install size
- Fix approach: Test if types still work after removal; modern Next.js may not need these

**Inconsistent Package Manager Documentation:**
- Issue: `README.md` shows npm/yarn/pnpm/bun examples but `CLAUDE.md` only mentions `bun` and `bunx`
- Files: `README.md`, `CLAUDE.md`
- Impact: Confusion about which package manager to use; bun is the actual choice
- Fix approach: Update README to remove npm/yarn/pnpm instructions; standardize on bun

## Known Gaps

**Missing Convex Integration Testing:**
- Symptoms: No way to verify Convex client connects correctly without manual browser testing
- Files: `app/ConvexClientProvider.tsx`
- Trigger: Build and deploy to production without validating connection
- Workaround: Manual testing in browser DevTools; check Convex dashboard for activity

**No Build-Time Validation:**
- Symptoms: Broken Convex functions won't be detected until runtime
- Files: `convex/` (future functions), `next.config.ts` (no validation)
- Trigger: `bun run build` succeeds even if Convex schema is invalid
- Workaround: Use `bunx convex dev` during development to catch errors

---

*Concerns audit: 2026-01-30*
