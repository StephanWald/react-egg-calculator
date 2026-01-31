---
phase: 04-services-hooks
plan: 01
subsystem: api, hooks
tags: [fetch, localStorage, react-hooks, open-meteo, nominatim, renderHook]

# Dependency graph
requires:
  - phase: 01-test-infrastructure
    provides: Vitest + jsdom + @testing-library/react configured
  - phase: 03-utilities-extraction
    provides: Module patterns (constants.js, formatters.js) and parameter-based design precedent
provides:
  - "fetchSurfacePressure async wrapper for Open-Meteo pressure API"
  - "fetchLocationName async wrapper for Nominatim geocoding API"
  - "useSettings hook with localStorage persistence, merge-with-defaults, auto-persist, reset"
  - "useUnitConversion hook with parameter-based unit preference state"
  - "DEFAULTS object for settings baseline"
affects: [04-02 (useLocationPressure consumes meteoApi/geocodingApi), 04-03 (useTimerLogic), 05-component-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Thin API service modules: plain async functions, no React imports"
    - "Hook persistence pattern: lazy initializer + useEffect auto-save + useCallback handlers"
    - "Parameter-based hooks: useUnitConversion accepts initial values instead of reading internal state"
    - "renderHook testing pattern for isolated hook tests"

key-files:
  created:
    - services/meteoApi.js
    - services/geocodingApi.js
    - hooks/useSettings.js
    - hooks/useUnitConversion.js
    - test/services/meteoApi.test.js
    - test/services/geocodingApi.test.js
    - test/hooks/useSettings.test.js
    - test/hooks/useUnitConversion.test.js
  modified: []

key-decisions:
  - "Thin API wrappers with no retries/caching per CONTEXT decision"
  - "useSettings uses single state object (not individual useState) to avoid infinite save loops"
  - "resetSettings allows auto-persist to re-save defaults (reset clears custom values, not all persistence)"
  - "useUnitConversion is parameter-based, decoupled from useSettings (Phase 3 pattern)"

patterns-established:
  - "API service: export async function, throw on error or return null for optional data"
  - "Hook with persistence: useState lazy init, useEffect auto-persist, useCallback for stable refs"
  - "Test services with vi.spyOn(global, fetch), test hooks with renderHook + act"

# Metrics
duration: 2min
completed: 2026-01-31
---

# Phase 4 Plan 01: API Services & Foundation Hooks Summary

**Open-Meteo and Nominatim API wrappers plus useSettings (localStorage persistence) and useUnitConversion (parameter-based unit state) hooks with 25 tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-31T01:46:40Z
- **Completed:** 2026-01-31T01:48:50Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- Extracted Open-Meteo pressure API and Nominatim geocoding API into thin async service modules with zero React dependencies
- Created useSettings hook with lazy localStorage loading, default merging, auto-persist on change, and reset capability
- Created useUnitConversion hook with parameter-based initialization following Phase 3 formatter pattern
- All 25 new tests pass, full suite of 168 tests passes with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create API service modules with tests** - `f09532a` (feat)
2. **Task 2: Create useSettings and useUnitConversion hooks with tests** - `425992c` (feat)

## Files Created/Modified
- `services/meteoApi.js` - Async wrapper for Open-Meteo surface pressure API
- `services/geocodingApi.js` - Async wrapper for Nominatim reverse geocoding API (graceful error handling, returns null)
- `hooks/useSettings.js` - Settings persistence hook with lazy init, auto-persist, merge with DEFAULTS, reset
- `hooks/useUnitConversion.js` - Unit preference state hook (tempUnit, volumeUnit, weightUnit, pressureUnit)
- `test/services/meteoApi.test.js` - 5 tests: success, URL params, HTTP error, network error, missing elevation
- `test/services/geocodingApi.test.js` - 6 tests: city/town/village fallback, HTTP error, missing data, network error
- `test/hooks/useSettings.test.js` - 7 tests: defaults, load, merge, persist, reset, corrupt data, partial update
- `test/hooks/useUnitConversion.test.js` - 7 tests: defaults, overrides, all 4 setters, units convenience object

## Decisions Made
- Thin API wrappers with no retries/caching -- per CONTEXT decision, always fetch fresh
- geocodingApi returns null on all errors (informational-only) vs meteoApi which throws (critical data)
- useSettings uses single state object to avoid infinite save loop pitfall (Research pitfall 7)
- resetSettings does not prevent auto-persist from re-saving defaults -- this is correct behavior since the effect fires on any settings change
- useUnitConversion is decoupled from useSettings, accepts initial values as parameter (following Phase 3 pattern)
- DEFAULTS exported as named export for test reference and future hook composition

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed resetSettings test expectation for localStorage**
- **Found during:** Task 2 (useSettings tests)
- **Issue:** Test expected `localStorage.getItem()` to return null after resetSettings, but the useEffect auto-persist immediately re-saves the defaults after state resets
- **Fix:** Changed test to verify localStorage contains default values (not null) after reset, which reflects the actual correct behavior
- **Files modified:** test/hooks/useSettings.test.js
- **Verification:** Test passes, confirms reset clears custom values and restores defaults
- **Committed in:** 425992c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test expectation)
**Impact on plan:** Minimal -- test expectation corrected to match actual hook behavior. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- services/meteoApi.js and services/geocodingApi.js ready for consumption by useLocationPressure hook (Plan 02)
- hooks/useSettings.js establishes the persistence pattern for component refactor (Phase 05)
- hooks/useUnitConversion.js ready for composition with formatters in component
- All module boundaries clean: services have zero React imports, hooks follow useTranslation.js pattern

---
*Phase: 04-services-hooks*
*Completed: 2026-01-31*
