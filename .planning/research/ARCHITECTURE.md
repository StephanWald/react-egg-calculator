# Architecture Research: React Monolith Refactoring

**Domain:** React application refactoring (egg calculator physics app)
**Researched:** 2026-01-30
**Confidence:** HIGH

## Current State Analysis

### Monolithic Structure
The application currently exists as a single 1,351-line React component (`egg-calculator.jsx`) containing:

- **47+ useState hooks** managing all application state
- **Physics calculations** (5 core formulas + helper functions)
- **API integrations** (2 external services: Open-Meteo, Nominatim)
- **Timer logic** with audio/notification/vibration support
- **Format/display helpers** (5 formatting functions)
- **Configuration presets** (stoveTypes, potMaterials, consistencyOptions, etc.)
- **UI rendering** (661 lines of JSX)
- **Settings persistence** via localStorage
- **Unit conversion logic** (4 unit systems: temp, volume, weight, pressure)

### Already Extracted
- **Translation system** (`useTranslation.js` + `translations.js`) - successfully separated

## Target Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Main    │  │ Settings │  │  Timer   │  │  Config  │    │
│  │Component │  │  Panel   │  │ Overlay  │  │  Dialog  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
├───────┴─────────────┴─────────────┴─────────────┴───────────┤
│                      Custom Hooks Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useEggCalculator (orchestration hook)               │    │
│  └──┬──────────┬──────────┬──────────┬──────────┬──────┘    │
│     │          │          │          │          │           │
│  ┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐      │
│  │State│  │Physics│  │ Timer │  │  API  │  │ Units │      │
│  │ Mgt │  │ Calcs │  │ Logic │  │Integr.│  │ Conv. │      │
│  └─────┘  └───────┘  └───────┘  └───────┘  └───────┘      │
├─────────────────────────────────────────────────────────────┤
│                      Utility Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Constants │  │ Formatters│  │Validation│  │ Storage  │    │
│  │ & Presets│  │           │  │          │  │  Utils   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **EggCalculator** | UI orchestration, layout structure | Main component using custom hooks, renders panels |
| **SettingsPanel** | Household settings UI (stove, pot, temps) | Controlled component with prop callbacks |
| **TimerOverlay** | Timer countdown, controls, completion state | Modal overlay, consumes timer hook |
| **ConfigDialog** | Unit preferences, language, reset settings | Modal dialog for app-wide configuration |
| **ResultDisplay** | Cooking time, temp drop, energy info | Presentational component with formatted values |
| **useEggCalculator** | Main orchestration hook | Composes physics, state, API hooks |
| **usePhysicsCalculations** | Pure physics formulas | Memoized calculations, no side effects |
| **useTimerLogic** | Timer state, countdown, notifications | setInterval management, audio, vibration |
| **useLocationPressure** | GPS + weather API integration | Geolocation, Open-Meteo API calls |
| **useSettings** | localStorage persistence | Read/write settings, sync with state |
| **useUnitConversion** | Format values in current units | Pure conversion functions |

## Recommended Project Structure

```
src/
├── components/                # UI components
│   ├── EggCalculator.jsx      # Main orchestration component
│   ├── ResultDisplay.jsx      # Cooking time display + egg viz
│   ├── SettingsPanel.jsx      # Household settings panel
│   ├── TimerOverlay.jsx       # Timer modal with controls
│   ├── ConfigDialog.jsx       # Unit/language preferences
│   ├── LocationPressure.jsx   # GPS + pressure input section
│   ├── ConsistencyPicker.jsx  # Consistency selection buttons
│   └── EggInputs.jsx          # Egg size, count, temp, water
│
├── hooks/                     # Custom React hooks
│   ├── useEggCalculator.js    # Main orchestration hook
│   ├── usePhysicsCalculations.js  # Physics formulas
│   ├── useTimerLogic.js       # Timer state + countdown
│   ├── useLocationPressure.js # GPS + weather API
│   ├── useSettings.js         # localStorage persistence
│   ├── useUnitConversion.js   # Unit formatting
│   └── useTranslation.js      # [EXISTING] Translation hook
│
├── utils/                     # Pure utility functions
│   ├── constants.js           # Presets (stoveTypes, potMaterials, etc.)
│   ├── physics.js             # Pure physics functions (formulas)
│   ├── formatters.js          # Display formatting (time, temp, etc.)
│   ├── validators.js          # Input validation
│   ├── storage.js             # localStorage helpers
│   └── audio.js               # Timer audio generation
│
├── services/                  # External API integrations
│   ├── meteoApi.js            # Open-Meteo API client
│   └── geocodingApi.js        # Nominatim reverse geocoding
│
├── translations.js            # [EXISTING] Translation strings
├── main.jsx                   # [EXISTING] React entry point
└── index.css                  # [EXISTING] Tailwind directives
```

