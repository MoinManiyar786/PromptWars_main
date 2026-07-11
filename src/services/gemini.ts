/**
 * @module GeminiService
 * @description Wraps the Google Gemini API (gemini-2.5-flash) to provide
 * safety advisories, emergency preparedness plans, and citizen query assistance.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  logger.error("GEMINI_API_KEY is not defined in environment variables.");
}

export async function generatePreparednessPlan(
  familySize: number,
  location: string,
  housingType: string,
  weatherForecast: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check GEMINI_API_KEY.");
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a weather emergency response AI expert specializing in monsoon preparedness.
    Generate a personalized, comprehensive monsoon preparedness plan for a family based on the following:
    - Family Size: ${familySize} people
    - Location: ${location}
    - Housing Type: ${housingType}
    - Current Weather Forecast/Condition: ${weatherForecast}

    The response must be returned in professional Markdown. It should include:
    1. **Personalized Checklist**: A list of specific items to prepare (food, water, medicine, documents) tailored to their family size.
    2. **Structural Hazards & Solutions**: Actions to secure their housing type (e.g., clearing gutters for houses, checking balcony drains for apartments).
    3. **Emergency Action Plan**: Step-by-step instructions on what to do if severe weather strikes.
    4. **Local Contacts & Resources**: Recommendations on general channels (e.g., local disaster helpline numbers, radio frequencies) to monitor.

    Keep it actionable, highly relevant, and easy to read. Do not include introductory or concluding conversational text. Start directly with the plan.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error("Error generating plan with Gemini:", error);
    throw error;
  }
}

export async function askSafetyAssistant(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check GEMINI_API_KEY.");
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: `
        You are a multilingual Monsoon Safety Assistant.
        Your goal is to provide real-time, accurate safety advice, emergency guide instructions, and weather-preparedness assistance.
        Always advise users to follow local government directives first.
        Provide answers in the language the user asks their question in.
        Be concise, calm, structured, and helpful. Use bullet points where appropriate.
      `,
    });

    const result = await chat.sendMessage(userQuery);
    return result.response.text();
  } catch (error) {
    logger.error("Error in safety assistant chat:", error);
    throw error;
  }
}

export async function getTravelAdvisory(
  origin: string,
  destination: string,
  originWeather: string,
  destWeather: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized. Check GEMINI_API_KEY.");
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are an AI Travel Safety Advisor.
    Analyze the safety of traveling between the following locations during the monsoon season:
    - Origin: ${origin} (Weather: ${originWeather})
    - Destination: ${destination} (Weather: ${destWeather})

    Provide a travel advisory that includes:
    1. **Risk Assessment**: High, Medium, or Low risk rating with reasoning (e.g., landslide susceptibility, waterlogging risk, low visibility).
    2. **Safe Routes & Alternatives**: General safety advice for the route.
    3. **Actionable Recommendations**: Recommended speed, things to pack (raincoat, offline maps, flashlight), and check-list before starting.
    4. **Safety Alerts**: Warnings for waterlogging, traffic delays, or flash floods commonly seen in these weather conditions.

    Keep it professional, direct, and structured in Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    logger.error("Error generating travel advisory:", error);
    throw error;
  }
}
