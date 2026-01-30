// Unit conversion functions extracted from egg-calculator.jsx
// Pure functions with no dependencies

/**
 * Convert Celsius to Fahrenheit
 * @param {number} tempC - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit (rounded)
 */
export const celsiusToFahrenheit = (tempC) => {
  return Math.round(tempC * 9 / 5 + 32);
};

/**
 * Convert liters to fluid ounces
 * @param {number} volumeL - Volume in liters
 * @returns {number} Volume in fluid ounces (rounded to 1 decimal)
 */
export const litersToOunces = (volumeL) => {
  return Math.round(volumeL * 33.814 * 10) / 10;
};

/**
 * Convert grams to ounces
 * @param {number} weightG - Weight in grams
 * @returns {number} Weight in ounces (rounded to 1 decimal)
 */
export const gramsToOunces = (weightG) => {
  return Math.round(weightG / 28.35 * 10) / 10;
};

/**
 * Convert hectopascals to inches of mercury
 * @param {number} pressureHPa - Pressure in hPa
 * @returns {number} Pressure in inHg (rounded to 2 decimals)
 */
export const hPaToInHg = (pressureHPa) => {
  return Math.round(pressureHPa * 0.02953 * 100) / 100;
};
