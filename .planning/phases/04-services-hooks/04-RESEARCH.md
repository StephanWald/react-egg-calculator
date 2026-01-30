# Phase 4: Services & Hooks - Research

**Researched:** 2026-01-30
**Domain:** React custom hooks, API service modules, localStorage persistence, timer logic, testing with renderHook
**Confidence:** HIGH

## Summary

Phase 4 extracts API services and custom React hooks from the monolithic `egg-calculator.jsx` component (currently ~1210 lines). The component contains two external API integrations (Open-Meteo pressure, Nominatim geocoding), timer countdown logic with browser side effects (notifications, vibration, audio), localStorage-based settings persistence, unit preference state, and location/pressure detection with GPS permission flow.

The standard approach is to create thin API service modules (plain async functions, no React dependencies) and custom hooks that encapsulate related state groups. The existing `useTranslation.js` hook in the project provides a direct precedent: it uses `useState` with lazy initializer, `useEffect` for persistence, and `useCallback` for stable references. Testing uses `renderHook` from `@testing-library/react` (the deprecated `@testing-library/react-hooks` package should NOT be used), `vi.spyOn` for fetch/localStorage mocking, and `vi.useFakeTimers` for timer testing.

The project already has `@testing-library/react` v16.3.2 installed, which includes `renderHook`. No new dependencies are needed. The jsdom environment is configured and sufficient for all hook testing needs. Browser APIs not available in jsdom (AudioContext, Notification) must be manually mocked with `vi.fn()`.

**Primary recommendation:** Split into two sub-plans: (1) API services + useLocationPressure + useSettings hooks with tests, (2) useTimerLogic + useUnitConversion hooks with tests. Keep API services as thin wrappers (no retries/caching per CONTEXT decision). Keep hooks parameter-based (following Phase 3 formatter pattern) rather than internally coupled.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @testing-library/react | 16.3.2 | renderHook, act, waitFor | Already installed; includes renderHook since React 18 migration |
| Vitest | 4.0.18 | Test runner, vi.spyOn, vi.useFakeTimers | Already installed; native timer mocking via @sinonjs/fake-timers |
| React | 18.3.1 | useState, useEffect, useCallback hooks | Already installed; hooks API stable since React 16.8 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vi.spyOn(global, 'fetch') | Built-in | Mock fetch for API service tests | Testing meteoApi.js and geocodingApi.js |
| vi.useFakeTimers() | Built-in | Mock setInterval/setTimeout for timer tests | Testing useTimerLogic countdown |
| Storage.prototype spies | Built-in | Mock localStorage for settings tests | Testing useSettings persistence |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vi.spyOn(global, 'fetch') | vitest-fetch-mock or MSW | Extra dependency; vi.spyOn sufficient for 2 simple API calls |
| Manual Notification mock | vitest browser mode | Browser mode requires Playwright setup; jsdom + manual mock simpler for this scope |
| vitest-localstorage-mock | Storage.prototype spies | Extra package; jsdom provides localStorage natively, spy on prototype works |

**Installation:**
```bash
# No new dependencies needed - all tools already installed
```

## Architecture Patterns

### Recommended Project Structure
```
/
+-- services/
|   +-- meteoApi.js          # Open-Meteo pressure API wrapper
|   +-- geocodingApi.js       # Nominatim reverse geocoding wrapper
+-- hooks/
|   +-- useTimerLogic.js      # Timer countdown state + side effects
|   +-- useLocationPressure.js # GPS + pressure/altitude/location state
|   +-- useSettings.js        # localStorage persistence for household settings
|   +-- useUnitConversion.js  # Unit preference state (temp, volume, weight, pressure)
+-- test/
|   +-- services/
|   |   +-- meteoApi.test.js
|   |   +-- geocodingApi.test.js
|   +-- hooks/
|       +-- useTimerLogic.test.js
|       +-- useLocationPressure.test.js
|       +-- useSettings.test.js
|       +-- useUnitConversion.test.js
+-- physics.js                # Already exists (Phase 2)
+-- formatters.js             # Already exists (Phase 3)
+-- converters.js             # Already exists (Phase 3)
+-- constants.js              # Already exists (Phase 3)
+-- useTranslation.js         # Already exists (existing hook)
+-- egg-calculator.jsx        # Main component (imports hooks + services)
```

