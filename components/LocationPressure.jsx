import { useTranslation } from '../useTranslation';
import { formatTemp, formatPressure } from '../formatters';

/**
 * LocationPressure - GPS and pressure section component
 *
 * Displays GPS detection button, pressure/boiling point/altitude values,
 * location name, and pressure source indicator.
 *
 * @param {Object} props
 * @param {number} props.pressure - Current pressure in hPa
 * @param {number} props.boilingPoint - Current boiling point in Celsius
 * @param {number} props.altitude - Current altitude in meters
 * @param {string|null} props.locationName - Current location name
 * @param {boolean} props.locationLoading - Whether GPS is loading
 * @param {string|null} props.locationError - Error code from location hook
 * @param {string} props.pressureSource - Source of pressure data ('default', 'gps', 'manual')
 * @param {string} props.tempUnit - Temperature display unit ('C' or 'F')
 * @param {string} props.pressureUnit - Pressure display unit ('hPa' or 'inHg')
 * @param {Function} props.onGetLocation - GPS detect callback
 * @param {Function} props.onPressureChange - Manual pressure change callback
 * @param {string|null} props.locationErrorMessage - Pre-translated error message
 */
export function LocationPressure({
  pressure,
  boilingPoint,
  altitude,
  locationName,
  locationLoading,
  locationError,
  pressureSource,
  tempUnit,
  pressureUnit,
  onGetLocation,
  onPressureChange,
  locationErrorMessage,
}) {
  const { t } = useTranslation();

  // Pressure input clamping constants (physics-valid range)
  const MIN_PRESSURE = 870;  // Extreme low (hurricane at ~1400m)
  const MAX_PRESSURE = 1084; // Record high
  const STANDARD_PRESSURE = 1013.25; // Standard atmosphere

  // Handle pressure input with silent clamping
  const handlePressureChange = (e) => {
    const val = e.target.value;

    // Allow empty string while user is typing
    if (val === '') {
      onPressureChange('');
      return;
    }

    const numVal = Number(val);
    if (!isNaN(numVal)) {
      // Clamp to valid physics range
      const clamped = Math.max(MIN_PRESSURE, Math.min(MAX_PRESSURE, numVal));
      onPressureChange(clamped);
    }
  };

  // Reset to standard atmosphere if empty on blur
  const handlePressureBlur = () => {
    if (pressure === '' || isNaN(Number(pressure))) {
      onPressureChange(STANDARD_PRESSURE);
    }
  };

  return (
    <div className="mb-5 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-sky-900">
          📍 {t('locationPressure')}
        </label>
        <button
          onClick={onGetLocation}
          disabled={locationLoading}
          className="px-3 py-2 min-h-[44px] bg-sky-500 text-white text-xs sm:text-sm rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {locationLoading ? `⏳ ${t('detectingLocation')}` : `🛰️ ${t('gpsWeather')}`}
        </button>
      </div>

      {locationError && (
        <div className="text-xs text-red-600 mb-2">{locationErrorMessage}</div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <div className="text-xs text-sky-700 mb-1">{t('airPressure')}</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={pressure}
              onChange={handlePressureChange}
              onBlur={handlePressureBlur}
              min={MIN_PRESSURE}
              max={MAX_PRESSURE}
              className="w-full px-2 py-2 text-base min-h-[44px] border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <span className="text-xs text-sky-700 font-medium whitespace-nowrap">{formatPressure(pressure, pressureUnit)}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-sky-700 mb-1">{t('boilingPoint')}</div>
          <div className="flex items-center justify-center h-8 bg-white rounded-lg border border-sky-200">
            <span className="text-lg font-bold text-sky-700">{formatTemp(boilingPoint, tempUnit)}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-sky-700 mb-1">{t('altitudeApprox')}</div>
          <div className="flex items-center justify-center h-8 bg-white rounded-lg border border-sky-200">
            <span className="text-sm text-sky-700">{altitude} m</span>
          </div>
        </div>
      </div>

      {locationName && (
        <div className="mt-2 text-xs text-sky-600">📍 {locationName}</div>
      )}

      {pressureSource === 'gps' && (
        <div className="mt-2 text-xs text-sky-600">
          ✓ {t('currentPressureSource')}
        </div>
      )}
    </div>
  );
}
