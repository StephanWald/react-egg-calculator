# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- React components: PascalCase with `.jsx` extension (e.g., `EggCalculator.jsx`)
- Utility/hook files: camelCase with `.js` extension (e.g., `useTranslation.js`, `translations.js`)
- Config files: kebab-case with descriptive names (e.g., `vite.config.js`, `tailwind.config.js`)

**Functions:**
- React components: PascalCase (e.g., `EggCalculator`, `useTranslation`)
- Utility functions: camelCase (e.g., `calculateBoilingPointFromPressure`, `formatTime`)
- Event handlers: `handle` + PascalCase (e.g., `handleStartTimer`, `handleStoveTypeChange`)
- Formatting helpers: `format` + descriptor (e.g., `formatTime`, `formatTemp`, `formatVolume`)
- Calculation helpers: `calculate` + descriptor (e.g., `calculateBoilingPointFromPressure`)
- Getters: `get` + descriptor (e.g., `getLocationAndPressure`, `getEggVisualization`)

**Variables:**
- State variables: camelCase (e.g., `weight`, `startTemp`, `cookingTime`, `showSettings`)
- Constants: UPPER_SNAKE_CASE for global/configuration values (e.g., `STORAGE_KEY`)
- Object/array data: camelCase (e.g., `stoveTypes`, `potMaterials`, `consistencyOptions`)

**Types/Enums:**
- No TypeScript used; state enums as plain objects with `id` and descriptive properties
- Example pattern in `egg-calculator.jsx` (line 266-295):
  - `stoveTypes` array with `id`, `nameKey`, `efficiency`, `defaultPower`, `icon`
  - `potMaterials` array with `id`, `nameKey`, `heatCapacity`
  - `consistencyOptions` array with `id`, `nameKey`, `temp`, `color`

## Code Style

**Formatting:**
- No explicit linter/formatter configured (ESLint/Prettier config not present)
- Line length: Practical wrapping observed around 120 characters
- Indentation: 2 spaces (observed in JSX and configuration files)
- Spacing: Single blank lines between function/section blocks

**Linting:**
- No ESLint or Prettier configuration detected
- Style follows common React conventions implicitly

**Section Organization:**
- Code organized with comment headers using `// ============ SECTION NAME ============` pattern
- Examples from `egg-calculator.jsx`:
  - Line 7: `// ============ WORKING INPUTS (per cooking session) ============`
  - Line 302: `// ============ FORMULAS ============`
  - Line 420: `// ============ MAIN CALCULATION ============`
  - Line 495: `// ============ TIMER HANDLERS ============`
  - Line 549: `// ============ AUDIO HELPERS ============`
  - Line 661: `// ============ RENDER ============`

## Import Organization

**Order (observed pattern from source files):**
1. React/React hooks imports (e.g., `import React, { useState, useEffect } from 'react'`)
2. External libraries (e.g., `import ReactDOM from 'react-dom/client'`)
3. Local modules (e.g., `import EggCalculator from './egg-calculator.jsx'`)
4. CSS/styles (e.g., `import './index.css'`)

