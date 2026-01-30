# Phase 3: Utilities Extraction - Research

**Researched:** 2026-01-30
**Domain:** JavaScript/React utility extraction, pure function refactoring, constant organization
**Confidence:** HIGH

## Summary

Phase 3 focuses on extracting formatter functions, unit converters, and constants from the monolithic `egg-calculator.jsx` component into dedicated, testable modules. The codebase already has `physics.js` successfully extracted in Phase 2, providing a proven pattern to follow.

The standard approach for this domain involves creating three new modules: `formatters.js` (pure formatting functions), `converters.js` (unit conversion logic), and `constants.js` (configuration presets and magic numbers). These modules follow the pure function pattern established in Phase 2, making them independently importable with no React dependencies.

Modern JavaScript practices (2026) emphasize named exports, CONSTANT_CASE for truly immutable values, and co-located test files following `.test.js` naming conventions. The key risk during extraction is maintaining visual parity - the component must render identically after refactoring.

**Primary recommendation:** Extract formatters and converters as pure functions with table-driven Vitest tests, organize constants as frozen objects with named exports, and verify no visual regression through existing smoke test.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 2.x | Test runner | Already in project (Phase 1), Jest-compatible API, fast for unit testing |
| ESLint | Latest | Code quality | Enforces no-magic-numbers rule, import/export standards |
| Prettier | Latest | Code formatting | Industry standard, ensures consistent style |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intl.NumberFormat | Native | Number formatting | 2026 best practice for user-facing numeric content (replaces custom toFixed()) |
| Object.freeze() | Native | Immutable constants | Prevent accidental mutation of constant objects |
| import/no-cycle | ESLint plugin | Circular dependency detection | Prevent module import loops |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual converters | convert.js library | Library adds dependency for simple conversions (overkill for 4 units) |
| Frozen objects | TypeScript enums | Project uses JavaScript; enums require TypeScript |
| Named exports | Default exports | Named exports required by Google Style Guide, better for refactoring |

**Installation:**
```bash
# All core tools already installed in Phase 1
# No additional dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── physics.js              # Already exists (Phase 2)
├── formatters.js           # Pure formatting functions
├── converters.js           # Unit conversion logic
├── constants.js            # Configuration presets, magic numbers
├── egg-calculator.jsx      # Main component (imports all above)
├── egg-calculator.test.jsx # Smoke test
test/
├── physics.test.js         # Already exists (Phase 2)
├── formatters.test.js      # New formatter tests
├── converters.test.js      # New converter tests
└── constants.test.js       # New constant validation tests
```

### Pattern 1: Pure Function Extraction
**What:** Extract functions with no side effects, no React dependencies, deterministic output
**When to use:** Formatters, converters, calculations - anything that transforms input to output

**Example:**
```javascript
// formatters.js
// Source: https://medium.com/@satyam202000/demystifying-pure-functions-in-javascript-write-cleaner-predictable-code-44b7d1e6bbe0

/**
 * Format temperature with unit conversion.
 * @param {number} tempC - temperature in Celsius
 * @param {'C'|'F'} unit - target unit
 * @returns {string} formatted temperature with symbol
 */
export const formatTemp = (tempC, unit = 'C') => {
  if (unit === 'F') {
    const tempF = Math.round(tempC * 9 / 5 + 32);
    return `${tempF}°F`;
  }
  return `${tempC}°C`;
};
```

### Pattern 2: Named Exports
**What:** Export symbols explicitly by name, never use default exports
**When to use:** Always (Google JavaScript Style Guide requirement)

**Example:**
```javascript
// constants.js
// Source: https://google.github.io/styleguide/jsguide.html

export const STOVE_TYPES = Object.freeze([
  { id: 'induction', nameKey: 'stoveInduction', efficiency: 0.87, defaultPower: 2200, icon: '⚡' },
  { id: 'ceramic', nameKey: 'stoveCeramic', efficiency: 0.70, defaultPower: 1800, icon: '🔴' },
]);

export const CONSISTENCY_OPTIONS = Object.freeze([
  { id: 'soft', nameKey: 'consistencySoft', temp: 63, color: '#FFD700' },
  { id: 'medium', nameKey: 'consistencyMedium', temp: 67, color: '#FFA500' },
]);
```

### Pattern 3: Frozen Configuration Objects
**What:** Use Object.freeze() to prevent accidental mutation of constants
**When to use:** Configuration arrays/objects that should never change at runtime

