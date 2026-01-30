import { describe, it, expect } from 'vitest';
import {
  calculateBoilingPointFromPressure,
  calculatePressureFromBoilingPoint,
  calculateAltitudeFromPressure,
  calculateTime,
} from '../physics';

// ============================================================
// Section 1: calculateBoilingPointFromPressure
// Formula: round((100 + 0.037 * (P - 1013.25)) * 10) / 10
// ============================================================

describe('calculateBoilingPointFromPressure', () => {
  it.each([
    [1013.25, 100.0,  'sea level'],
    [1050.0,  101.4,  'below sea level'],
    [954.6,   97.8,   '~500 m altitude'],
    [898.8,   95.8,   '~1000 m altitude'],
    [845.6,   93.8,   '~1500 m altitude'],
    [795.0,   91.9,   '~2000 m altitude'],
    [701.2,   88.5,   '~3000 m altitude'],
    [337.0,   75.0,   '~Everest summit'],
  ])('returns %f C for %f hPa (%s)', (pressure, expected) => {
    expect(calculateBoilingPointFromPressure(pressure)).toBeCloseTo(expected, 1);
  });

  it('returns below 75 C for very low pressure (300 hPa)', () => {
    expect(calculateBoilingPointFromPressure(300)).toBeLessThan(75);
  });

  it('returns above 103 C for very high pressure (1100 hPa)', () => {
    expect(calculateBoilingPointFromPressure(1100)).toBeGreaterThan(103);
  });
});

// ============================================================
// Section 2: calculatePressureFromBoilingPoint
// Formula: round(((T - 100) / 0.037 + 1013.25) * 10) / 10
// ============================================================

describe('calculatePressureFromBoilingPoint', () => {
  it.each([
    [100.0, 1013.3, 'sea level boiling point'],
    [95.0,  878.1,  '~1000 m boiling point'],
    [90.0,  743.0,  '~2000+ m boiling point'],
    [80.0,  472.7,  'very high altitude boiling point'],
  ])('returns ~%f hPa for %f C (%s)', (temp, expected) => {
    expect(calculatePressureFromBoilingPoint(temp)).toBeCloseTo(expected, 1);
  });
});

// ============================================================
// Section 3: calculateAltitudeFromPressure
// Formula: round(44330 * (1 - pow(P / 1013.25, 0.1903)))
// Math.round produces integers, so use toBe
// ============================================================

describe('calculateAltitudeFromPressure', () => {
  it.each([
    [1013.25, 0,    'sea level'],
    [954.6,   500,  '~500 m'],
    [898.8,   1000, '~1000 m'],
    [845.6,   1500, '~1500 m'],
    [795.0,   2000, '~2000 m'],
    [701.2,   2999, '~3000 m'],
    [337.0,   8378, '~Everest summit'],
  ])('returns %i m for %f hPa (%s)', (pressure, expected) => {
    expect(calculateAltitudeFromPressure(pressure)).toBe(expected);
  });
});

// ============================================================
// Section 4: Inverse round-trip consistency
// ============================================================

describe('inverse round-trip consistency', () => {
  // Both functions round to 1 decimal, so round-trip accumulates up to
  // ~1.4 units of error. We verify the difference stays within 1.5.
  it.each([
    [1013.25],
    [954.6],
    [898.8],
    [795.0],
    [701.2],
  ])('pressure -> boiling point -> pressure round-trips for %f hPa', (pressure) => {
    const bp = calculateBoilingPointFromPressure(pressure);
    const backToPressure = calculatePressureFromBoilingPoint(bp);
    expect(Math.abs(backToPressure - pressure)).toBeLessThan(1.5);
  });

  it.each([
    [100.0],
    [95.0],
    [90.0],
    [80.0],
  ])('boiling point -> pressure -> boiling point round-trips for %f C', (temp) => {
    const pressure = calculatePressureFromBoilingPoint(temp);
    const backToTemp = calculateBoilingPointFromPressure(pressure);
    expect(Math.abs(backToTemp - temp)).toBeLessThan(0.5);
  });
});

// ============================================================
// Section 5–11: calculateTime (Williams formula)
// ============================================================

const defaultParams = {
  weight: 60,
  startTemp: 4,
  targetTemp: 67,
  boilingPoint: 100,
  eggCount: 1,
  waterVolume: 1.5,
  stovePower: 2000,
  stoveEfficiency: 0.87,
  potWeight: 0.8,
  potHeatCapacity: 0.50,
  waterStartTemp: 15,
  ambientTemp: 22,
};

/** Helper: call calculateTime with overrides. */
const calc = (overrides = {}) => calculateTime({ ...defaultParams, ...overrides });

