# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Not configured (no test framework detected)
- No Jest, Vitest, or other runner present in package.json
- No test files in main codebase (`/Users/beff/_workspace/egg`)

**Assertion Library:**
- None in use

**Run Commands:**
```bash
# No test commands configured in package.json
# Available commands:
npm run dev        # Run development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Test File Organization

**Location:**
- No test files detected in project
- No `__tests__`, `tests/`, `*.test.js`, or `*.spec.js` files
- Testing infrastructure not implemented

**Naming Convention:**
- If implemented, would likely follow: `[module].test.js` or `[module].spec.js`
- Tests would be co-located or in separate `tests/` directory (TBD)

## Test Structure

**Current State:**
- No test infrastructure exists
- No example test patterns to document

**Recommended Pattern (if testing were to be added):**
```javascript
// Hypothetical test structure based on code patterns
describe('EggCalculator', () => {
  describe('calculateBoilingPointFromPressure', () => {
    it('should calculate boiling point from atmospheric pressure', () => {
      // Standard sea level: 1013.25 hPa → 100°C
      // Higher altitude: lower pressure → lower boiling point
      // Lower altitude: higher pressure → higher boiling point
    });
  });

  describe('formatTime', () => {
    it('should format minutes to MM:SS display', () => {
      // formatTime(5.5) → "5:30"
      // formatTime(null) → "--:--"
    });
  });
});
```

## Mocking

**Framework:**
- None configured

**Patterns to Consider:**
- Geolocation API mocking (lines 338-343 in `egg-calculator.jsx`)
- Fetch API mocking for Open-Meteo and Nominatim APIs (lines 347-376)
- localStorage mocking for persistence tests
- Browser API mocking (Notification, AudioContext, navigator.vibrate)
- Web Audio API mocking for timer sound (lines 551-583)

**What to Mock:**
- External APIs: Open-Meteo weather data, Nominatim reverse geocoding
- Browser APIs: geolocation, localStorage, Notification, Web Audio
- Network requests: fetch calls with various response states

**What NOT to Mock:**
- Core calculation logic (`calculateBoilingPointFromPressure`, `calculateTime`)
- Translation functions (pure lookups)
- State management (React hooks behavior)

## Fixtures and Factories

**Test Data:**
- Not implemented

**Suggested Fixtures (based on code patterns):**
```javascript
// Constant sets used in code (egg-calculator.jsx lines 266-300):
const testStoveTypes = [
  { id: 'induction', nameKey: 'stoveInduction', efficiency: 0.87, defaultPower: 2200, icon: '⚡' },
  { id: 'gas', nameKey: 'stoveGas', efficiency: 0.50, defaultPower: 2500, icon: '🔥' },
];

const testConsistencyOptions = [
  { id: 'soft', nameKey: 'consistencySoft', temp: 63, color: '#FFD700' },
  { id: 'hard', nameKey: 'consistencyHard', temp: 77, color: '#FF6347' },
];

// Sample calculation inputs
const testEggInput = {
  weight: 60,
  startTemp: 4,
  targetTemp: 67,
  boilingPoint: 100,
  eggCount: 1,
  waterVolume: 1.5,
};
```

**Location:**
- If created: `/Users/beff/_workspace/egg/tests/fixtures/` or `__tests__/fixtures/`

## Coverage

**Requirements:**
- No coverage requirements enforced
- No `.nycrc`, `codecov.yml`, or coverage configuration

**Suggested Coverage Areas (if testing added):**
1. **Physics calculations (HIGH priority):**
   - `calculateBoilingPointFromPressure`
   - `calculatePressureFromBoilingPoint`
   - `calculateAltitudeFromPressure`
   - `calculateTime` (main cooking time formula)

2. **Formatting/display (MEDIUM priority):**
   - `formatTime`, `formatTimerDisplay`, `formatCountdown`
   - `formatTemp`, `formatVolume`, `formatWeight`, `formatPressure`
   - Unit conversion correctness

3. **State management (MEDIUM priority):**
   - localStorage persistence (save/load cycle)
   - Timer countdown logic
   - Stove type changes affecting efficiency/power

4. **Browser API integration (LOW priority):**
   - Geolocation success/failure paths
   - Notification permission handling
   - Audio playback fallbacks

## Test Types

**Unit Tests:**
- Scope: Pure calculation functions, formatting helpers
- Approach: Direct function calls with known inputs and assertions on output
- Examples to test:
  - `calculateBoilingPointFromPressure(1013.25)` → `100`
  - `formatTime(5.5)` → `"5:30"`
  - `formatTemp(67)` with `tempUnit='F'` → `"152°F"`

**Integration Tests:**
- Scope: localStorage persistence cycle, API data flow
- Approach: Setup state, trigger save, reload, verify restore
- Examples:
  - Save settings to localStorage, verify reload restores them
  - Mock Open-Meteo API response, verify pressure/altitude calculation flow
  - Trigger timer start/countdown/complete cycle

**E2E Tests:**
- Not implemented
- Would require: Playwright, Cypress, or Puppeteer
- Scope: User workflows (enter values → calculate → start timer)

## Common Patterns

**Async Testing:**
- Current code uses async/await (line 333: `const getLocationAndPressure = async () => {...}`)
- Promise-based with try-catch error handling
- Would require async test support in framework

**Example from lines 337-342:**
```javascript
const position = await new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true,
    timeout: 10000
  });
});
```

**API Testing Pattern:**
- Multiple nested fetch calls (lines 347-379)
- Error handling with `.ok` checks and `.json()` parsing
- Fallback for non-critical requests (Nominatim)

**Error Testing:**
- Code implements comprehensive error handling (lines 386-398)
- Tests should verify error messages appear correctly
- Example: geolocation denied → `setLocationError(t('locationDenied'))`

## Browser API Considerations

**APIs Used (impact testing strategy):**
1. **localStorage** (lines 66, 118, 225)
   - Persists settings across sessions
   - Test: mock, verify read/write cycles

2. **Geolocation** (lines 339-343)
   - Gets user GPS coordinates
   - Test: mock with success/failure responses

3. **Fetch** (lines 347, 374)
   - External API calls (Open-Meteo, Nominatim)
   - Test: mock responses or use MSW (Mock Service Worker)

4. **Web Audio API** (lines 553-572)
   - Creates oscillator for timer beep
   - Test: verify context creation, tone generation

5. **Notification API** (lines 190-197, 503-504)
   - Browser notification on timer complete
   - Test: verify permission request flow

6. **Navigator.vibrate** (lines 204-205)
   - Mobile vibration feedback
   - Test: verify call with correct pattern

## Suggested Testing Infrastructure

**If to be added:**
- Framework: Vitest (native ES modules, fast, small config overhead)
- Mocking: MSW (Mock Service Worker) for API calls, vitest for browser APIs
- React testing: React Testing Library for component tests
- Config location: `vitest.config.js` at project root

**Example config structure:**
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
});
```

---

*Testing analysis: 2026-01-30*

**Note:** This project currently has no automated testing infrastructure. Testing patterns documented above reflect current code structure and recommended best practices for future test implementation.
