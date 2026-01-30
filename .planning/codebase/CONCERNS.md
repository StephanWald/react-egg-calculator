# Codebase Concerns

**Analysis Date:** 2026-01-30

## Monolithic Component Architecture

**[CRITICAL ARCHITECTURAL DEBT]:**
- Issue: Entire application exists as a single 1351-line React component (`egg-calculator.jsx`). No separation of concerns, no reusable modules, no clear layering.
- Files: `egg-calculator.jsx` (lines 1-1351)
- Impact:
  - Extremely difficult to test individual features in isolation
  - High cognitive overhead for maintenance - developer must understand all 47 useState hooks simultaneously
  - Impossible to reuse calculation or timer logic in other projects
  - Any change risks unintended side effects across the entire component
- Fix approach:
  - Extract calculation logic into pure utility functions (`/lib/thermodynamics.js`, `/lib/pressure.js`)
  - Create custom hooks for state management (`useEggCalculator`, `useTimer`, `useLocationServices`)
  - Build UI component hierarchy with smaller, single-responsibility components
  - Add unit tests for extracted functions

## State Management Complexity

**[MAINTAINABILITY RISK]:**
- Issue: 47 individual `useState` hooks across 4 semantic groups (lines 3-58) with no centralized management or custom hook wrapper
- Files: `egg-calculator.jsx` (lines 8-58)
- Impact:
  - Large dependency arrays in useEffects (line 122-128 has 28 dependencies)
  - Easy to accidentally miss dependencies or cause stale closures
  - No clear contract about what state persists vs what's ephemeral
  - Notification permission state is read-only from browser but stored in state, creating synchronization issues
- Fix approach:
  - Create `useEggCalculator` custom hook to encapsulate cooking session state
  - Create `useHouseholdSettings` custom hook for persistent settings
  - Create `useLocationAndPressure` custom hook for all GPS/weather/pressure state
  - Use a single useEffect with complete dependency tracking

## Mathematical Error Risk in Thermodynamic Calculations

**[CORRECTNESS CONCERN - HIGH PRIORITY]:**
- Issue: Multiple logarithm calls with unchecked ratios that could produce NaN or Infinity
- Files: `egg-calculator.jsx` (lines 461-465)
- Details:
  - Line 461: `const ratio = 0.76 * (T0 - T_eff) / (Tz - T_eff)` - if `T_eff === Tz`, division by zero occurs
  - Line 462: `Math.log(ratio)` - if ratio <= 0, returns -Infinity or NaN
  - Line 464-465: Same issue with `ratio_ideal`
  - No validation that `T_eff < Tz` or that `ratio > 0` before logging
- Trigger:
  - Set ambient temp very high relative to boiling point and target (e.g., ambient=100°C, boiling=100°C, target=67°C)
  - Set water volume very low with many eggs (extreme parameter combinations)
- Workaround: Input validation prevents extreme cases, but edge cases still exist
- Fix approach:
  - Add guard clauses before Math.log: `if (ratio <= 0) { setCookingTime(null); return; }`
  - Add explicit validation that physical constraints are met (T0 < T_eff < Tz)
  - Test with boundary values and document assumptions

## Missing Input Validation

**[SECURITY/USABILITY]:**
- Issue: No validation on numeric input ranges before calculations
- Files: `egg-calculator.jsx` (lines 900-1222)
- Examples:
  - Weight slider: min="40" max="90" but no validation if user types "999" or "-5"
  - Stove power: min="500" max="3500" but divisor assumptions in line 450 assume range
  - Water start temp: min="2" max="40" but line 467 calculation doesn't guard against values > boiling point
  - Ambient temp: min="-10" max="35" but no guard against values >= boiling point
- Impact: Silent calculation failures, NaN/Infinity results, misleading timer values
- Fix approach:
  - Create validation function that clamps inputs to safe ranges
  - Guard against edge cases before calculations
  - Display validation errors to user when constraints violated

## Browser API Error Handling Gaps

**[RELIABILITY CONCERN]:**
- Issue: Multiple browser APIs with inadequate error handling and silent failures
- Files: `egg-calculator.jsx`

**Geolocation API (lines 333-400):**
- Problem: Error handling exists (lines 386-396) but doesn't distinguish between permanent failures (permission denied) and temporary issues (timeout, network error)
- Impact: User gets generic error message but can't retry intelligently
- Fix: Add retry logic for temporary failures, cache failed location attempts

**Open-Meteo API (lines 347-354):**
- Problem: Network error handling missing - if fetch fails, no error state set, just silent failure
- Impact: User doesn't know GPS fetch failed vs succeeded
- Fix: Add explicit error handling in catch block