**Example:**
```javascript
// constants.js
// Source: https://semaphore.io/blog/constants-layer-javascript

export const EGG_SIZES = Object.freeze([
  { name: 'S', weight: 53 },
  { name: 'M', weight: 58 },
  { name: 'L', weight: 68 },
  { name: 'XL', weight: 78 },
]);

// Attempting mutation will throw in strict mode:
// EGG_SIZES[0].weight = 99; // Error in strict mode
```

### Pattern 4: Separate Conversion Logic
**What:** Split formatting (presentation) from conversion (calculation)
**When to use:** When format functions contain unit conversion math

**Example:**
```javascript
// converters.js
export const celsiusToFahrenheit = (tempC) => Math.round(tempC * 9 / 5 + 32);
export const litersToOunces = (liters) => Math.round(liters * 33.814 * 10) / 10;
export const gramsToOunces = (grams) => Math.round(grams / 28.35 * 10) / 10;
export const hPaToInHg = (hPa) => Math.round(hPa * 0.02953 * 100) / 100;

// formatters.js
import { celsiusToFahrenheit } from './converters.js';

export const formatTemp = (tempC, unit = 'C') => {
  if (unit === 'F') return `${celsiusToFahrenheit(tempC)}°F`;
  return `${tempC}°C`;
};
```

### Pattern 5: Table-Driven Tests for Converters
**What:** Use `it.each()` to test multiple input/output pairs
**When to use:** Testing formatters and converters with known values

**Example:**
```javascript
// test/converters.test.js
// Source: Phase 2 physics.test.js (proven pattern)
import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit } from '../converters';

describe('celsiusToFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [37, 99],
    [-40, -40],
  ])('converts %i°C to %i°F', (celsius, expectedF) => {
    expect(celsiusToFahrenheit(celsius)).toBe(expectedF);
  });
});
```

### Anti-Patterns to Avoid

- **Mixing pure and impure functions:** Keep React hooks, DOM access, and side effects out of utility modules
- **Default exports:** Harder to refactor, no autocomplete, breaks Google Style Guide
- **Barrel imports (index.js):** Can cause circular dependencies when utils import each other
- **God utility file:** Don't create one massive `utils.js` with everything - split by purpose
- **CONSTANT_CASE for everything:** Only truly immutable values use CONSTANT_CASE, not every `const`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number formatting with locales | Custom rounding/formatting | `Intl.NumberFormat` (native) | Handles locales, currencies, units; toFixed() has rounding edge cases |
| Date/time formatting | Custom date formatters | `Temporal` API (2026 standard) | Immutable, timezone-aware, replaces buggy Date object |
| Deep object freezing | Recursive freeze function | Existing library or manual shallow freeze | Shallow freeze sufficient for constant arrays/objects |
| Circular dependency detection | Manual code review | ESLint `import/no-cycle` rule | Automated, runs in CI, catches issues early |

**Key insight:** Formatters in this project are simple (4 units, basic math) and don't warrant external libraries. However, if localization is added later, refactor to use `Intl.NumberFormat` instead of custom string building.

## Common Pitfalls

### Pitfall 1: Forgetting to Update Imports After Extraction
**What goes wrong:** Component still tries to use locally-defined functions that no longer exist
**Why it happens:** Extract function, forget to add import statement at top of component
**How to avoid:**
- Extract one module at a time (formatters → converters → constants)
- Run component tests immediately after each extraction
- Use ESLint to catch undefined function calls
**Warning signs:** `ReferenceError: formatTemp is not defined`, component tests fail

### Pitfall 2: Creating Circular Dependencies
**What goes wrong:** Module A imports B, B imports A → infinite loop or undefined imports
**Why it happens:** Formatters import converters, converters import formatters
**How to avoid:**
- Keep dependency flow one-way: `component → formatters → converters → constants`
- Never import upward in the chain
- Use ESLint `import/no-cycle` rule
**Warning signs:** Webpack warnings about circular dependencies, undefined imports at runtime

### Pitfall 3: Breaking Visual Parity During Extraction
**What goes wrong:** Extracted function produces slightly different output, UI changes subtly
**Why it happens:** Rounding differences, missed edge cases, copy-paste errors
**How to avoid:**
- Copy exact implementation, don't "improve" during extraction
- Run smoke test (`egg-calculator.test.jsx`) to verify component still renders
- Manually verify formatted values match before/after
**Warning signs:** Smoke test fails, numbers render differently, unit symbols change

