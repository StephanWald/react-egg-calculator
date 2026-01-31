# Requirements Archive: v1 Hardening

**Archived:** 2026-01-31
**Status:** SHIPPED

This is the archived requirements specification for v1 Hardening.
For current requirements, see `.planning/REQUIREMENTS.md` (created for next milestone).

---

**Defined:** 2026-01-30
**Core Value:** Accurate egg cooking times based on real physics — thermodynamic calculations must remain correct through all refactoring

## v1 Requirements

Requirements for hardening milestone. Each maps to roadmap phases.

### Testing

- [x] **TEST-01**: Physics calculations have unit tests covering Williams formula, boiling point from pressure, pressure from boiling point, altitude from pressure, and energy consumption — *Validated: 63 tests at 100% coverage*
- [x] **TEST-02**: Formatter functions have unit tests for temperature, volume, weight, pressure, and time display formatting — *Validated: 63 tests covering all 7 formatters*
- [x] **TEST-03**: Vitest test infrastructure configured with jsdom, coverage reporting (v8), and watch mode — *Validated: Vitest 4.0.18, RTL 16.3.2, 3 npm scripts*
- [x] **TEST-04**: Custom hooks have tests for timer logic, location/pressure detection, settings persistence, and unit conversion — *Validated: 40 hook tests via renderHook*

### Refactoring

- [x] **REFAC-01**: Physics calculations extracted into pure functions in dedicated module (independently importable, no React dependency) — *Validated: physics.js, 4 exports, 150 lines*
- [x] **REFAC-02**: Formatting/conversion utilities and constants extracted into separate modules — *Validated: constants.js + converters.js + formatters.js, all at 100% coverage*
- [x] **REFAC-03**: UI sections extracted into focused components (SettingsPanel, TimerOverlay, ConsistencyPicker, ResultDisplay, EggInputs, LocationPressure, ConfigDialog) — *Validated: 7 components, main reduced to 372 lines*
- [x] **REFAC-04**: API integrations extracted into service modules (Open-Meteo pressure, Nominatim geocoding) — *Validated: meteoApi.js + geocodingApi.js, 11 tests*

### Mobile Responsiveness

- [x] **MOBI-01**: Tile/button groups (stove type, consistency, temperature, egg size selectors) do not overflow on mobile screens — *Validated: responsive grids with mobile-first breakpoints*
- [x] **MOBI-02**: No horizontal scroll at 320px viewport width across all pages and states — *Validated: mobile-first padding, stacking layouts*
- [x] **MOBI-03**: i18n text in all 6 languages (EN, DE, FR, ES, IT, PT) does not break layout at any viewport size — *Validated: translations shortened, human verified*
- [x] **MOBI-04**: All interactive elements meet 44x44px minimum touch target size — *Validated: 20+ instances of min-h-[44px], timer uses 56px*

### Error Handling & Polish

- [x] **QUAL-01**: Error boundaries wrap major sections to prevent white-screen crashes — *Validated: ErrorBoundary at 3 strategic locations*
- [x] **QUAL-02**: Input validation prevents invalid physics calculations (range checks on temperature hierarchy, weight > 0, pressure bounds) — *Validated: pressure clamped 870-1084 hPa*
- [x] **QUAL-03**: Keyboard navigation functional with correct tab order, visible focus indicators, and no keyboard traps — *Validated: 23 focus-visible instances, escape handlers*

## v2 Requirements (Deferred)

Tracked but not in v1 scope. Carried forward to next milestone planning.

### Refactoring (Extended)

- **REFAC-05**: Custom hooks extracted for timer logic, location/pressure, settings persistence, unit conversion, and physics calculations
- **REFAC-06**: Orchestration hook (useEggCalculator) composing all domain hooks into single interface
- **REFAC-07**: Main EggCalculator component reduced to ~200 lines (layout and hook composition only)

### Mobile (Extended)

- **MOBI-05**: Container queries for component-scoped responsive behavior
- **MOBI-06**: Settings dialog fully responsive across mobile/tablet/desktop breakpoints

### Timer & Edge Cases

- **TIMR-01**: Timer state machine converted to useReducer pattern (single source of truth)
- **TIMR-02**: GPS/API race conditions handled with AbortController and debouncing
- **TIMR-03**: Audio/notification permission timing optimized (contextual request)

### Quality (Extended)

- **QUAL-04**: WCAG 2.1 AA color contrast (4.5:1 ratio verified)
- **QUAL-05**: Screen reader compatibility (ARIA labels for dynamic content)
- **QUAL-06**: Visual regression tests (Playwright or manual screenshots)
- **QUAL-07**: 60-80% overall test coverage target

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features or capabilities | Hardening milestone only — no new user-facing features |
| TypeScript migration | Keep JavaScript, focus on structure and tests |
| New language additions | Existing 6 languages are sufficient |
| Backend or server-side changes | App remains fully static/client-side |
| Performance optimization | Beyond what refactoring naturally improves |
| Complete rewrite | Incremental refactoring preferred over big-bang rewrite |
| Snapshot tests everywhere | Brittle, prefer behavior-driven tests |
| Storybook | Only justified if component library grows significantly |
| E2E tests (Playwright) | Deferred — unit and integration tests are priority |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 2 | Complete |
| TEST-02 | Phase 5 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 4 | Complete |
| REFAC-01 | Phase 3 | Complete |
| REFAC-02 | Phase 3 | Complete |
| REFAC-03 | Phase 5 | Complete |
| REFAC-04 | Phase 4 | Complete |
| MOBI-01 | Phase 6 | Complete |
| MOBI-02 | Phase 6 | Complete |
| MOBI-03 | Phase 6 | Complete |
| MOBI-04 | Phase 6 | Complete |
| QUAL-01 | Phase 7 | Complete |
| QUAL-02 | Phase 7 | Complete |
| QUAL-03 | Phase 7 | Complete |

## Milestone Summary

**Shipped:** 15 of 15 v1 requirements
**Adjusted:** None — all requirements delivered as originally specified
**Dropped:** None

---
*Archived: 2026-01-31 as part of v1 milestone completion*
*Requirements defined: 2026-01-30*
