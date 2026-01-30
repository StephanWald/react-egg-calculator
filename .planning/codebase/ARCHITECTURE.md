# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Single Component Monolithic Application

**Key Characteristics:**
- Entire application is one functional React component (`EggCalculator`)
- All state, logic, and UI rendered in a single ~1,350-line file
- No file-based modularity or component decomposition
- All business logic, physics calculations, and UI rendering co-located
- localStorage-based persistence (no backend or external state management)

## Layers

**Presentation Layer:**
- Purpose: Render interactive UI with Tailwind CSS styling
- Location: `egg-calculator.jsx` (lines 661-1349)
- Contains: JSX markup, form controls, dialogs, timers, visualizations
- Depends on: All state, helper functions, translation system
- Used by: User interactions trigger state changes

**State Management Layer:**
- Purpose: Hold and persist application state
- Location: `egg-calculator.jsx` (lines 3-59)
- Contains: 50+ useState hooks organized into logical groups:
  - Working inputs (weight, temps, egg count, water volume)
  - Household settings (stove, pot, ambient conditions)
  - Location & pressure (altitude, coordinates, boiling point)
  - Calculated results (cooking time, energy, temperature drop)
  - UI toggles (settings panel, timer, dialogs)
  - Unit preferences (temperature, volume, weight, pressure)
  - Timer state (active, paused, remaining time)
- Depends on: localStorage API for persistence
- Used by: All UI components and calculation functions

**Business Logic Layer:**
- Purpose: Calculate cooking times using thermodynamic physics
- Location: `egg-calculator.jsx` (lines 302-493)
- Contains:
  - `calculateTime()`: Main Williams formula implementation (lines 425-493)
  - `calculateBoilingPointFromPressure()`: Clausius-Clapeyron approximation (line 304)
  - `calculatePressureFromBoilingPoint()`: Inverse calculation (line 308)
  - `calculateAltitudeFromPressure()`: Barometric formula (line 312)
  - `getPotHeatCapacity()`: Look up heat capacity by pot material (line 316)
- Depends on: State values, preset material/stove constants
- Used by: useEffect hook that triggers on parameter changes

**Integration Layer:**
- Purpose: Connect to external services
- Location: `egg-calculator.jsx` (lines 333-398)
- Contains:
  - `getLocationAndPressure()`: Fetches GPS coordinates, gets atmospheric pressure from Open-Meteo API, reverse-geocodes location with Nominatim (lines 333-398)
  - Timer sound generation using Web Audio API (lines 551-583)
  - Browser notifications via Notification API (lines 187-219)
  - Service Worker registration via `index.html` (lines 26-33)
- Depends on: Geolocation API, Open-Meteo API, Nominatim API, Web Audio API
- Used by: Button handlers and timer completion

**Helper/Utility Layer:**
- Purpose: Format output and manage state transitions
- Location: `egg-calculator.jsx` (lines 585-659)
- Contains:
  - Unit conversion helpers: `formatTemp()`, `formatVolume()`, `formatWeight()`, `formatPressure()` (lines 614-644)
  - Time formatters: `formatTime()`, `formatTimerDisplay()`, `formatCountdown()` (lines 592-611)
  - `getEggVisualization()`: SVG egg visualization (lines 646-659)
  - `handleConsistencyChange()`: Sync consistency to target temp (lines 587-590)
  - `handleStoveTypeChange()`: Sync stove type to efficiency/power (lines 322-329)
  - `handleManualPressure()`: Update derived pressure values (lines 402-408)
  - `handleManualBoilingPoint()`: Update derived boiling point values (lines 410-416)
  - `handleResetToDefaults()`: Restore all state to initial values (lines 222-262)

**Translation Layer:**
- Purpose: Support multiple languages (6 languages: en, de, fr, es, it, pt)
- Location: `useTranslation.js` (custom hook), `translations.js` (translation strings)
- Contains: `useTranslation()` hook with `t()` function for key lookup
- Depends on: localStorage for language preference
- Used by: All UI text rendering via `t('keyName')`

## Data Flow

**Main Calculation Flow:**

1. User modifies input (egg weight, temps, egg count, water volume, stove settings)
2. State setter triggered (e.g., `setWeight(60)`)
3. useEffect dependency array matches → `calculateTime()` executes (line 420)
4. Physics calculations compute:
   - Temperature drop when eggs added to water
   - Recovery factor based on stove power and ambient heat loss
   - Effective cooking temperature after recovery
   - Cooking time via Williams formula
   - Total energy consumption
5. Result state updated (`setCookingTime()`, `setEffectiveTemp()`, `setTotalEnergy()`)
6. Component re-renders with new cooking time displayed

**Timer Flow:**

1. User clicks "Start Timer" button
2. `handleStartTimer()` triggered:
   - Requests notification permission if needed
   - Sets `timerRemaining` to cooking time in seconds
   - Sets `timerActive = true`
3. useEffect timer logic activates (line 166):
   - Interval fires every 1000ms
   - Decrements `timerRemaining` by 1
   - When `timerRemaining <= 0`: sets `timerComplete = true`, plays sound
4. Timer UI overlays entire screen (z-index 50), shows countdown
5. User can pause/resume or stop
6. On completion: plays audio alert, sends browser notification, vibrates device
7. User dismisses completion overlay → timer state cleared

**Pressure Detection Flow:**

