import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeatherForecast } from './weather';

global.fetch = vi.fn();

describe('Weather Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches weather and forecast data successfully', async () => {
    const mockResponse = {
      location: {
        name: 'Mumbai',
        region: 'Maharashtra',
        country: 'India',
        lat: 19.076,
        lon: 72.877
      },
      current: {
        temp_c: 28,
        condition: { text: 'Heavy Rain', icon: '//cdn.weather.com/rain.png', code: 1009 },
        wind_kph: 15,
        humidity: 90,
        precip_mm: 12.5,
        uv: 2
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const data = await getWeatherForecast('Mumbai');

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=Mumbai'),
      expect.any(Object)
    );
    expect(data.location.name).toBe('Mumbai');
    expect(data.current.temp_c).toBe(28);
    expect(data.current.condition.text).toBe('Heavy Rain');
  });

  it('throws an error when the weather API fails', async () => {
    const mockErrorResponse = {
      error: { message: 'API key is invalid or expired' }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => mockErrorResponse,
    });

    await expect(getWeatherForecast('InvalidCity')).rejects.toThrow('API key is invalid or expired');
  });

  it('rejects empty location queries for security boundary validation', async () => {
    await expect(getWeatherForecast('')).rejects.toThrow('Query location cannot be empty');
    await expect(getWeatherForecast('   ')).rejects.toThrow('Query location cannot be empty');
  });
});
