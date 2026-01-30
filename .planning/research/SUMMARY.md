# Project Research Summary

**Project:** Egg Calculator React App Hardening
**Domain:** React application refactoring, testing, and mobile responsiveness
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

The egg calculator is a production React app that needs hardening through modular refactoring, comprehensive testing, and mobile UI fixes. The 1,351-line monolithic component with 47+ useState hooks contains critical physics calculations (Williams formula, Clausius-Clapeyron approximation) that must be proven correct through unit tests before refactoring. The recommended approach is 7-phase incremental extraction: establish testable patterns, add test infrastructure (Vitest + React Testing Library), extract pure functions and hooks, build modular components, fix mobile overflow (especially i18n strings), and optimize. The critical risk is breaking calculation correctness or localStorage state during extraction—mitigated by mapping state dependencies first, adding calculation tests before refactoring, and verifying physics outputs byte-for-byte after each phase. This is a well-scoped hardening effort, not feature development.

The stack is conventional React/Vite best practices: Vitest for testing (native ESM, 10-20x faster than Jest), React Testing Library for behavior-driven component tests, container queries for mobile responsiveness, and established refactoring patterns. All recommendations verified via npm registry and ecosystem consensus. Expected outcome: 1,351-line monolith → 7-8 focused components + 4-5 custom hooks + 3 utility modules, 60-80% test coverage, zero test infrastructure debt, mobile-friendly, and production-ready.

## Key Findings

### Recommended Stack

Vitest is the de facto standard for Vite projects—native ESM integration eliminates babel-jest/ts-jest complexity, and cold start is 10-20x faster than Jest. Pair with @testing-library/react (industry standard for behavior-driven testing), @testing-library/jest-dom for semantic assertions, @testing-library/user-event for realistic interactions, and jsdom for DOM emulation. Code coverage via @vitest/coverage-v8 (bundled with Vitest, fast). For refactoring safety, add ESLint with react-hooks plugin (catches hooks violations), eslint-plugin-jsx-a11y (accessibility), and Prettier (consistency). Container queries (@tailwindcss/container-queries) enable component-scoped responsive design—more modular than media queries alone. All versions verified 2026-01-30.

**Core technologies:**
- **Vitest ^4.0.18**: Test runner and framework — Native Vite integration, ESM-native, API compatible with Jest, 10-20x faster cold start than Jest
- **@testing-library/react ^16.3.2**: Component testing — Industry standard, tests user behavior over implementation, survives refactoring better than Enzyme
- **@testing-library/jest-dom ^6.9.1**: DOM matchers — Semantic assertions (toBeInTheDocument, toHaveTextContent) improve readability
- **@testing-library/user-event ^14.6.1**: User interaction sim — More realistic than fireEvent, simulates actual browser events
- **jsdom ^27.4.0**: DOM implementation — Lightweight Node.js DOM, faster than happy-dom for most cases
- **@vitest/coverage-v8 ^4.0.18**: Code coverage — Default choice, V8-based, faster than Istanbul
- **ESLint ^9.39.2 + react-hooks plugin**: Catch hooks violations during refactoring
- **@tailwindcss/container-queries ^0.1.1**: Component-level responsive design — Better than media queries for modular architecture

### Expected Features

Based on MVP hardening scope, table stakes are unit tests (physics calculations must be correct—core value), mobile responsiveness (60%+ mobile traffic), error boundaries (prevent white-screen crashes), input validation (prevent invalid physics), localStorage error handling (fallback when disabled), basic component rendering tests (smoke tests), and keyboard navigation (WCAG baseline). Differentiators that set apart well-engineered apps: 60-80% test coverage (critical paths, not all trivial UI), modular component architecture (easier maintenance), custom hooks (separate logic from UI), integration tests (timer flow, unit conversion), responsive touch targets 44×44px minimum (mobile UX baseline), and accessibility audit (WCAG 2.1 AA).