### Structure Rationale

- **components/:** UI-only components (presentational + container patterns). Each focused on one UI concern.
- **hooks/:** Custom hooks for reusable logic. Hooks encapsulate state management, side effects, and composition.
- **utils/:** Pure functions with no React dependencies. Easy to test, can be imported anywhere.
- **services/:** External API clients. Isolated for mocking/testing, clear network boundary.

## Extraction Phases & Dependencies

### Phase 1: Foundation (Independent Extractions)
**Goal:** Extract pure functions and constants with no state dependencies.

**Order:**
1. **constants.js** - Extract presets (stoveTypes, potMaterials, consistencyOptions, eggSizes, startTempOptions)
   - Lines: ~90 (264-294)
   - Dependencies: None
   - Risk: ZERO (pure data)
   - Verification: Import and verify data structure unchanged

2. **physics.js** - Extract pure physics formulas
   - Functions: `calculateBoilingPointFromPressure`, `calculatePressureFromBoilingPoint`, `calculateAltitudeFromPressure`, `getPotHeatCapacity`
   - Lines: ~30 (304-318)
   - Dependencies: None (pure functions)
   - Risk: LOW (deterministic calculations)
   - Verification: Unit tests with known inputs/outputs

3. **formatters.js** - Extract display formatting functions
   - Functions: `formatTime`, `formatTimerDisplay`, `formatCountdown`
   - Lines: ~25 (592-611)
   - Dependencies: None (pure functions)
   - Risk: ZERO (pure transformations)
   - Verification: Test with various inputs

4. **audio.js** - Extract timer audio generation
   - Function: `playTimerSound`
   - Lines: ~35 (551-583)
   - Dependencies: Web Audio API
   - Risk: ZERO (side effect isolated)
   - Verification: Manual audio playback test

**Verification:** After Phase 1, component should still work identically with imports replacing local definitions.

---

### Phase 2: Services (API Isolation)
**Goal:** Extract external API integrations into service modules.

**Order:**
1. **meteoApi.js** - Open-Meteo API client
   - Extract fetch logic from `getLocationAndPressure` (lines 347-354)
   - Export: `fetchSurfacePressure(latitude, longitude)`
   - Dependencies: fetch API
   - Risk: LOW (isolated network call)
   - Verification: Mock API response, test error handling

2. **geocodingApi.js** - Nominatim reverse geocoding
   - Extract fetch logic from `getLocationAndPressure` (lines 374-384)
   - Export: `reverseGeocode(latitude, longitude)`
   - Dependencies: fetch API
   - Risk: LOW (isolated network call)
   - Verification: Mock API response, test failure resilience

**Verification:** GPS button should still fetch location/pressure correctly.

---

### Phase 3: Utility Hooks (State-Aware Logic)
**Goal:** Extract stateful logic into custom hooks that can be reused.

**Order:**
1. **useUnitConversion.js** - Unit conversion + formatting
   - State: tempUnit, volumeUnit, weightUnit, pressureUnit (4 useState)
   - Functions: formatTemp, formatVolume, formatWeight, formatPressure
   - Lines: ~60 (614-644)
   - Dependencies: formatters.js
   - Risk: LOW (pure conversions with state)
   - Verification: Toggle units in ConfigDialog, verify display updates

2. **useSettings.js** - localStorage persistence
   - State: All 47 state variables
   - Logic: Load on mount (lines 64-101), save on change (lines 104-128)
   - Export: `useSettings(initialValues)` → returns [settings, updateSettings]
   - Dependencies: storage.js helpers
   - Risk: MEDIUM (manages all state sync)
   - Verification: Refresh page, verify all settings persist correctly

3. **useTimerLogic.js** - Timer countdown + notifications
   - State: timerActive, timerPaused, timerRemaining, timerComplete, notificationPermission (5 useState)
   - Logic: Countdown (lines 166-184), completion (lines 186-219), controls (523-547)
   - Export: `useTimerLogic()` → { start, stop, pause, resume, remaining, isActive, isComplete }
   - Dependencies: audio.js
   - Risk: MEDIUM (complex state transitions)
   - Verification: Start/pause/resume/stop timer, test notifications