### Pitfall 4: Not Testing Edge Cases in Formatters
**What goes wrong:** Formatters work for normal values but break on null, NaN, Infinity
**Why it happens:** Original component code never encountered edge cases
**How to avoid:**
- Test null, undefined, NaN, Infinity, negative values
- Test boundary values (0, very large numbers)
- See "Code Examples" section for edge case tests
**Warning signs:** Runtime errors in production, `NaN°C` displayed to users

### Pitfall 5: Over-using CONSTANT_CASE
**What goes wrong:** Every `const` variable uses SCREAMING_SNAKE_CASE, code becomes unreadable
**Why it happens:** Misunderstanding Google Style Guide - not every `const` is a "constant"
**How to avoid:**
- Use CONSTANT_CASE only for module-level, deeply immutable values
- Configuration objects, magic numbers, presets qualify
- Local variables, function parameters do NOT
**Warning signs:** Variables like `const TEMP_C = 100;` in function scope

### Pitfall 6: Forgetting Object.freeze() on Constants
**What goes wrong:** "Constant" arrays/objects get mutated accidentally at runtime
**Why it happens:** JavaScript `const` only prevents reassignment, not mutation
**How to avoid:**
- Wrap exported constant arrays/objects in `Object.freeze()`
- Enable strict mode (`'use strict';`) to throw errors on mutation attempts
- Add tests that verify constants are frozen
**Warning signs:** Configuration changes mysteriously, tests fail intermittently

## Code Examples

Verified patterns from research:

### Formatter Function with Edge Cases
```javascript
// formatters.js
// Source: https://copyprogramming.com/howto/javascript-tofixed-localized

/**
 * Format time in MM:SS format.
 * Handles null, negative, and edge cases gracefully.
 */
export const formatTime = (minutes) => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '--:--';
  }
  if (minutes < 0) return '--:--';

  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Edge Case Tests for Formatters
```javascript
// test/formatters.test.js
// Source: https://teamtreehouse.com/library/javascript-unit-testing/covering-edge-cases

import { describe, it, expect } from 'vitest';
import { formatTime } from '../formatters';

describe('formatTime - edge cases', () => {
  it('handles null input', () => {
    expect(formatTime(null)).toBe('--:--');
  });

  it('handles undefined input', () => {
    expect(formatTime(undefined)).toBe('--:--');
  });

  it('handles NaN input', () => {
    expect(formatTime(NaN)).toBe('--:--');
  });

  it('handles negative values', () => {
    expect(formatTime(-5)).toBe('--:--');
  });

  it('handles zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('handles very large values', () => {
    expect(formatTime(1234.5)).toBe('1234:30');
  });
});
```

### Converter Function Tests
```javascript
// test/converters.test.js
// Pattern proven in Phase 2 (physics.test.js)

import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit, litersToOunces } from '../converters';

describe('celsiusToFahrenheit', () => {
  it.each([
    [0, 32, 'freezing point'],
    [100, 212, 'boiling point'],
    [37, 99, 'body temperature'],
    [-40, -40, 'same in both scales'],
  ])('converts %i°C to %i°F (%s)', (celsius, expectedF) => {
    expect(celsiusToFahrenheit(celsius)).toBe(expectedF);
  });
});

describe('litersToOunces', () => {
  it.each([
    [1.0, 33.8],
    [1.5, 50.7],
    [0.5, 16.9],
  ])('converts %f L to %f oz', (liters, expectedOz) => {
    expect(litersToOunces(liters)).toBeCloseTo(expectedOz, 1);
  });
});
```

### Constants Module with Frozen Objects
```javascript
// constants.js
// Source: https://dmitripavlutin.com/javascript-enum/

'use strict'; // Enable strict mode for freeze enforcement

export const STOVE_TYPES = Object.freeze([
  Object.freeze({ id: 'induction', nameKey: 'stoveInduction', efficiency: 0.87, defaultPower: 2200, icon: '⚡' }),
  Object.freeze({ id: 'ceramic', nameKey: 'stoveCeramic', efficiency: 0.70, defaultPower: 1800, icon: '🔴' }),
  Object.freeze({ id: 'electric', nameKey: 'stoveElectric', efficiency: 0.65, defaultPower: 1500, icon: '⚫' }),
  Object.freeze({ id: 'gas', nameKey: 'stoveGas', efficiency: 0.50, defaultPower: 2500, icon: '🔥' }),
  Object.freeze({ id: 'camping', nameKey: 'stoveCamping', efficiency: 0.30, defaultPower: 1000, icon: '🏕️' }),
]);

