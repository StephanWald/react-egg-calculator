import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocationPressure } from '../../hooks/useLocationPressure';

// Mock the service modules
vi.mock('../../services/meteoApi', () => ({
  fetchSurfacePressure: vi.fn(),
}));

vi.mock('../../services/geocodingApi', () => ({
  fetchLocationName: vi.fn(),
}));

import { fetchSurfacePressure } from '../../services/meteoApi';
import { fetchLocationName } from '../../services/geocodingApi';

describe('useLocationPressure', () => {
  let originalGeolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    originalGeolocation = navigator.geolocation;
  });

  afterEach(() => {
    // Restore geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  function mockGeolocation(impl) {
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: impl },
      configurable: true,
    });
  }

  it('starts with default pressure values', () => {
    const { result } = renderHook(() => useLocationPressure());
    expect(result.current.pressure).toBe(1013.25);
    expect(result.current.boilingPoint).toBe(100);
    expect(result.current.altitude).toBe(0);
    expect(result.current.locationName).toBeNull();
    expect(result.current.locationLoading).toBe(false);
    expect(result.current.locationError).toBeNull();
    expect(result.current.pressureSource).toBe('default');
  });

  it('fetches location and updates pressure, altitude, and city', async () => {
    // Mock GPS success with altitude
    mockGeolocation((success) => {
      success({
        coords: { latitude: 52.52, longitude: 13.405, altitude: 34 },
      });
    });

    fetchSurfacePressure.mockResolvedValueOnce({
      surfacePressure: 1005.3,
      elevation: 34,
    });
    fetchLocationName.mockResolvedValueOnce('Berlin');

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.pressure).toBe(1005.3);
    expect(result.current.pressureSource).toBe('gps');
    expect(result.current.altitude).toBe(34); // GPS altitude used
    expect(result.current.locationName).toBe('Berlin');
    expect(result.current.locationLoading).toBe(false);
    expect(result.current.locationError).toBeNull();
    // Boiling point should be recalculated from pressure
    expect(result.current.boilingPoint).not.toBe(100);
  });

  it('uses API elevation when GPS altitude is not valid', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 48.86, longitude: 2.35, altitude: null },
      });
    });

    fetchSurfacePressure.mockResolvedValueOnce({
      surfacePressure: 1010.0,
      elevation: 35,
    });
    fetchLocationName.mockResolvedValueOnce('Paris');

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.altitude).toBe(35); // API elevation used
  });

  it('calculates altitude from pressure when neither GPS nor API elevation available', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 48.86, longitude: 2.35, altitude: null },
      });
    });

    fetchSurfacePressure.mockResolvedValueOnce({
      surfacePressure: 950.0,
      elevation: null,
    });
    fetchLocationName.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    // Altitude calculated from pressure (950 hPa ~ 540m)
    expect(result.current.altitude).toBeGreaterThan(400);
    expect(result.current.altitude).toBeLessThan(700);
  });

  it('handles GPS permission denied', async () => {
    mockGeolocation((_success, error) => {
      error({ code: 1, message: 'User denied Geolocation' });
    });

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.locationError).toBe('PERMISSION_DENIED');
    expect(result.current.locationLoading).toBe(false);
  });

  it('handles GPS position unavailable', async () => {
    mockGeolocation((_success, error) => {
      error({ code: 2, message: 'Position unavailable' });
    });

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.locationError).toBe('POSITION_UNAVAILABLE');
    expect(result.current.locationLoading).toBe(false);
  });

  it('handles API network error with error message', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 52.52, longitude: 13.405, altitude: null },
      });
    });

    fetchSurfacePressure.mockRejectedValueOnce(new Error('Weather data unavailable (500)'));

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.locationError).toBe('Weather data unavailable (500)');
    expect(result.current.locationLoading).toBe(false);
  });

  it('handles unknown error with fallback code', async () => {
    mockGeolocation((_success, error) => {
      error({ code: 99 }); // unknown error code, no message
    });

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    expect(result.current.locationError).toBe('LOCATION_ERROR');
  });

  it('geocoding failure does not affect pressure data', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 52.52, longitude: 13.405, altitude: 34 },
      });
    });

    fetchSurfacePressure.mockResolvedValueOnce({
      surfacePressure: 1005.3,
      elevation: 34,
    });
    // Geocoding returns null (failure)
    fetchLocationName.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useLocationPressure());

    await act(async () => {
      await result.current.getLocationAndPressure();
    });

    // Pressure data should still be set correctly
    expect(result.current.pressure).toBe(1005.3);
    expect(result.current.pressureSource).toBe('gps');
    expect(result.current.locationName).toBeNull(); // No city found
    expect(result.current.locationError).toBeNull(); // Not an error
  });

  describe('manual entry', () => {
    it('handleManualPressure recalculates boiling point and altitude', () => {
      const { result } = renderHook(() => useLocationPressure());

      act(() => {
        result.current.handleManualPressure(950);
      });

      expect(result.current.pressure).toBe(950);
      expect(result.current.pressureSource).toBe('manual');
      expect(result.current.locationName).toBeNull();
      // Boiling point at 950 hPa < 100 C
      expect(result.current.boilingPoint).toBeLessThan(100);
      // Altitude at 950 hPa > 0 m
      expect(result.current.altitude).toBeGreaterThan(0);
    });

    it('handleManualBoilingPoint recalculates pressure and altitude', () => {
      const { result } = renderHook(() => useLocationPressure());

      act(() => {
        result.current.handleManualBoilingPoint(98);
      });

      expect(result.current.boilingPoint).toBe(98);
      expect(result.current.pressureSource).toBe('manual');
      expect(result.current.locationName).toBeNull();
      // Pressure at 98 C bp < 1013.25 hPa
      expect(result.current.pressure).toBeLessThan(1013.25);
      // Altitude should be positive (lower pressure = higher altitude)
      expect(result.current.altitude).toBeGreaterThan(0);
    });

    it('manual entry clears previous location name', async () => {
      mockGeolocation((success) => {
        success({
          coords: { latitude: 52.52, longitude: 13.405, altitude: 34 },
        });
      });

      fetchSurfacePressure.mockResolvedValueOnce({
        surfacePressure: 1005.3,
        elevation: 34,
      });
      fetchLocationName.mockResolvedValueOnce('Berlin');

      const { result } = renderHook(() => useLocationPressure());

      // First fetch location
      await act(async () => {
        await result.current.getLocationAndPressure();
      });
      expect(result.current.locationName).toBe('Berlin');

      // Then manual entry clears it
      act(() => {
        result.current.handleManualPressure(1000);
      });
      expect(result.current.locationName).toBeNull();
    });
  });

  it('sets loading during fetch', async () => {
    let resolveGps;
    mockGeolocation((success) => {
      resolveGps = success;
    });

    const { result } = renderHook(() => useLocationPressure());

    // Start fetch (but don't resolve GPS yet)
    let fetchPromise;
    act(() => {
      fetchPromise = result.current.getLocationAndPressure();
    });

    expect(result.current.locationLoading).toBe(true);

    // Resolve GPS and API calls
    fetchSurfacePressure.mockResolvedValueOnce({
      surfacePressure: 1013.25,
      elevation: 0,
    });
    fetchLocationName.mockResolvedValueOnce(null);

    await act(async () => {
      resolveGps({ coords: { latitude: 0, longitude: 0, altitude: null } });
      await fetchPromise;
    });

    expect(result.current.locationLoading).toBe(false);
  });
});