4. **useLocationPressure.js** - GPS + weather data
   - State: locationName, locationLoading, locationError, pressureSource (4 useState)
   - Logic: Geolocation + API calls (lines 333-400)
   - Export: `useLocationPressure()` → { fetch, locationName, loading, error }
   - Dependencies: meteoApi.js, geocodingApi.js, physics.js
   - Risk: MEDIUM (async API coordination)
   - Verification: Click GPS button, verify location/pressure/altitude updates

**Verification:** All interactive features should work identically. Focus on state transitions.

---

### Phase 4: Domain Logic (Physics Calculations)
**Goal:** Extract core domain logic into a focused hook.

**Order:**
1. **usePhysicsCalculations.js** - Main calculation orchestrator
   - State inputs: weight, startTemp, targetTemp, consistency, eggCount, waterVolume, stoveType, stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp, boilingPoint
   - State outputs: cookingTime, tempDrop, effectiveTemp, idealTime, totalEnergy, heatingTime (6 useState)
   - Logic: Main calculateTime function (lines 425-493)
   - Export: `usePhysicsCalculations(inputs)` → { cookingTime, tempDrop, effectiveTemp, idealTime, totalEnergy, heatingTime }
   - Dependencies: physics.js, constants.js
   - Risk: HIGH (core business logic with complex dependencies)
   - Verification:
     - Test known scenarios with expected outputs
     - Verify energy calculations
     - Check temp drop warnings
     - Validate edge cases (extreme values)

**Verification:** Most critical phase. Cooking time calculations MUST remain byte-for-byte identical for same inputs.

---

### Phase 5: Orchestration (Main Hook)
**Goal:** Compose all hooks into a single orchestration hook.

**Order:**
1. **useEggCalculator.js** - Main orchestration hook
   - Composes: useSettings, usePhysicsCalculations, useTimerLogic, useLocationPressure, useUnitConversion
   - Provides: Unified API for EggCalculator component
   - Export: `useEggCalculator()` → { all state + actions }
   - Dependencies: All Phase 3 & 4 hooks
   - Risk: MEDIUM (coordination layer)
   - Verification: Component should be dramatically simplified, behavior identical

**Verification:** End-to-end test of full app flow. All features working.

---

### Phase 6: UI Components (View Layer)
**Goal:** Extract UI sections into focused components.

**Order:**
1. **ResultDisplay.jsx** - Cooking time display + egg visualization
   - Lines: ~50 (1026-1074)
   - Props: cookingTime, idealTime, tempDrop, effectiveTemp, consistency, tempUnit
   - Risk: LOW (presentational)
   - Verification: Visual inspection

2. **ConsistencyPicker.jsx** - Consistency selection buttons
   - Lines: ~25 (1134-1153)
   - Props: consistency, onChange, consistencyOptions, formatTemp
   - Risk: LOW (presentational)
   - Verification: Click buttons, verify selection

3. **EggInputs.jsx** - Egg size/count/temp/water controls
   - Lines: ~80 (1156-1247)
   - Props: eggCount, setEggCount, waterVolume, setWaterVolume, weight, setWeight, startTemp, setStartTemp, formatWeight, formatTemp, formatVolume
   - Risk: LOW (presentational with callbacks)
   - Verification: Adjust inputs, verify updates

4. **LocationPressure.jsx** - GPS + pressure input section
   - Lines: ~55 (1077-1131)
   - Props: pressure, boilingPoint, altitude, locationName, pressureSource, locationLoading, locationError, onFetchLocation, onManualPressure, formatPressure, formatTemp
   - Risk: LOW (presentational with callbacks)
   - Verification: GPS fetch + manual input

5. **SettingsPanel.jsx** - Household settings panel
   - Lines: ~155 (868-1020)
   - Props: showSettings, stoveType, stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp, onStoveTypeChange, on* callbacks
   - Risk: MEDIUM (many props, state updates)
   - Verification: Adjust all settings, verify persistence

6. **TimerOverlay.jsx** - Timer modal with controls
   - Lines: ~70 (782-847)
   - Props: timerActive, timerComplete, timerRemaining, timerPaused, onPause, onResume, onStop, onDismiss, formatCountdown
   - Risk: LOW (presentational with callbacks)
   - Verification: Timer flow (start → pause → resume → complete)

