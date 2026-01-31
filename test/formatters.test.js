import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatTimerDisplay,
  formatCountdown,
  formatTemp,
  formatVolume,
  formatWeight,
  formatPressure,
} from '../formatters';

describe('formatTime', () => {
  it.each([
    [5.5, '5:30'],
    [0, '0:00'],
    [10.25, '10:15'],
    [120.5, '120:30'],
  ])('formats %d minutes as %s', (minutes, expected) => {
    expect(formatTime(minutes)).toBe(expected);
  });

  it('returns "--:--" for null', () => {
    expect(formatTime(null)).toBe('--:--');
  });

  it('returns "NaN:NaN" for undefined', () => {
    expect(formatTime(undefined)).toBe('NaN:NaN');
  });

  it('formats very large values (999.99 minutes)', () => {
    expect(formatTime(999.99)).toBe('999:59');
  });

  it('handles 59-second rounding edge (1.99 minutes)', () => {
    expect(formatTime(1.99)).toBe('1:59');
  });
});

describe('formatTimerDisplay', () => {
  it.each([
    [90, '1:30'],
    [0, '0:00'],
    [300, '5:00'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatTimerDisplay(seconds)).toBe(expected);
  });

  it('returns "--:--" for null', () => {
    expect(formatTimerDisplay(null)).toBe('--:--');
  });

  it('returns "NaN:NaN" for undefined', () => {
    expect(formatTimerDisplay(undefined)).toBe('NaN:NaN');
  });

  it('formats large seconds (3661 seconds = over an hour)', () => {
    expect(formatTimerDisplay(3661)).toBe('61:01');
  });

  it('formats exactly 60 seconds', () => {
    expect(formatTimerDisplay(60)).toBe('1:00');
  });
});

describe('formatCountdown', () => {
  it.each([
    [90, '01:30'],
    [0, '00:00'],
    [600, '10:00'],
  ])('formats %d seconds as %s with zero padding', (seconds, expected) => {
    expect(formatCountdown(seconds)).toBe(expected);
  });

  it('returns "00:00" for null', () => {
    expect(formatCountdown(null)).toBe('00:00');
  });

  it('returns "00:00" for negative values', () => {
    expect(formatCountdown(-5)).toBe('00:00');
  });

  it('returns "NaN:NaN" for undefined', () => {
    expect(formatCountdown(undefined)).toBe('NaN:NaN');
  });

  it('formats large values (3600+ seconds = over an hour)', () => {
    expect(formatCountdown(3661)).toBe('61:01');
  });
});

describe('formatTemp', () => {
  describe('Celsius mode', () => {
    it.each([
      [100, '100°C'],
      [0, '0°C'],
      [20, '20°C'],
    ])('formats %d°C as %s', (tempC, expected) => {
      expect(formatTemp(tempC, 'C')).toBe(expected);
    });

    it('formats negative Celsius values', () => {
      expect(formatTemp(-10, 'C')).toBe('-10°C');
    });
  });

  describe('Fahrenheit mode', () => {
    it.each([
      [100, '212°F'],
      [0, '32°F'],
      [20, '68°F'],
    ])('formats %d°C as %s in Fahrenheit', (tempC, expected) => {
      expect(formatTemp(tempC, 'F')).toBe(expected);
    });

    it('formats negative Celsius values in Fahrenheit', () => {
      expect(formatTemp(-10, 'F')).toBe('14°F');
    });

    it('handles fractional Celsius with proper rounding', () => {
      expect(formatTemp(37.5, 'F')).toBe('100°F');
    });
  });

  it('defaults to Celsius when no unit provided', () => {
    expect(formatTemp(20)).toBe('20°C');
  });

  it('falls back to Celsius for unknown unit', () => {
    expect(formatTemp(20, 'K')).toBe('20°C');
  });
});

describe('formatVolume', () => {
  describe('Liters mode', () => {
    it.each([
      [1.5, '1.5L'],
      [2, '2L'],
      [0.5, '0.5L'],
    ])('formats %d liters as %s', (volumeL, expected) => {
      expect(formatVolume(volumeL, 'L')).toBe(expected);
    });

    it('formats zero volume', () => {
      expect(formatVolume(0, 'L')).toBe('0L');
    });
  });

  describe('Ounces mode', () => {
    it('formats 1.0L as 33.8 oz', () => {
      expect(formatVolume(1.0, 'oz')).toBe('33.8 oz');
    });

    it('formats 0.5L as 16.9 oz', () => {
      expect(formatVolume(0.5, 'oz')).toBe('16.9 oz');
    });

    it('formats zero volume', () => {
      expect(formatVolume(0, 'oz')).toBe('0 oz');
    });

    it('formats very small volumes with decimal precision', () => {
      expect(formatVolume(0.1, 'oz')).toBe('3.4 oz');
    });
  });

  it('defaults to Liters when no unit provided', () => {
    expect(formatVolume(2)).toBe('2L');
  });
});

describe('formatWeight', () => {
  describe('Grams mode', () => {
    it.each([
      [60, '60g'],
      [53, '53g'],
      [68, '68g'],
    ])('formats %dg as %s', (weightG, expected) => {
      expect(formatWeight(weightG, 'g')).toBe(expected);
    });

    it('formats zero weight', () => {
      expect(formatWeight(0, 'g')).toBe('0g');
    });
  });

  describe('Ounces mode', () => {
    it('formats 60g as 2.1oz', () => {
      expect(formatWeight(60, 'oz')).toBe('2.1oz');
    });

    it('formats 53g as 1.9oz', () => {
      expect(formatWeight(53, 'oz')).toBe('1.9oz');
    });

    it('formats zero weight', () => {
      expect(formatWeight(0, 'oz')).toBe('0oz');
    });

    it('formats very small values (1g)', () => {
      expect(formatWeight(1, 'oz')).toBe('0oz');
    });

    it('formats large values (1000g)', () => {
      expect(formatWeight(1000, 'oz')).toBe('35.3oz');
    });
  });

  it('defaults to grams when no unit provided', () => {
    expect(formatWeight(53)).toBe('53g');
  });
});

describe('formatPressure', () => {
  describe('hPa mode', () => {
    it.each([
      [1013.25, '1013.25 hPa'],
      [1000, '1000 hPa'],
      [950, '950 hPa'],
    ])('formats %d hPa as %s', (pressureHPa, expected) => {
      expect(formatPressure(pressureHPa, 'hPa')).toBe(expected);
    });

    it('formats zero pressure', () => {
      expect(formatPressure(0, 'hPa')).toBe('0 hPa');
    });

    it('formats very low pressure (300 hPa - extreme altitude)', () => {
      expect(formatPressure(300, 'hPa')).toBe('300 hPa');
    });

    it('formats very high pressure (1050 hPa)', () => {
      expect(formatPressure(1050, 'hPa')).toBe('1050 hPa');
    });
  });

  describe('inHg mode', () => {
    it('formats 1013.25 hPa as 29.92 inHg', () => {
      expect(formatPressure(1013.25, 'inHg')).toBe('29.92 inHg');
    });

    it('formats 1000 hPa as 29.53 inHg', () => {
      expect(formatPressure(1000, 'inHg')).toBe('29.53 inHg');
    });

    it('formats zero pressure', () => {
      expect(formatPressure(0, 'inHg')).toBe('0 inHg');
    });

    it('formats with decimal precision for non-standard values', () => {
      expect(formatPressure(987.65, 'inHg')).toBe('29.17 inHg');
    });
  });

  it('defaults to hPa when no unit provided', () => {
    expect(formatPressure(1013.25)).toBe('1013.25 hPa');
  });
});