**Nominatim API (lines 374-384):**
- Problem: Failure is silently ignored (line 383 comment says "Informational only"), but user has no feedback
- Impact: GPS location shows no name, user thinks feature is broken
- Fix: At minimum show "Location name unavailable" if geocoding fails

**Audio playback (lines 209-217):**
- Problem: Audio tag with base64 WAV - if browser can't decode/play, silently fails with catch that does nothing
- Impact: Timer completion has no audio feedback despite user expecting notification
- Fix: Add console.warn or user-facing toast when audio fails, provide fallback

## Clipboard/Data Leakage via Console

**[SECURITY - MINOR]:**
- Issue: Three console.error statements log error objects which could contain sensitive data
- Files: `egg-calculator.jsx` (lines 99, 120, 387)
- Examples:
  - Line 99: `console.error('Failed to load settings:', e)` - e could contain localStorage errors with PII
  - Line 120: `console.error('Failed to save settings:', e)` - same issue
  - Line 387: `console.error('Location error:', error)` - could log GPS coordinates or API keys if fetch fails
- Impact: Developer tools expose error details publicly; user error logs sent to support could leak location data
- Fix approach: Log only error.message, not full error object; sanitize error details before display

## Timer Cleanup Issue

**[MEMORY LEAK RISK]:**
- Issue: Timer interval created at line 171 returns cleanup function, but dependency array (line 184) is incomplete
- Files: `egg-calculator.jsx` (lines 166-184)
- Problem: Dependencies only include `[timerActive, timerPaused]`, missing `timerRemaining` which is captured in closure
- Impact: If `timerRemaining` state changes while dependencies don't, stale closure causes incorrect countdown behavior or interval not clearing properly
- Fix: Add `timerRemaining` to dependency array OR move setTimerRemaining callback inside interval to capture latest state

## Notification Permission State Sync Issue

**[STATE INCONSISTENCY]:**
- Issue: `notificationPermission` stored in state (line 52) but can become stale vs actual browser permission (line 132)
- Files: `egg-calculator.jsx` (lines 52, 131-135, 190)
- Problem:
  - Line 133 sets state from Notification.permission on mount
  - Line 190 checks `notificationPermission === 'granted'` but if browser revokes permission while app running, state stays 'granted'
  - User could see notification as 'granted' in settings but actual send fails at line 191
- Impact: Notification feature fails silently without user knowing permissions changed
- Fix:
  - Check actual Notification.permission before showing notification, not cached state
  - Consider polling Notification.permission periodically or invalidating on window focus

## Persistent Settings Validation Gap

**[DATA INTEGRITY]:**
- Issue: localStorage is read at mount but no validation that loaded values are sensible
- Files: `egg-calculator.jsx` (lines 64-101)
- Problem:
  - Lines 70-96: Load each setting with `if (settings.X !== undefined)` but never validate `settings.X` is in valid range
  - If user manually edits localStorage JSON, app accepts invalid values
  - No version detection if settings schema changes
- Impact:
  - Loading corrupted settings causes calculations to fail silently
  - User can't recover without clearing browser data
- Fix approach:
  - Add schema validation on load (e.g., check weight is 40-90, pressure is 900-1100, etc.)
  - Implement settings migration for schema version changes
  - Add try/catch around each setting load, fall back to defaults on invalid data

## Reset Function Doesn't Clear Calculated State

**[USABILITY ISSUE - MEDIUM]:**
- Issue: `handleResetToDefaults` (lines 222-262) resets working inputs but forgets to reset calculated results
- Files: `egg-calculator.jsx` (lines 222-262)
- Missing resets:
  - Lines 34-39: cookingTime, tempDrop, effectiveTemp, idealTime, totalEnergy, heatingTime never reset
  - Lines 48-51: Timer state never reset
  - No reset of UI toggles (showSettings, showAdvanced, showEnergy, showConfigDialog)
- Impact: After reset, stale calculated values display until user changes an input
- Fix: Add resets for all calculated state and UI panels in handleResetToDefaults

## Hardcoded Physical Constants Lack Documentation

**[MAINTAINABILITY]:**
- Issue: Critical physics constants scattered throughout code with no source documentation
- Files: `egg-calculator.jsx` (lines 304-314, 432-434, 460, 476-480)
- Examples:
  - Line 0.037: Clausius-Clapeyron coefficient (line 305)
  - Line 4.18: Heat capacity of water in J/(g·°C) (line 432)
  - Line 3.5: Heat capacity of egg in J/(g·°C) (line 433)
  - Line 0.451: Williams formula constant (line 460)
  - Line 0.76: Williams formula empirical factor (line 461)
- Impact:
  - No way to validate constants are correct
  - Impossible to add explanatory comments or change without understanding context
  - No reference to academic sources
- Fix:
  - Extract to constants file: `const PHYSICS = { CLAUSIUS_CLAPEYRON: 0.037, ... }`
  - Add JSDoc comment citing sources for each constant
  - Document assumptions (e.g., "assumes spherical egg approximation")

