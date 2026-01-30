// Constants extracted from egg-calculator.jsx
// All arrays and their elements are frozen to prevent mutation

export const STOVE_TYPES = Object.freeze([
  Object.freeze({ id: 'induction', nameKey: 'stoveInduction', efficiency: 0.87, defaultPower: 2200, icon: '⚡' }),
  Object.freeze({ id: 'ceramic', nameKey: 'stoveCeramic', efficiency: 0.70, defaultPower: 1800, icon: '🔴' }),
  Object.freeze({ id: 'electric', nameKey: 'stoveElectric', efficiency: 0.65, defaultPower: 1500, icon: '⚫' }),
  Object.freeze({ id: 'gas', nameKey: 'stoveGas', efficiency: 0.50, defaultPower: 2500, icon: '🔥' }),
  Object.freeze({ id: 'camping', nameKey: 'stoveCamping', efficiency: 0.30, defaultPower: 1000, icon: '🏕️' }),
]);

export const POT_MATERIALS = Object.freeze([
  Object.freeze({ id: 'steel', nameKey: 'materialSteel', heatCapacity: 0.50 }),
  Object.freeze({ id: 'aluminum', nameKey: 'materialAluminum', heatCapacity: 0.90 }),
  Object.freeze({ id: 'cast_iron', nameKey: 'materialCastIron', heatCapacity: 0.46 }),
  Object.freeze({ id: 'copper', nameKey: 'materialCopper', heatCapacity: 0.39 }),
  Object.freeze({ id: 'ceramic', nameKey: 'materialCeramic', heatCapacity: 0.85 }),
]);

export const CONSISTENCY_OPTIONS = Object.freeze([
  Object.freeze({ id: 'soft', nameKey: 'consistencySoft', temp: 63, color: '#FFD700' }),
  Object.freeze({ id: 'medium', nameKey: 'consistencyMedium', temp: 67, color: '#FFA500' }),
  Object.freeze({ id: 'hard-medium', nameKey: 'consistencyHardMedium', temp: 72, color: '#FF8C00' }),
  Object.freeze({ id: 'hard', nameKey: 'consistencyHard', temp: 77, color: '#FF6347' }),
]);

export const EGG_SIZES = Object.freeze([
  Object.freeze({ name: 'S', weight: 53 }),
  Object.freeze({ name: 'M', weight: 58 }),
  Object.freeze({ name: 'L', weight: 68 }),
  Object.freeze({ name: 'XL', weight: 78 }),
]);

export const START_TEMP_OPTIONS = Object.freeze([
  Object.freeze({ nameKey: 'tempFridge', temp: 4, icon: '❄️' }),
  Object.freeze({ nameKey: 'tempCool', temp: 7, icon: '🌡️' }),
  Object.freeze({ nameKey: 'tempRoom', temp: 20, icon: '🏠' }),
]);
