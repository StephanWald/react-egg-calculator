import React, { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';
import {
  calculateTime as calculateTimePhysics,
} from './physics';
import { STOVE_TYPES, POT_MATERIALS, CONSISTENCY_OPTIONS, EGG_SIZES, START_TEMP_OPTIONS } from './constants';
import { formatTime, formatTimerDisplay, formatCountdown, formatTemp, formatVolume, formatWeight, formatPressure } from './formatters';
import { useSettings } from './hooks/useSettings';
import { useUnitConversion } from './hooks/useUnitConversion';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useLocationPressure } from './hooks/useLocationPressure';

const EggCalculator = () => {
  const { t, lang, setLanguage, languages } = useTranslation();

  // ============ SETTINGS (persistent) ============
  const { settings, updateSetting, resetSettings } = useSettings();

  // Destructure working inputs and household settings from persisted settings
  const {
    weight, startTemp, targetTemp, consistency, eggCount, waterVolume,
    stoveType, stovePower, stoveEfficiency, potWeight, potMaterial,
    waterStartTemp, ambientTemp,
  } = settings;

  // ============ UNIT PREFERENCES ============
  const {
    tempUnit, setTempUnit,
    volumeUnit, setVolumeUnit,
    weightUnit, setWeightUnit,
    pressureUnit, setPressureUnit,
  } = useUnitConversion({
    tempUnit: settings.tempUnit,
    volumeUnit: settings.volumeUnit,
    weightUnit: settings.weightUnit,
    pressureUnit: settings.pressureUnit,
  });

  // Sync unit changes back to settings for persistence
  const handleTempUnitChange = (unit) => {
    setTempUnit(unit);
    updateSetting('tempUnit', unit);
  };
  const handleVolumeUnitChange = (unit) => {
    setVolumeUnit(unit);
    updateSetting('volumeUnit', unit);
  };
  const handleWeightUnitChange = (unit) => {
    setWeightUnit(unit);
    updateSetting('weightUnit', unit);
  };
  const handlePressureUnitChange = (unit) => {
    setPressureUnit(unit);
    updateSetting('pressureUnit', unit);
  };

  // ============ TIMER ============
  const {
    timerActive,
    timerPaused,
    timerRemaining,
    timerComplete,
    notificationPermission,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    dismissComplete,
  } = useTimerLogic({
    notificationTitle: `🥚 ${t('notificationTitle')}`,
    notificationBody: t('notificationBody'),
  });

  // ============ LOCATION & PRESSURE ============
  const {
    altitude, pressure, boilingPoint,
    locationName, locationLoading, locationError, pressureSource,
    getLocationAndPressure,
    handleManualPressure,
    handleManualBoilingPoint,
    setAltitude, setPressure, setBoilingPoint,
    setLocationName, setPressureSource,
  } = useLocationPressure();

  // Initialize location state from persisted settings on mount
  useEffect(() => {
    if (settings.pressure !== 1013.25 || settings.pressureSource !== 'default') {
      setPressure(settings.pressure);
      setBoilingPoint(settings.boilingPoint);
      setAltitude(settings.altitude);
      setPressureSource(settings.pressureSource);
      if (settings.locationName) {
        setLocationName(settings.locationName);
      }
    }
  }, []); // Only on mount

  // Persist location changes back to settings
  useEffect(() => {
    updateSetting('altitude', altitude);
    updateSetting('pressure', pressure);
    updateSetting('boilingPoint', boilingPoint);
    updateSetting('locationName', locationName);
    updateSetting('pressureSource', pressureSource);
  }, [altitude, pressure, boilingPoint, locationName, pressureSource]);

  // Map location error codes to translated messages
  const getLocationErrorMessage = (errorCode) => {
    if (!errorCode) return null;
    if (errorCode === 'PERMISSION_DENIED') return t('locationDenied');
    if (errorCode === 'POSITION_UNAVAILABLE') return t('positionUnavailable');
    if (errorCode === 'LOCATION_ERROR') return t('locationError');
    return errorCode; // fallback: display raw error message
  };

  // ============ CALCULATED RESULTS ============
  const [cookingTime, setCookingTime] = useState(null);
  const [tempDrop, setTempDrop] = useState(null);
  const [effectiveTemp, setEffectiveTemp] = useState(null);
  const [idealTime, setIdealTime] = useState(null);
  const [totalEnergy, setTotalEnergy] = useState(null);
  const [heatingTime, setHeatingTime] = useState(null);

  // ============ UI STATE ============
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEnergy, setShowEnergy] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // ============ ESCAPE KEY HANDLER (Config Dialog & Timer) ============
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Timer takes priority - stop it if active or complete
        if (timerActive) {
          stopTimer();
          return;
        }
        // Dismiss timer complete overlay
        if (timerComplete) {
          dismissComplete();
          return;
        }
        // Otherwise close config dialog
        if (showConfigDialog) {
          setShowConfigDialog(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfigDialog, timerActive, timerComplete, stopTimer, dismissComplete]);

  // ============ FORMULAS ============

  const getPotHeatCapacity = () => {
    return POT_MATERIALS.find(m => m.id === potMaterial)?.heatCapacity || 0.5;
  };

  // ============ STOVE TYPE HANDLER ============

  const handleStoveTypeChange = (type) => {
    const stove = STOVE_TYPES.find(s => s.id === type);
    if (stove) {
      updateSetting('stoveType', type);
      updateSetting('stoveEfficiency', stove.efficiency);
      updateSetting('stovePower', stove.defaultPower);
    }
  };

  // ============ MAIN CALCULATION ============

  useEffect(() => {
    calculateTime();
  }, [weight, startTemp, boilingPoint, targetTemp, eggCount, waterVolume,
      stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp]);

  const calculateTime = () => {
    const potHeatCap = getPotHeatCapacity();
    const result = calculateTimePhysics({
      weight, startTemp, targetTemp, boilingPoint, eggCount, waterVolume,
      stovePower, stoveEfficiency, potWeight, potHeatCapacity: potHeatCap,
      waterStartTemp, ambientTemp,
    });

    if (result) {
      setCookingTime(result.cookingTime);
      setTempDrop(result.tempDrop);
      setEffectiveTemp(result.effectiveTemp);
      setIdealTime(result.idealTime);
      setTotalEnergy(result.totalEnergy);
      setHeatingTime(result.heatingTime);
    } else {
      setCookingTime(null);
      setTempDrop(null);
      setEffectiveTemp(null);
      setIdealTime(null);
      setTotalEnergy(null);
      setHeatingTime(null);
    }
  };

  // ============ TIMER HANDLERS ============

  const handleStartTimer = async () => {
    if (!cookingTime) return;
    const timeInSeconds = Math.round(cookingTime * 60);
    await startTimer(timeInSeconds);
  };

  const handleStopTimer = () => {
    stopTimer();
  };

  // ============ HELPERS ============

  const handleConsistencyChange = (option) => {
    updateSetting('consistency', option.id);
    updateSetting('targetTemp', option.temp);
  };

  const handleResetToDefaults = () => {
    resetSettings();
    // Reset unit conversion hook state to match defaults
    setTempUnit('C');
    setVolumeUnit('L');
    setWeightUnit('g');
    setPressureUnit('hPa');
    // Reset location hook state to match defaults
    setAltitude(0);
    setPressure(1013.25);
    setBoilingPoint(100);
    setLocationName(null);
    setPressureSource('default');
  };

  const getEggVisualization = () => {
    const yolkSize = consistency === 'soft' ? 45 : consistency === 'medium' ? 40 : consistency === 'hard-medium' ? 35 : 30;
    const yolkColor = CONSISTENCY_OPTIONS.find(c => c.id === consistency)?.color || '#FFD700';

    return (
      <svg viewBox="0 0 100 120" className="w-24 h-32 mx-auto">
        <ellipse cx="50" cy="60" rx="40" ry="50" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2"/>
        <circle cx="50" cy="65" r={yolkSize} fill={yolkColor} opacity="0.9">
          <animate attributeName="r" values={`${yolkSize};${yolkSize + 2};${yolkSize}`} dur="2s" repeatCount="indefinite"/>
        </circle>
        <ellipse cx="42" cy="58" rx="8" ry="6" fill="white" opacity="0.3"/>
      </svg>
    );
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6 relative">
          {/* Config Dialog Button */}
          <div className="absolute right-0 top-0">
            <button
              onClick={() => setShowConfigDialog(!showConfigDialog)}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-lg"
              title="Settings"
            >
              ⚙️
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">🥚 {t('title')}</h1>
          <p className="text-amber-700">{t('subtitle')}</p>
        </div>

        {/* ============ CONFIG DIALOG ============ */}
        {showConfigDialog && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowConfigDialog(false)}
            />
            {/* Dialog */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 w-80 max-w-[90vw]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">⚙️ {t('configDialogTitle')}</h2>
                <button
                  onClick={() => setShowConfigDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Temperature Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('configTempUnit')}</label>
                <button
                  onClick={() => handleTempUnitChange(tempUnit === 'C' ? 'F' : 'C')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={tempUnit === 'C' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>°C</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={tempUnit === 'F' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>°F</span>
                </button>
              </div>

              {/* Volume Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('configVolumeUnit')}</label>
                <button
                  onClick={() => handleVolumeUnitChange(volumeUnit === 'L' ? 'oz' : 'L')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={volumeUnit === 'L' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>L</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={volumeUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>oz</span>
                </button>
              </div>

              {/* Weight Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('configWeightUnit')}</label>
                <button
                  onClick={() => handleWeightUnitChange(weightUnit === 'g' ? 'oz' : 'g')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={weightUnit === 'g' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>g</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={weightUnit === 'oz' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>oz</span>
                </button>
              </div>

              {/* Pressure Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('configPressureUnit')}</label>
                <button
                  onClick={() => handlePressureUnitChange(pressureUnit === 'hPa' ? 'inHg' : 'hPa')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={pressureUnit === 'hPa' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>hPa</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={pressureUnit === 'inHg' ? 'text-amber-600 border-b-2 border-amber-600 pb-0.5' : 'text-gray-400'}>inHg</span>
                </button>
              </div>

              {/* Language */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('configLanguage')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => setLanguage(language.code)}
                      className={`p-2 rounded-lg border-2 transition-all text-sm ${
                        lang === language.code
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="mr-1">{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============ TIMER OVERLAY ============ */}
        {(timerActive || timerComplete) && (
          <>
            {/* Backdrop - does NOT close on click (unlike config dialog) */}
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50" />
            {/* Timer Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
                {timerComplete ? (
                  <>
                    {/* Timer Complete State */}
                    <div className="text-6xl mb-4">🥚</div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">{t('timerComplete')}</h2>
                    <p className="text-gray-600 mb-6">{t('notificationBody')}</p>
                    <button
                      onClick={dismissComplete}
                      className="w-full py-4 px-6 bg-amber-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-colors"
                    >
                      ✓ {t('timerDismiss')}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Timer Running State */}
                    <div className="text-white text-sm font-medium mb-2 text-amber-600">⏱️ {t('timerRemaining')}</div>
                    <div className="text-7xl font-bold text-amber-900 tabular-nums tracking-wider mb-8">
                      {formatCountdown(timerRemaining)}
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-3">
                      {/* Pause/Resume Button */}
                      <button
                        onClick={timerPaused ? resumeTimer : pauseTimer}
                        className={`flex-1 py-4 px-6 text-lg font-bold rounded-xl shadow-lg transition-colors ${
                          timerPaused
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {timerPaused ? `▶ ${t('timerResume')}` : `⏸ ${t('timerPause')}`}
                      </button>

                      {/* Stop Button */}
                      <button
                        onClick={stopTimer}
                        className="flex-1 py-4 px-6 bg-red-500 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                      >
                        ⏹ {t('timerStop')}
                      </button>
                    </div>

                    {/* Paused indicator */}
                    {timerPaused && (
                      <div className="mt-4 text-amber-600 font-medium animate-pulse">
                        ⏸ {t('timerPause')}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full mb-4 p-3 bg-white rounded-xl shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <span>⚙️</span>
            <span className="font-medium">{t('settingsToggle')}</span>
            {!showSettings && (
              <span className="text-sm text-gray-500">
                ({t(STOVE_TYPES.find(s => s.id === stoveType)?.nameKey)}, {formatTemp(ambientTemp, tempUnit)})
              </span>
            )}
          </span>
          <span className="text-gray-400">{showSettings ? '▼' : '▶'}</span>
        </button>

        {/* ============ SETTINGS PANEL ============ */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⚙️ {t('settingsTitle')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('settingsHint')}</p>

            {/* Stove Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('stoveType')}</label>
              <div className="grid grid-cols-5 gap-2">
                {STOVE_TYPES.map((stove) => (
                  <button
                    key={stove.id}
                    onClick={() => handleStoveTypeChange(stove.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      stoveType === stove.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-xl">{stove.icon}</div>
                    <div className="text-xs font-medium">{t(stove.nameKey)}</div>
                    <div className="text-xs text-gray-500">{Math.round(stove.efficiency * 100)}%</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stove Power */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('stovePower')}: <span className="font-bold text-amber-600">{stovePower} W</span>
              </label>
              <input
                type="range"
                min="500"
                max="3500"
                step="100"
                value={stovePower}
                onChange={(e) => updateSetting('stovePower', Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>500W ({t('stovePowerWeak')})</span>
                <span>3500W ({t('stovePowerStrong')})</span>
              </div>
            </div>

            {/* Pot Material & Weight */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('potMaterial')}</label>
                <select
                  value={potMaterial}
                  onChange={(e) => updateSetting('potMaterial', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {POT_MATERIALS.map((mat) => (
                    <option key={mat.id} value={mat.id}>{t(mat.nameKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('potWeight')}: <span className="font-bold text-amber-600">{potWeight} kg</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="3.0"
                  step="0.1"
                  value={potWeight}
                  onChange={(e) => updateSetting('potWeight', Number(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
                />
              </div>
            </div>

            {/* Water Start Temperature & Ambient Temperature */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('temperatures')}</label>

              <div className="grid grid-cols-2 gap-4">
                {/* Water Start Temp */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span>🚰</span>
                    <span className="text-sm font-medium text-blue-800">{t('waterTemp')}</span>
                  </div>
                  <div className="text-xs text-blue-600 mb-2">{t('waterTempHint')}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={waterStartTemp}
                      onChange={(e) => updateSetting('waterStartTemp', Number(e.target.value))}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-bold text-blue-700 w-14 text-right">{formatTemp(waterStartTemp, tempUnit)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-blue-500 mt-1">
                    <span>{t('waterTempCold')} {formatTemp(2, tempUnit)}</span>
                    <span>{t('waterTempWarm')} {formatTemp(40, tempUnit)}</span>
                  </div>
                </div>

                {/* Ambient Temp */}
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span>🌡️</span>
                    <span className="text-sm font-medium text-orange-800">{t('ambientTemp')}</span>
                  </div>
                  <div className="text-xs text-orange-600 mb-2">{t('ambientTempHint')}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-10"
                      max="35"
                      value={ambientTemp}
                      onChange={(e) => updateSetting('ambientTemp', Number(e.target.value))}
                      className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <span className="text-sm font-bold text-orange-700 w-14 text-right">{formatTemp(ambientTemp, tempUnit)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-orange-500 mt-1">
                    <span>{t('ambientWinter')} {formatTemp(-10, tempUnit)}</span>
                    <span>{t('ambientSummer')} {formatTemp(35, tempUnit)}</span>
                  </div>
                </div>
              </div>

              {ambientTemp < 10 && stoveEfficiency < 0.6 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  ⚠️ {t('coldWeatherWarning')}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const message = `${t('resetConfirm')}\n\n${t('resetWarning')}`;
                  if (window.confirm(message)) {
                    handleResetToDefaults();
                  }
                }}
                className="w-full py-2 px-4 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
              >
                🔄 {t('resetToDefaults')}
              </button>
            </div>
          </div>
        )}

        {/* ============ MAIN CARD ============ */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {/* Result Display */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-6">
              {getEggVisualization()}
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-600 tabular-nums">
                  {formatTime(cookingTime)}
                </div>
                <div className="text-amber-800 mt-1">{t('cookingTime')}</div>
                {idealTime !== null && cookingTime !== null && Math.abs(cookingTime - idealTime) > 0.1 && (
                  <div className="text-xs text-gray-500 mt-2">
                    ({t('idealCase')}: {formatTime(idealTime)})
                  </div>
                )}
              </div>
            </div>

            {/* Temperature Info */}
            {tempDrop !== null && tempDrop > 2 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-center">
                <div className="text-blue-800">
                  ⚠️ {t('tempDropWarning')} <span className="font-bold">{tempUnit === 'F' ? Math.round(tempDrop * 9 / 5) : tempDrop}°{tempUnit}</span> {t('tempDropUnit')}
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  {t('effectiveTemp')}: ~{formatTemp(effectiveTemp, tempUnit)}
                </div>
              </div>
            )}

            {/* Timer Countdown Display */}
            {timerActive && timerRemaining !== null && (
              <div className="mt-4 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-white text-sm font-medium mb-2">⏱️ {t('timerRemaining')}</div>
                  <div className="text-6xl font-bold text-white tabular-nums tracking-wider">
                    {formatCountdown(timerRemaining)}
                  </div>
                </div>
              </div>
            )}

            {/* Start Timer Button */}
            <button
              onClick={timerActive ? handleStopTimer : handleStartTimer}
              disabled={!cookingTime && !timerActive}
              className="mt-4 w-full py-3 px-6 bg-amber-500 text-white text-lg font-medium rounded-xl shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⏱️ {timerActive ? t('timerStop') : t('timerStart')}
            </button>
          </div>

          {/* Location & Pressure Section */}
          <div className="mb-5 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-sky-900">
                📍 {t('locationPressure')}
              </label>
              <button
                onClick={getLocationAndPressure}
                disabled={locationLoading}
                className="px-3 py-1 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {locationLoading ? `⏳ ${t('detectingLocation')}` : `🛰️ ${t('gpsWeather')}`}
              </button>
            </div>

            {locationError && (
              <div className="text-xs text-red-600 mb-2">{getLocationErrorMessage(locationError)}</div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-sky-700 mb-1">{t('airPressure')}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pressure}
                    onChange={(e) => handleManualPressure(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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

          {/* Consistency Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('consistency')}</label>
            <div className="grid grid-cols-4 gap-2">
              {CONSISTENCY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleConsistencyChange(option)}
                  className={`p-2 rounded-xl border-2 transition-all ${
                    consistency === option.id
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: option.color }}></div>
                  <div className="font-medium text-gray-900 text-xs">{t(option.nameKey)}</div>
                  <div className="text-xs text-gray-500">{formatTemp(option.temp, tempUnit)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Egg Count & Water Volume */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('eggCount')}: <span className="font-bold text-amber-600">{eggCount}</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSetting('eggCount', n)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      eggCount === n
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('waterVolume')}: <span className="font-bold text-amber-600">{formatVolume(waterVolume, volumeUnit)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={waterVolume}
                onChange={(e) => updateSetting('waterVolume', Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-3"
              />
            </div>
          </div>

          {/* Egg Size */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('eggSize')}: <span className="font-bold text-amber-600">{formatWeight(weight, weightUnit)}</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {EGG_SIZES.map((size) => (
                <button
                  key={size.name}
                  onClick={() => updateSetting('weight', size.weight)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    weight === size.weight
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-bold">{size.name}</div>
                  <div className="text-xs text-gray-500">{formatWeight(size.weight, weightUnit)}</div>
                </button>
              ))}
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={weight}
              onChange={(e) => updateSetting('weight', Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Start Temperature */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('startTemp')}: <span className="font-bold text-amber-600">{formatTemp(startTemp, tempUnit)}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {START_TEMP_OPTIONS.map((option) => (
                <button
                  key={option.nameKey}
                  onClick={() => updateSetting('startTemp', option.temp)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    startTemp === option.temp
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{t(option.nameKey)}</div>
                  <div className="text-xs text-gray-500">{formatTemp(option.temp, tempUnit)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Important Notices */}
          <div className="mb-5 space-y-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <span className="text-lg">⚠️</span>
                <div className="text-sm text-amber-800">
                  <strong>{t('noticeImportant')}:</strong> {t('noticeCoverage')}
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <span className="text-lg">🫕</span>
                <div className="text-sm text-green-800">
                  <strong>{t('noticeLid')}</strong> {t('noticeLidHint')}
                </div>
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <button
            onClick={() => setShowEnergy(!showEnergy)}
            className="w-full text-sm text-emerald-700 hover:text-emerald-900 py-2 flex items-center justify-center gap-2"
          >
            {showEnergy ? '▼' : '▶'} {t('showEnergy')}
          </button>

          {showEnergy && totalEnergy && (
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl">
              <h3 className="font-medium text-emerald-800 mb-3">⚡ {t('energyTitle')}</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-emerald-600 text-xs">{t('heatingPhase')} ({formatTemp(waterStartTemp, tempUnit)} → {formatTemp(boilingPoint, tempUnit)})</div>
                  <div className="text-xl font-bold text-emerald-800">~{heatingTime} min</div>
                  <div className="text-xs text-gray-500">
                    {t('atPower')} {stovePower}W ({t(STOVE_TYPES.find(s => s.id === stoveType)?.nameKey)})
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-emerald-600 text-xs">{t('totalEnergy')}</div>
                  <div className="text-xl font-bold text-emerald-800">{totalEnergy} kJ</div>
                  <div className="text-xs text-gray-500">≈ {(totalEnergy / 3.6).toFixed(0)} Wh</div>
                </div>
              </div>

              {ambientTemp < 15 && (
                <div className="mt-2 text-xs text-emerald-700">
                  {t('includesHeatLoss')} {formatTemp(ambientTemp, tempUnit)} {t('ambient')}
                </div>
              )}
            </div>
          )}

          {/* Formula Section */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full text-sm text-amber-700 hover:text-amber-900 py-2 flex items-center justify-center gap-2"
          >
            {showAdvanced ? '▼' : '▶'} {t('showFormulas')}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm">
              <h3 className="font-medium text-gray-700 mb-3">📐 {t('formulasTitle')}</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('formulaBoiling')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs">
                    T<sub>boil</sub> = 100 + 0.037 × (P - 1013.25)
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('formulaTempDrop')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs overflow-x-auto">
                    T<sub>drop</sub> = (m<sub>W</sub>·c<sub>W</sub>·T<sub>W</sub> + m<sub>E</sub>·c<sub>E</sub>·T<sub>0</sub>) / (m<sub>W</sub>·c<sub>W</sub> + m<sub>E</sub>·c<sub>E</sub>)
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('formulaWilliams')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs overflow-x-auto">
                    t = 0.451 × M<sup>⅔</sup> × ln(0.76 × (T<sub>0</sub> - T<sub>eff</sub>) / (T<sub>target</sub> - T<sub>eff</sub>))
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-amber-700">
          {t('footer')}
        </div>
      </div>
    </div>
  );
};

export default EggCalculator;