7. **ConfigDialog.jsx** - Unit/language preferences
   - Lines: ~95 (685-778)
   - Props: showConfigDialog, tempUnit, volumeUnit, weightUnit, pressureUnit, lang, languages, onClose, setTempUnit, setVolumeUnit, setWeightUnit, setPressureUnit, setLanguage
   - Risk: LOW (presentational with callbacks)
   - Verification: Toggle all units/languages

**Verification:** Visual regression testing. Screenshots before/after should be pixel-perfect identical.

---

### Phase 7: Final Cleanup
**Goal:** Minimize EggCalculator.jsx to pure orchestration.

**Target:** EggCalculator.jsx should be ~200 lines:
- Import hooks + components
- Call `useEggCalculator()` hook
- Render component tree with props
- Handle top-level UI state (panel visibility)

**Verification:** Full regression test. All features working, code is clean and maintainable.

## Architectural Patterns

### Pattern 1: Custom Hooks for State Logic

**What:** Extract stateful logic into custom hooks that return state + actions.

**When to use:** When logic involves useState/useEffect but doesn't need UI rendering.

**Trade-offs:**
- ✅ **Pro:** Reusable, testable without UI, clear separation of concerns
- ✅ **Pro:** Enables composition (hooks can use other hooks)
- ❌ **Con:** Can become over-abstracted if too granular
- ❌ **Con:** Prop drilling if not composed properly

**Example:**
```typescript
// useTimerLogic.js
export function useTimerLogic() {
  const [isActive, setIsActive] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused || remaining === null) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          playTimerSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, remaining]);

  const start = (seconds) => {
    setRemaining(seconds);
    setIsActive(true);
    setIsPaused(false);
  };

  const stop = () => {
    setIsActive(false);
    setRemaining(null);
  };

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return { start, stop, pause, resume, remaining, isActive, isPaused };
}
```

### Pattern 2: Container/Presentational Component Split

**What:** Separate data-fetching/logic (container) from UI rendering (presentational).

**When to use:** For complex UI sections with state management.

**Trade-offs:**
- ✅ **Pro:** Clear separation, presentational components are pure/testable
- ✅ **Pro:** Easy to reuse presentational components
- ❌ **Con:** More files, boilerplate
- ❌ **Con:** Prop drilling if container too far from presentational

**Example:**
```typescript
// ResultDisplay.jsx (Presentational)
export function ResultDisplay({
  cookingTime,
  idealTime,
  tempDrop,
  effectiveTemp,
  consistency,
  tempUnit,
  formatTime,
  formatTemp
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-5xl font-bold text-amber-600">
        {formatTime(cookingTime)}
      </div>
      {tempDrop > 2 && (
        <div className="text-sm text-blue-600">
          Temperature drop: {formatTemp(tempDrop)}
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Pure Utility Functions

**What:** Extract calculations/formatting into pure functions (no React dependencies).

**When to use:** For deterministic transformations, calculations, formatting.

**Trade-offs:**
- ✅ **Pro:** Easiest to test (simple input → output)
- ✅ **Pro:** No React overhead, can be used anywhere
- ✅ **Pro:** Memoization-friendly
- ❌ **Con:** Can't access React state/effects directly

**Example:**
```typescript
// physics.js (Pure functions)
export function calculateBoilingPointFromPressure(pressureHPa) {
  return Math.round((100 + 0.037 * (pressureHPa - 1013.25)) * 10) / 10;
}

export function calculatePressureFromBoilingPoint(tempC) {
  return Math.round(((tempC - 100) / 0.037 + 1013.25) * 10) / 10;
}

