/**
 * @module ServerActions
 * @description Exposes secure, server-side actions to fetch weather forecasts
 * and call generative AI APIs without exposing private keys to the browser.
 */

'use server';

import { getWeatherForecast } from '@/services/weather';
import {
  generatePreparednessPlan,
  askSafetyAssistant,
  getTravelAdvisory,
} from '@/services/gemini';

export async function getWeatherAction(query: string) {
  try {
    const data = await getWeatherForecast(query);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || 'Failed to fetch weather data' };
  }
}

export async function generatePlanAction(
  familySize: number,
  location: string,
  housingType: string,
  weatherForecast: string
) {
  try {
    const plan = await generatePreparednessPlan(familySize, location, housingType, weatherForecast);
    return { success: true, plan };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || 'Failed to generate plan' };
  }
}

export async function askAssistantAction(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
) {
  try {
    const reply = await askSafetyAssistant(userQuery, chatHistory);
    return { success: true, reply };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || 'Failed to get answer' };
  }
}

export async function getTravelAdvisoryAction(origin: string, destination: string) {
  try {
    const [originData, destData] = await Promise.all([
      getWeatherForecast(origin),
      getWeatherForecast(destination),
    ]);

    const originWeather = `${originData.current.condition.text}, Temp: ${originData.current.temp_c}°C, Rain chance: ${originData.forecast?.forecastday[0]?.day.daily_chance_of_rain}%`;
    const destWeather = `${destData.current.condition.text}, Temp: ${destData.current.temp_c}°C, Rain chance: ${destData.forecast?.forecastday[0]?.day.daily_chance_of_rain}%`;

    const advisory = await getTravelAdvisory(origin, destination, originWeather, destWeather);

    return {
      success: true,
      advisory,
      weather: {
        origin: originData,
        destination: destData,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message || 'Failed to analyze route safety' };
  }
}
