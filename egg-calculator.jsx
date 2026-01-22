import React, { useState, useEffect } from 'react';
import { useTranslation } from './useTranslation';

const EggCalculator = () => {
  const { t, lang, setLanguage, languages } = useTranslation();

  // ============ WORKING INPUTS (per cooking session) ============
  const [weight, setWeight] = useState(60);
  const [startTemp, setStartTemp] = useState(4);
  const [targetTemp, setTargetTemp] = useState(67);
  const [consistency, setConsistency] = useState('medium');
  const [eggCount, setEggCount] = useState(1);
  const [waterVolume, setWaterVolume] = useState(1.5);

  // ============ HOUSEHOLD SETTINGS (persistent) ============
  const [stoveType, setStoveType] = useState('induction');
  const [stovePower, setStovePower] = useState(2000);
  const [stoveEfficiency, setStoveEfficiency] = useState(0.87);
  const [potWeight, setPotWeight] = useState(0.8);
  const [potMaterial, setPotMaterial] = useState('steel');
  const [waterStartTemp, setWaterStartTemp] = useState(15);
  const [ambientTemp, setAmbientTemp] = useState(22);

  // ============ LOCATION & PRESSURE ============
  const [altitude, setAltitude] = useState(0);
  const [pressure, setPressure] = useState(1013.25);
  const [boilingPoint, setBoilingPoint] = useState(100);
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [pressureSource, setPressureSource] = useState('default');

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
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // ============ UNIT PREFERENCES ============
  const [tempUnit, setTempUnit] = useState('C'); // 'C' or 'F'
  const [volumeUnit, setVolumeUnit] = useState('L'); // 'L' or 'oz'

  // ============ SETTINGS PERSISTENCE ============
  const STORAGE_KEY = 'egg-calculator-settings';

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        // Working inputs
        if (settings.weight !== undefined) setWeight(settings.weight);
        if (settings.startTemp !== undefined) setStartTemp(settings.startTemp);
        if (settings.targetTemp !== undefined) setTargetTemp(settings.targetTemp);
        if (settings.consistency !== undefined) setConsistency(settings.consistency);
        if (settings.eggCount !== undefined) setEggCount(settings.eggCount);
        if (settings.waterVolume !== undefined) setWaterVolume(settings.waterVolume);
        // Household settings
        if (settings.stoveType !== undefined) setStoveType(settings.stoveType);
        if (settings.stovePower !== undefined) setStovePower(settings.stovePower);
        if (settings.stoveEfficiency !== undefined) setStoveEfficiency(settings.stoveEfficiency);
        if (settings.potWeight !== undefined) setPotWeight(settings.potWeight);
        if (settings.potMaterial !== undefined) setPotMaterial(settings.potMaterial);
        if (settings.waterStartTemp !== undefined) setWaterStartTemp(settings.waterStartTemp);
        if (settings.ambientTemp !== undefined) setAmbientTemp(settings.ambientTemp);
        // Location & pressure
        if (settings.altitude !== undefined) setAltitude(settings.altitude);
        if (settings.pressure !== undefined) setPressure(settings.pressure);
        if (settings.boilingPoint !== undefined) setBoilingPoint(settings.boilingPoint);
        if (settings.locationName !== undefined) setLocationName(settings.locationName);
        if (settings.pressureSource !== undefined) setPressureSource(settings.pressureSource);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      const settings = {
        // Working inputs
        weight, startTemp, targetTemp, consistency, eggCount, waterVolume,
        // Household settings
        stoveType, stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp,
        // Location & pressure
        altitude, pressure, boilingPoint, locationName, pressureSource,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [
    weight, startTemp, targetTemp, consistency, eggCount, waterVolume,
    stoveType, stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp,
    altitude, pressure, boilingPoint, locationName, pressureSource,
  ]);

  // ============ CONFIG DIALOG ESCAPE KEY HANDLER ============
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showConfigDialog) {
        setShowConfigDialog(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfigDialog]);

  // ============ CONSTANTS & PRESETS ============

  const stoveTypes = [
    { id: 'induction', nameKey: 'stoveInduction', efficiency: 0.87, defaultPower: 2200, icon: '⚡' },
    { id: 'ceramic', nameKey: 'stoveCeramic', efficiency: 0.70, defaultPower: 1800, icon: '🔴' },
    { id: 'electric', nameKey: 'stoveElectric', efficiency: 0.65, defaultPower: 1500, icon: '⚫' },
    { id: 'gas', nameKey: 'stoveGas', efficiency: 0.50, defaultPower: 2500, icon: '🔥' },
    { id: 'camping', nameKey: 'stoveCamping', efficiency: 0.30, defaultPower: 1000, icon: '🏕️' },
  ];

  const potMaterials = [
    { id: 'steel', nameKey: 'materialSteel', heatCapacity: 0.50 },
    { id: 'aluminum', nameKey: 'materialAluminum', heatCapacity: 0.90 },
    { id: 'cast_iron', nameKey: 'materialCastIron', heatCapacity: 0.46 },
    { id: 'copper', nameKey: 'materialCopper', heatCapacity: 0.39 },
    { id: 'ceramic', nameKey: 'materialCeramic', heatCapacity: 0.85 },
  ];

  const consistencyOptions = [
    { id: 'soft', nameKey: 'consistencySoft', temp: 63, color: '#FFD700' },
    { id: 'medium', nameKey: 'consistencyMedium', temp: 67, color: '#FFA500' },
    { id: 'hard-medium', nameKey: 'consistencyHardMedium', temp: 72, color: '#FF8C00' },
    { id: 'hard', nameKey: 'consistencyHard', temp: 77, color: '#FF6347' },
  ];

  const eggSizes = [
    { name: 'S', weight: 53 },
    { name: 'M', weight: 58 },
    { name: 'L', weight: 68 },
    { name: 'XL', weight: 78 },
  ];

  const startTempOptions = [
    { nameKey: 'tempFridge', temp: 4, icon: '❄️' },
    { nameKey: 'tempCool', temp: 7, icon: '🌡️' },
    { nameKey: 'tempRoom', temp: 20, icon: '🏠' },
  ];

  // ============ FORMULAS ============

  const calculateBoilingPointFromPressure = (pressureHPa) => {
    return Math.round((100 + 0.037 * (pressureHPa - 1013.25)) * 10) / 10;
  };

  const calculatePressureFromBoilingPoint = (tempC) => {
    return Math.round(((tempC - 100) / 0.037 + 1013.25) * 10) / 10;
  };

  const calculateAltitudeFromPressure = (pressureHPa) => {
    return Math.round(44330 * (1 - Math.pow(pressureHPa / 1013.25, 0.1903)));
  };

  const getPotHeatCapacity = () => {
    return potMaterials.find(m => m.id === potMaterial)?.heatCapacity || 0.5;
  };

  // ============ STOVE TYPE HANDLER ============

  const handleStoveTypeChange = (type) => {
    const stove = stoveTypes.find(s => s.id === type);
    if (stove) {
      setStoveType(type);
      setStoveEfficiency(stove.efficiency);
      setStovePower(stove.defaultPower);
    }
  };

  // ============ LOCATION & PRESSURE FETCHING ============

  const getLocationAndPressure = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude, altitude: gpsAltitude } = position.coords;

      const meteoResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=surface_pressure`
      );

      if (!meteoResponse.ok) throw new Error(t('weatherDataUnavailable'));

      const meteoData = await meteoResponse.json();
      const surfacePressure = meteoData.current.surface_pressure;

      setPressure(Math.round(surfacePressure * 10) / 10);
      const bp = calculateBoilingPointFromPressure(surfacePressure);
      setBoilingPoint(bp);
      setPressureSource('gps');

      let elevationToUse = 0;

      if (gpsAltitude && !isNaN(gpsAltitude) && gpsAltitude > -100) {
        elevationToUse = Math.round(gpsAltitude);
      } else if (meteoData.elevation && !isNaN(meteoData.elevation)) {
        elevationToUse = Math.round(meteoData.elevation);
      } else {
        elevationToUse = calculateAltitudeFromPressure(surfacePressure);
      }

      setAltitude(elevationToUse);

      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village;
          if (city) setLocationName(city);
        }
      } catch (e) {
        // Ignore - location name is informational only
      }

    } catch (error) {
      console.error('Location error:', error);
      if (error.code === 1) {
        setLocationError(t('locationDenied'));
      } else if (error.code === 2) {
        setLocationError(t('positionUnavailable'));
      } else if (error.message) {
        setLocationError(error.message);
      } else {
        setLocationError(t('locationError'));
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualPressure = (p) => {
    setPressure(p);
    setBoilingPoint(calculateBoilingPointFromPressure(p));
    setAltitude(calculateAltitudeFromPressure(p));
    setPressureSource('manual');
    setLocationName(null);
  };

  const handleManualBoilingPoint = (bp) => {
    setBoilingPoint(bp);
    setPressure(calculatePressureFromBoilingPoint(bp));
    setAltitude(calculateAltitudeFromPressure(calculatePressureFromBoilingPoint(bp)));
    setPressureSource('manual');
    setLocationName(null);
  };

  // ============ MAIN CALCULATION ============

  useEffect(() => {
    calculateTime();
  }, [weight, startTemp, boilingPoint, targetTemp, eggCount, waterVolume,
      stovePower, stoveEfficiency, potWeight, potMaterial, waterStartTemp, ambientTemp]);

  const calculateTime = () => {
    if (weight > 0 && boilingPoint > targetTemp && targetTemp > startTemp) {
      const M = weight;
      const Tw = boilingPoint;
      const T0 = startTemp;
      const Tz = targetTemp;

      const c_water = 4.18;
      const c_egg = 3.5;
      const c_pot = getPotHeatCapacity();

      const m_water = waterVolume;
      const m_eggs = (eggCount * M) / 1000;
      const m_pot = potWeight;

      const Q_water = m_water * c_water;
      const Q_eggs = m_eggs * c_egg;
      const T_drop = (Q_water * Tw + Q_eggs * T0) / (Q_water + Q_eggs);

      setTempDrop(Math.round((Tw - T_drop) * 10) / 10);

      const tempDiffReference = 80;
      const tempDiffActual = Tw - ambientTemp;
      const heatLossFactor = tempDiffActual / tempDiffReference;

      const powerFactor = Math.min(1, stovePower / 2000) * stoveEfficiency;
      const baseRecoveryFactor = Math.min(0.85, 0.5 + (waterVolume / (eggCount * M / 1000)) * 0.1);

      const effectivePowerRatio = powerFactor / heatLossFactor;
      const recoveryFactor = baseRecoveryFactor * Math.min(1, 0.5 + 0.5 * effectivePowerRatio);

      const T_eff = T_drop + recoveryFactor * (Tw - T_drop);

      setEffectiveTemp(Math.round(T_eff * 10) / 10);

      const K = 0.451;
      const ratio = 0.76 * (T0 - T_eff) / (Tz - T_eff);
      const t_real = K * Math.pow(M, 2/3) * Math.log(ratio);

      const ratio_ideal = 0.76 * (T0 - Tw) / (Tz - Tw);
      const t_ideal = K * Math.pow(M, 2/3) * Math.log(ratio_ideal);

      const Q_water_heating = m_water * c_water * (Tw - waterStartTemp);
      const Q_pot_heating = m_pot * c_pot * (Tw - waterStartTemp);
      const Q_eggs_heating = m_eggs * c_egg * (Tz - T0);

      const cookingMinutes = Math.max(3, t_real);
      const heatLossPerMinute = 0.5 * heatLossFactor;
      const Q_ambient_loss = cookingMinutes * heatLossPerMinute;

      const Q_total = (Q_water_heating + Q_pot_heating + Q_eggs_heating + Q_ambient_loss) / stoveEfficiency;

      setTotalEnergy(Math.round(Q_total));

      const effectivePower = (stovePower / 1000) * stoveEfficiency;
      const t_heating = Q_water_heating / effectivePower / 60;
      setHeatingTime(Math.round(t_heating * 10) / 10);

      setIdealTime(Math.max(0, t_ideal));
      setCookingTime(Math.max(0, t_real));
    } else {
      setCookingTime(null);
      setTempDrop(null);
      setEffectiveTemp(null);
      setIdealTime(null);
      setTotalEnergy(null);
      setHeatingTime(null);
    }
  };

  // ============ HELPERS ============

  const handleConsistencyChange = (option) => {
    setConsistency(option.id);
    setTargetTemp(option.temp);
  };

  const formatTime = (minutes) => {
    if (minutes === null) return '--:--';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEggVisualization = () => {
    const yolkSize = consistency === 'soft' ? 45 : consistency === 'medium' ? 40 : consistency === 'hard-medium' ? 35 : 30;
    const yolkColor = consistencyOptions.find(c => c.id === consistency)?.color || '#FFD700';

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
                <h2 className="text-lg font-bold text-gray-800">⚙️ Settings</h2>
                <button
                  onClick={() => setShowConfigDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Temperature Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature Unit</label>
                <button
                  onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={tempUnit === 'C' ? 'text-amber-600' : 'text-gray-400'}>°C</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={tempUnit === 'F' ? 'text-amber-600' : 'text-gray-400'}>°F</span>
                </button>
              </div>

              {/* Volume Unit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume Unit</label>
                <button
                  onClick={() => setVolumeUnit(volumeUnit === 'L' ? 'oz' : 'L')}
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <span className={volumeUnit === 'L' ? 'text-amber-600' : 'text-gray-400'}>L</span>
                  <span className="text-gray-300 mx-2">|</span>
                  <span className={volumeUnit === 'oz' ? 'text-amber-600' : 'text-gray-400'}>oz</span>
                </button>
              </div>

              {/* Language */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
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
                ({t(stoveTypes.find(s => s.id === stoveType)?.nameKey)}, {ambientTemp}°C)
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
                {stoveTypes.map((stove) => (
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
                onChange={(e) => setStovePower(Number(e.target.value))}
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
                  onChange={(e) => setPotMaterial(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {potMaterials.map((mat) => (
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
                  onChange={(e) => setPotWeight(Number(e.target.value))}
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
                      onChange={(e) => setWaterStartTemp(Number(e.target.value))}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-bold text-blue-700 w-12 text-right">{waterStartTemp}°C</span>
                  </div>
                  <div className="flex justify-between text-xs text-blue-500 mt-1">
                    <span>{t('waterTempCold')} 2°C</span>
                    <span>{t('waterTempWarm')} 40°C</span>
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
                      onChange={(e) => setAmbientTemp(Number(e.target.value))}
                      className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <span className="text-sm font-bold text-orange-700 w-12 text-right">{ambientTemp}°C</span>
                  </div>
                  <div className="flex justify-between text-xs text-orange-500 mt-1">
                    <span>{t('ambientWinter')} -10°C</span>
                    <span>{t('ambientSummer')} 35°C</span>
                  </div>
                </div>
              </div>

              {ambientTemp < 10 && stoveEfficiency < 0.6 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  ⚠️ {t('coldWeatherWarning')}
                </div>
              )}
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
                  ⚠️ {t('tempDropWarning')} <span className="font-bold">{tempDrop}°C</span> {t('tempDropUnit')}
                </div>
                <div className="text-blue-600 text-xs mt-1">
                  {t('effectiveTemp')}: ~{effectiveTemp}°C
                </div>
              </div>
            )}
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
              <div className="text-xs text-red-600 mb-2">{locationError}</div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-sky-700 mb-1">{t('airPressure')}</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={pressure}
                    onChange={(e) => handleManualPressure(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <span className="text-xs text-sky-700">hPa</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-sky-700 mb-1">{t('boilingPoint')}</div>
                <div className="flex items-center justify-center h-8 bg-white rounded-lg border border-sky-200">
                  <span className="text-lg font-bold text-sky-700">{boilingPoint}°C</span>
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
              {consistencyOptions.map((option) => (
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
                  <div className="text-xs text-gray-500">{option.temp}°C</div>
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
                    onClick={() => setEggCount(n)}
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
                {t('waterVolume')}: <span className="font-bold text-amber-600">{waterVolume}L</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={waterVolume}
                onChange={(e) => setWaterVolume(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-3"
              />
            </div>
          </div>

          {/* Egg Size */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('eggSize')}: <span className="font-bold text-amber-600">{weight}g</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {eggSizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setWeight(size.weight)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    weight === size.weight
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-bold">{size.name}</div>
                  <div className="text-xs text-gray-500">{size.weight}g</div>
                </button>
              ))}
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Start Temperature */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('startTemp')}: <span className="font-bold text-amber-600">{startTemp}°C</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {startTempOptions.map((option) => (
                <button
                  key={option.nameKey}
                  onClick={() => setStartTemp(option.temp)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    startTemp === option.temp
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{t(option.nameKey)}</div>
                  <div className="text-xs text-gray-500">{option.temp}°C</div>
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
                  <div className="text-emerald-600 text-xs">{t('heatingPhase')} ({waterStartTemp}°C → {boilingPoint}°C)</div>
                  <div className="text-xl font-bold text-emerald-800">~{heatingTime} min</div>
                  <div className="text-xs text-gray-500">
                    {t('atPower')} {stovePower}W ({t(stoveTypes.find(s => s.id === stoveType)?.nameKey)})
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
                  {t('includesHeatLoss')} {ambientTemp}°C {t('ambient')}
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
