# Phase 5: Component Extraction - Research

**Researched:** 2026-01-31
**Domain:** React component extraction, refactoring large components, presentational vs container patterns, file organization, component testing
**Confidence:** HIGH

## Summary

Phase 5 extracts UI sections from the 939-line `egg-calculator.jsx` into focused child components (target ~7 components), each under 400 lines. The main EggCalculator component must also be reduced to under 400 lines. This is a structural refactoring — the application must render and behave identically after extraction. Additionally, any gaps in formatter unit test coverage should be filled.

The component is already well-structured for extraction: it uses 4 custom hooks (useSettings, useUnitConversion, useTimerLogic, useLocationPressure) extracted in Phase 4, imports pure utility modules (physics, formatters, converters, constants) from Phase 3, and has clear visual sections (SettingsPanel, TimerOverlay, ConsistencyPicker, ResultDisplay, EggInputs, LocationPressure, ConfigDialog). The standard approach is to extract **presentational components** (props only, no hook calls) to keep the main component as the single coordination point. This avoids prop drilling issues while maintaining clear data flow.

The existing test infrastructure (Vitest + React Testing Library + jsdom) is sufficient. Component tests should focus on **user behavior** (what users see and interact with) rather than implementation details. Visual parity verification requires running `npm run dev` and `npm run build` after extraction to confirm UI unchanged. The project follows flat file organization with test file mirroring, which should continue.

**Primary recommendation:** Extract presentational components one at a time, verify visual parity after each extraction, write smoke tests for complex components (TimerOverlay, LocationPressure). Keep EggCalculator as the smart component that holds all hooks and state, passing data down as props. Use flat `components/` directory with direct imports (no barrel exports).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | Component rendering, JSX | Already installed; functional components pattern |
| @testing-library/react | 16.3.2 | render, screen, user-event for component tests | Already installed; user-centric testing philosophy |
| Vitest | 4.0.18 | Test runner with jsdom environment | Already installed; Vite integration, fast feedback |
| jsdom | 26.1.0 | DOM simulation for component rendering | Already installed; sufficient for component tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/user-event | 14.6.1 | Simulate realistic user interactions (click, type) | Testing component interactions |
| @testing-library/jest-dom | 6.9.1 | Extended matchers (toBeInTheDocument, toHaveClass) | Testing component rendering |
| Tailwind CSS | 3.4.17 | Styling (existing) | Component styling already uses Tailwind classes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Presentational components | Smart components (call hooks directly) | Each child calling hooks creates multiple sources of truth; presentational keeps data flow explicit |
| Flat components/ directory | Feature-grouped directories | 7 components isn't enough to justify grouping; flat is simpler |
| Direct imports | Barrel exports (index.js) | Barrel exports hide imports; direct imports are clearer for small component counts |
| React Context | Prop drilling | Context adds abstraction for 1-2 levels of props; explicit props are clearer |

**Installation:**
```bash
# No new dependencies needed - all tools already installed
```

## Architecture Patterns

### Recommended Project Structure
```
/
├── components/
│   ├── SettingsPanel.jsx        # Stove, pot, temperature settings
│   ├── TimerOverlay.jsx          # Full-screen timer modal
│   ├── ConsistencyPicker.jsx     # Egg consistency selection buttons
│   ├── ResultDisplay.jsx         # Cooking time, egg visualization, temp drop warning
│   ├── EggInputs.jsx             # Egg count, water volume, size, start temp
│   ├── LocationPressure.jsx      # GPS/pressure/altitude section
│   └── ConfigDialog.jsx          # Settings dialog (units, language)
├── test/
│   ├── components/
│   │   ├── SettingsPanel.test.jsx
│   │   ├── TimerOverlay.test.jsx
│   │   ├── ConsistencyPicker.test.jsx
│   │   ├── ResultDisplay.test.jsx
│   │   ├── EggInputs.test.jsx
│   │   ├── LocationPressure.test.jsx
│   │   └── ConfigDialog.test.jsx
│   ├── hooks/                    # Already exists from Phase 4
│   └── services/                 # Already exists from Phase 4
├── hooks/                        # Already exists from Phase 4
├── services/                     # Already exists from Phase 4
├── physics.js                    # Already exists from Phase 3
├── formatters.js                 # Already exists from Phase 3
├── converters.js                 # Already exists from Phase 3
├── constants.js                  # Already exists from Phase 3
├── useTranslation.js             # Already exists
├── egg-calculator.jsx            # Main smart component (<400 lines after extraction)
└── main.jsx                      # React entry point
```

