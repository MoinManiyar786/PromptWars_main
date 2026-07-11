'use client';

import React, { useState } from 'react';
import { Loader2, Navigation, Compass, ShieldAlert, MapPin } from 'lucide-react';
import { getTravelAdvisoryAction } from '@/app/actions';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { WeatherData } from '@/services/weather';

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '1.5rem',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#334155' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
  ],
};

export default function TravelTab() {
  const [origin, setOrigin] = useState('Mumbai');
  const [destination, setDestination] = useState('Pune');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<{ origin: WeatherData; destination: WeatherData } | null>(null);
  
  // Directions state
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  // Load Google Maps script safely
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
  });

  const handleAnalyzeRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setError(null);
    setAdvisory(null);
    setWeatherData(null);
    setDirections(null);

    try {
      const res = await getTravelAdvisoryAction(origin, destination);
      if (res.success && res.advisory) {
        setAdvisory(res.advisory);
        setWeatherData(res.weather);

        // Fetch route directions for Google Map
        if (isLoaded && window.google) {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK && result) {
                setDirections(result);
              } else {
                console.warn('Google Maps Directions request failed:', status);
              }
            }
          );
        }
      } else {
        setError(res.error || 'Failed to analyze route safety');
      }
    } catch {
      setError('An unexpected error occurred during travel planning.');
    } finally {
      setLoading(false);
    }
  };


  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('###')) {
        return (
          <h4 key={index} className="text-sm font-bold text-cyan-300 mt-4 mb-1">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={index} className="text-base font-bold text-white mt-5 mb-2 border-b border-slate-800 pb-1">
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('#')) {
        return (
          <h2 key={index} className="text-lg font-black text-cyan-400 mt-5 mb-3">
            {trimmed.replace('#', '').trim()}
          </h2>
        );
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const cleanContent = trimmed.replace(/^[-*]\s*/, '');
        return (
          <ul key={index} className="list-disc list-inside text-xs text-slate-350 ml-3 mb-1 space-y-0.5">
            <li>{cleanContent}</li>
          </ul>
        );
      }

      if (trimmed === '') return <div key={index} className="h-1.5" />;

      // Support bold syntax **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(trimmed)) {
        const parts = trimmed.split(boldRegex);
        return (
          <p key={index} className="text-xs text-slate-350 mb-1.5 leading-relaxed">
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-cyan-400 font-semibold">{part}</strong> : part))}
          </p>
        );
      }

      return (
        <p key={index} className="text-xs text-slate-355 mb-1.5 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Route Inputs Panel */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl h-fit space-y-6">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Route Safety Config</h3>
        </div>

        <form onSubmit={handleAnalyzeRoute} className="space-y-4">
          <div>
            <label htmlFor="travel-origin-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <MapPin className="h-4.5 w-4.5 text-cyan-400" /> Starting Location
            </label>
            <input
              id="travel-origin-input"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full bg-slate-950/60 text-white placeholder-slate-500 text-sm rounded-xl py-2.5 px-4 border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="travel-destination-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
              <Navigation className="h-4.5 w-4.5 text-rose-450" /> Destination
            </label>
            <input
              id="travel-destination-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pune"
              className="w-full bg-slate-950/60 text-white placeholder-slate-500 text-sm rounded-xl py-2.5 px-4 border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Analyzing Route...
              </>
            ) : (
              <>
                <Compass className="h-5 w-5" /> Analyze Travel Safety
              </>
            )}
          </button>
        </form>

        {/* Live Weather Comparison */}
        {weatherData && (
          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white border-b border-slate-850 pb-2">Weather Comparison</h4>
            
            <div className="grid grid-cols-2 gap-4 divide-x divide-slate-850">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Origin ({weatherData.origin.location.name})</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{weatherData.origin.current.temp_c}°C</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https:${weatherData.origin.current.condition.icon}`}
                    alt="weather icon"
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-[10px] text-cyan-400 capitalize block">{weatherData.origin.current.condition.text}</span>
              </div>

              <div className="space-y-1 pl-4">
                <span className="text-[10px] text-slate-400">Dest ({weatherData.destination.location.name})</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{weatherData.destination.current.temp_c}°C</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https:${weatherData.destination.current.condition.icon}`}
                    alt="weather icon"
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-[10px] text-cyan-400 capitalize block">{weatherData.destination.current.condition.text}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map and Advisory Output */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Google Map Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 shadow-2xl relative">
          {loadError ? (
            <div className="h-[250px] flex items-center justify-center text-center p-4">
              <p className="text-xs text-red-400">Map loading failed. Check Google Maps API Key.</p>
            </div>
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: 19.076, lng: 72.877 }} // Default Mumbai
              zoom={8}
              options={mapOptions}
            >
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Advisory Content Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex-1 min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-3" />
              <p className="text-xs text-slate-400">Querying weather patterns along your route...</p>
            </div>
          ) : advisory ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <ShieldAlert className="h-5 w-5 text-cyan-450" />
                <h3 className="text-sm font-bold text-white">AI Travel Advisory</h3>
              </div>
              <div className="overflow-y-auto max-h-[300px] pr-2 space-y-1">
                {renderMarkdown(advisory)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Compass className="h-10 w-10 text-slate-650 mb-2" />
              <h4 className="text-xs font-semibold text-slate-450">Route Assessment Pending</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                Submit your start and end points to get a weather-aware travel safety analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
