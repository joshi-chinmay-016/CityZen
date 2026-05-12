"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, ChevronLeft, Filter, Layers3 } from "lucide-react";

const hazards = [
  { id: "pothole", label: "Potholes", color: "bg-red-400", glow: "glow-red" },
  { id: "manhole", label: "Manholes", color: "bg-amber-400", glow: "glow-amber" },
  { id: "crack", label: "Cracks", color: "bg-sky-400", glow: "glow-blue" },
];

const feed = [
  { title: "Pothole at MG Road", time: "2m ago", tone: "text-red-300" },
  { title: "Manhole at Indiranagar", time: "15m ago", tone: "text-amber-300" },
  { title: "Crack at Koramangala", time: "1h ago", tone: "text-sky-300" },
];

export default function MapSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(["pothole", "manhole", "crack"]);

  const toggleFilter = (type: string) => {
    setActiveFilters((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  return (
    <div className="pointer-events-auto fixed bottom-6 left-4 z-[1100] flex items-end gap-2 md:left-6 lg:bottom-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="glass-map w-[min(300px,calc(100vw-2rem))] rounded-[24px] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.42)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-400/16 bg-cyan-500/10 p-2.5 text-cyan-300">
                  <Layers3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-2xl tracking-tight text-[#f0f4ff]">Map layers</div>
                  <div className="text-xs text-[#f0f4ff]/38">Control what the city surface reveals.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-white/45 transition hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {hazards.map((hazard) => {
                const active = activeFilters.includes(hazard.id);
                return (
                  <button
                    key={hazard.id}
                    type="button"
                    onClick={() => toggleFilter(hazard.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-white/10 bg-white/[0.04] text-[#f0f4ff]"
                        : "border-white/[0.04] bg-black/10 text-[#f0f4ff]/36"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${hazard.color}`} />
                      <span>{hazard.label}</span>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        active ? "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]" : "bg-white/10"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/16 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#f0f4ff]/32">
                <Activity className="h-3.5 w-3.5 text-emerald-300" />
                Heat intensity
              </div>
              <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />
              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-[#f0f4ff]/25">
                <span>Safe</span>
                <span>Moderate</span>
                <span>Danger</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#f0f4ff]/32">Live feed</div>
              <div className="mt-3 space-y-3">
                {feed.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <div className={`text-sm ${item.tone}`}>{item.title}</div>
                    <div className="mt-1 text-xs text-[#f0f4ff]/32">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="glass-map rounded-2xl p-3 text-white/65 shadow-[0_18px_50px_rgba(0,0,0,0.34)] transition hover:text-emerald-300"
        >
          <Filter className="h-5 w-5" />
        </motion.button>
      ) : null}
    </div>
  );
}
