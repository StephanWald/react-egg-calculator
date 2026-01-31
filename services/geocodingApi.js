// Thin wrapper around Nominatim reverse geocoding API

/**
 * Fetch location name (city) from Nominatim reverse geocoding.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string|null>} City name or null if unavailable
 */
export async function fetchLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || null;
  } catch (e) {
    // Geocoding is informational-only, should not throw
    return null;
  }
}
