# Roadmap: Egg Calculator Hardening

## Overview

This roadmap hardens the existing egg calculator through systematic refactoring, comprehensive testing, and mobile improvements. The journey begins by establishing test infrastructure, then proving physics calculations correct before any refactoring. Once validation is in place, we extract the monolithic component into modular architecture (utilities → services/hooks → UI components), fix mobile responsiveness issues, and polish with error handling and accessibility. The core constraint throughout: thermodynamic calculations must remain byte-for-byte identical.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Test Infrastructure** - Vitest/RTL setup with coverage and watch mode
- [ ] **Phase 2: Physics Validation** - Unit tests prove calculations correct before refactoring
- [ ] **Phase 3: Utilities Extraction** - Pure functions (physics, formatters, constants) extracted
- [ ] **Phase 4: Services & Hooks** - API services and custom hooks extracted from component
- [ ] **Phase 5: Component Extraction** - UI sections split into focused components
- [ ] **Phase 6: Mobile Responsiveness** - Fix overflows, touch targets, i18n layout issues
- [ ] **Phase 7: Quality & Polish** - Error boundaries, validation, keyboard navigation

## Phase Details

### Phase 1: Test Infrastructure
**Goal**: Vitest and React Testing Library configured and ready to write tests
**Depends on**: Nothing (first phase)
**Requirements**: TEST-03
**Success Criteria** (what must be TRUE):
  1. `npm test` runs Vitest with jsdom environment
  2. `npm run test:coverage` generates coverage reports via v8
  3. `npm run test:watch` starts watch mode for TDD workflow
  4. React Testing Library matchers available in all test files
  5. Example smoke test proves setup works (app renders without crashing)
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md -- Configure Vitest, RTL, jsdom, coverage, and smoke test

### Phase 2: Physics Validation
**Goal**: All physics calculations have passing unit tests proving correctness
**Depends on**: Phase 1
**Requirements**: TEST-01
**Success Criteria** (what must be TRUE):
  1. Williams formula calculation has 10+ test cases with known-good outputs
  2. Boiling point from pressure calculation tested across altitude range (0-3000m)
  3. Pressure from boiling point calculation tested with inverse verification
  4. Altitude from pressure calculation tested against barometric formula
  5. Energy consumption calculation tested with all heating components
  6. All tests pass at 100% coverage for physics functions
**Plans**: TBD

Plans:
- [ ] 02-01: [Plan description pending]

### Phase 3: Utilities Extraction
**Goal**: Pure functions extracted into independent modules with no React dependencies
**Depends on**: Phase 2
**Requirements**: REFAC-01, REFAC-02
**Success Criteria** (what must be TRUE):
  1. Physics calculations importable from dedicated module (physics.js)
  2. Formatter/converter functions importable from utilities module (formatters.js, converters.js)
  3. Constants extracted into constants.js (no magic numbers in components)
  4. All extracted functions pass existing tests without modification
  5. Main component still renders identically (visual regression verified)
**Plans**: TBD

Plans:
- [ ] 03-01: [Plan description pending]

### Phase 4: Services & Hooks
**Goal**: API services and custom hooks extracted from monolithic component
**Depends on**: Phase 3
**Requirements**: REFAC-04, TEST-04
**Success Criteria** (what must be TRUE):
  1. Open-Meteo pressure API wrapped in service module (meteoApi.js)
  2. Nominatim geocoding wrapped in service module (geocodingApi.js)
  3. Timer logic extracted into useTimerLogic hook with tests
  4. Location/pressure detection extracted into useLocationPressure hook with tests
  5. Settings persistence extracted into useSettings hook with localStorage tests
  6. Unit conversion extracted into useUnitConversion hook with tests
  7. All hooks independently testable (no component mounting required)
**Plans**: TBD

Plans:
- [ ] 04-01: [Plan description pending]

### Phase 5: Component Extraction
**Goal**: UI sections extracted into focused components under 400 lines each
**Depends on**: Phase 4
**Requirements**: REFAC-03, TEST-02
**Success Criteria** (what must be TRUE):
  1. SettingsPanel component extracted with props interface
  2. TimerOverlay component extracted with timer state props
  3. ConsistencyPicker component extracted with selection callback
  4. ResultDisplay component extracted with calculation results props
  5. EggInputs component extracted with input change handlers
  6. LocationPressure component extracted with GPS/pressure state
  7. ConfigDialog component extracted with settings props
  8. Main EggCalculator component reduced to under 400 lines
  9. Formatter functions have unit tests for all format types (temp, volume, weight, pressure, time)
**Plans**: TBD

Plans:
- [ ] 05-01: [Plan description pending]

### Phase 6: Mobile Responsiveness
**Goal**: App works without overflow or layout breaks on all mobile viewports
**Depends on**: Phase 5
**Requirements**: MOBI-01, MOBI-02, MOBI-03, MOBI-04
**Success Criteria** (what must be TRUE):
  1. Tile/button groups (stove type, consistency, temperature, egg size) do not overflow on 320px viewport
  2. No horizontal scroll at 320px width across all app states
  3. All 6 languages (EN, DE, FR, ES, IT, PT) render without breaking layout at mobile width
  4. All interactive elements meet 44x44px minimum touch target size
  5. Settings dialog responsive at mobile/tablet/desktop breakpoints
**Plans**: TBD

Plans:
- [ ] 06-01: [Plan description pending]

### Phase 7: Quality & Polish
**Goal**: Error handling, input validation, and accessibility meet production standards
**Depends on**: Phase 6
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. Error boundaries wrap major sections (app continues after component error)
  2. Input validation prevents invalid physics calculations (temp hierarchy, weight > 0, pressure bounds)
  3. Keyboard navigation functional with correct tab order
  4. Visible focus indicators on all interactive elements
  5. No keyboard traps (can escape all dialogs/overlays with keyboard)
**Plans**: TBD

Plans:
- [ ] 07-01: [Plan description pending]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Test Infrastructure | 0/1 | Planning complete | - |
| 2. Physics Validation | 0/? | Not started | - |
| 3. Utilities Extraction | 0/? | Not started | - |
| 4. Services & Hooks | 0/? | Not started | - |
| 5. Component Extraction | 0/? | Not started | - |
| 6. Mobile Responsiveness | 0/? | Not started | - |
| 7. Quality & Polish | 0/? | Not started | - |
