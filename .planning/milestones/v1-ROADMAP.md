# Milestone v1: Hardening

**Status:** SHIPPED 2026-01-31
**Phases:** 1-7
**Total Plans:** 18

## Overview

This milestone hardened the existing egg calculator through systematic refactoring, comprehensive testing, and mobile improvements. The journey began by establishing test infrastructure, then proving physics calculations correct before any refactoring. Once validation was in place, we extracted the monolithic component into modular architecture (utilities -> services/hooks -> UI components), fixed mobile responsiveness issues, and polished with error handling and accessibility. The core constraint throughout: thermodynamic calculations remained byte-for-byte identical.

## Phases

### Phase 1: Test Infrastructure

**Goal**: Vitest and React Testing Library configured and ready to write tests
**Depends on**: Nothing (first phase)
**Requirements**: TEST-03
**Success Criteria**:
  1. `npm test` runs Vitest with jsdom environment
  2. `npm run test:coverage` generates coverage reports via v8
  3. `npm run test:watch` starts watch mode for TDD workflow
  4. React Testing Library matchers available in all test files
  5. Example smoke test proves setup works (app renders without crashing)
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md -- Configure Vitest, RTL, jsdom, coverage, and smoke test

### Phase 2: Physics Validation

**Goal**: All physics calculations have passing unit tests proving correctness
**Depends on**: Phase 1
**Requirements**: TEST-01
**Success Criteria**:
  1. Williams formula calculation has 10+ test cases with known-good outputs
  2. Boiling point from pressure calculation tested across altitude range (0-3000m)
  3. Pressure from boiling point calculation tested with inverse verification
  4. Altitude from pressure calculation tested against barometric formula
  5. Energy consumption calculation tested with all heating components
  6. All tests pass at 100% coverage for physics functions
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Extract physics functions from component into physics.js module
- [x] 02-02-PLAN.md -- Comprehensive unit tests for all physics calculations (40+ test cases)

### Phase 3: Utilities Extraction

**Goal**: Pure functions extracted into independent modules with no React dependencies
**Depends on**: Phase 2
**Requirements**: REFAC-01, REFAC-02
**Success Criteria**:
  1. Physics calculations importable from dedicated module (physics.js)
  2. Formatter/converter functions importable from utilities module (formatters.js, converters.js)
  3. Constants extracted into constants.js (no magic numbers in components)
  4. All extracted functions pass existing tests without modification
  5. Main component still renders identically (visual regression verified)
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md -- Extract constants and converters into standalone modules with tests
- [x] 03-02-PLAN.md -- Extract formatters, rewire component imports, verify visual parity

### Phase 4: Services & Hooks

**Goal**: API services and custom hooks extracted from monolithic component
**Depends on**: Phase 3
**Requirements**: REFAC-04, TEST-04
**Success Criteria**:
  1. Open-Meteo pressure API wrapped in service module (meteoApi.js)
  2. Nominatim geocoding wrapped in service module (geocodingApi.js)
  3. Timer logic extracted into useTimerLogic hook with tests
  4. Location/pressure detection extracted into useLocationPressure hook with tests
  5. Settings persistence extracted into useSettings hook with localStorage tests
  6. Unit conversion extracted into useUnitConversion hook with tests
  7. All hooks independently testable (no component mounting required)
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md -- API services + useSettings + useUnitConversion with tests
- [x] 04-02-PLAN.md -- useTimerLogic + useLocationPressure hooks with tests
- [x] 04-03-PLAN.md -- Rewire component to use all hooks, verify parity

### Phase 5: Component Extraction

**Goal**: UI sections extracted into focused components under 400 lines each
**Depends on**: Phase 4
**Requirements**: REFAC-03, TEST-02
**Success Criteria**:
  1. SettingsPanel component extracted with props interface
  2. TimerOverlay component extracted with timer state props
  3. ConsistencyPicker component extracted with selection callback
  4. ResultDisplay component extracted with calculation results props
  5. EggInputs component extracted with input change handlers
  6. LocationPressure component extracted with GPS/pressure state
  7. ConfigDialog component extracted with settings props
  8. Main EggCalculator component reduced to under 400 lines
  9. Formatter functions have unit tests for all format types (temp, volume, weight, pressure, time)
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md -- Fill formatter test coverage gaps for all format types
- [x] 05-02-PLAN.md -- Extract ConfigDialog, TimerOverlay, ConsistencyPicker components
- [x] 05-03-PLAN.md -- Extract SettingsPanel, LocationPressure, EggInputs, ResultDisplay components
- [x] 05-04-PLAN.md -- Rewire EggCalculator to use all 7 components, verify parity

