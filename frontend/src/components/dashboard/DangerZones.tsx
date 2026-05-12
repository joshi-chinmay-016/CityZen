"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, MapPin } from "lucide-react";

const dangerZones = [
  { name: "Downtown Intersection 4th & Pine", hazardCount: 42, stressLevel: "Critical", score: 9.2 },
  { name: "Highway 101 Northbound Entry", hazardCount: 28, stressLevel: "High", score: 8.5 },
  { name: "Westside Industrial Park Road", hazardCount: 19, stressLevel: "High", score: 7.8 },
  { name: "Lakeview Residential Drive", hazardCount: 12, stressLevel: "Medium", score: 6.1 },
];

export default function DangerZones() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <AlertCircle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Top Danger Zones</h3>
          <p className="text-sm text-slate-400">Areas with highest hazard density</p>
        </div>
      </div>

      <div className="space-y-4">
        {dangerZones.map((zone, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-500 mt-0.5 group-hover:text-rose-400 transition-colors" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">{zone.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{zone.hazardCount} active hazards reported</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-100">{zone.score}</div>
              <div className="text-xs font-medium text-rose-400 uppercase tracking-wider">{zone.stressLevel}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors border border-slate-700/50">
        View Full Heatmap
      </button>
    </motion.div>
  );
}
