'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Home, MapPin, Loader2, FileText, CheckSquare, Plus, Check } from 'lucide-react';
import { generatePlanAction } from '@/app/actions';
import { WeatherData } from '@/services/weather';

interface PlannerTabProps {
  currentLocation: string;
  weatherData: WeatherData | null;
  onPlanGenerated: (plan: string) => void;
  savedPlan: string | null;
  onAddToChecklist: (items: string[]) => void;
}

export default function PlannerTab({
  currentLocation,
  weatherData,
  onPlanGenerated,
  savedPlan,
  onAddToChecklist,
}: PlannerTabProps) {
  const [familySize, setFamilySize] = useState<number>(2);
  const [housingType, setHousingType] = useState<string>('Apartment');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [planText, setPlanText] = useState<string | null>(savedPlan);
  const [addedToChecklist, setAddedToChecklist] = useState<boolean>(false);

  const housingOptions = [
    { value: 'House', label: 'Independent House' },
    { value: 'Apartment', label: 'Apartment/Flat' },
    { value: 'Villa', label: 'Villa/Estate' },
    { value: 'Informal', label: 'Informal/Low-lying Area' },
  ];

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    setAddedToChecklist(false);

    const weatherForecast = weatherData
      ? `${weatherData.current.condition.text}, Temperature: ${weatherData.current.temp_c}°C, Precip: ${weatherData.current.precip_mm}mm, Risk: ${weatherData.alerts?.alert && weatherData.alerts.alert.length > 0 ? 'High Alerts Active' : 'Normal'}`
      : 'Normal monsoon conditions';

    try {
      const res = await generatePlanAction(
        familySize,
        currentLocation || 'Mumbai',
        housingType,
        weatherForecast
      );

      if (res.success && res.plan) {
        setPlanText(res.plan);
        onPlanGenerated(res.plan);
      } else {
        setError(res.error || 'Failed to generate plan');
      }
    } catch (err) {
      setError('An unexpected error occurred during AI plan generation.');
    } finally {
      setLoading(false);
    }
  };

  // Simple parser to extract potential checklist items from markdown
  const handleExtractChecklist = () => {
    if (!planText) return;
    
    // Parse markdown list items
    const lines = planText.split('\n');
    const items: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        items.push(trimmed.replace(/- \[[ x]\]\s*/, ''));
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const item = trimmed.replace(/^[-*]\s*/, '').trim();
        // Limit to reasonably short lines that look like checklist items
        if (item.length > 5 && item.length < 100 && !item.includes('**')) {
          items.push(item);
        }
      }
    });

    if (items.length > 0) {
      onAddToChecklist(items);
      setAddedToChecklist(true);
    } else {
      // Fallback: create generic items if parser found none
      const fallbackItems = [
        `Stock up non-perishable food for ${familySize} people`,
        `Inspect ${housingType} structure for water leakage`,
        `Prepare first aid kit and emergency medications`,
        `Secure backup power / charge power banks`,
        `Keep duplicate emergency documents in waterproof cover`,
      ];
      onAddToChecklist(fallbackItems);
      setAddedToChecklist(true);
    }
  };

  // Basic custom markdown renderer to render bold, lists, headings beautifully
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      let trimmed = line.trim();

      if (trimmed.startsWith('###')) {
        return (
          <h4 key={index} className="text-base font-semibold text-cyan-300 mt-4 mb-2">
            {trimmed.replace('###', '').trim()}
          </h4>
        );
      }
      if (trimmed.startsWith('##')) {
        return (
          <h3 key={index} className="text-lg font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-1">
            {trimmed.replace('##', '').trim()}
          </h3>
        );
      }
      if (trimmed.startsWith('#')) {
        return (
          <h2 key={index} className="text-xl font-black text-cyan-400 mt-6 mb-4">
            {trimmed.replace('#', '').trim()}
          </h2>
        );
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const cleanContent = trimmed.replace(/^[-*]\s*/, '');
        return (
          <ul key={index} className="list-disc list-inside text-sm text-slate-300 ml-4 mb-2 space-y-1">
            <li>{cleanContent}</li>
          </ul>
        );
      }

      if (trimmed === '') return <div key={index} className="h-2" />;

      // Support bold syntax **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(trimmed)) {
        const parts = trimmed.split(boldRegex);
        return (
          <p key={index} className="text-sm text-slate-300 mb-2 leading-relaxed">
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-cyan-400 font-semibold">{part}</strong> : part))}
          </p>
        );
      }

      return (
        <p key={index} className="text-sm text-slate-300 mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Form */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl h-fit">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">AI Plan Configurator</h3>
        </div>

        <div className="space-y-5">
          {/* Family Size */}
          <div>
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" /> Family Size
            </label>
            <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
              <button
                type="button"
                onClick={() => setFamilySize(Math.max(1, familySize - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-base font-bold text-white flex-1 text-center">{familySize} {familySize === 1 ? 'Person' : 'People'}</span>
              <button
                type="button"
                onClick={() => setFamilySize(familySize + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Housing Type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 mb-2">
              <Home className="h-4 w-4" /> Housing Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {housingOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHousingType(opt.value)}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all text-center ${
                    housingType === opt.value
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Info Panel */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-450">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Target Location</span>
              <span className="font-semibold text-white">{currentLocation || 'Detecting...'}</span>
            </div>
            {weatherData && (
              <div className="flex justify-between items-center text-slate-450 pt-2 border-t border-slate-900">
                <span>Weather awareness</span>
                <span className="font-semibold text-cyan-400">{weatherData.current.condition.text}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/65 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Generating Plan...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" /> Generate Preparedness Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Output Screen */}
      <div className="lg:col-span-2 flex flex-col bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-cyan-400">Analyzing weather patterns & geographic risks...</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
              Generating your personalized safety checklists, emergency actions, and structural checks.
            </p>
          </div>
        ) : planText ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-450" />
                <h3 className="text-base font-bold text-white">Your Preparedness Plan</h3>
              </div>
              <button
                onClick={handleExtractChecklist}
                disabled={addedToChecklist}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  addedToChecklist
                    ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-800/80 cursor-default'
                    : 'bg-cyan-650/20 text-cyan-400 border border-cyan-550/40 hover:bg-cyan-650/40'
                }`}
              >
                {addedToChecklist ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added to Checklist
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" /> Import Check Items
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-2 prose prose-invert max-w-none">
              {renderMarkdown(planText)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
            <Shield className="h-12 w-12 text-slate-650 mb-3" />
            <h4 className="text-sm font-semibold text-slate-350">No Preparedness Plan Generated</h4>
            <p className="text-xs text-slate-450 mt-1 max-w-xs">
              Configure your details in the panel and click "Generate" to construct a personalized monsoon plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
