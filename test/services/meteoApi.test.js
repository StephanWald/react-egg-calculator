import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSurfacePressure } from '../../services/meteoApi';

describe('fetchSurfacePressure', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns surfacePressure and elevation for valid coordinates', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current: { surface_pressure: 1013.25 },
        elevation: 52,
      }),
    });

    const result = await fetchSurfacePressure(52.52, 13.405);
    expect(result.surfacePressure).toBe(1013.25);
    expect(result.elevation).toBe(52);
  });

  it('passes correct URL with latitude/longitude parameters', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current: { surface_pressure: 1013.25 },
        elevation: 0,
      }),
    });

    await fetchSurfacePressure(48.8566, 2.3522);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=surface_pressure'
    );
  });

  it('throws on non-ok response (status 500)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchSurfacePressure(0, 0)).rejects.toThrow('Weather data unavailable (500)');
  });

  it('throws on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchSurfacePressure(0, 0)).rejects.toThrow('Network error');
  });

  it('returns null elevation when API response has no elevation field', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current: { surface_pressure: 980.0 },
      }),
    });

    const result = await fetchSurfacePressure(0, 0);
    expect(result.surfacePressure).toBe(980.0);
    expect(result.elevation).toBeNull();
  });
});
