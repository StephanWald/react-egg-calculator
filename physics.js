// ============ PHYSICS CALCULATIONS ============
// Pure functions extracted from EggCalculator component.
// No React imports — these are standalone thermodynamic calculations.

/**
 * Calculate boiling point from atmospheric pressure using
 * Clausius-Clapeyron linear approximation.
 * @param {number} pressureHPa - atmospheric pressure in hPa
 * @returns {number} boiling point in degrees Celsius (rounded to 1 decimal)
 */
export const calculateBoilingPointFromPressure = (pressureHPa) => {
  return Math.round((100 + 0.037 * (pressureHPa - 1013.25)) * 10) / 10;
};

/**
 * Inverse: calculate atmospheric pressure from a given boiling point.
 * @param {number} tempC - boiling point in degrees Celsius
 * @returns {number} pressure in hPa (rounded to 1 decimal)
 */
export const calculatePressureFromBoilingPoint = (tempC) => {
  return Math.round(((tempC - 100) / 0.037 + 1013.25) * 10) / 10;
};

/**
 * Estimate altitude from atmospheric pressure using barometric formula.
 * @param {number} pressureHPa - atmospheric pressure in hPa
 * @returns {number} altitude in metres (rounded to integer)
 */
export const calculateAltitudeFromPressure = (pressureHPa) => {
  return Math.round(44330 * (1 - Math.pow(pressureHPa / 1013.25, 0.1903)));
};

/**
 * Main egg cooking time calculation using the Williams formula
 * with temperature-drop compensation, heat-loss modelling,
 * and energy consumption estimation.
 *
 * @param {Object} params
 * @param {number} params.weight          - egg weight in grams (M)
 * @param {number} params.startTemp       - egg start temperature in C (T0)
 * @param {number} params.targetTemp      - target yolk temperature in C (Tz)
 * @param {number} params.boilingPoint    - water boiling point in C (Tw)
 * @param {number} params.eggCount        - number of eggs
 * @param {number} params.waterVolume     - water volume in litres
 * @param {number} params.stovePower      - stove power in watts
 * @param {number} params.stoveEfficiency - stove efficiency (0-1)
 * @param {number} params.potWeight       - pot weight in kg
 * @param {number} params.potHeatCapacity - pot material heat capacity in kJ/(kg*K)
 * @param {number} params.waterStartTemp  - water start temperature in C
 * @param {number} params.ambientTemp     - ambient temperature in C
 *
 * @returns {Object|null} result object or null if inputs are invalid
 * @returns {number} result.cookingTime    - cooking time in minutes
 * @returns {number} result.tempDrop       - temperature drop in C
 * @returns {number} result.effectiveTemp  - effective cooking temperature in C
 * @returns {number} result.idealTime      - ideal cooking time (no temp drop)
 * @returns {number} result.totalEnergy    - total energy in kJ
 * @returns {number} result.heatingTime    - water heating time in minutes
 */
export const calculateTime = ({
  weight,
  startTemp,
  targetTemp,
  boilingPoint,
  eggCount,
  waterVolume,
  stovePower,
  stoveEfficiency,
  potWeight,
  potHeatCapacity,
  waterStartTemp,
  ambientTemp,
}) => {
  // Validity guard
  if (!(weight > 0 && boilingPoint > targetTemp && targetTemp > startTemp)) {
    return null;
  }

  const M = weight;
  const Tw = boilingPoint;
  const T0 = startTemp;
  const Tz = targetTemp;

  const c_water = 4.18;
  const c_egg = 3.5;
  const c_pot = potHeatCapacity;

  const m_water = waterVolume;
  const m_eggs = (eggCount * M) / 1000;
  const m_pot = potWeight;

  // Temperature drop when cold eggs enter boiling water
  const Q_water = m_water * c_water;
  const Q_eggs = m_eggs * c_egg;
  const T_drop = (Q_water * Tw + Q_eggs * T0) / (Q_water + Q_eggs);

  const tempDrop = Math.round((Tw - T_drop) * 10) / 10;

  // Heat-loss factor relative to 80 K reference difference
  const tempDiffReference = 80;
  const tempDiffActual = Tw - ambientTemp;
  const heatLossFactor = tempDiffActual / tempDiffReference;

  // Effective power and recovery factor
  const powerFactor = Math.min(1, stovePower / 2000) * stoveEfficiency;
  const baseRecoveryFactor = Math.min(0.85, 0.5 + (waterVolume / (eggCount * M / 1000)) * 0.1);

  const effectivePowerRatio = powerFactor / heatLossFactor;
  const recoveryFactor = baseRecoveryFactor * Math.min(1, 0.5 + 0.5 * effectivePowerRatio);

  const T_eff = T_drop + recoveryFactor * (Tw - T_drop);

  const effectiveTemp = Math.round(T_eff * 10) / 10;

  // Williams formula
  const K = 0.451;
  const ratio = 0.76 * (T0 - T_eff) / (Tz - T_eff);
  const t_real = K * Math.pow(M, 2 / 3) * Math.log(ratio);

  // Ideal time (no temperature drop)
  const ratio_ideal = 0.76 * (T0 - Tw) / (Tz - Tw);
  const t_ideal = K * Math.pow(M, 2 / 3) * Math.log(ratio_ideal);

  // Energy calculation
  const Q_water_heating = m_water * c_water * (Tw - waterStartTemp);
  const Q_pot_heating = m_pot * c_pot * (Tw - waterStartTemp);
  const Q_eggs_heating = m_eggs * c_egg * (Tz - T0);

  const cookingMinutes = Math.max(3, t_real);
  const heatLossPerMinute = 0.5 * heatLossFactor;
  const Q_ambient_loss = cookingMinutes * heatLossPerMinute;

  const Q_total = (Q_water_heating + Q_pot_heating + Q_eggs_heating + Q_ambient_loss) / stoveEfficiency;

  const totalEnergy = Math.round(Q_total);

  const effectivePower = (stovePower / 1000) * stoveEfficiency;
  const t_heating = Q_water_heating / effectivePower / 60;
  const heatingTime = Math.round(t_heating * 10) / 10;

  return {
    cookingTime: Math.max(0, t_real),
    tempDrop,
    effectiveTemp,
    idealTime: Math.max(0, t_ideal),
    totalEnergy,
    heatingTime,
  };
};
