"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Info,
  Clock,
  Layers,
  Activity,
  MapPin
} from 'lucide-react';

export default function MapSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(['pothole', 'manhole', 'crack']);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const recentHazards = [
    { type: 'Pothole', severity: 4, location: 'MG Road', time: '2m ago' },
    { type: 'Manhole', severity: 5, location: 'Indiranagar', time: '15m ago' },
    { type: 'Crack', severity: 2, location: 'Koramangala', time: '1h ago' },
  ];

  return (
    <div className="fixed left-6 top-24 z-[1000] flex items-start gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-72 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-white font-bold">
                <Layers className="text-emerald-400" size={20} />
                Map Layers
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Hazard Filters */}
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Hazards</label>
              <div className="space-y-2">
                {[
                  { id: 'pothole', label: 'Potholes', color: 'bg-emerald-500' },
                  { id: 'manhole', label: 'Open Manholes', color: 'bg-rose-500' },
                  { id: 'crack', label: 'Road Cracks', color: 'bg-amber-500' },
                ].map(hazard => (
                  <button
                    key={hazard.id}
                    onClick={() => toggleFilter(hazard.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      activeFilters.includes(hazard.id)
                        ? 'bg-slate-800/50 border-slate-700 text-white'
                        : 'bg-slate-950/30 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${hazard.color}`} />
                      <span className="text-sm font-medium">{hazard.label}</span>
                    </div>
                    {activeFilters.includes(hazard.id) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Legend */}
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Heat Intensity</label>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full mb-2" />
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Safe</span>
                  <span>Moderate</span>
                  <span>Danger</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Feed</label>
              <div className="space-y-3">
                {recentHazards.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/50 flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      h.severity >= 4 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{h.type} at {h.location}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock size={10} />
                        {h.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 transition-all shadow-2xl"
        >
          <Filter size={24} />
        </motion.button>
      )}
    </div>
  );
}