### Pattern 1: Thin API Service Module
**What:** Plain async function that wraps a single fetch call, returns parsed data, throws on failure
**When to use:** Every external API integration
**Example:**
```javascript
// services/meteoApi.js
// Thin wrapper around Open-Meteo API for surface pressure

/**
 * Fetch current surface pressure from Open-Meteo API.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{surfacePressure: number, elevation: number|null}>}
 * @throws {Error} if network request fails or response is not ok
 */
export async function fetchSurfacePressure(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=surface_pressure`
  );
  if (!response.ok) {
    throw new Error(`Weather data unavailable (${response.status})`);
  }
  const data = await response.json();
  return {
    surfacePressure: data.current.surface_pressure,
    elevation: data.elevation ?? null,
  };
}
```

### Pattern 2: Custom Hook with State Group
**What:** Hook that encapsulates related state, effects, and handlers
**When to use:** Groups of state that change together and share logic
**Example:**
```javascript
// hooks/useUnitConversion.js
import { useState } from 'react';

/**
 * Manages unit preferences for temperature, volume, weight, and pressure.
 * @param {Object} initial - Initial unit preferences
 * @returns {Object} Unit state and setters
 */
export function useUnitConversion(initial = {}) {
  const [tempUnit, setTempUnit] = useState(initial.tempUnit ?? 'C');
  const [volumeUnit, setVolumeUnit] = useState(initial.volumeUnit ?? 'L');
  const [weightUnit, setWeightUnit] = useState(initial.weightUnit ?? 'g');
  const [pressureUnit, setPressureUnit] = useState(initial.pressureUnit ?? 'hPa');

  return {
    tempUnit, setTempUnit,
    volumeUnit, setVolumeUnit,
    weightUnit, setWeightUnit,
    pressureUnit, setPressureUnit,
    // Convenience: all units as object (for persistence)
    units: { tempUnit, volumeUnit, weightUnit, pressureUnit },
  };
}
```

### Pattern 3: Hook with localStorage Persistence
**What:** Hook that auto-loads from and auto-saves to localStorage
**When to use:** useSettings hook for household settings
**Example (following existing useTranslation pattern):**
```javascript
// hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'egg-calculator-settings';
const DEFAULTS = {
  stoveType: 'induction',
  stovePower: 2000,
  stoveEfficiency: 0.87,
  // ... all household settings
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    // Lazy initializer: load from localStorage on first render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed }; // Merge with defaults
      }
    } catch (e) {
      // localStorage unavailable or corrupt
    }
    return { ...DEFAULTS };
  });

  // Auto-persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // localStorage unavailable
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* */ }
    setSettings({ ...DEFAULTS });
  }, []);

  return { settings, updateSetting, resetSettings };
}
```

### Pattern 4: Hook with Timer and Side Effects
**What:** Hook that manages countdown timer with setInterval and browser notification side effects
**When to use:** useTimerLogic
**Key design decision:** Timer hook owns ALL side effects (notifications, vibration, audio) because:
1. These effects are triggered by timer state transitions (remaining === 0)
2. Moving them out would require the component to watch timer state and manually trigger effects
3. The side effects are testable by mocking globals (Notification, navigator.vibrate, AudioContext)
```javascript
// hooks/useTimerLogic.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimerLogic() {
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // ... countdown effect with setInterval
  // ... completion notification effect
  // ... start/stop/pause/resume callbacks

  return {
    timerActive, timerPaused, timerRemaining, timerComplete,
    notificationPermission,
    startTimer, stopTimer, pauseTimer, resumeTimer,
    dismissComplete,
  };
}
```

### Pattern 5: renderHook Testing
**What:** Test hooks in isolation without mounting a component
**When to use:** All hook tests
**Example:**
```javascript
// test/hooks/useUnitConversion.test.js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnitConversion } from '../../hooks/useUnitConversion';

