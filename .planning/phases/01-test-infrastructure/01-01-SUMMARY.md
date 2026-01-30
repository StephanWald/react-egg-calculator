---
phase: 01-test-infrastructure
plan: 01
subsystem: testing
completed: 2026-01-30
duration: 2

tags:
  - vitest
  - react-testing-library
  - jsdom
  - v8-coverage
  - test-infrastructure

dependencies:
  requires: []
  provides:
    - Vitest 4.0.18 with jsdom environment
    - React Testing Library 16.3.2
    - jest-dom matchers available globally
    - npm test/test:watch/test:coverage scripts
    - Smoke test proving infrastructure works
  affects:
    - 02-physics-extraction
    - 03-physics-validation
    - 04-component-refactor
    - 05-responsive-mobile
    - 06-timer-enhancements
    - 07-perf-accessibility

tech-stack:
  added:
    - vitest: ^4.0.18
    - "@testing-library/react": ^16.3.2
    - "@testing-library/jest-dom": ^6.9.1
    - "@testing-library/user-event": ^14.6.1
    - jsdom: ^26.1.0
    - "@vitest/coverage-v8": ^4.0.18
  patterns:
    - Global test setup via setupFiles
    - v8 coverage provider
    - Vitest config embedded in vite.config.js

key-files:
  created:
    - test/setup.js: Global jest-dom matcher setup
    - egg-calculator.test.jsx: Smoke test verifying component renders
  modified:
    - package.json: Added test scripts and devDependencies
    - vite.config.js: Added test configuration with jsdom environment

decisions:
  - decision: Use jsdom 26.x not 27.x
    rationale: Known Vitest 4 compatibility issues with jsdom 27+ (ERR_REQUIRE_ESM errors)
    impact: Ensures stable test environment
    date: 2026-01-30
  - decision: Configure Vitest in vite.config.js instead of separate vitest.config.js
    rationale: Reduce config file proliferation, leverage existing Vite config
    impact: Single source of truth for build and test configuration
    date: 2026-01-30
  - decision: Use globals:true for automatic cleanup
    rationale: Enables automatic cleanup() after each test per RTL best practices
    impact: Tests are more reliable, less boilerplate
    date: 2026-01-30
---

# Phase 01 Plan 01: Test Infrastructure Setup Summary

**One-liner:** Vitest 4 + React Testing Library 16 + jsdom 26 with v8 coverage and global jest-dom matchers

## What Was Done

### Task 1: Install dependencies and configure test infrastructure

**Completed:** 2026-01-30
**Commit:** da0d5df

Installed six dev dependencies:
- vitest@^4.0.18 (test runner)
- @testing-library/react@^16.3.2 (React component testing utilities)
- @testing-library/jest-dom@^6.9.1 (DOM matchers)
- @testing-library/user-event@^14.6.1 (user interaction simulation)
- jsdom@^26.1.0 (DOM environment for Node.js - pinned to 26.x for Vitest 4 compatibility)
- @vitest/coverage-v8@^4.0.18 (v8 coverage provider)

Added three npm scripts:
- `npm test`: Single test run with exit code (CI-friendly)
- `npm run test:watch`: Interactive watch mode for TDD workflow
- `npm run test:coverage`: Generate coverage reports with v8 provider

Configured Vitest in vite.config.js:
- `globals: true` enables automatic cleanup after each test
- `environment: 'jsdom'` provides browser-like DOM APIs
- `setupFiles: ['./test/setup.js']` loads global test setup
- `coverage.provider: 'v8'` with text/json/html reporters

Created test/setup.js:
- Single import: `import '@testing-library/jest-dom/vitest'`
- Makes jest-dom matchers (toBeInTheDocument, toBeDisabled, etc.) available globally
- No per-file imports needed in test files

### Task 2: Create smoke test and verify full infrastructure

**Completed:** 2026-01-30
**Commit:** c7fe719