export const POT_MATERIALS = Object.freeze([
  Object.freeze({ id: 'steel', nameKey: 'materialSteel', heatCapacity: 0.50 }),
  Object.freeze({ id: 'aluminum', nameKey: 'materialAluminum', heatCapacity: 0.90 }),
  Object.freeze({ id: 'cast_iron', nameKey: 'materialCastIron', heatCapacity: 0.46 }),
  Object.freeze({ id: 'copper', nameKey: 'materialCopper', heatCapacity: 0.39 }),
  Object.freeze({ id: 'ceramic', nameKey: 'materialCeramic', heatCapacity: 0.85 }),
]);

export const CONSISTENCY_OPTIONS = Object.freeze([
  Object.freeze({ id: 'soft', nameKey: 'consistencySoft', temp: 63, color: '#FFD700' }),
  Object.freeze({ id: 'medium', nameKey: 'consistencyMedium', temp: 67, color: '#FFA500' }),
  Object.freeze({ id: 'hard-medium', nameKey: 'consistencyHardMedium', temp: 72, color: '#FF8C00' }),
  Object.freeze({ id: 'hard', nameKey: 'consistencyHard', temp: 77, color: '#FF6347' }),
]);

export const EGG_SIZES = Object.freeze([
  Object.freeze({ name: 'S', weight: 53 }),
  Object.freeze({ name: 'M', weight: 58 }),
  Object.freeze({ name: 'L', weight: 68 }),
  Object.freeze({ name: 'XL', weight: 78 }),
]);

export const START_TEMP_OPTIONS = Object.freeze([
  Object.freeze({ nameKey: 'tempFridge', temp: 4, icon: '❄️' }),
  Object.freeze({ nameKey: 'tempCool', temp: 7, icon: '🌡️' }),
  Object.freeze({ nameKey: 'tempRoom', temp: 20, icon: '🏠' }),
]);
```

### Constants Validation Tests
```javascript
// test/constants.test.js

import { describe, it, expect } from 'vitest';
import { STOVE_TYPES, POT_MATERIALS, EGG_SIZES } from '../constants';

describe('constants are frozen', () => {
  it('STOVE_TYPES array is frozen', () => {
    expect(Object.isFrozen(STOVE_TYPES)).toBe(true);
  });

  it('STOVE_TYPES elements are frozen', () => {
    STOVE_TYPES.forEach(stove => {
      expect(Object.isFrozen(stove)).toBe(true);
    });
  });

  it('EGG_SIZES array is frozen', () => {
    expect(Object.isFrozen(EGG_SIZES)).toBe(true);
  });
});

