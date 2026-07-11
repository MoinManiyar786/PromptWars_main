'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Shield, ListTodo, Bot, Compass, AlertTriangle, Info } from 'lucide-react';
import WeatherTab from '@/components/WeatherTab';
import PlannerTab from '@/components/PlannerTab';
import ChecklistTab from '@/components/ChecklistTab';
import ChatTab from '@/components/ChatTab';
import TravelTab from '@/components/TravelTab';
import { WeatherData } from '@/services/weather';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'weather' | 'planner' | 'checklist' | 'chat' | 'travel'>('weather');
  const [currentLocation, setCurrentLocation] = useState('Mumbai');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  // Checklist sharing state
  const [importedChecklistItems, setImportedChecklistItems] = useState<string[]>([]);
  const [savedPlan, setSavedPlan] = useState<string | null>(null);

  const handleLocationChange = (location: string, data: WeatherData | null) => {
    setCurrentLocation(location);
    if (data) {
      setWeatherData(data);
    }
  };

  const handleAddToChecklist = (items: string[]) => {
    setImportedChecklistItems(items);
    setActiveTab('checklist');
  };

  const tabs = [
    { id: 'weather', name: 'Alerts & Weather', icon: CloudRain },
    { id: 'planner', name: 'GenAI Planner', icon: Shield },
    { id: 'checklist', name: 'Preparedness List', icon: ListTodo },
    { id: 'chat', name: 'Safety Chatbot', icon: Bot },
    { id: 'travel', name: 'Route Assessor', icon: Compass },
  ] as const;

  return (
    <div className="flex-1 bg-[#020617] text-slate-100 min-h-screen relative overflow-hidden font-sans">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-600 to-teal-500 p-2.5 rounded-2xl shadow-lg shadow-cyan-950/50">
              <CloudRain className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                JAL-KAVACH <span className="bg-cyan-550/15 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-800/30">V1.0</span>
              </h1>
              <p className="text-xs text-slate-455">GenAI-Powered Monsoon Preparedness & Citizen Assistance</p>
            </div>
          </div>

          {/* Active Severe Alert Marquee / Banner */}
          {weatherData?.alerts?.alert && weatherData.alerts.alert.length > 0 ? (
            <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/40 rounded-xl px-4 py-2 text-xs text-amber-300 shadow-md">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-pulse shrink-0" />
              <span>Warning: {weatherData.alerts.alert[0].event} active in {currentLocation}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-950/15 border border-emerald-900/30 rounded-xl px-4 py-2 text-xs text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Weather-Aware & Secured</span>
            </div>
          )}
        </header>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-900 pb-4 mb-8" role="tablist" aria-label="Jal-Kavach Portal sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 border ${
                  isActive
                    ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-950/30 border-slate-900 text-slate-350 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {activeTab === 'weather' && (
                <WeatherTab
                  onLocationChange={handleLocationChange}
                  initialWeatherData={weatherData}
                />
              )}
              {activeTab === 'planner' && (
                <PlannerTab
                  currentLocation={currentLocation}
                  weatherData={weatherData}
                  onPlanGenerated={setSavedPlan}
                  savedPlan={savedPlan}
                  onAddToChecklist={handleAddToChecklist}
                />
              )}
              {activeTab === 'checklist' && (
                <ChecklistTab
                  importedItems={importedChecklistItems}
                  onImportHandled={() => setImportedChecklistItems([])}
                />
              )}
              {activeTab === 'chat' && <ChatTab />}
              {activeTab === 'travel' && <TravelTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-350">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Designed for Hackathon Excellence. Secure API Routing enabled.</span>
          </div>
          <span>© 2026 Jal-Kavach Portal. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