describe('useUnitConversion', () => {
  it('returns default units', () => {
    const { result } = renderHook(() => useUnitConversion());
    expect(result.current.tempUnit).toBe('C');
    expect(result.current.volumeUnit).toBe('L');
  });

  it('accepts initial unit overrides', () => {
    const { result } = renderHook(() =>
      useUnitConversion({ tempUnit: 'F', volumeUnit: 'oz' })
    );
    expect(result.current.tempUnit).toBe('F');
  });

  it('updates temperature unit', () => {
    const { result } = renderHook(() => useUnitConversion());
    act(() => { result.current.setTempUnit('F'); });
    expect(result.current.tempUnit).toBe('F');
  });
});
```

### Anti-Patterns to Avoid

- **Importing React hooks inside service modules:** Services must be plain async functions with no React dependency. Hooks consume services, not the other way around.
- **Coupling hooks internally:** Do NOT have useUnitConversion import useSettings to read preferences. Pass units as parameters or let the component compose both hooks. This follows the Phase 3 pattern where formatters accept unit as parameter.
- **Using `@testing-library/react-hooks`:** This package is deprecated and incompatible with React 18. Use `renderHook` from `@testing-library/react` directly.
- **Using `waitForNextUpdate`:** Removed in React 18 migration. Use `waitFor` from `@testing-library/react` instead.
- **Testing hooks by mounting full component:** Defeats the purpose of extraction. Use `renderHook` for isolated tests.
- **Synchronous timer advancement with Promises:** Use `vi.advanceTimersByTimeAsync` instead of `vi.advanceTimersByTime` to avoid promise/timer deadlocks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timer mocking | Custom timer stubs | `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` | Based on @sinonjs/fake-timers; handles edge cases with setInterval/clearInterval |
| Fetch mocking | Custom fetch replacement | `vi.spyOn(global, 'fetch').mockResolvedValue(...)` | Built into Vitest, auto-restores, tracks call counts |
| localStorage mocking | vitest-localstorage-mock package | `vi.spyOn(Storage.prototype, 'getItem')` (or use jsdom's native localStorage directly) | jsdom provides working localStorage; spy on prototype for assertions |
| Hook testing harness | Custom wrapper component | `renderHook()` from `@testing-library/react` | Purpose-built, returns result.current, supports rerender/unmount |
| AudioContext mock | standardized-audio-context-mock | Simple `vi.fn()` constructor | Only need to verify it was called, not simulate audio processing |
| Notification mock | Browser mode | `global.Notification = vi.fn()` | Only need constructor + requestPermission; simple mock suffices |

**Key insight:** For this project scope (2 API calls, 4 hooks), built-in Vitest mocking utilities (`vi.spyOn`, `vi.fn`, `vi.useFakeTimers`) are sufficient. External mocking libraries add complexity without proportional benefit.

## Common Pitfalls

### Pitfall 1: Stale Closure in Timer Callbacks
**What goes wrong:** Timer callback captures stale state values, countdown appears stuck or jumps
**Why it happens:** setInterval callback closes over initial state; React state updates don't propagate into existing closures
**How to avoid:** Use functional state updates: `setTimerRemaining(prev => prev - 1)` instead of `setTimerRemaining(timerRemaining - 1)`. The existing code already does this correctly (line 180-188).
**Warning signs:** Timer display jumps from correct value to wrong value, or stays at initial value

### Pitfall 2: Timer Not Cleaned Up on Unmount
**What goes wrong:** setInterval continues running after component unmounts, causing memory leaks and "setState on unmounted component" warnings
**Why it happens:** Missing cleanup in useEffect return function
**How to avoid:** Always return `() => clearInterval(interval)` from the timer effect. The existing code does this correctly (line 191).
**Warning signs:** Console warning about state updates on unmounted components

### Pitfall 3: Promise/Timer Deadlock in Tests
**What goes wrong:** Test hangs indefinitely when using `vi.advanceTimersByTime()` with code that mixes Promises and timers
**Why it happens:** Synchronous timer advancement doesn't flush microtasks (Promises), causing a deadlock where the timer waits for a Promise that waits for the timer
**How to avoid:** Use `vi.advanceTimersByTimeAsync()` instead of `vi.advanceTimersByTime()`. The async variant flushes microtasks between timer executions.
**Warning signs:** Test timeout with no error, test appears to hang

### Pitfall 4: localStorage Spy Fails on jsdom
**What goes wrong:** `vi.spyOn(localStorage, 'getItem')` throws or doesn't work in jsdom
**Why it happens:** jsdom implements localStorage as a getter on the window prototype, not a plain object property
**How to avoid:** Spy on `Storage.prototype` instead: `vi.spyOn(Storage.prototype, 'getItem')`. Alternatively, use jsdom's native localStorage directly (it works) and just assert on its contents with `localStorage.getItem(key)`.
**Warning signs:** TypeError when trying to spy, spy never gets called

### Pitfall 5: Missing act() Wrapper for State Updates
**What goes wrong:** Warning: "An update to TestComponent inside a test was not wrapped in act(...)"
**Why it happens:** Calling hook functions that trigger state updates without wrapping in `act()`
**How to avoid:** Wrap all calls that trigger state updates: `act(() => { result.current.startTimer(300); })`
**Warning signs:** Console warnings about act(), assertions fail because state hasn't updated yet

### Pitfall 6: Geolocation Mock Not Restored Between Tests
**What goes wrong:** Test pollution where one test's geolocation mock leaks into another test
**Why it happens:** `Object.defineProperty(navigator, 'geolocation', ...)` persists across tests
**How to avoid:** Save original value in `beforeEach`, restore in `afterEach`. Or use `vi.stubGlobal()` which auto-restores.
**Warning signs:** Tests pass individually but fail when run together

### Pitfall 7: Settings Hook Triggers Infinite Save Loop
**What goes wrong:** useEffect for saving triggers on every render, causing infinite re-renders
**Why it happens:** Settings object recreated each render, causing useEffect dependency to change
**How to avoid:** Use a single state object (not individual useState calls) so the useEffect dependency is one reference. Or use a ref to track whether save is needed.
**Warning signs:** "Maximum update depth exceeded" error, browser tab freezes

### Pitfall 8: Breaking Existing Component Behavior During Extraction
**What goes wrong:** Component works differently after hooks are extracted
**Why it happens:** Subtle differences in how state is initialized, when effects fire, or how values are composed
**How to avoid:**
1. Extract one hook at a time
2. Run existing smoke test after each extraction
3. Verify component still renders identically
4. Copy exact logic first, refactor later
**Warning signs:** Existing smoke test fails, component renders differently

## Code Examples

### Testing API Service with Fetch Mock
```javascript
// test/services/meteoApi.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSurfacePressure } from '../../services/meteoApi';

