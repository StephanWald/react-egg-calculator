# Requirements: Egg Calculator Hardening

**Defined:** 2026-01-30
**Core Value:** Accurate egg cooking times based on real physics — thermodynamic calculations must remain correct through all refactoring

## v1 Requirements

Requirements for hardening milestone. Each maps to roadmap phases.

### Testing

- [ ] **TEST-01**: Physics calculations have unit tests covering Williams formula, boiling point from pressure, pressure from boiling point, altitude from pressure, and energy consumption
- [ ] **TEST-02**: Formatter functions have unit tests for temperature, volume, weight, pressure, and time display formatting
- [ ] **TEST-03**: Vitest test infrastructure configured with jsdom, coverage reporting (v8), and watch mode
- [ ] **TEST-04**: Custom hooks have tests for timer logic, location/pressure detection, settings persistence, and unit conversion

### Refactoring

- [ ] **REFAC-01**: Physics calculations extracted into pure functions in dedicated module (independently importable, no React dependency)
- [ ] **REFAC-02**: Formatting/conversion utilities and constants extracted into separate modules
- [ ] **REFAC-03**: UI sections extracted into focused components (SettingsPanel, TimerOverlay, ConsistencyPicker, ResultDisplay, EggInputs, LocationPressure, ConfigDialog)
- [ ] **REFAC-04**: API integrations extracted into service modules (Open-Meteo pressure, Nominatim geocoding)

### Mobile Responsiveness

- [ ] **MOBI-01**: Tile/button groups (stove type, consistency, temperature, egg size selectors) do not overflow on mobile screens
- [ ] **MOBI-02**: No horizontal scroll at 320px viewport width across all pages and states
- [ ] **MOBI-03**: i18n text in all 6 languages (EN, DE, FR, ES, IT, PT) does not break layout at any viewport size
- [ ] **MOBI-04**: All interactive elements meet 44x44px minimum touch target size

### Error Handling & Polish

- [ ] **QUAL-01**: Error boundaries wrap major sections to prevent white-screen crashes
- [ ] **QUAL-02**: Input validation prevents invalid physics calculations (range checks on temperature hierarchy, weight > 0, pressure bounds)
- [ ] **QUAL-03**: Keyboard navigation functional with correct tab order, visible focus indicators, and no keyboard traps

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

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

Explicitly excluded. Documented to prevent scope creep.

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

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |
| REFAC-01 | — | Pending |
| REFAC-02 | — | Pending |
| REFAC-03 | — | Pending |
| REFAC-04 | — | Pending |
| MOBI-01 | — | Pending |
| MOBI-02 | — | Pending |
| MOBI-03 | — | Pending |
| MOBI-04 | — | Pending |
| QUAL-01 | — | Pending |
| QUAL-02 | — | Pending |
| QUAL-03 | — | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 (awaiting roadmap)

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-30 after initial definition*