Created egg-calculator.test.jsx:
- Smoke test verifying EggCalculator component renders without crashing
- Uses `toBeInTheDocument()` matcher WITHOUT per-file import (proves setup file works)
- Queries for `[class*="min-h-screen"]` selector (component's top-level div)
- Test passes, confirming jsdom environment and React rendering work

Verified all three scripts:
- `npm test`: Passes with 1 test, exits with code 0
- `npm run test:coverage`: Generates v8 coverage report (40% statement coverage baseline)
- `npm run test:watch`: Starts interactive watch mode successfully

## Decisions Made

**1. jsdom version pinned to 26.x**
- **Context:** jsdom 27+ has breaking ESM changes that cause ERR_REQUIRE_ESM errors with Vitest 4
- **Decision:** Use jsdom@^26.1.0 explicitly
- **Impact:** Stable test environment, no runtime errors
- **Alternative considered:** Wait for Vitest 5 (not ready) or jsdom 28 fix (unknown timeline)

**2. Single config file approach**
- **Context:** Could create separate vitest.config.js or use vite.config.js
- **Decision:** Add test section to existing vite.config.js
- **Impact:** One fewer config file, shared settings (e.g., resolve aliases)
- **Alternative considered:** Separate vitest.config.js (more isolation but more files)

**3. Global test setup**
- **Context:** jest-dom matchers can be imported per-file or globally
- **Decision:** Use setupFiles to import jest-dom/vitest globally
- **Impact:** Cleaner test files, consistent matcher availability
- **Alternative considered:** Per-file imports (more explicit but more boilerplate)

## Technical Details

### Test Infrastructure Stack

```
Vitest 4.0.18 (test runner)
├── jsdom 26.1.0 (DOM environment)
├── @vitest/coverage-v8 4.0.18 (coverage)
└── vite.config.js (test configuration)

React Testing Library 16.3.2 (component testing)
├── @testing-library/jest-dom 6.9.1 (matchers)
└── test/setup.js (global setup)
```

### Coverage Baseline

Initial coverage from smoke test:
- Statement coverage: 40.04%
- Branch coverage: 22.54%
- Function coverage: 32.58%
- Line coverage: 42.54%

Files covered:
- egg-calculator.jsx: 38.02% statements (main component renders)
- translations.js: 60% statements (default language loads)
- useTranslation.js: 81.25% statements (hook initialization)

### Test Configuration

```javascript
// vite.config.js
test: {
  globals: true,              // Automatic cleanup after each test
  environment: 'jsdom',       // Browser-like DOM APIs
  setupFiles: ['./test/setup.js'], // Global test setup
  coverage: {
    provider: 'v8',           // Fast native coverage
    reporter: ['text', 'json', 'html'], // Multiple formats
  },
}
```

### Smoke Test Pattern

```javascript
// egg-calculator.test.jsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EggCalculator from './egg-calculator';

describe('EggCalculator', () => {
  it('renders without crashing', () => {
    render(<EggCalculator />);
    expect(document.querySelector('[class*="min-h-screen"]'))
      .toBeInTheDocument(); // Global matcher from setup file
  });
});
```

## Success Metrics

All five phase success criteria verified:

1. **npm test runs Vitest with jsdom environment** ✓
   - Output confirms jsdom environment loaded (273ms environment time)
   - Test passes with React component rendering

2. **npm run test:coverage generates v8 coverage reports** ✓
   - Coverage report displays with v8 provider
   - Shows file-by-file coverage percentages
   - Generates text, json, and html reports

3. **npm run test:watch starts watch mode for TDD workflow** ✓
   - Interactive watch mode starts successfully
   - Tests run and pass
   - Ready for file-watch-based TDD workflow

4. **React Testing Library matchers available globally** ✓
   - `toBeInTheDocument()` works without per-file import
   - Proves test/setup.js is loaded correctly
   - All jest-dom matchers available (50+ assertions)

5. **Example smoke test proves setup works** ✓
   - EggCalculator component renders
   - DOM queries work (querySelector)
   - React Testing Library integration confirmed
   - jsdom environment provides working DOM APIs

## Deviations from Plan

None - plan executed exactly as written.

## Blockers Resolved

**Blocker:** Missing base dependencies (React, Vite, etc.)
- **Resolution:** Dependencies auto-installed when test dependencies added
- **How:** npm install automatically resolved peer dependencies

## Next Phase Readiness

**Phase 02 (Physics Extraction)** is now **READY**.

Prerequisites met:
- Test infrastructure fully operational
- npm test/watch/coverage scripts available
- React Testing Library ready for component tests
- jsdom environment supports DOM-dependent code
- Coverage reporting enables tracking refactoring safety

What Phase 02 can do immediately:
- Write tests for extracted physics functions (pure function tests)
- Use TDD workflow with `npm run test:watch`
- Track coverage to ensure physics calculations are tested
- Verify thermodynamic calculations against known values

No blockers for subsequent phases (all depend on this infrastructure).

## Files Changed

### Created (2 files)
- `test/setup.js` (2 lines) - Global jest-dom matcher setup
- `egg-calculator.test.jsx` (13 lines) - Smoke test

### Modified (3 files)
- `package.json` - Added 3 test scripts, 6 devDependencies
- `package-lock.json` - 229 packages added (automated)
- `vite.config.js` - Added test configuration section (10 lines)

### Generated (ignored by git)
- `coverage/` - HTML, JSON, text coverage reports
- `node_modules/` - 229 packages

## Lessons Learned

**1. jsdom version compatibility matters**
- Always check Vitest compatibility matrix before updating jsdom
- Pinning jsdom to 26.x avoids known issues with 27+

**2. Global setup reduces test boilerplate**
- setupFiles approach means jest-dom matchers "just work"
- One-time setup vs. repeated imports in every test file

**3. Smoke tests validate infrastructure end-to-end**
- Simple render test confirms: Vitest + jsdom + React + RTL all working
- Faster to catch config issues than waiting for complex tests

**4. Single config file is cleaner for small projects**
- Embedding test config in vite.config.js reduces file proliferation
- Shared resolve aliases and plugin config between build and test

## Verification Commands

```bash
# Run tests (single run, CI-friendly)
npm test

# Generate coverage report
npm run test:coverage

# Start watch mode for TDD
npm run test:watch

# Verify scripts exist
node -e "const pkg = require('./package.json');
  console.log('test:', pkg.scripts.test);
  console.log('test:watch:', pkg.scripts['test:watch']);
  console.log('test:coverage:', pkg.scripts['test:coverage']);"

# Check coverage baseline
npm run test:coverage | grep "All files"
```

## Performance Notes

- Test execution: ~570ms for 1 test (acceptable baseline)
- Environment setup: ~270ms jsdom initialization (typical)
- Coverage generation: +60ms overhead (minimal)
- Total infrastructure overhead: <1 second (excellent)

Fast enough for TDD workflow (sub-second feedback loop).

## References

- [Vitest documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom matchers](https://github.com/testing-library/jest-dom)
- [jsdom 26 release notes](https://github.com/jsdom/jsdom/releases/tag/26.0.0)
- Research: `.planning/phases/01-test-infrastructure/01-RESEARCH.md`