describe('fetchSurfacePressure', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns surface pressure and elevation for valid coordinates', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current: { surface_pressure: 1013.25 },
        elevation: 52,
      }),
    });

    const result = await fetchSurfacePressure(52.52, 13.405);
    expect(result.surfacePressure).toBe(1013.25);
    expect(result.elevation).toBe(52);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('latitude=52.52')
    );
  });

  it('throws on non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchSurfacePressure(0, 0)).rejects.toThrow('Weather data unavailable');
  });

  it('throws on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchSurfacePressure(0, 0)).rejects.toThrow('Network error');
  });
});
```

### Testing Timer Hook with Fake Timers
```javascript
// test/hooks/useTimerLogic.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerLogic } from '../../hooks/useTimerLogic';

describe('useTimerLogic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock browser APIs not available in jsdom
    global.Notification = vi.fn();
    global.Notification.permission = 'default';
    global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
    global.AudioContext = vi.fn().mockImplementation(() => ({
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        frequency: { value: 0 },
        type: '',
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      }),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with inactive timer', () => {
    const { result } = renderHook(() => useTimerLogic());
    expect(result.current.timerActive).toBe(false);
    expect(result.current.timerRemaining).toBeNull();
  });

  it('starts countdown from given seconds', () => {
    const { result } = renderHook(() => useTimerLogic());
    act(() => { result.current.startTimer(300); });
    expect(result.current.timerActive).toBe(true);
    expect(result.current.timerRemaining).toBe(300);
  });

  it('counts down by 1 each second', async () => {
    const { result } = renderHook(() => useTimerLogic());
    act(() => { result.current.startTimer(10); });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(result.current.timerRemaining).toBe(9);
  });

  it('completes when reaching zero', async () => {
    const { result } = renderHook(() => useTimerLogic());
    act(() => { result.current.startTimer(2); });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.timerComplete).toBe(true);
    expect(result.current.timerActive).toBe(false);
  });

  it('pauses and resumes countdown', async () => {
    const { result } = renderHook(() => useTimerLogic());
    act(() => { result.current.startTimer(10); });

    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(result.current.timerRemaining).toBe(8);

    act(() => { result.current.pauseTimer(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(result.current.timerRemaining).toBe(8); // Unchanged

    act(() => { result.current.resumeTimer(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(result.current.timerRemaining).toBe(7);
  });
});
```

### Testing Settings Hook with localStorage
```javascript
// test/hooks/useSettings.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../../hooks/useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns defaults when no saved settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('induction');
    expect(result.current.settings.stovePower).toBe(2000);
  });

  it('loads saved settings from localStorage', () => {
    localStorage.setItem('egg-calculator-settings', JSON.stringify({
      stoveType: 'gas',
      stovePower: 2500,
    }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('gas');
    expect(result.current.settings.stovePower).toBe(2500);
  });

  it('merges saved settings with defaults (missing keys get defaults)', () => {
    localStorage.setItem('egg-calculator-settings', JSON.stringify({
      stoveType: 'gas',
    }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('gas');
    expect(result.current.settings.stovePower).toBe(2000); // Default
  });

  it('auto-persists on update', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.updateSetting('stoveType', 'ceramic'); });
    const saved = JSON.parse(localStorage.getItem('egg-calculator-settings'));
    expect(saved.stoveType).toBe('ceramic');
  });

  it('resetSettings clears localStorage and returns to defaults', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.updateSetting('stoveType', 'gas'); });
    act(() => { result.current.resetSettings(); });
    expect(result.current.settings.stoveType).toBe('induction');
    expect(localStorage.getItem('egg-calculator-settings')).toBeNull();
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('egg-calculator-settings', 'not-json');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('induction'); // Falls back to defaults
  });
});
```

### Testing Location/Pressure Hook with Geolocation Mock
```javascript
// test/hooks/useLocationPressure.test.js (pattern)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocationPressure } from '../../hooks/useLocationPressure';