1. User clicks "GPS & Weather" button
2. `getLocationAndPressure()` executes:
   - Requests device geolocation (enableHighAccuracy mode)
   - Calls Open-Meteo API with coordinates: `https://api.open-meteo.com/v1/forecast?latitude=X&longitude=Y&current=surface_pressure`
   - Calls Nominatim API: `https://nominatim.openstreetmap.org/reverse?format=json&lat=X&lon=Y`
   - Updates pressure, altitude, boiling point, location name
   - Sets `pressureSource = 'gps'`
3. Physics recalculation triggered via useEffect
4. Pressure UI updated with detected values and location name

**Persistence Flow:**

1. On component mount: useEffect loads saved settings from localStorage (line 64)
2. Any state change to watched variables → save to localStorage (line 104)
3. Saved keys: weight, temps, consistency, egg count, water volume, stove settings, location, units, notification permission
4. Manual reset button clears localStorage and resets all state

**State Management:**

- All state local to component instance (no Redux, Context, or external store)
- No parent component dependencies
- localStorage serves as pseudo-persistent storage
- Each setting change cascades to dependent calculations via useEffect hooks

## Key Abstractions

**Thermodynamic Model:**
- Purpose: Model egg cooking as heat transfer problem
- Examples: `calculateTime()` (line 425)
- Pattern:
  - Temperature drop computation: energy conservation when cold eggs meet hot water
  - Recovery factor: how quickly water recovers temperature after adding eggs
  - Effective temperature: post-recovery cooking temperature
  - Williams formula: empirical formula correlating mass, temperature differential, and cooking time
  - Energy accounting: sum of water heating, pot heating, egg heating, ambient losses

**Configuration Presets:**
- Purpose: Provide sensible defaults and constraints for user inputs
- Examples: `stoveTypes` (line 266), `potMaterials` (line 274), `consistencyOptions` (line 282), `startTempOptions` (line 296)
- Pattern: Array of objects with id, display name (translation key), and parameters (efficiency, power, heat capacity, color, etc.)

**UI Toggle Pattern:**
- Purpose: Expand/collapse sections (Settings, Advanced, Energy) and overlay dialogs
- Examples: `showSettings`, `showAdvanced`, `showEnergy`, `showConfigDialog`
- Pattern: Boolean state controls conditional rendering; click handler toggles state

**Location & Pressure Coupling:**
- Purpose: Synchronized state for altitude, pressure, boiling point
- Pattern: Changing pressure via input recalculates boiling point and altitude; changing boiling point does inverse calc
- APIs used: Geolocation, Open-Meteo, Nominatim

## Entry Points

**React Application Entry:**
- Location: `main.jsx`
- Triggers: Page load
- Responsibilities: Bootstrap React, render EggCalculator into `#root` DOM element

**PWA Service Worker:**
- Location: Service worker registration in `index.html` (line 28)
- Triggers: Page load (navigator.serviceWorker.register('./sw.js'))
- Responsibilities: Offline functionality, caching (implemented in `public/sw.js`)

**User Interactions:**
- Settings button (gear icon, top right): Opens/closes config dialog
- Consistency buttons: Change target cooking temperature
- Egg size preset buttons: Set egg weight to standard sizes
- Start Temperature quick-select: Set egg starting temperature
- Stove Type selection: Pre-populate stove power and efficiency
- GPS & Weather button: Fetch current pressure and location
- Manual inputs: Pressure, water volume, stove power, pot weight
- Timer Start/Stop: Begin countdown timer
- Timer Pause/Resume: Control timer during countdown
- Reset Settings: Restore all defaults

## Error Handling

**Strategy:** Graceful degradation with fallbacks

**Patterns:**

**Location/Pressure Detection:**
- Geolocation API failure: Show error message, allow manual pressure entry
- Open-Meteo API failure: Revert to last known pressure (1013.25 hPa default)
- Nominatim reverse geocoding failure: Show pressure without location name

**Notifications:**
- Browser notification unavailable: Fallback to audio alert (inline WAV data)
- Audio playback blocked: Silent fallback (try/catch handles AudioContext errors)
- Vibration API missing: Graceful skip (navigator.vibrate check)

**localStorage:**
- Access denied/quota exceeded: Settings not persisted but app still functional
- Corrupted data on load: Wrapped in try/catch, revert to defaults on parse error

**Calculations:**
- Invalid input values: `cookingTime` set to null, UI disables timer button
- Guard condition: Check `weight > 0 && boilingPoint > targetTemp && targetTemp > startTemp` before calculating

## Cross-Cutting Concerns

**Logging:**
- Minimal console.error for localStorage failures (lines 99, 120, 227)
- No systematic logging framework

**Validation:**
- Input range constraints via HTML input min/max attributes
- Logical constraints checked before calculation (temperature hierarchies)
- User confirmation dialog for destructive reset action

**Authentication:**
- Not applicable (no backend, public calculator)

**Localization:**
- Translation hook pattern: `useTranslation()` provides `t('key')` function
- Supported languages: English, German, French, Spanish, Italian, Portuguese
- Language preference persisted to localStorage
- Auto-detection on first load: Browser language or fallback to English

**Performance:**
- All calculations synchronous (microseconds to milliseconds)
- No lazy loading or code splitting
- Tailwind CSS compiled inline (no external stylesheet downloads)
- Single bundle includes React, Vite-compiled JSX, Tailwind utilities
- Timer uses setInterval (1000ms resolution, inherently efficient)

**Accessibility:**
- No explicit a11y features observed
- Relies on semantic HTML button elements
- Color-coded UI (not suitable for colorblind users without labels)
- Tab navigation possible with native HTML inputs

---

*Architecture analysis: 2026-01-30*
