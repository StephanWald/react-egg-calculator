import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'egg-calculator-settings';

export const DEFAULTS = {
  // Working inputs
  weight: 60,
  startTemp: 4,
  targetTemp: 67,
  consistency: 'medium',
  eggCount: 1,
  waterVolume: 1.5,
  // Household settings
  stoveType: 'induction',
  stovePower: 2000,
  stoveEfficiency: 0.87,
  potWeight: 0.8,
  potMaterial: 'steel',
  waterStartTemp: 15,
  ambientTemp: 22,
  // Location & pressure
  altitude: 0,
  pressure: 1013.25,
  boilingPoint: 100,
  locationName: null,
  pressureSource: 'default',
  // Unit preferences
  tempUnit: 'C',
  volumeUnit: 'L',
  weightUnit: 'g',
  pressureUnit: 'hPa',
  // Notification permission
  notificationPermission: 'default',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    // Lazy initializer: load from localStorage on first render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      // localStorage unavailable or corrupt JSON
    }
    return { ...DEFAULTS };
  });

  // Auto-persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // localStorage unavailable
    }
  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // localStorage unavailable
    }
    setSettings({ ...DEFAULTS });
  }, []);

  return { settings, updateSetting, resetSettings };
}