describe('useLocationPressure', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(global, 'fetch');
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with default pressure values', () => {
    const { result } = renderHook(() => useLocationPressure());
    expect(result.current.pressure).toBe(1013.25);
    expect(result.current.boilingPoint).toBe(100);
    expect(result.current.altitude).toBe(0);
  });

  it('fetches location and updates pressure', async () => {
    // Mock GPS success
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: { latitude: 52.52, longitude: 13.405, altitude: 34 },
      });
    });

    // Mock Open-Meteo response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current: { surface_pressure: 1005.3 },
        elevation: 34,
      }),
    });

    // Mock Nominatim response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        address: { city: 'Berlin' },
      }),
    });

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.pressure).toBe(1005.3);
    expect(result.current.locationName).toBe('Berlin');
    expect(result.current.pressureSource).toBe('gps');
  });
});
```

## Discretionary Decisions (Recommendations)

Based on code analysis and CONTEXT.md discretion areas:

### 1. Service Architecture: Thin Wrappers, Split Files
**Recommendation:** Two separate thin service files (meteoApi.js, geocodingApi.js)
**Rationale:** The APIs are genuinely independent (different endpoints, different purposes, different failure modes). The Nominatim call is optional and can fail without affecting pressure data (see line 331-342 in current component). Thin wrappers (no retries, no caching) per CONTEXT decision.

### 2. Timer Side Effect Ownership: Hook Owns All
**Recommendation:** useTimerLogic owns notifications, vibration, and audio playback
**Rationale:** Side effects are triggered by timer state transitions. The component should not need to watch `timerComplete` and manually call notification functions. The hook can accept an `onComplete` callback for extensibility, but the default behavior includes all current side effects.

### 3. useUnitConversion: Parameter-Based (No Internal Reads)
**Recommendation:** useUnitConversion takes optional initial values as parameter, does NOT internally read from useSettings
**Rationale:** Follows Phase 3 pattern where formatters accept unit as parameter rather than reading global state. The component composes both hooks: it reads unit preferences from useSettings' persisted data and passes them as initial values to useUnitConversion (or vice versa -- useSettings persists what useUnitConversion provides).

### 4. useLocationPressure: Handles Full GPS Flow
**Recommendation:** Hook handles GPS permission flow, coordinate acquisition, API calls, and error handling
**Rationale:** The GPS flow is tightly coupled to the state it produces (pressure, altitude, locationName, loading, error). Splitting GPS acquisition from data fetching would require complex state passing between hooks.

### 5. Hook Granularity: Stick to 4 ROADMAP Hooks
**Recommendation:** The 4 specified hooks (useTimerLogic, useLocationPressure, useSettings, useUnitConversion) are the right granularity
**Rationale:** Code analysis shows clean state group boundaries:
- Timer state (5 variables + handlers): naturally isolated
- Location/pressure (7 variables + handlers): naturally isolated
- Settings (7 household variables + persistence): naturally isolated
- Unit preferences (4 variables + setters): naturally isolated
- Working inputs (weight, startTemp, etc.) and UI state (showSettings, etc.) remain in the component for Phase 5

### 6. Testing Approach: renderHook + vi.spyOn
**Recommendation:** Use renderHook for all hook tests, vi.spyOn for global mocks, vi.useFakeTimers for timer tests
**Rationale:** No extra dependencies needed, proven patterns in React Testing Library ecosystem, sufficient for this scope.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @testing-library/react-hooks | renderHook from @testing-library/react | React 18 (2022) | Deprecated package, import from main RTL now |
| waitForNextUpdate | waitFor | React 18 (2022) | waitForNextUpdate removed, use waitFor with assertion callback |
| vi.advanceTimersByTime (sync) | vi.advanceTimersByTimeAsync | Vitest 1.x+ | Async variant prevents promise/timer deadlocks |
| Manual fetch mock | vi.spyOn(global, 'fetch') | Vitest 1.x+ | Built-in spy with auto-restore |
| Separate hook test package | Integrated in @testing-library/react | @testing-library/react v14+ | No extra package needed |

**Deprecated/outdated:**
- **@testing-library/react-hooks:** Do not install or import from this package
- **waitForNextUpdate:** Does not exist in current RTL; use `waitFor(() => expect(...))` pattern
- **result.error:** Error catching via result.error removed in React 18; use `expect(() => renderHook(...)).toThrow()`

## Open Questions

1. **Should useSettings persist unit preferences, or should useUnitConversion do its own persistence?**
   - What we know: Currently, the component has a single localStorage blob that includes both household settings AND unit preferences. The CONTEXT says "persist all household settings + units."
   - What's unclear: Whether to keep a single storage key or split into two keys
   - Recommendation: Keep a single STORAGE_KEY managed by useSettings, which includes unit preferences. useUnitConversion is a pure state hook that receives initial values. This avoids split-brain persistence.

2. **Should the component pass translation function `t()` to hooks for error messages?**
   - What we know: Current location error handling uses `t('locationDenied')`, `t('positionUnavailable')` etc.
   - What's unclear: Whether hooks should be translation-aware or return error codes
   - Recommendation: Hooks return error codes or English strings. The component maps error types to translated messages. This keeps hooks translation-agnostic and independently testable.

3. **How to handle the escape key handler that spans timer and config dialog?**
   - What we know: Lines 146-171 show an Escape key handler that prioritizes timer stop over dialog close
   - What's unclear: Whether this lives in useTimerLogic or remains in the component
   - Recommendation: Leave escape key handling in the component (Phase 5 concern). It coordinates between timer and UI state, which is composition logic.

## Sources

### Primary (HIGH confidence)
- [@testing-library/react API docs](https://testing-library.com/docs/react-testing-library/api/) - renderHook signature, options, return values
- [Vitest vi API reference](https://vitest.dev/api/vi.html) - useFakeTimers, advanceTimersByTimeAsync, spyOn signatures
- [Vitest Timer Mocking Guide](https://vitest.dev/guide/mocking/timers) - Timer testing patterns, setInterval examples
- Existing codebase: `useTranslation.js` - Custom hook pattern precedent
- Existing codebase: `egg-calculator.jsx` lines 55-496 - All extraction source code analyzed

### Secondary (MEDIUM confidence)
- [Kent C. Dodds: How to Test Custom React Hooks](https://kentcdodds.com/blog/how-to-test-custom-react-hooks) - renderHook vs wrapper component testing philosophy
- [Builder.io: Test Custom Hooks with RTL](https://www.builder.io/blog/test-custom-hooks-react-testing-library) - act() and state update patterns
- [Maya Shavin: Test React Hooks with Vitest](https://mayashavin.com/articles/test-react-hooks-with-vitest) - Vitest-specific hook testing patterns
- [RunThatLine: Mock localStorage with Vitest](https://runthatline.com/vitest-mock-localstorage/) - Storage.prototype spy pattern
- [RunThatLine: Mock Fetch API in Vitest](https://runthatline.com/how-to-mock-fetch-api-with-vitest/) - global.fetch mocking pattern

### Tertiary (LOW confidence)
- [jsdom Issue #2900: Web Audio API not implemented](https://github.com/jsdom/jsdom/issues/2900) - AudioContext must be mocked
- [RTL Issue #1198: fake timers and waitFor interaction](https://github.com/testing-library/react-testing-library/issues/1198) - Timer/waitFor deadlock known issue

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools already installed, APIs verified against official docs
- Architecture: HIGH - Follows existing useTranslation.js pattern, service/hook split is standard React pattern
- Pitfalls: HIGH - Timer/Promise deadlock and localStorage spy issues are well-documented and verified
- Code examples: HIGH - All examples based on verified API signatures from official docs
- Discretionary decisions: MEDIUM - Based on code analysis and Phase 3 precedent, but involve judgment calls

**Research date:** 2026-01-30
**Valid until:** ~30 days (React Testing Library and Vitest APIs stable)
