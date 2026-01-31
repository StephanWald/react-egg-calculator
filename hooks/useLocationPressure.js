// GPS + pressure + geocoding hook
// Orchestrates: GPS -> Open-Meteo (pressure) -> Nominatim (city name)

import { useState, useCallback } from 'react';
import { fetchSurfacePressure } from '../services/meteoApi';
import { fetchLocationName } from '../services/geocodingApi';
import {
  calculateBoilingPointFromPressure,
  calculatePressureFromBoilingPoint,
  calculateAltitudeFromPressure,
} from '../physics';

/**
 * Custom hook for location-based atmospheric pressure detection.
 *
 * Flow: GPS coordinates -> Open-Meteo API (surface pressure) -> Nominatim (city name)
 * Also supports manual pressure/boiling point entry with recalculation.
 *
 * @returns {Object} Location/pressure state and control functions
 */
export function useLocationPressure() {
  const [altitude, setAltitude] = useState(0);
  const [pressure, setPressure] = useState(1013.25);
  const [boilingPoint, setBoilingPoint] = useState(100);
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [pressureSource, setPressureSource] = useState('default');

  /**
   * Fetch GPS position, then surface pressure from Open-Meteo,
   * then city name from Nominatim. Updates all atmospheric state.
   */
  const getLocationAndPressure = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      // Get GPS coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude, altitude: gpsAltitude } = position.coords;

      // Fetch surface pressure from Open-Meteo
      const { surfacePressure, elevation: apiElevation } = await fetchSurfacePressure(latitude, longitude);

      // Update pressure and boiling point
      const roundedPressure = Math.round(surfacePressure * 10) / 10;
      setPressure(roundedPressure);
      const bp = calculateBoilingPointFromPressure(surfacePressure);
      setBoilingPoint(bp);
      setPressureSource('gps');

      // Determine elevation: prefer GPS altitude > API elevation > calculated
      let elevationToUse = 0;
      if (gpsAltitude && !isNaN(gpsAltitude) && gpsAltitude > -100) {
        elevationToUse = Math.round(gpsAltitude);
      } else if (apiElevation && !isNaN(apiElevation)) {
        elevationToUse = Math.round(apiElevation);
      } else {
        elevationToUse = calculateAltitudeFromPressure(surfacePressure);
      }
      setAltitude(elevationToUse);

      // Fetch city name (optional, errors are silently ignored)
      const city = await fetchLocationName(latitude, longitude);
      if (city) {
        setLocationName(city);
      }
    } catch (error) {
      // Return error codes, not translated strings
      if (error.code === 1) {
        setLocationError('PERMISSION_DENIED');
      } else if (error.code === 2) {
        setLocationError('POSITION_UNAVAILABLE');
      } else if (error.message) {
        setLocationError(error.message);
      } else {
        setLocationError('LOCATION_ERROR');
      }
    } finally {
      setLocationLoading(false);
    }
  }, []);

  /**
   * Manual pressure entry: recalculate boiling point and altitude.
   * @param {number} p - pressure in hPa
   */
  const handleManualPressure = useCallback((p) => {
    setPressure(p);
    setBoilingPoint(calculateBoilingPointFromPressure(p));
    setAltitude(calculateAltitudeFromPressure(p));
    setPressureSource('manual');
    setLocationName(null);
  }, []);

  /**
   * Manual boiling point entry: recalculate pressure and altitude.
   * @param {number} bp - boiling point in degrees Celsius
   */
  const handleManualBoilingPoint = useCallback((bp) => {
    setBoilingPoint(bp);
    const p = calculatePressureFromBoilingPoint(bp);
    setPressure(p);
    setAltitude(calculateAltitudeFromPressure(p));
    setPressureSource('manual');
    setLocationName(null);
  }, []);

  return {
    altitude,
    pressure,
    boilingPoint,
    locationName,
    locationLoading,
    locationError,
    pressureSource,
    getLocationAndPressure,
    handleManualPressure,
    handleManualBoilingPoint,
    // Direct setters for composition with other hooks / component state
    setAltitude,
    setPressure,
    setBoilingPoint,
    setLocationName,
    setPressureSource,
  };
}
