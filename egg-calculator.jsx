import React, { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';
import {
  calculateTime as calculateTimePhysics,
} from './physics';
import { STOVE_TYPES, POT_MATERIALS } from './constants';
import { formatTemp } from './formatters';
import { useSettings } from './hooks/useSettings';
import { useUnitConversion } from './hooks/useUnitConversion';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useLocationPressure } from './hooks/useLocationPressure';
import { ConfigDialog } from './components/ConfigDialog';
import { TimerOverlay } from './components/TimerOverlay';
import { ConsistencyPicker } from './components/ConsistencyPicker';
import { SettingsPanel } from './components/SettingsPanel';
import { LocationPressure } from './components/LocationPressure';
import { EggInputs } from './components/EggInputs';
import { ResultDisplay } from './components/ResultDisplay';

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
  const handleTempUnitChange = (unit) => { setTempUnit(unit); updateSetting('tempUnit', unit); };
  const handleVolumeUnitChange = (unit) => { setVolumeUnit(unit); updateSetting('volumeUnit', unit); };
  const handleWeightUnitChange = (unit) => { setWeightUnit(unit); updateSetting('weightUnit', unit); };
  const handlePressureUnitChange = (unit) => { setPressureUnit(unit); updateSetting('pressureUnit', unit); };

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
      setPressure(settings.pressure); setBoilingPoint(settings.boilingPoint); setAltitude(settings.altitude);
      setPressureSource(settings.pressureSource); if (settings.locationName) setLocationName(settings.locationName);
    }
  }, []); // Only on mount

  // Persist location changes back to settings
  useEffect(() => {
    updateSetting('altitude', altitude); updateSetting('pressure', pressure); updateSetting('boilingPoint', boilingPoint);
    updateSetting('locationName', locationName); updateSetting('pressureSource', pressureSource);
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

  // ============ HANDLERS ============
  const handleStoveTypeChange = (type) => {
    const stove = STOVE_TYPES.find(s => s.id === type);
    if (stove) { updateSetting('stoveType', type); updateSetting('stoveEfficiency', stove.efficiency); updateSetting('stovePower', stove.defaultPower); }
  };

  // ============ MAIN CALCULATION ============

  useEffect(() => { calculateTime(); }, [weight, startTemp, boilingPoint, targetTemp, eggCount, waterVolume, stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp]);

  const calculateTime = () => {
    const result = calculateTimePhysics({ weight, startTemp, targetTemp, boilingPoint, eggCount, waterVolume,
      stovePower, stoveEfficiency, potWeight, potHeatCapacity: getPotHeatCapacity(), waterStartTemp, ambientTemp });
    if (result) {
      setCookingTime(result.cookingTime); setTempDrop(result.tempDrop); setEffectiveTemp(result.effectiveTemp);
      setIdealTime(result.idealTime); setTotalEnergy(result.totalEnergy); setHeatingTime(result.heatingTime);
    } else {
      setCookingTime(null); setTempDrop(null); setEffectiveTemp(null);
      setIdealTime(null); setTotalEnergy(null); setHeatingTime(null);
    }
  };

  const handleStartTimer = async () => { if (!cookingTime) return; await startTimer(Math.round(cookingTime * 60)); };
  const handleStopTimer = () => { stopTimer(); };
  const handleConsistencyChange = (option) => { updateSetting('consistency', option.id); updateSetting('targetTemp', option.temp); };
  const handleResetToDefaults = () => {
    resetSettings(); setTempUnit('C'); setVolumeUnit('L'); setWeightUnit('g'); setPressureUnit('hPa');
    setAltitude(0); setPressure(1013.25); setBoilingPoint(100); setLocationName(null); setPressureSource('default');
  };

  // ============ RENDER ============

  return (
    <div className="min-h-dvh bg-gradient-to-br from-amber-50 to-orange-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="absolute right-0 top-0">
            <button onClick={() => setShowConfigDialog(!showConfigDialog)} className="p-2 min-h-[44px] min-w-[44px] bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-lg" title="Settings">⚙️</button>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900 mb-2 px-12 sm:px-0">🥚 {t('title')}</h1>
          <p className="text-amber-700 px-12 sm:px-0">{t('subtitle')}</p>
        </div>

        {/* ============ CONFIG DIALOG ============ */}
        <ConfigDialog
          visible={showConfigDialog}
          onClose={() => setShowConfigDialog(false)}
          tempUnit={tempUnit}
          volumeUnit={volumeUnit}
          weightUnit={weightUnit}
          pressureUnit={pressureUnit}
          onTempUnitChange={handleTempUnitChange}
          onVolumeUnitChange={handleVolumeUnitChange}
          onWeightUnitChange={handleWeightUnitChange}
          onPressureUnitChange={handlePressureUnitChange}
          languages={languages}
          currentLanguage={lang}
          onLanguageChange={setLanguage}
        />

        {/* ============ TIMER OVERLAY ============ */}
        {(timerActive || timerComplete) && (
          <TimerOverlay
            timerActive={timerActive}
            timerComplete={timerComplete}
            timerPaused={timerPaused}
            timerRemaining={timerRemaining}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onStop={stopTimer}
            onDismiss={dismissComplete}
          />
        )}

        {/* Settings Toggle */}
        <button onClick={() => setShowSettings(!showSettings)} className="w-full mb-4 p-3 min-h-[44px] bg-white rounded-xl shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="flex items-center gap-2 text-gray-700">
            <span>⚙️</span><span className="font-medium">{t('settingsToggle')}</span>
            {!showSettings && (<span className="text-sm text-gray-500">({t(STOVE_TYPES.find(s => s.id === stoveType)?.nameKey)}, {formatTemp(ambientTemp, tempUnit)})</span>)}
          </span>
          <span className="text-gray-400">{showSettings ? '▼' : '▶'}</span>
        </button>

        {/* ============ SETTINGS PANEL ============ */}
        {showSettings && (
          <SettingsPanel
            stoveType={stoveType}
            stovePower={stovePower}
            stoveEfficiency={stoveEfficiency}
            potMaterial={potMaterial}
            potWeight={potWeight}
            waterStartTemp={waterStartTemp}
            ambientTemp={ambientTemp}
            tempUnit={tempUnit}
            onStoveTypeChange={handleStoveTypeChange}
            onStovePowerChange={(val) => updateSetting('stovePower', val)}
            onPotMaterialChange={(val) => updateSetting('potMaterial', val)}
            onPotWeightChange={(val) => updateSetting('potWeight', val)}
            onWaterStartTempChange={(val) => updateSetting('waterStartTemp', val)}
            onAmbientTempChange={(val) => updateSetting('ambientTemp', val)}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

        {/* ============ MAIN CARD ============ */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">

          {/* Result Display */}
          <ResultDisplay
            cookingTime={cookingTime}
            idealTime={idealTime}
            tempDrop={tempDrop}
            effectiveTemp={effectiveTemp}
            consistency={consistency}
            tempUnit={tempUnit}
            timerActive={timerActive}
            timerRemaining={timerRemaining}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
          />

          {/* Location & Pressure Section */}
          <LocationPressure
            pressure={pressure}
            boilingPoint={boilingPoint}
            altitude={altitude}
            locationName={locationName}
            locationLoading={locationLoading}
            locationError={locationError}
            pressureSource={pressureSource}
            tempUnit={tempUnit}
            pressureUnit={pressureUnit}
            onGetLocation={getLocationAndPressure}
            onPressureChange={handleManualPressure}
            locationErrorMessage={getLocationErrorMessage(locationError)}
          />

          {/* Consistency Selection */}
          <ConsistencyPicker
            consistency={consistency}
            tempUnit={tempUnit}
            onConsistencyChange={handleConsistencyChange}
          />

          {/* Egg Inputs Section */}
          <EggInputs
            eggCount={eggCount}
            waterVolume={waterVolume}
            weight={weight}
            startTemp={startTemp}
            tempUnit={tempUnit}
            volumeUnit={volumeUnit}
            weightUnit={weightUnit}
            onEggCountChange={(val) => updateSetting('eggCount', val)}
            onWaterVolumeChange={(val) => updateSetting('waterVolume', val)}
            onWeightChange={(val) => updateSetting('weight', val)}
            onStartTempChange={(val) => updateSetting('startTemp', val)}
          />

          {/* Important Notices */}
          <div className="mb-5 space-y-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2 items-start"><span className="text-lg">⚠️</span>
                <div className="text-xs sm:text-sm text-amber-800"><strong>{t('noticeImportant')}:</strong> {t('noticeCoverage')}</div></div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2 items-start"><span className="text-lg">🫕</span>
                <div className="text-xs sm:text-sm text-green-800"><strong>{t('noticeLid')}</strong> {t('noticeLidHint')}</div></div>
            </div>
          </div>

          {/* Energy Section */}
          <button onClick={() => setShowEnergy(!showEnergy)} className="w-full text-sm text-emerald-700 hover:text-emerald-900 py-2 min-h-[44px] flex items-center justify-center gap-2">
            {showEnergy ? '▼' : '▶'} {t('showEnergy')}
          </button>
          {showEnergy && totalEnergy && (
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl">
              <h3 className="font-medium text-emerald-800 mb-3">⚡ {t('energyTitle')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-emerald-600 text-xs">{t('heatingPhase')} ({formatTemp(waterStartTemp, tempUnit)} → {formatTemp(boilingPoint, tempUnit)})</div>
                  <div className="text-xl font-bold text-emerald-800">~{heatingTime} min</div>
                  <div className="text-xs text-gray-500">{t('atPower')} {stovePower}W ({t(STOVE_TYPES.find(s => s.id === stoveType)?.nameKey)})</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-emerald-600 text-xs">{t('totalEnergy')}</div>
                  <div className="text-xl font-bold text-emerald-800">{totalEnergy} kJ</div>
                  <div className="text-xs text-gray-500">≈ {(totalEnergy / 3.6).toFixed(0)} Wh</div>
                </div>
              </div>
              {ambientTemp < 15 && (<div className="mt-2 text-xs text-emerald-700">{t('includesHeatLoss')} {formatTemp(ambientTemp, tempUnit)} {t('ambient')}</div>)}
            </div>
          )}

          {/* Formula Section */}
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-sm text-amber-700 hover:text-amber-900 py-2 min-h-[44px] flex items-center justify-center gap-2">
            {showAdvanced ? '▼' : '▶'} {t('showFormulas')}
          </button>
          {showAdvanced && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm">
              <h3 className="font-medium text-gray-700 mb-3">📐 {t('formulasTitle')}</h3>
              <div className="space-y-3">
                <div><div className="text-xs text-gray-500 mb-1">{t('formulaBoiling')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs">T<sub>boil</sub> = 100 + 0.037 × (P - 1013.25)</div>
                </div>
                <div><div className="text-xs text-gray-500 mb-1">{t('formulaTempDrop')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs overflow-x-auto">T<sub>drop</sub> = (m<sub>W</sub>·c<sub>W</sub>·T<sub>W</sub> + m<sub>E</sub>·c<sub>E</sub>·T<sub>0</sub>) / (m<sub>W</sub>·c<sub>W</sub> + m<sub>E</sub>·c<sub>E</sub>)</div>
                </div>
                <div><div className="text-xs text-gray-500 mb-1">{t('formulaWilliams')}</div>
                  <div className="font-mono bg-white p-2 rounded text-xs overflow-x-auto">t = 0.451 × M<sup>⅔</sup> × ln(0.76 × (T<sub>0</sub> - T<sub>eff</sub>) / (T<sub>target</sub> - T<sub>eff</sub>))</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-amber-700">{t('footer')}</div>
      </div>
    </div>
  );
};

export default EggCalculator;