### Phase 6: Mobile Responsiveness

**Goal**: App works without overflow or layout breaks on all mobile viewports
**Depends on**: Phase 5
**Requirements**: MOBI-01, MOBI-02, MOBI-03, MOBI-04
**Success Criteria**:
  1. Tile/button groups (stove type, consistency, temperature, egg size) do not overflow on 320px viewport
  2. No horizontal scroll at 320px width across all app states
  3. All 6 languages (EN, DE, FR, ES, IT, PT) render without breaking layout at mobile width
  4. All interactive elements meet 44x44px minimum touch target size
  5. Settings dialog responsive at mobile/tablet/desktop breakpoints
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md -- Foundation: fix Tailwind config, install deps, mobile base CSS, responsive main layout
- [x] 06-02-PLAN.md -- Responsive tile/button grids and touch targets in all 5 components
- [x] 06-03-PLAN.md -- ConfigDialog bottom drawer on mobile, TimerOverlay immersive mobile
- [x] 06-04-PLAN.md -- i18n translation testing at 320px, shortening overflows, human verification

### Phase 7: Quality & Polish

**Goal**: Error handling, input validation, and accessibility meet production standards
**Depends on**: Phase 6
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria**:
  1. Error boundaries wrap major sections (app continues after component error)
  2. Input validation prevents invalid physics calculations (temp hierarchy, weight > 0, pressure bounds)
  3. Keyboard navigation functional with correct tab order
  4. Visible focus indicators on all interactive elements
  5. No keyboard traps (can escape all dialogs/overlays with keyboard)
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md -- Error boundaries at 3 strategic locations + silent pressure input clamping
- [x] 07-02-PLAN.md -- Focus-visible indicators on all interactive elements + keyboard nav verification

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Test Infrastructure | 1/1 | Complete | 2026-01-30 |
| 2. Physics Validation | 2/2 | Complete | 2026-01-30 |
| 3. Utilities Extraction | 2/2 | Complete | 2026-01-30 |
| 4. Services & Hooks | 3/3 | Complete | 2026-01-31 |
| 5. Component Extraction | 4/4 | Complete | 2026-01-31 |
| 6. Mobile Responsiveness | 4/4 | Complete | 2026-01-31 |
| 7. Quality & Polish | 2/2 | Complete | 2026-01-31 |

## Milestone Summary

**Decimal Phases:** None (no urgent insertions required)

**Key Decisions:**
- Vitest over Jest: Native ES modules, Vite integration, minimal config
- Extract physics first: Pure functions easiest to test and most critical to verify
- Object.freeze at two levels: Complete immutability for constant arrays
- Unit parameters on formatters: Makes formatters pure and stateless
- Thin API wrappers: No retries/caching, always fetch fresh
- Single state object for useSettings: Avoids infinite save loop
- Presentational component pattern: All state via props, no internal state
- Bottom drawer on mobile for ConfigDialog: Native mobile pattern with swipe-to-dismiss
- Strategic error boundary placement: App root, ConfigDialog, TimerOverlay only
- Silent input clamping: No error messages for pressure out of range

**Issues Resolved:**
- Monolithic 1,351-line component decomposed into 17 focused modules
- Zero test coverage expanded to 218 tests with 100% on core logic
- Mobile overflow on tile/button groups fixed with responsive grids
- i18n translation overflow fixed by shortening labels for mobile
- Header subtitle overlapping cogwheel on mobile fixed with padding

**Issues Deferred:**
- Custom hooks for physics calculations (REFAC-05, v2)
- Orchestration hook useEggCalculator (REFAC-06, v2)
- Timer state machine with useReducer (TIMR-01, v2)
- WCAG 2.1 AA color contrast verification (QUAL-04, v2)
- Screen reader compatibility (QUAL-05, v2)

**Technical Debt Incurred:**
- None identified during milestone audit

---

_For current project status, see .planning/PROJECT.md_

---
*Archived: 2026-01-31 as part of v1 milestone completion*
