import { useState } from 'react';

/**
 * Manages unit preferences for temperature, volume, weight, and pressure.
 * Parameter-based: accepts optional initial values, does NOT read from useSettings.
 * @param {Object} initial - Initial unit preferences
 * @returns {Object} Unit state and setters
 */
export function useUnitConversion(initial = {}) {
  const [tempUnit, setTempUnit] = useState(initial.tempUnit ?? 'C');
  const [volumeUnit, setVolumeUnit] = useState(initial.volumeUnit ?? 'L');
  const [weightUnit, setWeightUnit] = useState(initial.weightUnit ?? 'g');
  const [pressureUnit, setPressureUnit] = useState(initial.pressureUnit ?? 'hPa');

  return {
    tempUnit, setTempUnit,
    volumeUnit, setVolumeUnit,
    weightUnit, setWeightUnit,
    pressureUnit, setPressureUnit,
    // Convenience: all units as object
    units: { tempUnit, volumeUnit, weightUnit, pressureUnit },
  };
}
