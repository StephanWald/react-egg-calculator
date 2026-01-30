// Formatting functions extracted from egg-calculator.jsx
// Handles time and unit-aware formatting for display

import { celsiusToFahrenheit, litersToOunces, gramsToOunces, hPaToInHg } from './converters.js';

/**
 * Format minutes as MM:SS
 * @param {number|null} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export const formatTime = (minutes) => {
  if (minutes === null) return '--:--';
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds as MM:SS
 * @param {number|null} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTimerDisplay = (seconds) => {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format countdown seconds as MM:SS with zero padding
 * @param {number|null} seconds - Time in seconds
 * @returns {string} Formatted countdown string
 */
export const formatCountdown = (seconds) => {
  if (seconds === null || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format temperature with unit
 * @param {number} tempC - Temperature in Celsius
 * @param {string} unit - 'C' or 'F'
 * @returns {string} Formatted temperature with unit
 */
export const formatTemp = (tempC, unit = 'C') => {
  if (unit === 'F') {
    const tempF = celsiusToFahrenheit(tempC);
    return `${tempF}°F`;
  }
  return `${tempC}°C`;
};

/**
 * Format volume with unit
 * @param {number} volumeL - Volume in liters
 * @param {string} unit - 'L' or 'oz'
 * @returns {string} Formatted volume with unit
 */
export const formatVolume = (volumeL, unit = 'L') => {
  if (unit === 'oz') {
    const volumeOz = litersToOunces(volumeL);
    return `${volumeOz} oz`;
  }
  return `${volumeL}L`;
};

/**
 * Format weight with unit
 * @param {number} weightG - Weight in grams
 * @param {string} unit - 'g' or 'oz'
 * @returns {string} Formatted weight with unit
 */
export const formatWeight = (weightG, unit = 'g') => {
  if (unit === 'oz') {
    const weightOz = gramsToOunces(weightG);
    return `${weightOz}oz`;
  }
  return `${weightG}g`;
};

/**
 * Format pressure with unit
 * @param {number} pressureHPa - Pressure in hectopascals
 * @param {string} unit - 'hPa' or 'inHg'
 * @returns {string} Formatted pressure with unit
 */
export const formatPressure = (pressureHPa, unit = 'hPa') => {
  if (unit === 'inHg') {
    const pressureInHg = hPaToInHg(pressureHPa);
    return `${pressureInHg} inHg`;
  }
  return `${pressureHPa} hPa`;
};