// ---- Section 5: Input validation ----

describe('calculateTime – input validation', () => {
  it('returns null when weight is 0', () => {
    expect(calc({ weight: 0 })).toBeNull();
  });

  it('returns null when weight is negative', () => {
    expect(calc({ weight: -10 })).toBeNull();
  });

  it('returns null when boilingPoint <= targetTemp', () => {
    expect(calc({ boilingPoint: 67 })).toBeNull();
  });

  it('returns null when targetTemp <= startTemp', () => {
    expect(calc({ targetTemp: 4 })).toBeNull();
  });

  it('returns null when targetTemp < startTemp', () => {
    expect(calc({ targetTemp: 2 })).toBeNull();
  });
});

// ---- Section 6: Default case ----

describe('calculateTime – default case', () => {
  it('returns a valid result object with all expected properties', () => {
    const result = calc();
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('cookingTime');
    expect(result).toHaveProperty('tempDrop');
    expect(result).toHaveProperty('effectiveTemp');
    expect(result).toHaveProperty('idealTime');
    expect(result).toHaveProperty('totalEnergy');
    expect(result).toHaveProperty('heatingTime');
  });

  it('produces a cooking time in a reasonable range (2–15 min)', () => {
    const result = calc();
    expect(result.cookingTime).toBeGreaterThanOrEqual(2);
    expect(result.cookingTime).toBeLessThanOrEqual(15);
  });

  it('produces a positive temperature drop', () => {
    expect(calc().tempDrop).toBeGreaterThan(0);
  });

  it('effective temperature is between T_drop and boiling point', () => {
    const result = calc();
    const tempAfterDrop = defaultParams.boilingPoint - result.tempDrop;
    expect(result.effectiveTemp).toBeGreaterThanOrEqual(tempAfterDrop);
    expect(result.effectiveTemp).toBeLessThanOrEqual(defaultParams.boilingPoint);
  });

  it('ideal time is less than or equal to real cooking time', () => {
    const result = calc();
    expect(result.idealTime).toBeLessThanOrEqual(result.cookingTime);
  });

  it('total energy is a positive integer', () => {
    const result = calc();
    expect(result.totalEnergy).toBeGreaterThan(0);
    expect(Number.isInteger(result.totalEnergy)).toBe(true);
  });

  it('heating time is positive', () => {
    expect(calc().heatingTime).toBeGreaterThan(0);
  });
});

// ---- Section 7: Williams formula physical relationships ----

describe('calculateTime – physical relationships', () => {
  it('heavier eggs take longer to cook', () => {
    const light = calc({ weight: 50 });
    const heavy = calc({ weight: 70 });
    expect(heavy.cookingTime).toBeGreaterThan(light.cookingTime);
  });

  it('colder eggs take longer to cook', () => {
    const warm = calc({ startTemp: 20 });
    const cold = calc({ startTemp: 4 });
    expect(cold.cookingTime).toBeGreaterThan(warm.cookingTime);
  });

  it('higher target temperature takes longer', () => {
    const soft = calc({ targetTemp: 62 });
    const hard = calc({ targetTemp: 82 });
    expect(hard.cookingTime).toBeGreaterThan(soft.cookingTime);
  });

  it('lower boiling point increases cooking time', () => {
    const seaLevel = calc({ boilingPoint: 100 });
    const highAlt = calc({ boilingPoint: 92 });
    expect(highAlt.cookingTime).toBeGreaterThan(seaLevel.cookingTime);
  });

  it('more eggs increase temperature drop', () => {
    const oneEgg = calc({ eggCount: 1 });
    const fourEggs = calc({ eggCount: 4 });
    expect(fourEggs.tempDrop).toBeGreaterThan(oneEgg.tempDrop);
  });

  it('more water reduces temperature drop', () => {
    const lessWater = calc({ waterVolume: 0.8 });
    const moreWater = calc({ waterVolume: 3.0 });
    expect(moreWater.tempDrop).toBeLessThan(lessWater.tempDrop);
  });

  it('higher stove power improves effective temperature', () => {
    const lowPower = calc({ stovePower: 500 });
    const highPower = calc({ stovePower: 3000 });
    expect(highPower.effectiveTemp).toBeGreaterThanOrEqual(lowPower.effectiveTemp);
  });

  it('higher efficiency improves effective temperature', () => {
    const lowEff = calc({ stoveEfficiency: 0.4 });
    const highEff = calc({ stoveEfficiency: 0.95 });
    expect(highEff.effectiveTemp).toBeGreaterThanOrEqual(lowEff.effectiveTemp);
  });

  it('energy increases with more water', () => {
    const lessWater = calc({ waterVolume: 1.0 });
    const moreWater = calc({ waterVolume: 3.0 });
    expect(moreWater.totalEnergy).toBeGreaterThan(lessWater.totalEnergy);
  });

  it('energy includes pot heating contribution', () => {
    const lightPot = calc({ potWeight: 0.3 });
    const heavyPot = calc({ potWeight: 2.0 });
    expect(heavyPot.totalEnergy).toBeGreaterThan(lightPot.totalEnergy);
  });

  it('colder ambient temperature increases energy consumption', () => {
    const warmRoom = calc({ ambientTemp: 25 });
    const coldRoom = calc({ ambientTemp: 5 });
    expect(coldRoom.totalEnergy).toBeGreaterThan(warmRoom.totalEnergy);
  });
});

