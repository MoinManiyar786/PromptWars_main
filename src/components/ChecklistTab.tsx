'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Trash2, Plus, ListTodo, CloudLightning, RefreshCw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  category: 'critical' | 'household' | 'medical' | 'custom';
}

interface ChecklistTabProps {
  importedItems: string[];
  onImportHandled: () => void;
}

export default function ChecklistTab({ importedItems, onImportHandled }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', task: 'Store at least 3 days of drinking water (3 liters per person per day)', completed: false, category: 'critical' },
    { id: '2', task: 'Inspect house roof and clear all rainwater gutters/balcony drains', completed: false, category: 'household' },
    { id: '3', task: 'Keep a battery-powered radio or backup power bank fully charged', completed: false, category: 'critical' },
    { id: '4', task: 'Prepare a waterproof folder containing medical logs and ID cards', completed: false, category: 'medical' },
    { id: '5', task: 'Ensure you have a 7-day reserve of essential prescription medications', completed: false, category: 'medical' },
  ]);
  
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'critical' | 'household' | 'medical' | 'custom'>('custom');
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'local' | 'syncing'>('local');

  // Load from localStorage or Firestore on mount
  useEffect(() => {
    const loadChecklist = async () => {
      let loadedItems: ChecklistItem[] = [];

      // 1. Try to load from Firestore if db is active
      if (db) {
        setFirebaseStatus('syncing');
        try {
          const querySnapshot = await getDocs(collection(db, 'checklists'));
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.items) {
                loadedItems = data.items;
              }
            });
            if (loadedItems.length > 0) {
              setItems(loadedItems);
              setFirebaseStatus('connected');
              return;
            }
          }
        } catch (err) {
          console.warn("Firestore access error, falling back to local storage:", err);
        }
      }

      // 2. Local storage fallback
      const local = localStorage.getItem('monsoon_checklist');
      if (local) {
        try {
          setItems(JSON.parse(local));
        } catch (e) {
          console.error(e);
        }
      }
      setFirebaseStatus('local');
    };

    loadChecklist();
  }, []);

  // Save to localStorage and Firestore whenever items change
  const saveChecklist = async (updatedItems: ChecklistItem[]) => {
    localStorage.setItem('monsoon_checklist', JSON.stringify(updatedItems));

    if (db && firebaseStatus !== 'local') {
      try {
        // Sync to a single master document for simplicity in this demo project
        const docRef = doc(db, 'checklists', 'master_checklist');
        await setDoc(docRef, { items: updatedItems, lastUpdated: new Date().toISOString() });
        setFirebaseStatus('connected');
      } catch (err) {
        console.warn("Firestore sync failed, keeping local copy active:", err);
      }
    }
  };

  // Import items passed down from Planner
  useEffect(() => {
    if (importedItems.length > 0) {
      const newItems: ChecklistItem[] = importedItems.map((task, idx) => ({
        id: `imported-${Date.now()}-${idx}`,
        task,
        completed: false,
        category: 'custom',
      }));

      const merged = [...items, ...newItems];
      setItems(merged);
      saveChecklist(merged);
      onImportHandled();
    }
  }, [importedItems]);

  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    saveChecklist(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveChecklist(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      task: newItemText,
      completed: false,
      category: newItemCategory,
    };

    const updated = [...items, newItem];
    setItems(updated);
    saveChecklist(updated);
    setNewItemText('');
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const categoryLabels = {
    critical: { label: 'Severe Alert / Safety', color: 'bg-red-950/40 text-red-400 border-red-900/60' },
    household: { label: 'Home / Infrastructure', color: 'bg-blue-950/40 text-blue-400 border-blue-900/60' },
    medical: { label: 'Medical / Supplies', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' },
    custom: { label: 'Custom / Planner', color: 'bg-slate-950/40 text-slate-400 border-slate-850' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Progress & Sync Status */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl h-fit space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Your Progress</h3>
          </div>
          <span className="text-2xl font-black text-cyan-400">{progressPercent}%</span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-3.5 border border-slate-900 p-0.5">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Checklist Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-405 block">Completed Tasks</span>
            <span className="text-lg font-bold text-emerald-450">{completedCount}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-405 block">Remaining Tasks</span>
            <span className="text-lg font-bold text-slate-300">{items.length - completedCount}</span>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold">Cloud Sync</span>
            <span className="text-xs text-white font-medium mt-0.5">
              {firebaseStatus === 'connected' && 'Firestore Live Connection'}
              {firebaseStatus === 'syncing' && 'Synchronizing cloud database...'}
              {firebaseStatus === 'local' && 'Offline / LocalStorage Mode'}
            </span>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${
            firebaseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
            firebaseStatus === 'syncing' ? 'bg-amber-500 animate-spin' : 'bg-slate-500'
          }`} />
        </div>
      </div>

      {/* Checklist Tasks List */}
      <div className="lg:col-span-2 flex flex-col bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Emergency Preparedness List</h3>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add new safety task (e.g., Check drainage pipe)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-550 border-0 focus:outline-none focus:ring-0"
          />
          <div className="flex gap-2 shrink-0">
            <select
              value={newItemCategory}
              onChange={(e: any) => setNewItemCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="custom">Custom</option>
              <option value="critical">Critical</option>
              <option value="household">Household</option>
              <option value="medical">Medical</option>
            </select>
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3">
          <AnimatePresence initial={false}>
            {items.length > 0 ? (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center justify-between gap-4 p-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl transition-all ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="text-cyan-400 hover:text-cyan-300 shrink-0 mt-0.5 transition-colors"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 fill-cyan-950/60" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm text-slate-200 leading-normal ${item.completed ? 'line-through text-slate-500' : ''}`}>
                        {item.task}
                      </p>
                      <span className={`inline-block border text-[9px] px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 ${
                        categoryLabels[item.category]?.color || categoryLabels.custom.color
                      }`}>
                        {categoryLabels[item.category]?.label || categoryLabels.custom.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-slate-550 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-8">
                <CheckSquare className="h-10 w-10 text-slate-650 mb-2" />
                <h4 className="text-xs font-semibold text-slate-450">List is Empty</h4>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                  All tasks cleared. Add custom tasks or generate an AI preparedness plan to import items.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