**Example from `main.jsx` (lines 1-4):**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import EggCalculator from './egg-calculator.jsx';
import './index.css';
```

**Path style:**
- Relative imports with `./` prefix for same-directory imports
- No path aliases configured
- File extensions included in imports (`.jsx`, `.js`)

## Error Handling

**Patterns:**
- Try-catch blocks for asynchronous operations and risky browser APIs
- Silent fallback for non-critical errors (graceful degradation)
- Error logging via `console.error()` only when context is important (lines 99, 120, 387 in `egg-calculator.jsx`)

**Examples:**
1. **Settings persistence (lines 65-101, 104-128):**
   - Try-catch around `localStorage.getItem` and `localStorage.setItem`
   - Console error logged only for unexpected failures
   - Falls back to defaults if parsing fails

2. **Browser API fallback (lines 209-217):**
   - Audio play wrapped in try-catch
   - `.catch()` on promise for play failures
   - Empty catch for silent fallback (comment explains browser blocking)

3. **Location fetching (lines 337-399):**
   - Geolocation wrapped in Promise wrapper for timeout handling
   - Explicit error code checking (lines 388-395)
   - Nested try-catch for non-critical Nominatim API (lines 373-384)

4. **Notification permission (lines 501-509):**
   - Try-catch for promise-based `Notification.requestPermission()`
   - Fallback to 'denied' for older browsers that don't support promises

## Logging

**Framework:** `console` API (no logging library)

**Patterns:**
- `console.error()` used only for unexpected conditions or API failures
- Examples:
  - Line 99: `console.error('Failed to load settings:', e);`
  - Line 120: `console.error('Failed to save settings:', e);`
  - Line 387: `console.error('Location error:', error);`
- No debug/info/warn logs in code
- Info provided via UI state and translations instead

## Comments

**When to Comment:**
- Section headers: Always (every major function block uses `// ============ SECTION ============`)
- Inline explanations: For non-obvious logic (e.g., line 383: `// Ignore - location name is informational only`)
- Fallback explanations: When intentionally not failing (e.g., lines 213, 216, 227, 581)
- Browser compatibility notes: For API quirks (e.g., line 506)

**JSDoc/TSDoc:**
- Not used (no type annotations, no JSDoc blocks)
- Function purpose inferred from name and surrounding comments
- Translations object uses inline comments for section grouping (lines 1-2 in `translations.js`)

## Function Design

**Size:**
- Small utility functions: 2-10 lines (e.g., `formatTime`, `formatTemp`)
- Medium business logic: 20-50 lines (e.g., `calculateTime`)
- Large functions with multiple responsibilities: 200+ lines (e.g., `EggCalculator` component: 1351 lines)

**Parameters:**
- Prefer single arguments for event handlers
- Callback functions use arrow notation (e.g., line 556: `const playBeep = (startTime, frequency) => {...}`)
- State setters receive single value (e.g., `setWeight(Number(e.target.value))`)

**Return Values:**
- Calculation functions return primitive numbers/strings
- React components return JSX
- Utility functions return computed values or void for side effects
- Conditional rendering via early returns in JSX

**Nullish Handling:**
- State initialized with `null` for "not calculated yet" (e.g., lines 34-39)
- Checks before display: `{cookingTime !== null && ...}` (line 1034)
- Fallback values in formatters: `if (minutes === null) return '--:--'` (line 593)

## Module Design

**Exports:**
- Named exports for utilities (e.g., `export function useTranslation()`)
- Default exports for components (e.g., `export default EggCalculator`)
- `translations.js` exports two named exports: `translations` object and `languages` array

**Barrel Files:**
- Not used (single component application, no barrel patterns)

**State Organization:**
- All component state in single `EggCalculator` component using `useState`
- State grouped by semantic meaning with comment headers
- Related setters called together (e.g., when stove type changes, efficiency and power both update)

## Styling

**Framework:** Tailwind CSS

**Patterns:**
- Classes applied inline to JSX elements
- Responsive modifiers used (e.g., `md:p-8`, `md:text-4xl`)
- Color scheme: Amber/orange primary (e.g., `bg-amber-500`, `text-amber-600`)
- Utility-first: No custom CSS classes, all styling via Tailwind
- Transitions: `transition-colors`, `transition-all` for state changes

**Example from lines 664-665:**
```jsx
<div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-8">
  <div className="max-w-2xl mx-auto">
```

## Internationalization

**Pattern:**
- Single `useTranslation()` hook returns translation function
- Translation keys are camelCase strings (e.g., `'title'`, `'consistency'`, `'cookingTime'`)
- `t()` function called inline: `{t('cookingTime')}`
- Fallback chain: current language → English → key itself (line 26 in `useTranslation.js`)

---

*Convention analysis: 2026-01-30*