// ---- Section 8: Egg size variations ----

describe('calculateTime – egg size variations', () => {
  const sizes = [
    { label: 'S', weight: 48 },
    { label: 'M', weight: 58 },
    { label: 'L', weight: 68 },
    { label: 'XL', weight: 78 },
  ];

  it('cooking time increases monotonically from S to XL', () => {
    const times = sizes.map((s) => calc({ weight: s.weight }).cookingTime);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i - 1]);
    }
  });

  it('all egg sizes produce valid positive cooking times', () => {
    sizes.forEach((s) => {
      const result = calc({ weight: s.weight });
      expect(result).not.toBeNull();
      expect(result.cookingTime).toBeGreaterThan(0);
    });
  });
});

// ---- Section 9: Consistency / target temperature variations ----

describe('calculateTime – consistency levels', () => {
  const consistencies = [
    { label: 'weich (soft)',        targetTemp: 62 },
    { label: 'mittel (medium)',     targetTemp: 67 },
    { label: 'hart-mittel',        targetTemp: 75 },
    { label: 'hart (hard)',         targetTemp: 82 },
  ];

  it('cooking times increase from soft to hard', () => {
    const times = consistencies.map((c) => calc({ targetTemp: c.targetTemp }).cookingTime);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i - 1]);
    }
  });

  it('all consistency levels produce valid results', () => {
    consistencies.forEach((c) => {
      const result = calc({ targetTemp: c.targetTemp });
      expect(result).not.toBeNull();
      expect(result.cookingTime).toBeGreaterThan(0);
    });
  });
});

// ---- Section 10: Energy calculation components ----

describe('calculateTime – energy calculations', () => {
  it('doubling stove power approximately halves heating time', () => {
    const base = calc({ stovePower: 1000 });
    const doubled = calc({ stovePower: 2000 });
    // heatingTime = Q / (power_kW * eff) / 60 => inversely proportional
    const ratio = base.heatingTime / doubled.heatingTime;
    expect(ratio).toBeCloseTo(2, 0);
  });

  it('lower efficiency increases total energy', () => {
    const highEff = calc({ stoveEfficiency: 1.0 });
    const lowEff = calc({ stoveEfficiency: 0.5 });
    expect(lowEff.totalEnergy).toBeGreaterThan(highEff.totalEnergy);
  });

  it('heating time is proportional to water temperature difference', () => {
    // waterStartTemp=15 => delta=85; waterStartTemp=80 => delta=20
    const cold = calc({ waterStartTemp: 15 });
    const warm = calc({ waterStartTemp: 80 });
    expect(cold.heatingTime).toBeGreaterThan(warm.heatingTime);
  });
});

// ---- Section 11: Altitude / pressure effects ----

describe('calculateTime – altitude effects', () => {
  const altitudes = [
    { label: 'sea level (100 C)',  boilingPoint: 100 },
    { label: '~1000 m (95.8 C)',   boilingPoint: 95.8 },
    { label: '~2000 m (91.9 C)',   boilingPoint: 91.9 },
    { label: '~3000 m (88.5 C)',   boilingPoint: 88.5 },
  ];

  it('all altitude levels produce valid results', () => {
    altitudes.forEach((a) => {
      const result = calc({ boilingPoint: a.boilingPoint });
      expect(result).not.toBeNull();
      expect(result.cookingTime).toBeGreaterThan(0);
    });
  });

  it('lower boiling point (higher altitude) = longer cooking time', () => {
    const times = altitudes.map((a) => calc({ boilingPoint: a.boilingPoint }).cookingTime);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]).toBeGreaterThan(times[i - 1]);
    }
  });

  it('effective temperature decreases at higher altitudes', () => {
    const temps = altitudes.map((a) => calc({ boilingPoint: a.boilingPoint }).effectiveTemp);
    for (let i = 1; i < temps.length; i++) {
      expect(temps[i]).toBeLessThan(temps[i - 1]);
    }
  });
});
