// Thin wrapper around Open-Meteo API for surface pressure

/**
 * Fetch current surface pressure from Open-Meteo API.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{surfacePressure: number, elevation: number|null}>}
 * @throws {Error} if network request fails or response is not ok
 */
export async function fetchSurfacePressure(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=surface_pressure`
  );
  if (!response.ok) {
    throw new Error(`Weather data unavailable (${response.status})`);
  }
  const data = await response.json();
  return {
    surfacePressure: data.current.surface_pressure,
    elevation: data.elevation ?? null,
  };
}