Anti-features to explicitly NOT build: 100% coverage (diminishing returns), over-abstraction (premature optimization), snapshot tests everywhere (brittle), complete rewrite (incremental refactoring preferred), micro-frontend architecture (overkill), GraphQL/complex state mgmt (localStorage sufficient), pixel-perfect responsive (3-tier breakpoints adequate), comprehensive Storybook (only for reusable components), full TypeScript conversion (JSDoc + PropTypes sufficient). Current component is 3× critical size threshold (1,351 vs 400-line warning), with 47 useState hooks (4× the threshold of 10-12 for extracted logic).

**Must have (table stakes):**
- Unit tests for physics calculations — Core value must be proven correct
- Mobile-responsive fixes — 60%+ mobile traffic, horizontal scroll broken
- Error boundaries — Prevent white-screen crashes
- Input validation — Prevent invalid physics calculations
- localStorage error handling — Silent failures in private browsing
- Basic component rendering tests — Smoke tests prevent regressions
- Keyboard navigation — WCAG 2.1 AA accessibility baseline

**Should have (differentiators):**
- 60-80% test coverage — Industry standard for utility apps
- Modular component extraction — Easier to test, maintain, extend
- Custom hooks for business logic — Separate concerns, testable in isolation
- Integration tests — Timer flow, unit conversion, GPS pressure
- Responsive touch targets 44×44px — Mobile UX best practice
- Accessibility audit — WCAG 2.1 AA compliance

**Defer to v2+:**
- Complete component extraction (20+ components) — After core hardening stable
- Visual regression testing — Chromatic/Playwright screenshots
- E2E smoke tests — Playwright critical flows
- TypeScript migration — JSDoc types sufficient for now
- Comprehensive Storybook — Emerge naturally if library grows

### Architecture Approach

The target architecture is 7 extraction phases progressing from safest (pure functions) to highest-risk (state dependencies). Phase 1 extracts independent utilities (constants, physics functions, formatters, audio), Phase 2 isolates API services (meteo, geocoding), Phase 3 creates state-aware hooks (unit conversion, settings, timer, location), Phase 4 orchestrates physics calculations, Phase 5 composes all hooks, Phase 6 extracts UI components, Phase 7 minimizes main component. This progression ensures each phase can be tested and reverted independently. The orchestration pattern uses a main `useEggCalculator()` hook that composes domain-specific hooks (physics, timer, location, settings) and returns unified state+actions to a thin EggCalculator.jsx component—reducing monolith from 1,351 lines to ~200 lines for the main component while maintaining identical behavior.

**Major components:**
1. **EggCalculator.jsx** (200 lines) — UI orchestration, layout, panel visibility
2. **Custom hooks** (300 lines total) — useEggCalculator (main orchestration), usePhysicsCalculations, useTimerLogic, useLocationPressure, useSettings, useUnitConversion
3. **Utility functions** (150 lines total) — physics formulas, formatters, constants, validators, storage helpers
4. **UI components** (400 lines total) — SettingsPanel, ResultDisplay, TimerOverlay, ConsistencyPicker, EggInputs, LocationPressure, ConfigDialog
5. **Services** (50 lines total) — meteoApi.js (Open-Meteo), geocodingApi.js (Nominatim)

**Architectural patterns:**
- Custom hooks encapsulate state + side effects, testable without UI
- Container/presentational split (logic in hooks, rendering in components)
- Pure utility functions at bottom (no React dependencies, highest testability)
- Service layer for APIs (clear boundaries, mockable)
- Dependency graph is acyclic: Utils → Hooks → Components (never reverse)

### Critical Pitfalls & Prevention

1. **Breaking useState dependency chains** — Refactoring breaks the 47-state interdependency graph where changing pressure triggers recalculations of boiling point, altitude, cooking time, temp drop, effective temp, etc. **Prevention:** Map complete dependency graph first (which states trigger which useEffect hooks), keep calculation logic atomic in single location, add unit tests for physics BEFORE refactoring, test calculations output byte-for-byte after each phase. **Phase:** Phase 1 (Analysis), Phase 2 (Test Infrastructure).

