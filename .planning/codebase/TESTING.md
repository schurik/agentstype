# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Not detected - No testing framework configured (Jest, Vitest, etc.)
- No `jest.config.*` or `vitest.config.*` files present

**Assertion Library:**
- Not detected - No testing libraries in dependencies

**Run Commands:**
- Not applicable - No test scripts in `package.json`

## Test File Organization

**Location:**
- Not established - No test files found in codebase
- Recommended pattern: Co-located with source files (e.g., `Component.test.tsx` next to `Component.tsx`)

**Naming:**
- No test files present to establish pattern
- Suggested pattern based on ESLint config: `*.test.ts` or `*.spec.ts`

**Structure:**
- No test directory established

## Test Structure

**Suite Organization:**
- Not applicable - No test files present

**Patterns:**
- Setup/teardown patterns: Not established
- Assertion patterns: Not established
- Async testing: Not established

## Mocking

**Framework:**
- Not detected - No mocking library installed

**Patterns:**
- Convex client mocking would be needed for testing components using Convex hooks
- Environment variable mocking would be needed for testing `ConvexClientProvider` which uses `process.env.NEXT_PUBLIC_CONVEX_URL`

**What to Mock:**
- Convex client (`ConvexReactClient`)
- Environment variables in tests
- Next.js Image component in unit tests

**What NOT to Mock:**
- React components (test integration instead)
- Tailwind CSS classes (test rendered output instead)

## Fixtures and Factories

**Test Data:**
- Not established - No fixtures present

**Location:**
- Suggested: `tests/fixtures/` or `__tests__/fixtures/`

## Coverage

**Requirements:**
- Not enforced - No coverage configuration present

**View Coverage:**
- Not applicable - No test infrastructure

## Test Types

**Unit Tests:**
- Not implemented
- Candidates for unit testing:
  - `ConvexClientProvider` component wrapping and initialization
  - Provider configuration with environment variables

**Integration Tests:**
- Not implemented
- Candidates for integration testing:
  - Root layout with ConvexClientProvider integration
  - Convex provider connecting to actual/mocked Convex client

**E2E Tests:**
- Not detected - No e2e framework configured

## Recommended Testing Setup

**For this project, consider:**

1. **Framework Selection:**
   - Vitest for unit/integration tests (TypeScript-native, fast)
   - Jest as alternative (widely used with Next.js)

2. **Required Packages:**
   ```json
   {
     "@testing-library/react": "^15",
     "@testing-library/jest-dom": "^6",
     "vitest": "^2" // or "jest": "^29"
   }
   ```

3. **Convex Testing:**
   - Mock `convex/react` module in tests
   - Mock `ConvexReactClient` instantiation
   - Example setup:
   ```typescript
   // tests/mocks/convex.ts
   import { vi } from 'vitest';
   vi.mock('convex/react', () => ({
     ConvexProvider: ({ children }: any) => children,
     ConvexReactClient: vi.fn(),
   }));
   ```

4. **Component Testing Pattern:**
   ```typescript
   // app/ConvexClientProvider.test.tsx
   import { render } from '@testing-library/react';
   import { ConvexClientProvider } from './ConvexClientProvider';

   describe('ConvexClientProvider', () => {
     it('renders children', () => {
       const { getByText } = render(
         <ConvexClientProvider>
           <div>Test Content</div>
         </ConvexClientProvider>
       );
       expect(getByText('Test Content')).toBeInTheDocument();
     });
   });
   ```

5. **Environment Variables in Tests:**
   - Set `NEXT_PUBLIC_CONVEX_URL` in test setup
   - Use test environment file or mock in beforeEach

## Current State

**Testing Status:**
- No testing infrastructure present
- Codebase is newly initialized from Create Next App
- Testing should be added early before feature development expands

---

*Testing analysis: 2026-01-30*
