import { describe, it, expect } from 'vitest';
import {
  STOVE_TYPES,
  POT_MATERIALS,
  CONSISTENCY_OPTIONS,
  EGG_SIZES,
  START_TEMP_OPTIONS,
} from '../constants';

// ============================================================
// Freeze Validation Tests
// Verify all constants are frozen to prevent mutation
// ============================================================

describe('Constants are frozen', () => {
  it('STOVE_TYPES array and all elements are frozen', () => {
    expect(Object.isFrozen(STOVE_TYPES)).toBe(true);
    STOVE_TYPES.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });

  it('POT_MATERIALS array and all elements are frozen', () => {
    expect(Object.isFrozen(POT_MATERIALS)).toBe(true);
    POT_MATERIALS.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });

  it('CONSISTENCY_OPTIONS array and all elements are frozen', () => {
    expect(Object.isFrozen(CONSISTENCY_OPTIONS)).toBe(true);
    CONSISTENCY_OPTIONS.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });

  it('EGG_SIZES array and all elements are frozen', () => {
    expect(Object.isFrozen(EGG_SIZES)).toBe(true);
    EGG_SIZES.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });

  it('START_TEMP_OPTIONS array and all elements are frozen', () => {
    expect(Object.isFrozen(START_TEMP_OPTIONS)).toBe(true);
    START_TEMP_OPTIONS.forEach(item => {
      expect(Object.isFrozen(item)).toBe(true);
    });
  });
});

// ============================================================
// Structure Validation Tests
// Verify constants have expected properties and reasonable values
// ============================================================

describe('STOVE_TYPES structure', () => {
  it('has 5 stove types', () => {
    expect(STOVE_TYPES).toHaveLength(5);
  });

  it('all items have required properties', () => {
    STOVE_TYPES.forEach(stove => {
      expect(stove).toHaveProperty('id');
      expect(stove).toHaveProperty('nameKey');
      expect(stove).toHaveProperty('efficiency');
      expect(stove).toHaveProperty('defaultPower');
      expect(stove).toHaveProperty('icon');
    });
  });

  it('all efficiency values are between 0 and 1', () => {
    STOVE_TYPES.forEach(stove => {
      expect(stove.efficiency).toBeGreaterThan(0);
      expect(stove.efficiency).toBeLessThanOrEqual(1);
    });
  });

  it('all defaultPower values are positive', () => {
    STOVE_TYPES.forEach(stove => {
      expect(stove.defaultPower).toBeGreaterThan(0);
    });
  });

  it('all icons are non-empty strings', () => {
    STOVE_TYPES.forEach(stove => {
      expect(typeof stove.icon).toBe('string');
      expect(stove.icon.length).toBeGreaterThan(0);
    });
  });
});

describe('POT_MATERIALS structure', () => {
  it('has 5 materials', () => {
    expect(POT_MATERIALS).toHaveLength(5);
  });

  it('all items have required properties', () => {
    POT_MATERIALS.forEach(material => {
      expect(material).toHaveProperty('id');
      expect(material).toHaveProperty('nameKey');
      expect(material).toHaveProperty('heatCapacity');
    });
  });

  it('all heatCapacity values are positive', () => {
    POT_MATERIALS.forEach(material => {
      expect(material.heatCapacity).toBeGreaterThan(0);
    });
  });
});

describe('CONSISTENCY_OPTIONS structure', () => {
  it('has 4 consistency options', () => {
    expect(CONSISTENCY_OPTIONS).toHaveLength(4);
  });

  it('all items have required properties', () => {
    CONSISTENCY_OPTIONS.forEach(option => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('nameKey');
      expect(option).toHaveProperty('temp');
      expect(option).toHaveProperty('color');
    });
  });

  it('all temp values are positive', () => {
    CONSISTENCY_OPTIONS.forEach(option => {
      expect(option.temp).toBeGreaterThan(0);
    });
  });

  it('all colors are valid hex codes', () => {
    CONSISTENCY_OPTIONS.forEach(option => {
      expect(option.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('EGG_SIZES structure', () => {
  it('has 4 egg sizes', () => {
    expect(EGG_SIZES).toHaveLength(4);
  });

  it('all items have required properties', () => {
    EGG_SIZES.forEach(size => {
      expect(size).toHaveProperty('name');
      expect(size).toHaveProperty('weight');
    });
  });

  it('all weight values are positive', () => {
    EGG_SIZES.forEach(size => {
      expect(size.weight).toBeGreaterThan(0);
    });
  });

  it('weights are in ascending order (S < M < L < XL)', () => {
    expect(EGG_SIZES[0].weight).toBeLessThan(EGG_SIZES[1].weight); // S < M
    expect(EGG_SIZES[1].weight).toBeLessThan(EGG_SIZES[2].weight); // M < L
    expect(EGG_SIZES[2].weight).toBeLessThan(EGG_SIZES[3].weight); // L < XL
  });
});

describe('START_TEMP_OPTIONS structure', () => {
  it('has 3 temperature options', () => {
    expect(START_TEMP_OPTIONS).toHaveLength(3);
  });

  it('all items have required properties', () => {
    START_TEMP_OPTIONS.forEach(option => {
      expect(option).toHaveProperty('nameKey');
      expect(option).toHaveProperty('temp');
      expect(option).toHaveProperty('icon');
    });
  });

  it('all temp values are defined numbers', () => {
    START_TEMP_OPTIONS.forEach(option => {
      expect(typeof option.temp).toBe('number');
    });
  });

  it('all icons are non-empty strings', () => {
    START_TEMP_OPTIONS.forEach(option => {
      expect(typeof option.icon).toBe('string');
      expect(option.icon.length).toBeGreaterThan(0);
    });
  });
});