2. **Corrupting localStorage state persistence** — Renaming state variables during refactoring breaks localStorage schema, causing settings reset to defaults or crashes on load when users have old saved data. **Prevention:** Document schema version, implement migration code BEFORE changing state structure, test with old data format seeded in localStorage, don't remove old keys immediately. **Phase:** Phase 1 (Analysis), Phase 2 (Test Infrastructure), Phase 3 (Refactoring).

3. **Thermodynamic calculation correctness loss** — Physics formulas (Williams line 462, temp drop line 442, energy 467-475) produce wrong results due to floating-point precision loss, premature rounding, or missing intermediate values. **Prevention:** Never round in calculation functions (only at display layer), test with known inputs (60g egg, 100°C = ~6.5 minutes), keep physics functions isolated and pure, validate outputs match original to 4 decimal places. **Phase:** Phase 2 (Test Infrastructure), Phase 3 (Refactoring).

4. **Timer state machine corruption** — Refactoring breaks 6-state timer logic (timerActive, timerPaused, timerComplete, timerRemaining, etc.) causing invalid combinations like timer running after stop, multiple intervals (memory leak), or NaN remaining time. **Prevention:** Document state machine transitions before refactoring, convert to useReducer pattern for single source of truth, test all state transitions, keep timer logic atomic in one hook. **Phase:** Phase 1 (Analysis), Phase 2 (Test Infrastructure), Phase 3 (Refactoring).

5. **i18n string overflow on mobile** — German/French strings 40-60% longer than English cause button overflow, label wrap, settings dialog overflow on 320px mobile screens. German "Weichgekocht" wraps, consistency tiles break grid, language buttons become unreadable. **Prevention:** Test in longest language (German) at 320px width, use flex-wrap for grids, implement min-w/flex-1 for space sharing, test all 6 languages at multiple viewport widths. **Phase:** Phase 4 (Mobile Fixes), Phase 5 (Visual Testing).

## Implications for Roadmap

Based on research, recommended 7-phase structure with clear dependencies and risk mitigation:

### Phase 1: Analysis & Dependency Mapping
**Rationale:** Establish foundation before any code changes. Map complete state dependency graph, document useState/useEffect interactions, identify calculation clusters, document timer state machine, list localStorage schema version 1. Identify which state changes trigger which recalculations. This prevents breaking hidden dependencies during extraction.

**Delivers:**
- Complete state dependency graph diagram (which state changes trigger which recalculations)
- localStorage schema documentation with version
- Timer state machine diagram with all valid transitions
- Extraction priority ordering (safest first: constants → physics → formatters → audio → services → hooks)

**Addresses:** All critical pitfalls (dependency breaks, localStorage corruption, calculation loss, timer state, i18n detection)

**Avoids:** Pitfall #1 (broken dependencies), Pitfall #2 (localStorage corruption), Pitfall #4 (timer state corruption)

**Research flags:** Skip research-phase; analysis is straightforward codebase review with clear artifacts. Use `/gsd:map-codebase` to generate parallel analysis if team wants validation.

---

### Phase 2: Test Infrastructure & Physics Validation
**Rationale:** Add test runner and establish golden standard for physics calculations BEFORE refactoring. Once physics tests pass with original monolith, any refactoring that breaks tests is immediately detected. Establish testing patterns (React Testing Library, Vitest config, test file structure).

**Delivers:**
- Vitest configured with jsdom, coverage (v8), watch mode
- React Testing Library setup with matchers, cleanup hooks
- 100% test coverage for physics functions (5 core functions: boilingPoint, pressure, altitude, time, energy)
- 80%+ test coverage for utility functions (formatters, converters, validators)
- 20+ known-good calculation test cases (with expected outputs documented from original monolith)
- Basic component smoke tests (app renders, inputs update state)
- localStorage persistence tests (read/write, old schema handling)
- Timer state transition tests (start → pause → resume → stop all work)