## Energy Calculation Uses Simplified Model

**[ACCURACY CONCERN - MEDIUM]:**
- Issue: Energy calculation (lines 467-475) oversimplifies heat loss
- Files: `egg-calculator.jsx` (lines 467-475)
- Problem:
  - Line 472: `const heatLossPerMinute = 0.5 * heatLossFactor` - arbitrary constant 0.5 with no justification
  - Line 473: `Q_ambient_loss = cookingMinutes * heatLossPerMinute` - linear heat loss assumption ignores cooling curve
  - Doesn't account for lid on/off, pot material insulation properties beyond heat capacity
  - Line 475 divides by stoveEfficiency but this is already factored into recovery calculation
- Impact: Energy estimates could be off by 20-40% for edge cases (cold outdoor cooking, uncovered pot)
- Fix approach:
  - Add configurable model: "Simple" vs "Detailed"
  - For detailed: implement exponential cooling curve based on pot surface area
  - Add warning when estimates are uncertain

## Unused Stove Type Icon Storage

**[CODE QUALITY]:**
- Issue: Stove type icons (lines 266-272) stored in preset objects but used inconsistently
- Files: `egg-calculator.jsx` (lines 266-272, 886)
- Problem: Icons are part of stoveTypes array but the actual translation key is separate (nameKey)
- No icons shown for Pot Material, Consistency, Egg Size presets even though they could display visual indicators
- Fix: Extract icons to separate icon mapping or component, consider using an icon library

## Locale-Specific Time Formatting

**[INTERNATIONALIZATION ISSUE]:**
- Issue: Time formatting (lines 592-611) assumes HH:MM format globally
- Files: `egg-calculator.jsx` (lines 592-611)
- Problem:
  - Some locales prefer MM:SS as spoken format
  - No support for translated time labels ("5 minutes" vs "5:00")
- Impact: German/French users might expect "5 Minuten" instead of "5:00"
- Fix: Move time format to translations.js, allow locale-specific formatting

## Browser Compatibility Gaps

**[RELIABILITY CONCERN - MEDIUM]:**
- Issue: Assumes modern browser APIs without fallbacks in some cases
- Files: Multiple locations
- Specific gaps:
  - Web Audio API fallback exists (line 553) but only tries new syntax, old AudioContext might not work
  - Notification API checks exist (lines 132, 190) but Vibration API check is minimal (line 204)
  - LocalStorage assumed available (lines 66, 118) - no fallback to sessionStorage or memory
- Impact: Older browsers or private/incognito mode could fail silently
- Fix: Add comprehensive feature detection and graceful degradation

## Config Dialog Doesn't Reset on Language Change

**[UX ISSUE - MINOR]:**
- Issue: Language selector in config dialog (lines 760-775) doesn't re-render preview
- Files: `egg-calculator.jsx`
- Problem: When user switches language, header doesn't update stove type label in real-time
- Impact: Confusing UX - settings panel refreshes but header preview is stale
- Fix: Recalculate header preview label whenever lang changes

## Missing Pressure Unit Display Consistency

**[QA ISSUE - REPORTED]:**
- Issue: Pressure display formatting uses `formatPressure` (line 1105) but alternative unit display in Advanced panel unclear
- Files: `egg-calculator.jsx` (lines 1105, 1318-1336)
- Problem: Advanced formulas section shows pressure in text but doesn't match user's selected unit preference
- Impact: User selects inHg but sees hPa in formula explanation
- Fix: Ensure all formulas and explanations respect unit preferences

## Performance: Every Settings Change Triggers Calculation

**[PERFORMANCE CONCERN - LOW PRIORITY]:**
- Issue: Main calculation triggered by 12 different state changes (line 422-423)
- Files: `egg-calculator.jsx` (lines 420-423)
- Problem: Any UI interaction (temp slider, pressure input) immediately recalculates everything
- On slower devices, this could cause jank
- Impact: Not critical for current use case but becomes issue if adding more complex physics
- Fix: Debounce calculations by 300ms, or split into "interactive" and "compute-heavy" effects

## Timer Audio Edge Cases

**[RELIABILITY - MINOR]:**
- Issue: Base64 WAV audio embedded at line 210 - unclear what this audio is, no fallback
- Files: `egg-calculator.jsx` (line 210)
- Problem:
  - Audio data is unreadable (base64 opaque)
  - No way to customize alert sound
  - Some browsers might block autoplay audio
- Impact: Users can't choose notification sound, audio might not play without user gesture
- Fix:
  - Use Web Audio API beep (already implemented at line 553) as primary
  - Remove base64 audio fallback or make it configurable

---

*Concerns audit: 2026-01-30*
