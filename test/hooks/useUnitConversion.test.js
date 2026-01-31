import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnitConversion } from '../../hooks/useUnitConversion';

describe('useUnitConversion', () => {
  it('returns default units (C, L, g, hPa)', () => {
    const { result } = renderHook(() => useUnitConversion());
    expect(result.current.tempUnit).toBe('C');
    expect(result.current.volumeUnit).toBe('L');
    expect(result.current.weightUnit).toBe('g');
    expect(result.current.pressureUnit).toBe('hPa');
  });

  it('accepts initial unit overrides', () => {
    const { result } = renderHook(() =>
      useUnitConversion({ tempUnit: 'F', volumeUnit: 'oz' })
    );
    expect(result.current.tempUnit).toBe('F');
    expect(result.current.volumeUnit).toBe('oz');
    // Non-overridden units keep defaults
    expect(result.current.weightUnit).toBe('g');
    expect(result.current.pressureUnit).toBe('hPa');
  });

  it('updates temperature unit via setTempUnit', () => {
    const { result } = renderHook(() => useUnitConversion());
    act(() => { result.current.setTempUnit('F'); });
    expect(result.current.tempUnit).toBe('F');
  });

  it('updates volume unit via setVolumeUnit', () => {
    const { result } = renderHook(() => useUnitConversion());
    act(() => { result.current.setVolumeUnit('oz'); });
    expect(result.current.volumeUnit).toBe('oz');
  });

  it('updates weight unit via setWeightUnit', () => {
    const { result } = renderHook(() => useUnitConversion());
    act(() => { result.current.setWeightUnit('oz'); });
    expect(result.current.weightUnit).toBe('oz');
  });

  it('updates pressure unit via setPressureUnit', () => {
    const { result } = renderHook(() => useUnitConversion());
    act(() => { result.current.setPressureUnit('inHg'); });
    expect(result.current.pressureUnit).toBe('inHg');
  });

  it('returns units convenience object reflecting current state', () => {
    const { result } = renderHook(() => useUnitConversion());

    // Default state
    expect(result.current.units).toEqual({
      tempUnit: 'C',
      volumeUnit: 'L',
      weightUnit: 'g',
      pressureUnit: 'hPa',
    });

    // After updates
    act(() => { result.current.setTempUnit('F'); });
    act(() => { result.current.setPressureUnit('inHg'); });

    expect(result.current.units).toEqual({
      tempUnit: 'F',
      volumeUnit: 'L',
      weightUnit: 'g',
      pressureUnit: 'inHg',
    });
  });
});