**Uses:** Vitest ^4.0.18, @testing-library/react, jsdom, @vitest/coverage-v8

**Implements:** Test pyramid foundation (unit tests bottom), pure function testing pattern, integration test pattern

**Avoids:** Pitfall #3 (calculation loss through tests), Pitfall #2 (localStorage through versioning tests), Pitfall #4 (timer state through transition tests)

**Research flags:** Standard patterns (skip research); Vitest config well-documented. May need brief investigation into calculation precision (4 decimal places vs 2 decimal places) based on original outputs.

---

### Phase 3: Component Extraction & Refactoring (7 sub-phases)
**Rationale:** Incremental extraction with testing at each step. Start with safest (independent functions), end with highest-risk (state dependencies). Each sub-phase is small enough to commit and verify independently.

**Sub-phases:**
- **3.1 Extract utilities** (constants.js, physics.js, formatters.js, audio.js) — Pure functions, zero risk
- **3.2 Extract services** (meteoApi.js, geocodingApi.js) — API boundaries, mockable
- **3.3 Extract hooks (phase 1)** (useUnitConversion, useSettings) — State-aware but isolated
- **3.4 Extract hooks (phase 2)** (useTimerLogic, useLocationPressure) — Async logic, complex state
- **3.5 Extract core physics hook** (usePhysicsCalculations) — CRITICAL: must output match original byte-for-byte
- **3.6 Orchestration hook** (useEggCalculator) — Compose all hooks into single interface
- **3.7 UI components** (ResultDisplay, SettingsPanel, TimerOverlay, others) — Presentational, safest to extract last

**Delivers:**
- 1,351-line monolith → 200-line main component + 15+ focused components + 5 custom hooks + 3 utility modules
- All component files <400 lines each
- All hooks <150 lines of logic
- EggCalculator.jsx reduced from 1,351 → 200 lines
- Identical visual behavior (pixel-perfect screenshots before/after)
- All tests passing (60%+ coverage maintained)

**Implements:** Custom hooks pattern, pure utility functions, service layer, container/presentational split, dependency graph (acyclic)

**Avoids:** All pitfalls through incremental approach (test after each sub-phase, can revert specific commits)

**Research flags:** No research needed; extraction patterns well-established in React community. ESLint react-hooks plugin will catch violations during extraction.

---

### Phase 4: Mobile Responsive Fixes
**Rationale:** Fix known overflow issues (button wrapping, i18n text, touch targets) with modern responsive patterns (container queries, flex-wrap, responsive sizing).

**Delivers:**
- No horizontal scroll on 320px width (tested on iPhone SE, Android devices)
- All buttons meet 44×44px touch target minimum (mobile HIG, Material Design standards)
- i18n text doesn't break layout in any language (tested German at 320px)
- Language buttons wrap gracefully instead of overflow (flex-wrap, min-w-*)
- Settings dialog responsive at all breakpoints (mobile/tablet/desktop)
- Container queries for component-scoped responsive behavior
- Tailwind responsive classes verified across 3 tiers: mobile (<640px), tablet (640-1024px), desktop (>1024px)

**Addresses:** Pitfall #5 (i18n mobile overflow), touch target standards (differentiator)

**Research flags:** Standard patterns (skip research); Tailwind responsive design is well-documented. May need device testing validation.

---

### Phase 5: Accessibility & Polish
**Rationale:** WCAG 2.1 AA compliance (keyboard navigation, screen readers, color contrast, ARIA labels), performance audit, visual regression testing.

**Delivers:**
- Keyboard navigation functional (tab order, focus visible, no keyboard traps)
- Screen reader compatibility (input labels, ARIA attributes for dynamic content)
- Color contrast ≥4.5:1 (verified with axe-core)
- Error boundaries prevent white-screen crashes
- Input validation prevents invalid calculations (range checks, type safety)
- Performance: bundle <200KB gzipped, TTI <3s on 3G
- Visual regression tests (Playwright or manual) verifying no unintended layout changes
- All 6 languages tested at multiple viewport sizes

