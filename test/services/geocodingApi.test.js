import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchLocationName } from '../../services/geocodingApi';

describe('fetchLocationName', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns city name from address.city', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        address: { city: 'Berlin', country: 'Germany' },
      }),
    });

    const result = await fetchLocationName(52.52, 13.405);
    expect(result).toBe('Berlin');
  });

  it('falls back to address.town when city is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        address: { town: 'Freiburg', country: 'Germany' },
      }),
    });

    const result = await fetchLocationName(47.99, 7.85);
    expect(result).toBe('Freiburg');
  });

  it('falls back to address.village when town is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        address: { village: 'Schoenau', country: 'Germany' },
      }),
    });

    const result = await fetchLocationName(47.78, 7.89);
    expect(result).toBe('Schoenau');
  });

  it('returns null when response is not ok (does not throw)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    const result = await fetchLocationName(0, 0);
    expect(result).toBeNull();
  });

  it('returns null when no city/town/village in response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        address: { country: 'Germany' },
      }),
    });

    const result = await fetchLocationName(52.52, 13.405);
    expect(result).toBeNull();
  });

  it('returns null on network error (does not throw)', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchLocationName(0, 0);
    expect(result).toBeNull();
  });
});