export function calculateAltitudeFromPressure(pressureHPa) {
  return Math.round(44330 * (1 - Math.pow(pressureHPa / 1013.25, 0.1903)));
}
```

### Pattern 4: Service Layer for APIs

**What:** Isolate external API calls into service modules.

**When to use:** For any network communication (REST, GraphQL, WebSocket).

**Trade-offs:**
- ✅ **Pro:** Clear network boundary, easy to mock for testing
- ✅ **Pro:** Error handling centralized
- ✅ **Pro:** API version changes isolated to service layer
- ❌ **Con:** Adds indirection (extra import layer)

**Example:**
```typescript
// meteoApi.js
export async function fetchSurfacePressure(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=surface_pressure`
  );

  if (!response.ok) {
    throw new Error('Weather data unavailable');
  }

  const data = await response.json();
  return {
    pressure: data.current.surface_pressure,
    elevation: data.elevation
  };
}
```

## Data Flow

### Request Flow (User Interaction → Calculation → Display)

```
[User adjusts egg weight slider]
    ↓
[onChange handler updates weight state]
    ↓
[usePhysicsCalculations detects weight change via useEffect dependency]
    ↓
[calculateTime runs with new weight value]
    ↓
[Physics formulas compute new cookingTime, tempDrop, effectiveTemp]
    ↓
[State setters update calculated results]
    ↓
[ResultDisplay re-renders with new cookingTime]
```

### State Management Flow

```
[useSettings Hook]
    ↓ (provides state + setters)
[usePhysicsCalculations Hook] ←── consumes settings state
    ↓ (provides calculated results)
[useEggCalculator Hook] ←── orchestrates all hooks
    ↓ (provides unified state + actions)
[EggCalculator Component] ←── uses orchestration hook
    ↓ (passes props down)
[Child Components] ←── receive state via props
```

### Key Data Flows

1. **Settings Persistence Flow:**
   - User adjusts setting → State updates → useSettings saves to localStorage
   - Page refresh → useSettings loads from localStorage → State initialized

2. **Physics Calculation Flow:**
   - Input state changes → useEffect triggers → calculateTime runs → Results state updates → UI re-renders

3. **Timer Flow:**
   - User clicks "Start Timer" → useTimerLogic.start(seconds) → setInterval begins → Countdown updates every second → On completion: audio plays, notification sent, UI updates

4. **Location/Pressure Flow:**
   - User clicks GPS button → Geolocation API → Latitude/Longitude → meteoApi.fetchSurfacePressure → Pressure state updates → Boiling point recalculated → Cooking time recalculated

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Current (1 component)** | Monolith works but hard to maintain, test, extend |
| **After refactor (modular)** | Custom hooks + components, easy to test/maintain, ready for features |
| **Future scaling** | Could add state management library (Zustand/Jotai) if state becomes very complex, but custom hooks sufficient for current scope |

### Scaling Priorities

1. **First bottleneck:** Testing — current monolith is hard to unit test
   - **Fix:** Extract pure functions/hooks → each testable in isolation

2. **Second bottleneck:** Feature additions — adding features requires touching 1,351-line file
   - **Fix:** Modular components → add features in focused files

3. **Third bottleneck:** Performance — re-renders entire component for any state change
   - **Fix:** Component splitting → React.memo on presentational components → only re-render affected sections

## Anti-Patterns to Avoid

### Anti-Pattern 1: Over-Extraction (Too Many Tiny Hooks)

**What people do:** Create a separate hook for every single piece of state (e.g., `useEggCount()`, `useEggWeight()`, `useEggTemp()`)

**Why it's wrong:**
- Explosion of files with minimal logic
- Prop drilling nightmare (each hook returns 1-2 values)
- Lost cohesion (related state scattered across many hooks)

**Do this instead:**
- Group related state into cohesive hooks (e.g., `useEggInputs()` returns all egg-related state)
- Extract hooks when logic is complex OR reusable, not just because state exists
- Aim for 5-10 hooks total, not 47 hooks

### Anti-Pattern 2: Premature Optimization (React.memo Everywhere)

**What people do:** Wrap every component in React.memo during refactoring

**Why it's wrong:**
- Adds complexity and reduces readability
- Performance gains often negligible for this app size
- Premature optimization is root of evil

**Do this instead:**
- Extract components first without optimization
- Measure performance (React DevTools Profiler)
- Add React.memo ONLY where profiling shows unnecessary re-renders
- For this app: likely only needed for ResultDisplay, egg visualization

### Anti-Pattern 3: Circular Dependencies

**What people do:** Create circular imports (e.g., utils imports hooks, hooks import utils from same file)

**Why it's wrong:**
- Module resolution errors
- Initialization order issues
- Bundler problems

**Do this instead:**
- Keep dependency graph acyclic (DAG)
- Utils layer at bottom (no React dependencies)
- Hooks layer above utils (can import utils)
- Components at top (can import hooks + utils)
- **Never:** utils importing hooks, hooks importing components

### Anti-Pattern 4: God Hook (Single Hook with All Logic)

**What people do:** Create one `useEggCalculator()` hook that contains all 1,351 lines of logic

**Why it's wrong:**
- Just moved the monolith, didn't solve it
- Still hard to test, maintain, understand
- Defeats purpose of refactoring

**Do this instead:**
- Create focused hooks with single responsibilities
- Use composition (hooks calling other hooks)
- Main orchestration hook should be thin (~100 lines), mostly composition
- Each domain hook (physics, timer, location) isolated and testable

### Anti-Pattern 5: Props Drilling Hell

**What people do:** Pass 20+ props through 3+ component levels

**Why it's wrong:**
- Maintenance nightmare (rename prop → update 5 files)
- Component signatures become unreadable
- Easy to forget to pass props down

**Do this instead:**
- Use composition hooks to bundle related props
- For deeply nested components, consider React Context (but avoid for this app size)
- Keep component hierarchy shallow (max 2-3 levels)
- Pass objects instead of individual props when logical (e.g., `settings` object vs 10 separate props)

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Open-Meteo API** | service module → hook → component | Rate limits unknown, handle fetch errors gracefully |
| **Nominatim API** | service module → hook → component | Rate limit: 1 req/sec, requires User-Agent header |
| **Geolocation API** | browser API → hook → component | Requires HTTPS, user permission prompt |
| **Notification API** | browser API → hook | Permission prompt, not supported in all browsers |
| **localStorage** | browser API → hook | Can be disabled, handle storage quota errors |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Component ↔ Hook** | Props in, state/actions out | Standard React pattern, no special considerations |
| **Hook ↔ Hook** | Direct function calls | Composition pattern, orchestration hook calls domain hooks |
| **Hook ↔ Utils** | Import and call | Utils are pure functions, hooks can call freely |
| **Component ↔ Utils** | Import and call | Components can use utils directly for simple formatting |
| **Service ↔ Hook** | async/await | Services return promises, hooks handle loading/error states |

## Migration Strategy

### Verification Protocol

**After each extraction:**

1. **Build verification:**
   ```bash
   npm run build
   # Should complete without errors
   ```

2. **Visual verification:**
   - Open app in browser
   - Test feature related to extraction
   - Compare screenshots before/after (pixel-perfect)

3. **Behavior verification:**
   - Run through full user flow
   - Verify calculations match previous results
   - Check localStorage persistence
   - Test edge cases

4. **Git verification:**
   ```bash
   git add <extracted-files>
   git commit -m "refactor: extract <module> from monolith"
   # Commit after each successful extraction
   ```

### Rollback Strategy

- **Commit after each phase** → if extraction breaks something, revert specific commit
- **Keep original component until Phase 7** → can compare behavior
- **Use feature flags** for risky extractions (conditionally use old vs new code)

### Testing Strategy

**Phase 1-2 (Pure functions/services):**
- Unit tests with known inputs → expected outputs
- No React dependencies, use standard test runners (Vitest)

**Phase 3-4 (Hooks):**
- Use `@testing-library/react-hooks` for isolated hook testing
- Mock dependencies (services, utils)
- Test state transitions and side effects

**Phase 5-6 (Components):**
- Use `@testing-library/react` for component testing
- Integration tests (full component with real hooks)
- Visual regression tests (screenshots)

**Phase 7 (E2E):**
- Full user flow tests
- Test all features in realistic scenarios
- Performance profiling (ensure no regression)

## Success Criteria

Refactoring is successful when:

- ✅ **Behavior preservation:** App works identically to original (pixel-perfect UI, same calculations)
- ✅ **Code quality:** EggCalculator.jsx reduced from 1,351 lines to ~200 lines
- ✅ **Testability:** Each module has >80% test coverage, pure functions at 100%
- ✅ **Maintainability:** New developer can understand architecture in <1 hour
- ✅ **Performance:** No degradation in render performance (measure with React DevTools)
- ✅ **Build size:** Bundle size unchanged or smaller (tree-shaking benefits)

## Sources

- React official documentation: https://react.dev/learn (custom hooks, component composition)
- Codebase analysis: `/Users/beff/_workspace/egg/egg-calculator.jsx` (1,351 lines)
- Translation extraction example: `/Users/beff/_workspace/egg/useTranslation.js` (successful extraction pattern)

---
*Architecture research for: React monolith refactoring (egg calculator)*
*Researched: 2026-01-30*