### Pattern 1: Presentational Component (Props Only)
**What:** Component that receives all data and callbacks via props, renders JSX, calls no hooks except useTranslation
**When to use:** All extracted components (SettingsPanel, TimerOverlay, ConsistencyPicker, ResultDisplay, EggInputs, LocationPressure, ConfigDialog)
**Example:**
```javascript
// components/ConsistencyPicker.jsx
import React from 'react';
import { useTranslation } from '../useTranslation';
import { CONSISTENCY_OPTIONS } from '../constants';
import { formatTemp } from '../formatters';

/**
 * Egg consistency selection UI with 4 option buttons.
 * @param {string} consistency - Current consistency ID
 * @param {string} tempUnit - Temperature unit for display
 * @param {function} onConsistencyChange - Callback with full option object
 */
export const ConsistencyPicker = ({ consistency, tempUnit, onConsistencyChange }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('consistency')}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {CONSISTENCY_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onConsistencyChange(option)}
            className={`p-2 rounded-xl border-2 transition-all ${
              consistency === option.id
                ? 'border-amber-500 bg-amber-50 shadow-md'
                : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: option.color }}
            ></div>
            <div className="font-medium text-gray-900 text-xs">
              {t(option.nameKey)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTemp(option.temp, tempUnit)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Pattern 2: Smart Component with State Coordination
**What:** Main component that holds all hooks, state, and effects, passes data to children as props
**When to use:** EggCalculator (the orchestrator component)
**Example:**
```javascript
// egg-calculator.jsx (simplified structure)
import React, { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';
import { useSettings } from './hooks/useSettings';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useLocationPressure } from './hooks/useLocationPressure';
import { useUnitConversion } from './hooks/useUnitConversion';
import { SettingsPanel } from './components/SettingsPanel';
import { ConsistencyPicker } from './components/ConsistencyPicker';
import { ResultDisplay } from './components/ResultDisplay';
// ... other imports

const EggCalculator = () => {
  const { t, lang, setLanguage, languages } = useTranslation();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { tempUnit, setTempUnit, volumeUnit, setVolumeUnit /* ... */ } = useUnitConversion({
    tempUnit: settings.tempUnit,
    volumeUnit: settings.volumeUnit,
    weightUnit: settings.weightUnit,
    pressureUnit: settings.pressureUnit,
  });
  const { timerActive, timerRemaining, startTimer, stopTimer /* ... */ } = useTimerLogic({
    notificationTitle: `🥚 ${t('notificationTitle')}`,
    notificationBody: t('notificationBody'),
  });
  const { pressure, boilingPoint, altitude, locationName /* ... */ } = useLocationPressure();

  // Calculated results state (local to component)
  const [cookingTime, setCookingTime] = useState(null);
  const [tempDrop, setTempDrop] = useState(null);
  const [effectiveTemp, setEffectiveTemp] = useState(null);

  // UI state (local to component)
  const [showSettings, setShowSettings] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Calculation effect
  useEffect(() => {
    // ... calculation logic
  }, [/* dependencies */]);

  // Handlers that compose hook actions
  const handleConsistencyChange = (option) => {
    updateSetting('consistency', option.id);
    updateSetting('targetTemp', option.temp);
  };

  const handleTempUnitChange = (unit) => {
    setTempUnit(unit);
    updateSetting('tempUnit', unit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-8">
      {/* Pass all needed data and callbacks as props */}
      <ConsistencyPicker
        consistency={settings.consistency}
        tempUnit={tempUnit}
        onConsistencyChange={handleConsistencyChange}
      />
      <ResultDisplay
        cookingTime={cookingTime}
        tempDrop={tempDrop}
        effectiveTemp={effectiveTemp}
        tempUnit={tempUnit}
        consistency={settings.consistency}
      />
      {/* ... other components */}
    </div>
  );
};

export default EggCalculator;
```

### Pattern 3: Component Testing (User-Centric)
**What:** Test components by what users see/do, not internal implementation
**When to use:** All component tests
**Example:**
```javascript
// test/components/ConsistencyPicker.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsistencyPicker } from '../../components/ConsistencyPicker';

describe('ConsistencyPicker', () => {
  it('renders all consistency options', () => {
    const handleChange = vi.fn();
    render(
      <ConsistencyPicker
        consistency="medium"
        tempUnit="C"
        onConsistencyChange={handleChange}
      />
    );

    // Test what user sees
    expect(screen.getByText(/weich/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/hart-medium/i)).toBeInTheDocument();
    expect(screen.getByText(/hart/i)).toBeInTheDocument();
  });

  it('highlights selected consistency', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <ConsistencyPicker
        consistency="medium"
        tempUnit="C"
        onConsistencyChange={handleChange}
      />
    );

    // Find button containing "Medium" text
    const mediumButton = screen.getByText(/^medium$/i).closest('button');
    expect(mediumButton).toHaveClass('border-amber-500', 'bg-amber-50');
  });

  it('calls callback when option clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <ConsistencyPicker
        consistency="medium"
        tempUnit="C"
        onConsistencyChange={handleChange}
      />
    );

    // Simulate user interaction
    await user.click(screen.getByText(/hart-medium/i));
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'hard-medium' })
    );
  });

  it('formats temperatures in Fahrenheit when tempUnit is F', () => {
    const handleChange = vi.fn();
    render(
      <ConsistencyPicker
        consistency="medium"
        tempUnit="F"
        onConsistencyChange={handleChange}
      />
    );

    // Verify Fahrenheit conversion (medium = 63°C = 145°F)
    expect(screen.getByText(/145°F/i)).toBeInTheDocument();
  });
});
```

### Pattern 4: Extraction Process (One Component at a Time)
**What:** Incremental extraction with visual verification after each step
**When to use:** The extraction process itself
**Steps:**
```bash
# 1. Identify component boundary in egg-calculator.jsx
# 2. Copy JSX section to new components/ComponentName.jsx
# 3. Identify all data and callbacks the JSX uses
# 4. Add props parameter with destructuring
# 5. Add useTranslation() if needed for t()
# 6. Import and replace JSX in egg-calculator.jsx with <ComponentName {...props} />
# 7. Run npm run dev - verify visual parity
# 8. Run npm run build - verify build succeeds
# 9. Run npm test - verify existing tests pass
# 10. Write component test (optional for simple components, required for complex)
# 11. Commit extraction
# 12. Repeat for next component
```

### Anti-Patterns to Avoid

- **Calling hooks inside extracted components:** Keep hooks in EggCalculator only; extracted components receive data via props. Otherwise, you create multiple sources of truth.
- **Deep prop drilling via intermediary components:** If props pass through 3+ levels, consider extracting the intermediary into a smaller component or flattening the hierarchy.
- **Testing implementation details:** Don't test that a button has `onClick={handleClick}`. Test that clicking the button produces the expected behavior.
- **Over-extraction:** Don't extract a component for every 10 lines. Extract when there's a clear UI section with a cohesive purpose.
- **Extracting loops in JSX without benefit:** A `.map()` loop doesn't need extraction unless the mapped element is complex (>20 lines).
- **Breaking existing component behavior:** Run existing smoke test after EVERY extraction to catch subtle differences early.
- **Using React Context prematurely:** For 1-2 levels of props, explicit props are clearer. Context is overkill for this component tree depth.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User interaction simulation | Manually firing onChange/onClick events | `userEvent` from @testing-library/user-event | Simulates realistic browser behavior (focus, blur, input events in correct order) |
| Component rendering in tests | Custom render wrapper | `render` from @testing-library/react | Purpose-built, handles cleanup, provides screen queries |
| Visual regression testing | Screenshot comparison tool | Manual dev server + build verification | For this phase scope, manual verification is sufficient; visual regression tools (Percy, Chromatic) add complexity |
| Component prop validation | PropTypes package | JSDoc comments + TypeScript (future) | PropTypes is runtime overhead; JSDoc provides documentation without runtime cost |
| Callback mocking | Custom spy function | `vi.fn()` from Vitest | Built-in mock tracking, automatic cleanup, assertion helpers |

**Key insight:** React Testing Library's philosophy is "test like a user" — query by text users see, interact via userEvent, assert on observable behavior. This makes tests resilient to refactoring because they don't depend on component internal structure.

## Common Pitfalls

### Pitfall 1: Breaking Visual Parity During Extraction
**What goes wrong:** Component looks or behaves differently after extraction (button position changed, spacing off, interaction broken)
**Why it happens:** Subtle differences in JSX structure, missing className, incorrect prop passing, missing conditional logic
**How to avoid:**
1. Copy JSX exactly as-is first (don't refactor while extracting)
2. Run dev server side-by-side (before/after) and visually compare every UI state
3. Test all interactions (click buttons, change inputs, trigger edge cases)
4. Check responsive behavior (resize browser window)
5. Verify all conditional rendering paths (open/close panels, show/hide sections)
**Warning signs:** Visual difference in dev server, existing smoke test fails, interaction no longer works

### Pitfall 2: Prop Drilling Without Documenting
**What goes wrong:** Component has 10+ props, unclear what each does, prop types mismatch
**Why it happens:** Extracting without planning the component's interface, adding props ad-hoc
**How to avoid:**
1. Add JSDoc comment with `@param` for each prop
2. List props in destructuring to make them explicit: `({ consistency, tempUnit, onConsistencyChange })`
3. Use descriptive prop names (`onConsistencyChange` not `onChange`)
4. Group related props into objects if needed (but prefer flat for clarity)
**Warning signs:** Component has >12 props, unclear what props are required vs optional, prop names don't describe purpose

### Pitfall 3: Component Using Stale Props
**What goes wrong:** Component displays old data after parent state updates
**Why it happens:** Component relies on internal state instead of props, or memoization prevents re-render
**How to avoid:**
1. Make components fully controlled (no internal state for data that comes from props)
2. Avoid `useMemo`/`useCallback`/`React.memo` during initial extraction (optimize later if needed)
3. Test that changing props causes re-render with new data
**Warning signs:** Component doesn't update when parent state changes, stale values displayed

### Pitfall 4: Not Passing Callbacks to Child Components
**What goes wrong:** Child component can't communicate user actions to parent (button clicks don't work)
**Why it happens:** Forgetting to pass callback props, or passing the wrong callback
**How to avoid:**
1. For every interactive element (button, input, select), identify the current handler
2. Pass the handler as a prop (e.g., `onClick={handleStoveTypeChange}` becomes `onStoveTypeChange={handleStoveTypeChange}`)
3. In the component, destructure and use: `onClick={() => onStoveTypeChange(stove.id)}`
4. Test the callback is called with correct arguments
**Warning signs:** Buttons don't respond to clicks, inputs don't update, selections ignored

### Pitfall 5: Over-Fragmenting Components
**What goes wrong:** 20+ tiny components (each <30 lines), excessive indirection, hard to follow data flow
**Why it happens:** Following "single responsibility" too strictly, extracting every JSX section
**How to avoid:**
1. Extract components for clear UI sections (not arbitrary line count)
2. Keep related elements together (label + input + validation can stay in one component)
3. Only extract when it improves clarity or enables reuse
4. Aim for 7-10 components (the ROADMAP target is reasonable)
**Warning signs:** Components with <30 lines that don't have clear responsibility, hard to find where data flows

### Pitfall 6: Testing Internal Implementation Instead of User Behavior
**What goes wrong:** Tests break on harmless refactors (renaming variables, changing div to section)
**Why it happens:** Testing that specific DOM structure exists, testing className directly, testing props passed internally
**How to avoid:**
1. Query by text users see: `screen.getByText(/consistency/i)` not `container.querySelector('.consistency-label')`
2. Query by role: `screen.getByRole('button', { name: /start timer/i })` not `container.querySelector('button')`
3. Test observable behavior: "clicking button calls callback" not "button has onClick prop"
4. Avoid `container.querySelector` unless absolutely necessary
**Warning signs:** Tests break when changing div to section, tests break when changing className, tests depend on exact DOM structure

### Pitfall 7: Forgetting to Import Constants/Formatters in Extracted Components
**What goes wrong:** Component throws "X is not defined" error
**Why it happens:** Original component has imports at top; extracted component needs same imports
**How to avoid:**
1. When extracting JSX that uses `CONSISTENCY_OPTIONS`, add `import { CONSISTENCY_OPTIONS } from '../constants'`
2. When extracting JSX that uses `formatTemp()`, add `import { formatTemp } from '../formatters'`
3. When extracting JSX that uses `t()`, add `import { useTranslation } from '../useTranslation'` and call `const { t } = useTranslation()`
4. Check all references in the extracted JSX and add imports
**Warning signs:** Runtime error "X is not defined", missing translations, missing constants

### Pitfall 8: Not Testing Edge Cases in Complex Components
**What goes wrong:** Component works in happy path but breaks with edge case data (null, empty array, zero)
**Why it happens:** Tests only cover typical use case, not boundary conditions
**How to avoid:**
1. For TimerOverlay: test timerActive=true, timerComplete=true, timerPaused=true
2. For LocationPressure: test loading state, error state, no location name
3. For ResultDisplay: test cookingTime=null, tempDrop=null, idealTime very close to cookingTime
4. Test with different unit combinations (°F, oz, inHg)
**Warning signs:** Component crashes with certain prop combinations, unexpected null displayed

## Code Examples

### Extraction Example: ConfigDialog Component
```javascript
// components/ConfigDialog.jsx
import React from 'react';
import { useTranslation } from '../useTranslation';

/**
 * Settings dialog for units and language selection.
 * Renders as modal with backdrop when visible.
 *
 * @param {boolean} visible - Whether dialog is shown
 * @param {function} onClose - Callback to close dialog
 * @param {string} tempUnit - Current temperature unit ('C' or 'F')
 * @param {string} volumeUnit - Current volume unit ('L' or 'oz')
 * @param {string} weightUnit - Current weight unit ('g' or 'oz')
 * @param {string} pressureUnit - Current pressure unit ('hPa' or 'inHg')
 * @param {function} onTempUnitChange - Callback with new temp unit
 * @param {function} onVolumeUnitChange - Callback with new volume unit
 * @param {function} onWeightUnitChange - Callback with new weight unit
 * @param {function} onPressureUnitChange - Callback with new pressure unit
 * @param {Array} languages - Available language options
 * @param {string} currentLanguage - Current language code
 * @param {function} onLanguageChange - Callback with new language code
 */
export const ConfigDialog = ({
  visible,
  onClose,
  tempUnit,
  volumeUnit,
  weightUnit,
  pressureUnit,
  onTempUnitChange,
  onVolumeUnitChange,
  onWeightUnitChange,
  onPressureUnitChange,
  languages,
  currentLanguage,
  onLanguageChange,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 w-80 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            ⚙️ {t('configDialogTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Temperature Unit */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('configTempUnit')}
          </label>
          <button
            onClick={() => onTempUnitChange(tempUnit === 'C' ? 'F' : 'C')}
            className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <span className={tempUnit === 'C' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              °C
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className={tempUnit === 'F' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              °F
            </span>
          </button>
        </div>

        {/* Volume Unit */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('configVolumeUnit')}
          </label>
          <button
            onClick={() => onVolumeUnitChange(volumeUnit === 'L' ? 'oz' : 'L')}
            className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <span className={volumeUnit === 'L' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              L
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className={volumeUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              oz
            </span>
          </button>
        </div>

        {/* Weight Unit */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('configWeightUnit')}
          </label>
          <button
            onClick={() => onWeightUnitChange(weightUnit === 'g' ? 'oz' : 'g')}
            className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <span className={weightUnit === 'g' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              g
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className={weightUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              oz
            </span>
          </button>
        </div>

        {/* Pressure Unit */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('configPressureUnit')}
          </label>
          <button
            onClick={() => onPressureUnitChange(pressureUnit === 'hPa' ? 'inHg' : 'hPa')}
            className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            <span className={pressureUnit === 'hPa' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              hPa
            </span>
            <span className="text-gray-300 mx-2">|</span>
            <span className={pressureUnit === 'inHg' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>
              inHg
            </span>
          </button>
        </div>

        {/* Language */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('configLanguage')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => onLanguageChange(language.code)}
                className={`p-2 rounded-lg border-2 transition-all text-sm ${
                  currentLanguage === language.code
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <span className="mr-1">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
```

### Testing ConfigDialog
```javascript
// test/components/ConfigDialog.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigDialog } from '../../components/ConfigDialog';

describe('ConfigDialog', () => {
  const mockLanguages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    tempUnit: 'C',
    volumeUnit: 'L',
    weightUnit: 'g',
    pressureUnit: 'hPa',
    onTempUnitChange: vi.fn(),
    onVolumeUnitChange: vi.fn(),
    onWeightUnitChange: vi.fn(),
    onPressureUnitChange: vi.fn(),
    languages: mockLanguages,
    currentLanguage: 'de',
    onLanguageChange: vi.fn(),
  };

  it('does not render when visible is false', () => {
    render(<ConfigDialog {...defaultProps} visible={false} />);
    expect(screen.queryByText(/Einstellungen/i)).not.toBeInTheDocument();
  });

  it('renders dialog when visible is true', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText(/Einstellungen/i)).toBeInTheDocument();
  });

  it('highlights current temperature unit', () => {
    render(<ConfigDialog {...defaultProps} tempUnit="C" />);
    const celsiusSpan = screen.getByText('°C');
    expect(celsiusSpan).toHaveClass('text-amber-600', 'border-b-2');
  });

  it('toggles temperature unit when button clicked', async () => {
    const user = userEvent.setup();
    const onTempUnitChange = vi.fn();
    render(<ConfigDialog {...defaultProps} onTempUnitChange={onTempUnitChange} />);

    // Find and click the temperature unit toggle button
    const tempButton = screen.getByText('°C').closest('button');
    await user.click(tempButton);

    expect(onTempUnitChange).toHaveBeenCalledWith('F');
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfigDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<ConfigDialog {...defaultProps} onClose={onClose} />);

    const backdrop = container.querySelector('.fixed.inset-0.bg-black');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders all language options', () => {
    render(<ConfigDialog {...defaultProps} />);
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('🇩🇪')).toBeInTheDocument();
    expect(screen.getByText('🇬🇧')).toBeInTheDocument();
  });

  it('highlights current language', () => {
    render(<ConfigDialog {...defaultProps} currentLanguage="de" />);
    const deutschButton = screen.getByText('Deutsch').closest('button');
    expect(deutschButton).toHaveClass('border-amber-500', 'bg-amber-50');
  });

  it('calls onLanguageChange when language clicked', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();
    render(<ConfigDialog {...defaultProps} onLanguageChange={onLanguageChange} />);

    await user.click(screen.getByText('English'));
    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Container/Presentational with classes | Hooks in parent, props to children | React 16.8 (2019) | Hooks replaced class-based containers; presentational pattern still valid with functional components |
| PropTypes for validation | JSDoc + TypeScript | ~2020+ | PropTypes is runtime overhead; JSDoc provides documentation; TypeScript is compile-time safety |
| Separate .test.js files | Co-located .test.jsx files | Modern convention | Tests alongside components, easier to find |
| CSS modules | Tailwind utility classes | ~2020+ | Utility-first CSS reduces custom class names |
| getByTestId queries | getByRole, getByText queries | Testing Library v10+ (2020) | Accessibility-focused queries encourage better markup |
| fireEvent | userEvent | @testing-library/user-event v14+ | userEvent simulates realistic browser behavior |

**Deprecated/outdated:**
- **PropTypes package:** Runtime overhead, prefer JSDoc or TypeScript
- **getByTestId as primary query:** Should be last resort; prefer getByRole, getByText, getByLabelText
- **Enzyme:** Deprecated; use React Testing Library instead
- **Class-based container components:** Use hooks in functional components instead

## Open Questions

1. **Should SettingsPanel and ConfigDialog be merged?**
   - What we know: SettingsPanel is household settings (stove, pot, temps), ConfigDialog is user preferences (units, language)
   - What's unclear: Whether these are conceptually separate enough to justify two components
   - Recommendation: Keep separate. SettingsPanel is collapsible section within main layout; ConfigDialog is modal overlay. Different visual treatments and purposes.

2. **Should TimerOverlay render conditionally or always mount with visibility prop?**
   - What we know: Current code uses `{(timerActive || timerComplete) && <div>...</div>}` (lines 372-435)
   - What's unclear: Whether to continue conditional rendering or use visibility prop
   - Recommendation: Keep conditional rendering (`{timerActive || timerComplete) && <TimerOverlay ... />}`). Simpler than managing visibility state, no performance difference for this component.

3. **Should getEggVisualization() be extracted to a component?**
   - What we know: It's a function returning SVG JSX (lines 237-250), used once in ResultDisplay
   - What's unclear: Whether it warrants its own component file
   - Recommendation: Keep as inline JSX within ResultDisplay component. It's simple SVG, no interactivity, no reuse. Extracting would add file without benefit.

4. **Should formatters be imported in each component or passed as props?**
   - What we know: Formatters are pure functions (formatTemp, formatVolume, etc.)
   - What's unclear: Whether each component should import formatters directly or receive them as props
   - Recommendation: Import directly in each component. Formatters are stateless utilities (like lodash); passing as props adds boilerplate without benefit.

## Sources

### Primary (HIGH confidence)
- [React Official Docs: Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) - When to use Context vs props
- [React Testing Library Docs: Query Priority](https://testing-library.com/docs/queries/about/#priority) - getByRole > getByLabelText > getByText > getByTestId
- [Kent C. Dodds: When to Break Up a Component](https://kentcdodds.com/blog/when-to-break-up-a-component-into-multiple-components) - Component extraction philosophy
- [Testing Library: Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Implementation vs behavior testing
- Existing codebase: Phase 4 hooks (useSettings, useTimerLogic, useLocationPressure, useUnitConversion)
- Existing codebase: egg-calculator.jsx (939 lines) - All extraction source code analyzed

### Secondary (MEDIUM confidence)
- [Alex Kondov: Refactoring a Messy React Component](https://alexkondov.com/refactoring-a-messy-react-component/) - Practical extraction patterns
- [Thiraphat Phutson: Splitting Components in React](https://thiraphat-ps-dev.medium.com/splitting-components-in-react-a-path-to-cleaner-and-more-maintainable-code-f0828eca627c) - Component splitting benefits
- [patterns.dev: Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern/) - Pattern overview and hooks integration
- [Vitest Component Testing Guide](https://vitest.dev/guide/browser/component-testing) - Browser mode vs jsdom for component testing
- [Trio Dev: Best Practices for React UI Testing 2026](https://trio.dev/best-practices-for-react-ui-testing/) - Testing strategies

### Tertiary (LOW confidence)
- [OneUpTime: Visual Regression Testing with Chromatic](https://oneuptime.com/blog/post/2026-01-15-visual-regression-testing-react-chromatic/view) - Visual regression tools (not needed for this phase)
- [Nucamp: Testing in 2026](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Full stack testing strategy overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools already installed, React Testing Library patterns verified
- Architecture: HIGH - Presentational component pattern is well-established; Phase 4 provides hook precedent
- Component boundaries: HIGH - Visual sections in current component are clearly delineated
- Testing approach: HIGH - React Testing Library philosophy documented, user-centric testing proven
- File organization: MEDIUM - Flat structure recommended based on component count, but could be adjusted

**Research date:** 2026-01-31
**Valid until:** ~30 days (React patterns stable; testing library APIs stable)
