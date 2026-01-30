# Phase 2 Plan 1: Extract Physics Functions Summary

**One-liner:** Extracted 4 thermodynamic functions (boiling point, pressure, altitude, cooking time) from EggCalculator component into standalone physics.js module with named exports.

## Execution Details

| Field | Value |
|-------|-------|
| Phase | 02 |
| Plan | 01 |
| Subsystem | physics |
| Status | Complete |
| Duration | ~2 min |
| Completed | 2026-01-30 |
| Tasks | 2/2 |

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extract physics functions into physics.js | 0aec355 | physics.js |
| 2 | Update EggCalculator to import from physics.js | fde2210 | egg-calculator.jsx |

## What Was Done

### Task 1: Extract physics functions into physics.js
Created `physics.js` with four named exports:
- `calculateBoilingPointFromPressure(pressureHPa)` -- Clausius-Clapeyron linear approximation
- `calculatePressureFromBoilingPoint(tempC)` -- inverse pressure calculation
- `calculateAltitudeFromPressure(pressureHPa)` -- barometric formula approximation
- `calculateTime(params)` -- Williams formula with temp-drop compensation, heat-loss modelling, energy estimation

The `calculateTime` function was refactored from a closure-dependent void function into a pure function that:
- Accepts a single params object with 12 named parameters
- Returns a result object with 6 computed values (or null for invalid inputs)
- Has no React dependencies (no useState, no side effects)

### Task 2: Update EggCalculator to import from physics.js
- Added import statement at top of egg-calculator.jsx
- Removed 3 inline formula definitions (calculateBoilingPointFromPressure, calculatePressureFromBoilingPoint, calculateAltitudeFromPressure)
- Refactored internal `calculateTime()` to delegate to imported `calculateTimePhysics()`
- Kept `getPotHeatCapacity` in the component (references potMaterials array and potMaterial state)
- Net change: +20 lines, -71 lines in egg-calculator.jsx

## Verification

- Existing smoke test passes (`npm test`)
- Production build succeeds (`npm run build`)
- Standalone Node.js verification passes (all exports present, sea-level boiling point = 100)
- calculateTime returns correct results with default parameters (cookingTime ~5.57 min for 60g medium egg from fridge)

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Validity check uses strict inequality chain | `weight > 0 && boilingPoint > targetTemp && targetTemp > startTemp` matches original |
| potHeatCapacity passed as parameter, not looked up | Keeps physics.js free of UI data structures (potMaterials array) |

## Key Files

### Created
- `physics.js` -- standalone physics calculation module (149 lines)

### Modified
- `egg-calculator.jsx` -- imports from physics.js, removed inline formulas (-51 net lines)

## Next Phase Readiness

Physics functions are now testable in isolation. Phase 02 Plan 02 (physics unit tests) can proceed immediately -- all four functions are exported and documented with JSDoc.
