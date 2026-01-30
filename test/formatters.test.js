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
  });

  describe('Fahrenheit mode', () => {
    it.each([
      [100, '212°F'],
      [0, '32°F'],
      [20, '68°F'],
    ])('formats %d°C as %s in Fahrenheit', (tempC, expected) => {
      expect(formatTemp(tempC, 'F')).toBe(expected);
    });
  });

  it('defaults to Celsius when no unit provided', () => {
    expect(formatTemp(20)).toBe('20°C');
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
  });

  describe('Ounces mode', () => {
    it('formats 1.0L as 33.8 oz', () => {
      expect(formatVolume(1.0, 'oz')).toBe('33.8 oz');
    });

    it('formats 0.5L as 16.9 oz', () => {
      expect(formatVolume(0.5, 'oz')).toBe('16.9 oz');
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
  });

  describe('Ounces mode', () => {
    it('formats 60g as 2.1oz', () => {
      expect(formatWeight(60, 'oz')).toBe('2.1oz');
    });

    it('formats 53g as 1.9oz', () => {
      expect(formatWeight(53, 'oz')).toBe('1.9oz');
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
  });

  describe('inHg mode', () => {
    it('formats 1013.25 hPa as 29.92 inHg', () => {
      expect(formatPressure(1013.25, 'inHg')).toBe('29.92 inHg');
    });

    it('formats 1000 hPa as 29.53 inHg', () => {
      expect(formatPressure(1000, 'inHg')).toBe('29.53 inHg');
    });
  });

  it('defaults to hPa when no unit provided', () => {
    expect(formatPressure(1013.25)).toBe('1013.25 hPa');
  });
});