describe('constants have expected structure', () => {
  it('all stove types have required properties', () => {
    STOVE_TYPES.forEach(stove => {
      expect(stove).toHaveProperty('id');
      expect(stove).toHaveProperty('nameKey');
      expect(stove).toHaveProperty('efficiency');
      expect(stove).toHaveProperty('defaultPower');
      expect(stove.efficiency).toBeGreaterThan(0);
      expect(stove.efficiency).toBeLessThanOrEqual(1);
    });
  });

  it('all egg sizes have name and weight', () => {
    EGG_SIZES.forEach(size => {
      expect(size).toHaveProperty('name');
      expect(size).toHaveProperty('weight');
      expect(size.weight).toBeGreaterThan(0);
    });
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| toFixed() for formatting | Intl.NumberFormat | 2026 standard | Handles locales automatically, no edge case rounding bugs |
| Date object | Temporal API | 2026 standard | Immutable, timezone-aware, eliminates Date bugs |
| Default exports | Named exports only | Google Style Guide 2020+ | Better refactoring, autocomplete, tree-shaking |
| Barrel imports (index.js) | Direct imports | 2024+ recommendation | Avoids circular dependencies |
| Manual immutability | Object.freeze() + strict mode | ES5+ (enforced 2026) | Catches mutation bugs at runtime |

**Deprecated/outdated:**
- **Default exports:** Still work but discouraged; named exports preferred for tooling support
- **Untyped constants:** TypeScript projects use enums; JavaScript uses frozen objects as equivalent
- **Single utils.js file:** Split by purpose (formatters, converters, constants) for maintainability

## Open Questions

Things that couldn't be fully resolved:

1. **Should converters.js be separate from formatters.js?**
   - What we know: Separation of concerns pattern suggests splitting conversion math from presentation logic
   - What's unclear: Whether 4 simple conversions (temp, volume, weight, pressure) justify separate file
   - Recommendation: Start with separate files for clarity; can merge later if deemed unnecessary. Separation mirrors physics.js pattern.

2. **Deep freeze vs shallow freeze for constants?**
   - What we know: Nested objects need recursive freezing; Object.freeze() is shallow only
   - What's unclear: Whether constant objects have sufficient nesting depth to require deep freeze library
   - Recommendation: Use shallow freeze on both array and elements (see code examples). Sufficient for 2-level structure.

3. **Should timer helper functions be extracted?**
   - What we know: `formatTimerDisplay` and `formatCountdown` are pure formatting functions
   - What's unclear: Whether timer-specific formatters belong with general formatters or stay in component
   - Recommendation: Extract to formatters.js - they're pure functions, domain-specific grouping is less important than purity.

4. **Test file location: co-located vs test/ directory?**
   - What we know: Vitest supports both patterns; physics.test.js is in test/ directory
   - What's unclear: Project convention preference
   - Recommendation: Follow existing pattern - use test/ directory to match physics.test.js location.

## Sources

### Primary (HIGH confidence)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) - Constant naming, exports, module structure
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) - Import/export best practices
- [Vitest: In-Source Testing](https://vitest.dev/guide/in-source) - Testing utility functions
- [React Folder Structure (Robin Wieruch)](https://www.robinwieruch.de/react-folder-structure/) - Utils organization patterns
- [JavaScript Pure Functions (Medium)](https://medium.com/@satyam202000/demystifying-pure-functions-in-javascript-write-cleaner-predictable-code-44b7d1e6bbe0) - Pure function patterns

### Secondary (MEDIUM confidence)
- [React Refactoring Patterns (DEV Community, 2025)](https://dev.to/vigneshiyergithub/refactoring-react-taming-chaos-one-component-at-a-time-df) - Component extraction patterns
- [Magic Numbers Refactoring (refactoring.guru)](https://refactoring.guru/replace-magic-number-with-symbolic-constant) - Constants extraction
- [JavaScript Modules Best Practices (Dmitri Pavlutin)](https://dmitripavlutin.com/javascript-modules-best-practices/) - Named vs default exports
- [Circular Dependencies Fix (Medium)](https://medium.com/@Adekola_Olawale/fixing-circular-dependency-issues-in-javascript-modules-24c953345520) - Avoiding circular imports
- [Constants Layer in JavaScript (Semaphore)](https://semaphore.io/blog/constants-layer-javascript) - Dedicated constants organization

### Tertiary (LOW confidence)
- [Vitest Best Practices (StudyRaid)](https://app.studyraid.com/en/read/11292/352302/naming-conventions-and-patterns) - Test naming conventions
- [JavaScript toFixed 2026 Updates (CopyProgramming)](https://copyprogramming.com/howto/javascript-tofixed-localized) - Formatter edge cases
- [Enums in JavaScript (Flexiple)](https://flexiple.com/javascript/using-enum) - JavaScript enum patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tools already in project (Vitest, ESLint), native APIs well-documented
- Architecture: HIGH - Google Style Guide authoritative, pattern proven in Phase 2 (physics.js)
- Pitfalls: HIGH - Common refactoring issues well-documented, circular dependencies have established solutions
- Code examples: HIGH - Patterns verified from official docs (Google, MDN, Vitest), Phase 2 provides working template

**Research date:** 2026-01-30
**Valid until:** ~30 days (stable patterns, unlikely to change rapidly)

**Research notes:**
- Phase 2 provides strong precedent: physics.js extraction was successful with same patterns
- Project uses JavaScript (not TypeScript), so enum patterns use frozen objects instead
- Existing test infrastructure (Vitest) makes adding utility tests straightforward
- Component has 7 formatter functions and 5 constant arrays to extract (clear scope)
- No CONTEXT.md exists for this phase, so no user decisions constrain research
