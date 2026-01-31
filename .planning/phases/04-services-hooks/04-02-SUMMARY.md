---
phase: 04-services-hooks
plan: 02
subsystem: hooks
tags: [react-hooks, timer, geolocation, gps, atmospheric-pressure, renderHook, fake-timers, notification-api, web-audio]

# Dependency graph
requires:
  - phase: 01-test-infrastructure
    provides: Vitest + jsdom + @testing-library/react configured
  - phase: 02-physics-validation
    provides: physics.js with atmospheric calculation functions
  - phase: 04-services-hooks (plan 01)
    provides: fetchSurfacePressure, fetchLocationName service modules
provides:
  - "useTimerLogic hook with countdown, pause/resume, notification, vibration, and audio side effects"
  - "useLocationPressure hook orchestrating GPS -> Open-Meteo -> Nominatim with manual entry support"
affects: [04-03 (useCalculation consumes both hooks' state), 05-component-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Class-based mocks for browser constructors (Notification, AudioContext, Audio) in Vitest tests"
    - "vi.advanceTimersByTimeAsync for timer hooks to avoid Promise/timer deadlocks"
    - "vi.mock() for service module mocking in hook tests"
    - "Error code pattern: hooks return error codes, component maps to translated strings"
    - "Altitude fallback chain: GPS altitude > API elevation > calculated from pressure"

key-files:
  created:
    - hooks/useTimerLogic.js
    - hooks/useLocationPressure.js
    - test/hooks/useTimerLogic.test.js
    - test/hooks/useLocationPressure.test.js
  modified: []

key-decisions:
  - "Timer hook owns all side effects (notification, vibration, audio) — triggered by state transitions"
  - "Notification options passed as parameters for translation-agnostic hooks"
  - "Location hook returns error CODES not translated strings (PERMISSION_DENIED, POSITION_UNAVAILABLE, LOCATION_ERROR)"
  - "Class-based mocks for Notification/AudioContext/Audio instead of vi.fn() — vi.fn() cannot be used with `new`"
  - "vi.mock() for service imports in location hook tests — cleaner than vi.spyOn(global, 'fetch')"

patterns-established:
  - "Timer testing: vi.useFakeTimers + vi.advanceTimersByTimeAsync + await act(async => {})"
  - "Geolocation testing: Object.defineProperty(navigator, 'geolocation', ...) with save/restore"
  - "Hook error pattern: return error codes, let component translate"
  - "Constructor mock pattern: use real class definitions, not vi.fn(), for APIs invoked with `new`"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 4 Plan 02: Complex Hooks Summary

**useTimerLogic countdown hook with notification/vibration/audio side effects and useLocationPressure GPS-to-pressure orchestration hook with 26 tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T01:52:10Z
- **Completed:** 2026-01-31T01:55:24Z
- **Tasks:** 2
- **Files created:** 4

## Accomplishments
- Extracted timer countdown logic with full lifecycle (start/stop/pause/resume/dismiss) and all browser side effects (Notification, vibration, Web Audio beeps, base64 audio fallback)
- Extracted GPS -> Open-Meteo -> Nominatim orchestration with altitude fallback chain and manual pressure/boilingPoint entry
- Both hooks independently testable via renderHook with comprehensive mocking strategies
- All 194 tests pass (168 existing + 26 new) with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useTimerLogic hook with tests** - `96e9c24` (feat)
2. **Task 2: Create useLocationPressure hook with tests** - `a9930f6` (feat)

## Files Created/Modified
- `hooks/useTimerLogic.js` - Timer countdown hook with notification/vibration/audio side effects
- `hooks/useLocationPressure.js` - GPS + pressure + geocoding orchestration hook
- `test/hooks/useTimerLogic.test.js` - 13 tests: lifecycle, side effects, missing APIs, permission request
- `test/hooks/useLocationPressure.test.js` - 13 tests: GPS flow, elevation fallbacks, errors, manual entry, loading state

## Decisions Made
- Timer hook owns ALL side effects (notification, vibration, audio) — they are triggered by timer state transitions, so keeping them in the hook avoids the component needing to watch timerComplete and manually trigger effects
- Notification title/body passed as hook parameters with English defaults — enables translation without coupling hooks to useTranslation
- Location hook returns error codes (PERMISSION_DENIED, POSITION_UNAVAILABLE, LOCATION_ERROR) instead of translated strings — the component maps these to `t()` calls
- Used class-based mocks for Notification/AudioContext/Audio instead of `vi.fn()` — Vitest's `vi.fn()` mock does not support being called with `new`
- Used `vi.mock()` for service module imports in location hook tests — cleaner isolation than spying on global fetch

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Notification/AudioContext/Audio mock pattern for constructor usage**
- **Found during:** Task 1 (useTimerLogic tests)
- **Issue:** `vi.fn().mockImplementation(...)` produces a mock that cannot be invoked with `new` keyword — Vitest error: "mock did not use 'function' or 'class' in its implementation"
- **Fix:** Replaced all `vi.fn()` constructor mocks with real class definitions (`class MockNotification`, `class MockAudioContext`, `class MockAudio`) and tracked calls manually via `_calls` array
- **Files modified:** test/hooks/useTimerLogic.test.js
- **Verification:** All 13 timer tests pass
- **Committed in:** 96e9c24 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in mock pattern)
**Impact on plan:** Minimal — mock strategy adapted to Vitest constraint. No scope creep.

## Issues Encountered
None beyond the mock pattern issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 core hooks now exist: useSettings, useUnitConversion (Plan 01), useTimerLogic, useLocationPressure (Plan 02)
- hooks/useLocationPressure.js imports from services/meteoApi.js and services/geocodingApi.js — service -> hook dependency chain complete
- hooks/useTimerLogic.js is fully self-contained — no service or physics imports needed
- Ready for Plan 03 (useCalculation hook) which will compose physics.js with hook state
- All module boundaries clean for Phase 05 component refactor

---
*Phase: 04-services-hooks*
*Completed: 2026-01-31*
