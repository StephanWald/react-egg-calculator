# Phase 1: Test Infrastructure - Research

**Researched:** 2026-01-30
**Domain:** JavaScript Testing (React + Vite ecosystem)
**Confidence:** HIGH

## Summary

Vitest is the standard testing framework for Vite-based React projects in 2026, offering 10-20x faster execution than Jest with native ESM support and seamless Vite integration. React Testing Library is the established library for component testing, emphasizing user-centric testing over implementation details. The stack is mature with clear conventions, though version compatibility requires attention (specifically jsdom 26 vs 27).

This phase establishes test infrastructure with minimal friction: Vitest reads the existing vite.config.js, jsdom provides browser API emulation, and React Testing Library with jest-dom matchers enable accessible, user-focused assertions. The setup requires 6 dependencies and one configuration addition to vite.config.js.

**Primary recommendation:** Use Vitest 4.x with jsdom 26.x (not 27) for React Testing Library component tests. Enable `globals: true` and `environment: 'jsdom'` in vite.config.js test section. Add setup file for @testing-library/jest-dom matchers. Create smoke test that renders main component to prove infrastructure works.

## Standard Stack

The established libraries/tools for React component testing with Vite:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | ^4.0.18 | Test runner and framework | Built for Vite, 10-20x faster than Jest, native ESM support, Jest-compatible API |
| @testing-library/react | ^16.3.2 | React component testing utilities | Official Testing Library for React, user-centric queries, 6M+ weekly downloads |
| @testing-library/jest-dom | ^6.9.1 | Semantic DOM matchers | Provides `toBeInTheDocument()`, `toBeDisabled()` etc. for readable assertions |
| jsdom | ^26.1.0 | Browser API emulation | Most complete DOM simulation for Node.js, required for React Testing Library |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/user-event | ^14.6.1 | Realistic user interaction simulation | Simulates full user interaction sequences (typing, clicking) vs fireEvent's single events |
| @vitest/coverage-v8 | ^4.0.18 | Code coverage with V8 provider | Default coverage provider, faster than Istanbul with identical accuracy (since v3.2.0) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsdom | happy-dom | Faster but lacks some APIs, less complete browser simulation |
| Vitest | Jest | Mature ecosystem but 10-20x slower, no native ESM, separate config from Vite |
| v8 coverage | istanbul (@vitest/coverage-istanbul) | More ecosystem familiarity but slower execution and higher memory usage |

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

**Version Constraints:**
- Vitest requires Vite >=v6.0.0 and Node >=v20.0.0 (project already has Vite 6.0.5)
- React Testing Library v16+ requires React v18+ (project has React 18.3.1)
- **CRITICAL:** Use jsdom v26.x, NOT v27.x (known compatibility issues with Vitest 4)

## Architecture Patterns

### Recommended Project Structure
```
src/
├── egg-calculator.jsx           # Main component
├── egg-calculator.test.jsx      # Colocated test
├── useTranslation.js
├── useTranslation.test.js       # Colocated test
└── test/
    └── setup.js                  # Test setup file (jest-dom import)
```

**Rationale:** Colocation for unit tests (improves discoverability, encourages TDD, simplifies imports). Separate test/ directory only for shared setup files.

### Pattern 1: Vitest Configuration in vite.config.js
**What:** Add test configuration to existing Vite config (don't create separate vitest.config.js)
**When to use:** Always for projects with existing vite.config.js (avoids config duplication)
**Example:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-egg-calculator/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
});
```
**Source:** [Vitest Official Configuration Guide](https://vitest.dev/config/)

### Pattern 2: Setup File for jest-dom Matchers
**What:** Import jest-dom matchers in setup file, not individual test files
**When to use:** Always (DRY principle, ensures matchers available everywhere)
**Example:**
```javascript
// src/test/setup.js
import '@testing-library/jest-dom/vitest';
```
**Source:** [Using Testing Library jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest)

### Pattern 3: Smoke Test with screen and User-Centric Queries
**What:** Test component renders without crashing using accessible queries
**When to use:** First test for any component (proves infrastructure works)
**Example:**
```javascript
// egg-calculator.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EggCalculator from './egg-calculator';