**Implements:** Error boundaries pattern, input validation pattern, accessibility testing pattern

**Avoids:** No critical pitfalls addressed here (polish phase); catches UX issues like notification permission timing (Phase 4 timer optimization).

**Research flags:** Accessibility standards well-documented (WCAG 2.1 AA); may need axe-core integration if not familiar.

---

### Phase 6: Timer Optimization & Edge Cases
**Rationale:** Harden timer logic (state machine correctness, audio/notification permissions, mobile touch events, race conditions in GPS/API calls).

**Delivers:**
- Timer state machine visually correct (converts boolean states to single state enum)
- Audio/notification permissions deferred to contextual moment (request when user starts timer, not on load)
- Mobile touch optimization (touch-action: manipulation, 48px button heights, no zoom delay)
- GPS/API race conditions eliminated (AbortController, debouncing, in-flight request tracking)
- Error handling for network failures (retry logic, graceful degradation to manual input)
- Timer persists in localStorage so resume-ability on page refresh (if user desires)

**Implements:** useReducer pattern for state machine, AbortController pattern for async, error handling pattern

**Avoids:** Pitfall #4 (timer state corruption through useReducer), Pitfall #7 (race conditions through AbortController), Pitfall #10 (mobile touch through CSS + size fixes)

**Research flags:** No research needed; patterns well-documented. May test edge cases (rapid GPS clicks, slow network, component unmount during fetch).

---

### Phase 7: Final Verification & Optimization
**Rationale:** Full regression testing, bundle analysis, performance profiling, ensure no unintended changes and optimizations are appropriate (React.memo only where profiling shows need).

**Delivers:**
- Full end-to-end regression test (all features working, calculations match original)
- Bundle size analysis (should be same or smaller due to tree-shaking)
- React DevTools performance profiling (no unnecessary re-renders, no memory leaks after 20 timer cycles)
- 60-80% test coverage (calculation 100%, hooks 60%, components 40%)
- Lighthouse score ≥90 on all metrics
- Documentation updated (architecture diagrams, component responsibility matrix)
- Ready for production deployment

**Delivers:** Production-ready app with hardened architecture

**Research flags:** Standard practices (skip research).

---

## Phase Ordering Rationale

1. **Analysis first (Phase 1)** — Reveals hidden state dependencies that refactoring will break. Prevents catastrophic bugs in later phases.

2. **Tests before code changes (Phase 2)** — Establishes golden standard. Any refactoring that breaks tests is immediately detected. Tests serve as regression fence.

3. **Extract safest first, risky last (Phase 3)** — Pure functions have zero risk; state dependencies have high risk. Progression builds confidence.

4. **Mobile fixes early (Phase 4)** — Users see these immediately. Responsive design is component responsibility, easier to test after extraction.

5. **Accessibility + polish (Phase 5)** — Builds on working architecture. No point optimizing if core is broken.

6. **Edge cases + hardening (Phase 6)** — Timer, race conditions, permissions are nice-to-have, not blocking. Comes after core is solid.

7. **Final verification (Phase 7)** — Catches integration issues. Performance profiling only meaningful after refactoring complete.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All versions verified via npm registry 2026-01-30. Vitest is de facto standard for Vite projects. React Testing Library industry consensus. jsdom is mature. |
| Features | **HIGH** | Based on established React/web app quality standards (Apple HIG, Material Design, WCAG 2.1). Coverage benchmarks from Google/ThoughtWorks. |
| Architecture | **HIGH** | Direct codebase analysis. 1,351 lines measured, 47 useState hooks counted, existing translation extraction validates patterns. Phase sequencing from established React refactoring best practices. |
| Pitfalls | **HIGH** | Based on codebase analysis + React ecosystem patterns. Each pitfall has specific line numbers (e.g., useState chain lines 420-423). Prevention strategies from established practices. |
| Phase ordering | **MEDIUM** | Logical dependencies inferred from architecture research, but actual phase timing depends on team velocity. Risk mitigation (tests before refactoring) is solid, ordering is sound. |

