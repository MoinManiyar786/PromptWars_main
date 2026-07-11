/**
 * @module WeatherService
 * @description Fetches real-time weather alerts, precipitation, and conditions
 * from WeatherAPI.com to drive weather-aware guidance and warning systems.
 */

import { logger } from '@/lib/logger';

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    humidity: number;
    precip_mm: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        totalprecip_mm: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      msgtype: string;
      severity: string;
      urgency: string;
      areas: string;
      category: string;
      certainty: string;
      event: string;
      note: string;
      effective: string;
      expires: string;
      desc: string;
      instruction: string;
    }>;
  };
}

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export async function getWeatherForecast(query: string): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error("Weather API Key is not configured.");
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error("Query location cannot be empty");
  }

  // Fetch 3-day forecast including severe alerts
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(trimmedQuery)}&days=3&aqi=no&alerts=yes`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } }); // Cache for 30 mins
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to fetch weather data: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    logger.error("Error fetching weather forecast:", error);
    throw error;
  }
}