describe('EggCalculator', () => {
  it('renders without crashing', () => {
    render(<EggCalculator />);
    // Use accessible query (getByRole) not getByTestId
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```
**Source:** [React Testing Library Smoke Test Examples](https://www.robinwieruch.de/vitest-react-testing-library/)

### Pattern 4: Explicit Imports (globals: true for cleanup only)
**What:** Import test functions explicitly despite globals: true
**When to use:** Always (better tooling, type safety, maintainability)
**Example:**
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```
**Why:** Vitest docs recommend explicit imports for IDE support and type checking. `globals: true` only needed for automatic cleanup() after each test.
**Source:** [Vitest Globals Configuration](https://vitest.dev/config/globals)

### Anti-Patterns to Avoid
- **Separate vitest.config.js when vite.config.js exists:** Creates config duplication and potential conflicts
- **Manual cleanup() calls:** Vitest with globals: true handles cleanup automatically
- **Destructuring queries from render():** Use `screen` instead for maintainability (no need to update destructure when adding queries)
- **Using jsdom 27:** Known compatibility issues with Vitest 4 (ERR_REQUIRE_ESM errors)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User interaction simulation | `fireEvent.click()`, `fireEvent.change()` | `userEvent.click()`, `userEvent.type()` | fireEvent dispatches single events; userEvent simulates full interaction sequences (focus, keydown, keypress, input, keyup) matching real user behavior |
| DOM matchers | `expect(button.disabled).toBe(true)` | `expect(button).toBeDisabled()` | jest-dom matchers provide semantic assertions with better error messages |
| Async query waiting | `await waitFor(() => {})` (empty) or manual setTimeout | `screen.findByRole()` or `waitFor` with assertion | findBy queries combine getBy + waitFor; empty waitFor creates timing-dependent flaky tests |
| Element cleanup between tests | Manual cleanup calls | `globals: true` in config | Automatic cleanup prevents test pollution without boilerplate |
| Coverage reporting | Custom coverage scripts | @vitest/coverage-v8 | V8 provider is faster than Istanbul with identical accuracy (since Vitest 3.2.0) |

**Key insight:** React Testing Library and Vitest have battle-tested solutions for common testing patterns. Custom solutions miss edge cases (async updates, event sequences, cleanup timing) and create maintenance burden.

## Common Pitfalls

### Pitfall 1: jsdom Version Incompatibility
**What goes wrong:** Using jsdom 27.x with Vitest 4.x causes `ERR_REQUIRE_ESM` errors and test failures
**Why it happens:** jsdom 27 changed to ES modules (parse5 dependency) that conflict with Vitest 4's module resolution
**How to avoid:** Use jsdom v26.x (specifically ^26.1.0)
**Warning signs:** Tests fail with "ERR_REQUIRE_ESM" or "Cannot find module" errors after upgrading jsdom
**Source:** [Vitest Issue #9279](https://github.com/vitest-dev/vitest/issues/9279) (closed as "not planned", workaround is downgrade)

### Pitfall 2: Testing Implementation Details Instead of User Behavior
**What goes wrong:** Tests break on refactors even when user-facing behavior unchanged
**Why it happens:** Testing internal state, private methods, or DOM structure (class names, IDs) instead of observable behavior
**How to avoid:** Use `getByRole`, `getByLabelText`, `getByText` (accessible queries) not `getByTestId` or `querySelector`
**Warning signs:** Tests require updates when refactoring without changing features; overuse of `data-testid`
**Source:** [Kent C. Dodds: Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Pitfall 3: Awaiting Synchronous Queries
**What goes wrong:** `await getByRole()` causes TypeScript errors; doesn't provide async benefit
**Why it happens:** Confusion about query types: `getBy*` and `queryBy*` are synchronous; only `findBy*` is async
**How to avoid:** Use `findByRole()` for async queries; never await `getBy*` or `queryBy*`
**Warning signs:** Unnecessary `await` before getBy queries; tests work but IDE shows type warnings
**Source:** [Common React Testing Library Mistakes](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8)

### Pitfall 4: Side Effects Inside waitFor Callbacks
**What goes wrong:** `fireEvent` or `userEvent` calls inside `waitFor` execute multiple times unpredictably
**Why it happens:** waitFor retries callback until assertion passes; side effects run on every retry
**How to avoid:** Place interactions (fireEvent, userEvent) BEFORE waitFor; only assertions go inside callback
**Warning signs:** Duplicate events, unexpected behavior, tests work intermittently
**Source:** [Kent C. Dodds: Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Pitfall 5: Using queryBy for Existence Checks
**What goes wrong:** `queryByRole` returns null silently; test fails without helpful error message
**Why it happens:** queryBy designed for asserting non-existence; getBy throws descriptive errors
**How to avoid:** Use `getByRole()` to assert element exists; reserve `queryByRole()` for `expect(element).not.toBeInTheDocument()`
**Warning signs:** Tests fail with "Cannot read property of null" instead of "Unable to find element"
**Source:** [Kent C. Dodds: Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Pitfall 6: Missing TypeScript Configuration for Globals
**What goes wrong:** TypeScript errors like "Cannot find name 'describe'" despite globals: true
**Why it happens:** TypeScript doesn't recognize Vitest globals without explicit types configuration
**How to avoid:** Add to tsconfig.json: `"compilerOptions": { "types": ["vitest/globals"] }`
**Warning signs:** Runtime works but IDE shows red squiggles; TypeScript compilation fails
**Note:** Project uses JavaScript not TypeScript, so this pitfall doesn't apply but included for completeness

### Pitfall 7: Relative Path Aliases Not Resolving
**What goes wrong:** Test imports fail with "Cannot find module" despite working in app code
**Why it happens:** Vite treats relative aliases as relative to file, not root; Vitest uses Vite's SSR resolution
**How to avoid:** Use absolute paths in vite.config.js aliases: `new URL('./src/', import.meta.url).pathname`
**Warning signs:** Imports work in app but fail in tests; relative paths in resolve.alias config
**Source:** [Vitest Common Errors](https://vitest.dev/guide/common-errors)

## Code Examples

Verified patterns from official sources:

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```
**Note:** Vitest runs in watch mode by default, so `test` and `test:watch` are equivalent. Use `vitest run` for CI (single run without watch).
**Source:** [Vitest Getting Started](https://vitest.dev/guide/)

### Complete vite.config.js with Test Section
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-egg-calculator/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```
**Source:** [Vitest Configuration Reference](https://vitest.dev/config/)

### Setup File (src/test/setup.js)
```javascript
import '@testing-library/jest-dom/vitest';
```
**Source:** [Markus Oberlehner: Using jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest)

### Smoke Test Example
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EggCalculator from './egg-calculator';

describe('EggCalculator', () => {
  it('renders without crashing', () => {
    render(<EggCalculator />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
```
**Source:** Testing Library best practices

### User Interaction Test Pattern
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

describe('Component with interactions', () => {
  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);

    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```
**Note:** Always use `userEvent.setup()` pattern (userEvent v14 API). Old direct calls like `userEvent.click()` work but setup API is recommended.
**Source:** [Testing Library user-event v14 Guide](https://testing-library.com/docs/user-event/intro/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + CRA | Vitest + Vite | 2021-2022 | React team recommends Vite over CRA; Vitest is Jest-compatible but 10-20x faster |
| fireEvent for interactions | userEvent from @testing-library/user-event | 2020 (userEvent v13-14) | userEvent simulates full interaction sequences vs single events |
| Manual cleanup after tests | globals: true auto-cleanup | Vitest 1.0+ | Automatic cleanup reduces boilerplate |
| Istanbul coverage | v8 coverage | Vitest 3.2.0 | V8 faster with identical accuracy to Istanbul (AST-based remapping) |
| userEvent.click() direct call | userEvent.setup() pattern | userEvent v14 (2022) | Setup API allows per-test configuration |
| jest-dom import in every test | Setup file with /vitest import | jest-dom v6 (2023) | Explicit Vitest support reduces boilerplate |

**Deprecated/outdated:**
- **create-react-app (CRA):** Officially deprecated 2023; React docs recommend Vite
- **@testing-library/react-hooks:** Merged into @testing-library/react v13+ (React 18 renderHook built-in)
- **Manual cleanup() calls:** No longer needed with globals: true
- **Destructuring render() return:** Use `screen` instead (official recommendation since 2020)

## Open Questions

Things that couldn't be fully resolved:

1. **React 18 act() warnings with Vitest**
   - What we know: GitHub issue #1413 reports persistent act() warnings with React 18.3.1 + RTL 16.3.0 + Vitest 2.1.0
   - What's unclear: Whether issue affects Vitest 4.x; workarounds unclear from documentation
   - Recommendation: Proceed with setup; if act() warnings appear, investigate [Vitest act() issue](https://github.com/testing-library/react-testing-library/issues/1413) for workarounds

2. **ESLint plugin integration**
   - What we know: eslint-plugin-testing-library and eslint-plugin-jest-dom provide best practice enforcement; compatible with Vitest
   - What's unclear: Whether project wants ESLint plugins (not in requirements)
   - Recommendation: Skip for Phase 1 (infrastructure only); consider in future phase if code quality gates needed

3. **jsdom 27 compatibility timeline**
   - What we know: jsdom 27 incompatible with Vitest 4; issue closed as "not planned"
   - What's unclear: Whether future Vitest or jsdom versions will resolve; timeline unknown
   - Recommendation: Lock jsdom to ^26.1.0 in package.json; monitor issue for updates

## Sources

### Primary (HIGH confidence)
- [Vitest Official Documentation](https://vitest.dev/guide/) - Getting Started, Configuration, Environment setup
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage.html) - V8 coverage configuration
- [Vitest Common Errors](https://vitest.dev/guide/common-errors) - Pitfalls and solutions
- [React Testing Library Official Docs](https://testing-library.com/docs/react-testing-library/intro/) - Core principles and setup
- [Testing Library Setup Guide](https://testing-library.com/docs/react-testing-library/setup) - Vitest integration
- [Markus Oberlehner: Using jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest) - Verified setup pattern
- [Kent C. Dodds: Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Authoritative pitfall guide

### Secondary (MEDIUM confidence)
- [OneUptime: Unit Test React Components with Vitest](https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view) - January 2026 comprehensive guide
- [Nucamp: Testing in 2026](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Current ecosystem state
- [Vitest GitHub Issue #9279](https://github.com/vitest-dev/vitest/issues/9279) - jsdom 27 compatibility issue (closed as "not planned")
- [Medium: React Testing Library Mistakes](https://medium.com/@samueldeveloper/react-testing-library-vitest-the-mistakes-that-haunt-developers-and-how-to-fight-them-like-ca0a0cda2ef8) - Common pitfalls compilation
- WebSearch results verified against official documentation for accuracy

### Tertiary (LOW confidence)
- Community blog posts about TDD workflow (cited for supplementary context, not critical claims)
- GitHub discussions about globals configuration (opinions vary, official docs take precedence)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official docs and project-level research recommendations match
- Architecture: HIGH - Patterns from official Vitest and Testing Library documentation
- Pitfalls: HIGH - jsdom 27 issue verified from GitHub, other pitfalls from Kent C. Dodds (authoritative source)

**Research date:** 2026-01-30
**Valid until:** ~2026-03-30 (30 days, stable ecosystem)

**Critical version constraint:** jsdom ^26.1.0 NOT ^27.x (compatibility issue unresolved, tracked in Vitest #9279)
