'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Wind, Droplets, CloudRain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getWeatherAction } from '@/app/actions';
import { WeatherData } from '@/services/weather';

interface WeatherTabProps {
  onLocationChange: (location: string, weatherData: WeatherData | null) => void;
  initialWeatherData: WeatherData | null;
}

export default function WeatherTab({ onLocationChange, initialWeatherData }: WeatherTabProps) {
  const [query, setQuery] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(initialWeatherData);

  const fetchWeather = useCallback(async (locationName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWeatherAction(locationName);
      if (res.success && res.data) {
        setWeather(res.data);
        onLocationChange(locationName, res.data);
      } else {
        setError(res.error || 'Failed to fetch weather');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [onLocationChange]);

  useEffect(() => {
    if (!weather) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchWeather('Mumbai');
    }
  }, [weather, fetchWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latLon = `${position.coords.latitude},${position.coords.longitude}`;
          await fetchWeather(latLon);
        },
        () => {
          setError('Geolocation access denied. Enter location manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported by this browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-semibold text-cyan-400">Live Weather & Severe Alerts</h2>
          <p className="text-sm text-slate-300">Search location or use GPS to track active monsoonal alerts</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <label htmlFor="weather-search-input" className="sr-only">Search location name</label>
            <input
              id="weather-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g. Mumbai)..."
              className="w-full bg-slate-950/80 text-white placeholder-slate-500 text-sm rounded-xl py-2.5 pl-10 pr-4 border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" aria-hidden="true" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={loading}
            title="Use current location"
            aria-label="Use current location"
            className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-3 flex items-center gap-3 text-red-200 text-sm">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 bg-slate-900/40 h-80 rounded-3xl border border-slate-800/50"></div>
          <div className="bg-slate-900/40 h-80 rounded-3xl border border-slate-800/50"></div>
        </div>
      ) : (
        weather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Weather Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span>{weather.location.name}, {weather.location.region}, {weather.location.country}</span>
                  </div>
                  <h1 className="text-5xl font-bold tracking-tight text-white mt-3">
                    {weather.current.temp_c}°C
                  </h1>
                  <p className="text-lg font-medium text-cyan-300 mt-1 capitalize">
                    {weather.current.condition.text}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800/60 p-4 rounded-2xl self-stretch md:self-auto justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https:${weather.current.condition.icon}`}
                    alt={weather.current.condition.text}
                    className="h-16 w-16"
                  />
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/60">
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Droplets className="h-6 w-6 text-cyan-400 mb-2" />
                  <span className="text-xs text-slate-400">Humidity</span>
                  <span className="text-base font-semibold text-white mt-1">{weather.current.humidity}%</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col items-center text-center">
                  <Wind className="h-6 w-6 text-teal-400 mb-2" />
                  <span className="text-xs text-slate-400">Wind Speed</span>
                  <span className="text-base font-semibold text-white mt-1">{weather.current.wind_kph} km/h</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col items-center text-center">
                  <CloudRain className="h-6 w-6 text-blue-400 mb-2" />
                  <span className="text-xs text-slate-400">Precipitation</span>
                  <span className="text-base font-semibold text-white mt-1">{weather.current.precip_mm} mm</span>
                </div>
              </div>
            </div>

            {/* Weather Alerts Panel */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Active Severe Warnings</h3>
              
              <div className="flex-1 overflow-y-auto max-h-[220px] pr-2 space-y-4">
                {weather.alerts?.alert && weather.alerts.alert.length > 0 ? (
                  weather.alerts.alert.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-4 flex gap-3"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-300">{alert.event}</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-3" title={alert.desc}>
                          {alert.desc}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full py-8">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                    <h4 className="text-sm font-semibold text-emerald-400">All Clear</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      No active storm, flood, or rainfall warning issued for this location.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3-Day Forecast */}
            {weather.forecast && (
              <div className="lg:col-span-3">
                <h3 className="text-lg font-bold text-white mb-4">3-Day Forecast & Preparedness Outlook</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weather.forecast.forecastday.map((day, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-xs text-slate-400">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <h4 className="text-base font-semibold text-white mt-1">
                          {day.day.maxtemp_c}°C / {day.day.mintemp_c}°C
                        </h4>
                        <p className="text-xs text-cyan-400 mt-0.5 font-medium">
                          {day.day.daily_chance_of_rain}% Chance of Rain
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https:${day.day.condition.icon}`}
                          alt={day.day.condition.text}
                          className="h-12 w-12"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 text-center line-clamp-1 max-w-[80px]">
                          {day.day.condition.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
