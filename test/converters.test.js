import { describe, it, expect } from 'vitest';
import {
  celsiusToFahrenheit,
  litersToOunces,
  gramsToOunces,
  hPaToInHg,
} from '../converters';

// ============================================================
// celsiusToFahrenheit Tests
// Formula: Math.round(tempC * 9 / 5 + 32)
// ============================================================

describe('celsiusToFahrenheit', () => {
  it.each([
    [0, 32, 'freezing point of water'],
    [100, 212, 'boiling point of water'],
    [37, 99, 'body temperature'],
    [-40, -40, 'C/F intersection point'],
    [20, 68, 'room temperature'],
  ])('converts %d°C to %d°F (%s)', (celsius, expected) => {
    expect(celsiusToFahrenheit(celsius)).toBe(expected);
  });
});

// ============================================================
// litersToOunces Tests
// Formula: Math.round(volumeL * 33.814 * 10) / 10
// ============================================================

describe('litersToOunces', () => {
  it.each([
    [1.0, 33.8, '1 liter'],
    [1.5, 50.7, '1.5 liters'],
    [0.5, 16.9, 'half liter'],
    [0, 0, 'zero volume'],
  ])('converts %d L to %d fl oz (%s)', (liters, expected) => {
    expect(litersToOunces(liters)).toBeCloseTo(expected, 1);
  });
});

// ============================================================
// gramsToOunces Tests
// Formula: Math.round(weightG / 28.35 * 10) / 10
// ============================================================

describe('gramsToOunces', () => {
  it.each([
    [28.35, 1.0, 'exact conversion (1 oz)'],
    [60, 2.1, 'medium egg weight'],
    [0, 0, 'zero weight'],
  ])('converts %d g to %d oz (%s)', (grams, expected) => {
    expect(gramsToOunces(grams)).toBeCloseTo(expected, 1);
  });
});

// ============================================================
// hPaToInHg Tests
// Formula: Math.round(pressureHPa * 0.02953 * 100) / 100
// ============================================================

describe('hPaToInHg', () => {
  it.each([
    [1013.25, 29.92, 'standard sea level pressure'],
    [900, 26.58, 'high altitude pressure'],
    [0, 0, 'zero pressure'],
  ])('converts %d hPa to %d inHg (%s)', (hPa, expected) => {
    expect(hPaToInHg(hPa)).toBeCloseTo(expected, 2);
  });
});
