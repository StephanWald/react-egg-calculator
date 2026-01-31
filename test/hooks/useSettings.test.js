import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings, DEFAULTS } from '../../hooks/useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns defaults when no saved settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('induction');
    expect(result.current.settings.stovePower).toBe(2000);
    expect(result.current.settings.stoveEfficiency).toBe(0.87);
    expect(result.current.settings.weight).toBe(60);
    expect(result.current.settings.tempUnit).toBe('C');
  });

  it('loads saved settings from localStorage', () => {
    localStorage.setItem('egg-calculator-settings', JSON.stringify({
      stoveType: 'gas',
      stovePower: 2500,
    }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('gas');
    expect(result.current.settings.stovePower).toBe(2500);
  });

  it('merges saved settings with defaults (missing keys get defaults)', () => {
    localStorage.setItem('egg-calculator-settings', JSON.stringify({
      stoveType: 'gas',
    }));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('gas');
    expect(result.current.settings.stovePower).toBe(2000); // Default
    expect(result.current.settings.potMaterial).toBe('steel'); // Default
  });

  it('auto-persists on update', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.updateSetting('stoveType', 'ceramic'); });
    const saved = JSON.parse(localStorage.getItem('egg-calculator-settings'));
    expect(saved.stoveType).toBe('ceramic');
  });

  it('resetSettings returns state to defaults and clears custom values', () => {
    const { result } = renderHook(() => useSettings());
    act(() => { result.current.updateSetting('stoveType', 'gas'); });
    expect(result.current.settings.stoveType).toBe('gas');

    act(() => { result.current.resetSettings(); });
    expect(result.current.settings.stoveType).toBe('induction');
    expect(result.current.settings.stovePower).toBe(DEFAULTS.stovePower);
    // After reset, auto-persist re-saves defaults; verify no custom values remain
    const saved = JSON.parse(localStorage.getItem('egg-calculator-settings'));
    expect(saved.stoveType).toBe('induction');
  });

  it('handles corrupt localStorage gracefully (falls back to defaults)', () => {
    localStorage.setItem('egg-calculator-settings', 'not-valid-json{{{');
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.stoveType).toBe('induction');
    expect(result.current.settings.stovePower).toBe(2000);
  });

  it('updateSetting updates a single key without affecting others', () => {
    const { result } = renderHook(() => useSettings());
    const originalWeight = result.current.settings.weight;
    const originalPressure = result.current.settings.pressure;

    act(() => { result.current.updateSetting('stoveType', 'ceramic'); });

    expect(result.current.settings.stoveType).toBe('ceramic');
    expect(result.current.settings.weight).toBe(originalWeight);
    expect(result.current.settings.pressure).toBe(originalPressure);
  });
});
