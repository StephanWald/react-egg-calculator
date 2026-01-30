# Phase 2: Physics Validation - Research

**Researched:** 2026-01-30
**Domain:** Unit testing physics calculations with Vitest
**Confidence:** HIGH

## Summary

Testing physics calculations embedded inside React component closures presents a unique challenge. The functions (`calculateBoilingPointFromPressure`, `calculatePressureFromBoilingPoint`, `calculateAltitudeFromPressure`, `calculateTime`) are currently defined inside the `EggCalculator` component and are not exported.

The standard approach in 2026 is **NOT** to test these functions directly from inside the closure. Modern React testing philosophy emphasizes testing components through their public interface (user interactions and rendered outputs) rather than testing internal implementation details. However, for **physics validation specifically**, we need to verify mathematical correctness with known-good test cases.

The recommended strategy is to test these functions **indirectly through component behavior** - render the component, manipulate inputs, and verify calculated outputs. This approach:
- Avoids premature extraction/refactoring (Phase 3's responsibility)
- Tests the actual user-facing behavior
- Validates physics calculations in their real execution context
- Provides regression protection for the refactoring phase

**Primary recommendation:** Use React Testing Library with Vitest to test physics calculations through component interaction. Set inputs via user events, read outputs from rendered DOM, validate with `toBeCloseTo` for floating-point comparisons.

## Standard Stack

The established libraries/tools for testing React components with Vitest:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 4.0+ | Test runner | Native ES modules, Vite integration, 10-20x faster than Jest |
| @testing-library/react | 16.3+ | Component testing | Industry standard for user-centric React testing |
| @testing-library/jest-dom | 6.9+ | DOM matchers | Semantic assertions like `toBeInTheDocument()` |
| @testing-library/user-event | 14.6+ | User interaction simulation | More realistic than `fireEvent` |
| jsdom | 26.1+ | DOM environment | Lightweight browser environment for tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | 4.0+ | Code coverage | Already installed, use for coverage reporting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Component testing | In-source testing (`import.meta.vitest`) | In-source testing allows testing private closures but conflicts with Phase 3 refactoring goals and is not recommended for complex component testing |
| Component testing | Temporarily extracting functions | Would require rewriting tests after Phase 3 refactoring |

**Installation:**
```bash
# Already installed in Phase 1 - no additional packages needed
npm test
```

## Architecture Patterns

### Recommended Test File Structure
```
/
├── egg-calculator.jsx        # Component with physics functions
├── egg-calculator.test.jsx   # Basic smoke test (exists)
└── test/
    ├── setup.js              # Jest-dom matchers (exists)
    └── physics.test.jsx      # NEW: Physics validation tests
```

**Why separate physics tests:** Keep physics validation tests separate from component behavior tests. This makes it clear which tests validate mathematical correctness vs. UI behavior.

### Pattern 1: Indirect Function Testing via Component Props

**What:** Test physics calculations by setting component inputs and reading calculated outputs from the DOM.

**When to use:** When functions are in component closure and you want to test them without extraction.

**Example:**
```javascript
// Source: https://mayashavin.com/articles/test-react-components-with-vitest
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import EggCalculator from './egg-calculator';

describe('Physics Calculations', () => {
  describe('calculateBoilingPointFromPressure', () => {
    it('should calculate 100°C at sea level pressure (1013.25 hPa)', async () => {
      const user = userEvent.setup();
      render(<EggCalculator />);

      // Arrange: Set pressure to sea level
      const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
      await user.clear(pressureInput);
      await user.type(pressureInput, '1013.25');

      // Assert: Boiling point should be 100°C
      const boilingDisplay = screen.getByText(/100.*°C/); // Regex to match display format
      expect(boilingDisplay).toBeInTheDocument();
    });
  });
});
```

### Pattern 2: Table-Driven Testing with test.each

**What:** Use Vitest's `test.each` to run the same test with multiple parameter sets.

**When to use:** When you have multiple known-good test cases for the same calculation (e.g., Williams formula at different egg weights).

**Example:**
```javascript
// Source: https://www.the-koi.com/projects/parameterized-data-driven-tests-in-vitest-example/
describe('Williams formula', () => {
  it.each([
    { weight: 60, startTemp: 4, targetTemp: 67, boilingPoint: 100, expectedMin: 6, expectedMax: 8 },
    { weight: 50, startTemp: 4, targetTemp: 63, boilingPoint: 100, expectedMin: 5, expectedMax: 7 },
    { weight: 70, startTemp: 20, targetTemp: 77, boilingPoint: 100, expectedMin: 8, expectedMax: 10 },
  ])('should calculate time for $weight g egg from $startTemp°C to $targetTemp°C',
    async ({ weight, startTemp, targetTemp, boilingPoint, expectedMin, expectedMax }) => {
      // Test implementation
    }
  );
});
```

### Pattern 3: Floating-Point Comparison with toBeCloseTo

**What:** Use `toBeCloseTo` for all floating-point number comparisons to handle IEEE 754 precision issues.

**When to use:** Always, when testing calculated numbers. Never use `toBe` for floats.

**Example:**
```javascript
// Source: https://vitest.dev/api/expect
// For physics calculations, use appropriate precision
expect(calculatedBoilingPoint).toBeCloseTo(100.0, 1); // 1 decimal place precision
expect(calculatedPressure).toBeCloseTo(1013.25, 2);   // 2 decimal places
expect(calculatedTime).toBeCloseTo(6.5, 1);           // 1 decimal place for minutes
```

**Default precision:** `toBeCloseTo(expected, numDigits)` uses `numDigits = 2` by default, which means tolerance of 0.005 (i.e., 10^-2 / 2).

### Pattern 4: Inverse Function Round-Trip Validation

**What:** Test that inverse functions properly reverse each other: `inverse(function(x)) ≈ x`.

**When to use:** For testing `calculateBoilingPointFromPressure` ↔ `calculatePressureFromBoilingPoint`.

**Example:**
```javascript
describe('Inverse functions', () => {
  it('should round-trip pressure → boiling point → pressure', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Start with known pressure
    const originalPressure = 900; // hPa (high altitude)

    // Set pressure, read calculated boiling point
    const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
    await user.clear(pressureInput);
    await user.type(pressureInput, originalPressure.toString());

    const boilingPointDisplay = screen.getByText(/°C/);
    const calculatedBoilingPoint = parseFloat(boilingPointDisplay.textContent);

    // Now set boiling point, verify pressure returns to original
    const boilingPointInput = screen.getByRole('spinbutton', { name: /boiling/i });
    await user.clear(boilingPointInput);
    await user.type(boilingPointInput, calculatedBoilingPoint.toString());

    const finalPressure = parseFloat(pressureInput.value);
    expect(finalPressure).toBeCloseTo(originalPressure, 1);
  });
});
```

### Anti-Patterns to Avoid

- **Testing private functions directly:** Don't use `import.meta.vitest` in-source testing for complex component functions - this creates coupling to implementation details
- **Using `toBe` for floats:** Always use `toBeCloseTo` - JavaScript floating-point arithmetic means `0.1 + 0.2 !== 0.3`
- **Hardcoding display formats:** Use flexible regex patterns when matching rendered text (e.g., `/100.*°C/` instead of exact string match)
- **Testing implementation details:** Don't test internal state variables, recovery factors, or intermediate calculations - test final outputs only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Floating-point comparison | Custom epsilon comparison | Vitest's `toBeCloseTo` | Handles precision correctly, configurable tolerance, standard matcher |
| User interaction simulation | Manual `fireEvent` calls | `@testing-library/user-event` | More realistic (delays, focus, validation), better async handling |
| DOM queries | Manual `querySelector` | Testing Library queries (`getByRole`, `getByText`) | Accessibility-focused, better error messages, semantic |
| Test data tables | Multiple `it()` blocks | `test.each` with array/object data | DRY principle, easier to add cases, clearer test output |
| Decimal precision calculations | Custom rounding logic | Built-in `Math.round()` with multipliers | Already used in codebase, consistent results |

**Key insight:** Physics testing in JavaScript requires careful handling of floating-point precision. Use established patterns (`toBeCloseTo`, parameterized tests) rather than building custom comparison logic.

## Common Pitfalls

### Pitfall 1: Floating-Point Precision Errors
**What goes wrong:** Tests fail intermittently because JavaScript numbers are IEEE 754 double-precision floats. Direct equality comparisons like `expect(0.1 + 0.2).toBe(0.3)` fail because the actual value is 0.30000000000000004.

**Why it happens:** JavaScript stores all numbers as 64-bit floating-point, which cannot exactly represent many decimal fractions. Physics calculations involving division, logarithms, and powers compound rounding errors.

**How to avoid:**
- Always use `toBeCloseTo(expected, precision)` for calculated numbers
- Choose precision based on physical significance: ±0.1°C for temperature, ±0.05 hPa for pressure, ±0.1 min for cooking time
- For round-trip tests, allow slightly larger tolerance (compounded rounding)

**Warning signs:**
- Test failures showing tiny differences like `expected: 100, received: 99.99999999999999`
- Tests that pass locally but fail in CI/CD
- Different results between Node versions or platforms

### Pitfall 2: Testing Component Closure Without Component Context
**What goes wrong:** Attempting to test functions defined inside a component closure (via in-source testing or extraction) without the component's React context means `useState`, `useEffect`, and other hooks don't run.

**Why it happens:** The physics functions reference component state (pressure, boilingPoint, weight, etc.) through closure. Testing them in isolation loses this context.

**How to avoid:**
- Test through component rendering - mount the actual component
- Use React Testing Library to interact with the component as a user would
- Verify outputs from the rendered DOM, not from function return values

**Warning signs:**
- Trying to extract functions temporarily just for testing
- Considering in-source testing (`if (import.meta.vitest)`) for component methods
- Planning to refactor code structure before Phase 3

### Pitfall 3: Overly Specific Test Assertions
**What goes wrong:** Tests break when UI text changes, units toggle, or display formatting updates, even though calculations remain correct.

**Why it happens:** Hardcoding exact strings or DOM structures creates coupling to presentation details.

**How to avoid:**
- Use flexible regex patterns: `/100.*°C/` matches "100°C", "100.0°C", "~100 °C"
- Query by role and accessible name: `getByRole('spinbutton', { name: /pressure/i })`
- Test the calculated value, not the formatted display string when possible

**Warning signs:**
- Tests breaking when switching between °C/°F or hPa/inHg
- Brittle string matches like `expect(element.textContent).toBe("Cooking time: 6.5 minutes")`
- Tests that fail when German translations are added

### Pitfall 4: Insufficient Test Case Coverage for Edge Cases
**What goes wrong:** Tests pass for "normal" cases (sea level, medium eggs, 4°C fridge) but fail in production when users are at high altitude, have room-temperature eggs, or use extreme settings.

**Why it happens:** Physics formulas have non-linear behavior at extremes. Williams formula uses logarithms (undefined when temp ratios go negative), barometric formula uses exponentials (precision loss at high altitudes).

**How to avoid:**
- Test boundary conditions: sea level (1013.25 hPa), Mt. Everest (~337 hPa), Dead Sea (~1050 hPa)
- Test extreme parameters: tiny eggs (40g), huge eggs (90g), frozen eggs (-10°C), room temp eggs (20°C)
- Test edge cases in Williams formula: when `targetTemp` approaches `boilingPoint` (low pressure cooking)
- Use `test.each` to systematically cover altitude ranges (0m, 500m, 1000m, 2000m, 3000m)

**Warning signs:**
- Only testing with default values (60g egg, 4°C, sea level)
- No tests for altitude > 1000m
- No tests for cooking temperature close to boiling point

### Pitfall 5: Ignoring Inverse Function Consistency
**What goes wrong:** `calculateBoilingPointFromPressure(1013.25)` returns 100°C, but `calculatePressureFromBoilingPoint(100)` returns 1013.20 hPa due to rounding differences. Users toggling between pressure/boiling point inputs see inconsistent values.

**Why it happens:** The formulas use approximations (0.037 coefficient in Clausius-Clapeyron) and JavaScript applies rounding (`Math.round(... * 10) / 10`) at different stages.

**How to avoid:**
- Implement round-trip tests: pressure → boiling point → pressure should return original value (±tolerance)
- Test in both directions: start with pressure, start with boiling point
- Use appropriate tolerance for round-trip tests (allow 0.1-0.2 difference for compounded rounding)

**Warning signs:**
- User reports: "Setting pressure to 1013.25 shows 100°C, but setting 100°C shows 1013.2 hPa"
- Inconsistent values when switching between manual input modes
- Accumulating error when user repeatedly toggles inputs

## Code Examples

Verified patterns from official sources:

### Testing Physics Calculation via Component Rendering
```javascript
// Source: https://mayashavin.com/articles/test-react-components-with-vitest
// Source: https://vitest.dev/api/expect
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import EggCalculator from '../egg-calculator';

describe('Physics: Boiling Point from Pressure', () => {
  it('should calculate 100.0°C at standard sea level pressure (1013.25 hPa)', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Find and set pressure input
    const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
    await user.clear(pressureInput);
    await user.type(pressureInput, '1013.25');

    // Verify boiling point calculation
    // Use regex to handle various display formats (100°C, 100.0°C, etc.)
    const boilingPointText = screen.getByText(/100\.?0?\s*°C/);
    expect(boilingPointText).toBeInTheDocument();
  });

  it('should calculate reduced boiling point at high altitude', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Denver, CO altitude: ~1600m, pressure ~835 hPa
    const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
    await user.clear(pressureInput);
    await user.type(pressureInput, '835');

    // Expected: ~93.4°C (boiling point drops ~6-7°C at this altitude)
    // Use flexible matching for the calculated value
    const boilingDisplay = await screen.findByText(/93\.\d\s*°C/);
    expect(boilingDisplay).toBeInTheDocument();
  });
});
```

### Table-Driven Testing with test.each
```javascript
// Source: https://www.the-koi.com/projects/parameterized-data-driven-tests-in-vitest-example/
// Source: https://vitest.dev/api/
describe('Physics: Altitude from Pressure (Barometric Formula)', () => {
  // Test data: known pressure-altitude pairs
  it.each([
    { altitude: 0, pressure: 1013.25, desc: 'sea level' },
    { altitude: 500, pressure: 954.6, desc: 'low altitude' },
    { altitude: 1000, pressure: 898.8, desc: 'moderate altitude' },
    { altitude: 1500, pressure: 845.6, desc: 'Denver-like' },
    { altitude: 2000, pressure: 794.9, desc: 'high altitude' },
    { altitude: 3000, pressure: 701.2, desc: 'very high altitude' },
  ])('should calculate $altitude m for pressure $pressure hPa ($desc)',
    async ({ altitude, pressure, desc }) => {
      const user = userEvent.setup();
      render(<EggCalculator />);

      const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
      await user.clear(pressureInput);
      await user.type(pressureInput, pressure.toString());

      // Find altitude display (may be in a specific element)
      const altitudeText = screen.getByText(new RegExp(`${altitude}\\s*m`));
      expect(altitudeText).toBeInTheDocument();
    }
  );
});
```

### Inverse Function Round-Trip Testing
```javascript
// Source: http://xunitpatterns.com/round%20trip%20test.html
describe('Physics: Inverse Function Consistency', () => {
  it('should maintain consistency when converting pressure ↔ boiling point', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Start with a non-standard pressure
    const originalPressure = 900; // High altitude

    // Set pressure
    const pressureInput = screen.getByRole('spinbutton', { name: /pressure/i });
    await user.clear(pressureInput);
    await user.type(pressureInput, originalPressure.toString());

    // Read the calculated boiling point from the display
    const boilingPointMatch = screen.getByText(/°C/).textContent.match(/([\d.]+)\s*°C/);
    const calculatedBoilingPoint = parseFloat(boilingPointMatch[1]);

    // Now manually set that boiling point
    const boilingPointInput = screen.getByRole('spinbutton', { name: /boiling.*point/i });
    await user.clear(boilingPointInput);
    await user.type(boilingPointInput, calculatedBoilingPoint.toFixed(1));

    // Pressure should return to original value (within rounding tolerance)
    const finalPressure = parseFloat(pressureInput.value);
    expect(finalPressure).toBeCloseTo(originalPressure, 1); // ±0.05 hPa tolerance
  });
});
```

### Floating-Point Comparison Best Practice
```javascript
// Source: https://vitest.dev/api/expect
// Source: https://medium.com/@contactxanta/handling-floating-point-precision-in-javascript-tests-tobe-vs-tobecloseto-e84c0f277407

describe('Physics: Williams Formula Cooking Time', () => {
  it('should calculate cooking time with proper floating-point handling', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Set up test conditions
    // ... (set egg weight, temperatures, etc.)

    // Extract calculated time from display
    const timeDisplay = screen.getByText(/\d+:\d+/); // MM:SS format
    const timeMatch = timeDisplay.textContent.match(/(\d+):(\d+)/);
    const calculatedMinutes = parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;

    // Expected ~6.5 minutes for a 60g egg, 4°C to 67°C at sea level
    // Use toBeCloseTo with appropriate precision (1 decimal = ±0.05 min = ±3 seconds)
    expect(calculatedMinutes).toBeCloseTo(6.5, 1);

    // WRONG - will fail due to floating-point precision:
    // expect(calculatedMinutes).toBe(6.5);
  });
});
```

### Energy Calculation Testing
```javascript
// Source: https://vitest.dev/guide/coverage
describe('Physics: Energy Consumption Calculation', () => {
  it('should calculate total energy including all heating components', async () => {
    const user = userEvent.setup();
    render(<EggCalculator />);

    // Open energy section to trigger calculation display
    const energyToggle = screen.getByRole('button', { name: /energy/i });
    await user.click(energyToggle);

    // Verify energy calculation is displayed (in kJ)
    const energyDisplay = screen.getByText(/\d+\s*kJ/);
    const energyMatch = energyDisplay.textContent.match(/([\d.]+)\s*kJ/);
    const totalEnergy = parseFloat(energyMatch[1]);

    // Energy should be positive and reasonable for egg cooking
    // (typically 300-800 kJ depending on water volume, stove type)
    expect(totalEnergy).toBeGreaterThan(200);
    expect(totalEnergy).toBeLessThan(1000);

    // Verify energy breakdown includes:
    // - Water heating (Q_water_heating)
    // - Pot heating (Q_pot_heating)
    // - Egg heating (Q_eggs_heating)
    // - Ambient heat loss (Q_ambient_loss)
    // All divided by stove efficiency
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest for testing | Vitest | 2021-2022 | 10-20x faster test runs, native ES modules, better Vite integration |
| `fireEvent` for interactions | `@testing-library/user-event` | 2020+ | More realistic user interactions, better async handling |
| Testing implementation details | Testing user-facing behavior | Ongoing since 2018 | More maintainable tests, easier refactoring |
| `toBe` for number comparison | `toBeCloseTo` for floats | Standard practice | Prevents floating-point precision test failures |
| Manual test cases | `test.each` parameterized tests | Jest 23+ (2018), Vitest from start | DRY principle, easier to add test cases |

**Deprecated/outdated:**
- **In-source testing for components:** While Vitest supports `if (import.meta.vitest)` for in-source testing, it's not recommended for React components. Use for small utility functions only.
- **Enzyme:** Popular React testing library until ~2020, now unmaintained. Use React Testing Library instead.
- **Snapshot testing for calculations:** Don't use Vitest snapshots for numeric calculations - snapshots hide what's being tested. Use explicit assertions with `toBeCloseTo`.

## Open Questions

Things that couldn't be fully resolved:

1. **Williams Formula Known-Good Test Cases**
   - What we know: Formula is `t = 0.451 × M^(2/3) × ln(0.76 × (T0 - Teff) / (Tziel - Teff))`. Found reference to 50-egg validation study comparing calculated vs. actual times.
   - What's unclear: No publicly available dataset with ground-truth cooking times for specific egg weights/temperatures.
   - Recommendation: Use physics-based sanity checks (time increases with weight, decreases with higher temperature) and compare against online calculators for spot-checking. Phase 2 tests should verify formula implementation correctness, not formula physics accuracy.

2. **Temperature Drop Recovery Factor Validation**
   - What we know: Code calculates recovery factor based on stove power, water volume, heat loss. This affects effective cooking temperature.
   - What's unclear: No reference data for validating the recovery factor calculation itself.
   - Recommendation: Test that recovery factor produces reasonable results (0 < recovery < 1, higher power = faster recovery). Don't test exact recovery values without reference data. Consider this calculation validated by end-to-end behavior (does cooking time make sense?).

3. **Precision Requirements for Physics Formulas**
   - What we know: Different calculations have different precision needs. Boiling point precise to ±0.1°C, pressure to ±0.1 hPa, altitude to ±1 m, time to ±0.1 min.
   - What's unclear: Whether these precision levels match physical significance and user expectations.
   - Recommendation: Start with these tolerance levels, adjust based on Phase 4 QA feedback. Document chosen tolerances in test comments.

4. **Component State Access for Assertions**
   - What we know: Physics calculations update React state (cookingTime, tempDrop, effectiveTemp, totalEnergy). These may not all be directly visible in the DOM.
   - What's unclear: Whether all calculated values are rendered to the DOM for testing, or if some are internal-only.
   - Recommendation: Test what's visible to users. For internal calculations (effectiveTemp, recoveryFactor), test indirectly through final outputs. If a value isn't shown to users, its exact value may not need a dedicated test.

## Sources

### Primary (HIGH confidence)
- [Vitest Official Documentation - expect API](https://vitest.dev/api/expect) - Assertion matchers including `toBeCloseTo`
- [Vitest Official Documentation - Coverage Configuration](https://vitest.dev/guide/coverage) - Setting up 100% coverage thresholds
- [Vitest Official Documentation - In-Source Testing](https://vitest.dev/guide/in-source) - Testing functions in closures (not recommended for this use case)
- [React Testing Library - Component Testing with Vitest](https://mayashavin.com/articles/test-react-components-with-vitest) - Patterns for testing React components
- [NOAA - Air Pressure Standards](https://www.noaa.gov/jetstream/atmosphere/air-pressure) - Standard sea level pressure validation (1013.25 hPa)
- [U.S. Standard Atmosphere](https://www.engineeringtoolbox.com/standard-atmosphere-d_604.html) - Atmospheric pressure and temperature standards

### Secondary (MEDIUM confidence)
- [Khymos - Towards the Perfect Soft Boiled Egg](https://khymos.org/2009/04/09/towards-the-perfect-soft-boiled-egg/) - Williams formula background and validation with 50-egg study
- [Boiling Point at Altitude Calculator - Pearson](https://www.pearson.com/channels/calculators/boiling-point-at-altitude-calculator) - Clausius-Clapeyron equation test cases
- [Wikipedia - Barometric Formula](https://en.wikipedia.org/wiki/Barometric_formula) - Altitude-pressure relationship verification data
- [The Koi - Parameterized Tests in Vitest](https://www.the-koi.com/projects/parameterized-data-driven-tests-in-vitest-example/) - `test.each` examples
- [Medium - Floating-Point Precision in JavaScript Tests](https://medium.com/@contactxanta/handling-floating-point-precision-in-javascript-tests-tobe-vs-tobecloseto-e84c0f277407) - toBe vs toBeCloseTo

### Tertiary (LOW confidence - informational only)
- [XUnit Patterns - Round Trip Test](http://xunitpatterns.com/round%20trip%20test.html) - Inverse function testing pattern (general concept, not JS-specific)
- [Engineering Toolbox - Air Pressure at Altitude](https://www.engineeringtoolbox.com/standard-atmosphere-d_604.html) - Additional atmospheric data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Vitest + React Testing Library is the 2026 standard, confirmed by official docs and current project setup
- Architecture: HIGH - Component-based testing approach is well-documented, verified with official Vitest and Testing Library guides
- Pitfalls: HIGH - Floating-point precision issues, testing closure functions, and brittleness are well-known problems with established solutions
- Physics formulas: MEDIUM - Found reference implementations and validation data, but no comprehensive test dataset for Williams formula
- Test case values: MEDIUM - Standard atmospheric values verified with NOAA/ISA, but egg cooking times lack ground-truth dataset

**Research date:** 2026-01-30
**Valid until:** 2026-03-01 (30 days - Vitest and Testing Library are stable, unlikely to change patterns)