**Overall confidence:** **HIGH** — Research is specific, well-sourced, and directly applicable. Recommendations are concrete (not vague), have clear verification steps, and align with React ecosystem standards.

### Gaps to Address

1. **Calculation precision validation** — Need to establish exact precision (2 vs 4 decimal places) for physics outputs. **Action:** During Phase 2, generate 20+ test cases from original monolith, document expected outputs, use those as regression baseline.

2. **localStorage quota headroom** — Current ~2KB, but not quantified. May need to trim if PWA/offline features added. **Action:** Measure actual localStorage size in Phase 1 analysis, document quota usage.

3. **API rate limits** — Open-Meteo and Nominatim have undocumented rate limits. Unknown if single user hitting limits. **Action:** Phase 3.2 (services extraction) should add retry + backoff logic, test with rapid clicks.

4. **Device/browser testing** — Responsive design tested in Chrome DevTools, but needs real iPhone/Android validation. **Action:** Phase 4 (mobile fixes) includes real device testing checklist.

5. **Internationalization coverage** — Only 6 languages tested (EN, DE, FR, IT, ES, PT). Unknown if expansion planned. **Action:** Document i18n boundaries in Phase 1, identify if translation strings need resizing.

6. **Visual regression tooling** — Playwright vs Chromatic vs manual screenshots not specified. **Action:** Phase 5 (visual testing) should choose tooling based on team preference (budget/maintenance).

## Sources

### Primary (HIGH confidence)

**Stack Research (STACK.md):**
- npm registry verification (2026-01-30): vitest@4.0.18, @testing-library/react@16.3.2, jsdom@27.4.0, all versions verified
- Official documentation: Vitest (vitest.dev), React Testing Library (testing-library.com/react)
- React ecosystem consensus: Vitest as de facto standard for Vite projects, React Testing Library as industry standard

**Features Research (FEATURES.md):**
- Apple Human Interface Guidelines (developer.apple.com/design/hig) — Touch targets 44×44px minimum
- Material Design guidelines (material.io/design) — Touch target standards
- WCAG 2.1 AA standards (w3.org/WAI/WCAG21) — Accessibility baseline
- Google Testing Blog + ThoughtWorks Technology Radar — Coverage benchmarks by app type (utility apps 60-80%)
- React Testing Library documentation (Kent C. Dodds "Testing Trophy" model) — Test pyramid structure

**Architecture Research (ARCHITECTURE.md):**
- Direct codebase analysis: `/Users/beff/_workspace/egg/egg-calculator.jsx` (1,351 lines)
- React official documentation (react.dev/learn) — Custom hooks, component composition patterns
- Existing successful extraction: `/Users/beff/_workspace/egg/useTranslation.js` — Validates extraction patterns work for this codebase

**Pitfalls Research (PITFALLS.md):**
- Codebase line-by-line analysis (useState hooks, useEffect chains, localStorage schema, timer state machine, i18n strings)
- React ecosystem patterns: hooks best practices, testing patterns, refactoring strategies
- Established anti-patterns documentation: "Over-abstraction", "props drilling", circular dependencies

### Secondary (MEDIUM confidence)

- Tailwind CSS documentation (container queries, responsive design) — Less mature than core patterns but browser support widespread
- Training data (knowledge cutoff January 2025) — React refactoring best practices, ecosystem trends

### Tertiary (LOW confidence)

- Assumed rate limits for Open-Meteo, Nominatim APIs — Not verified; needs testing during Phase 3
- Assumed browser feature support (geolocation, Web Audio) — Modern browsers have it, but Safari/Firefox edge cases possible
- Assumed team familiarity with Vitest — If team wants Jest, slight migration effort needed

---

*Research completed: 2026-01-30*
*Ready for roadmap: yes*
*Confidence: HIGH — All recommendations specific, well-sourced, and applicable to this project's context*
