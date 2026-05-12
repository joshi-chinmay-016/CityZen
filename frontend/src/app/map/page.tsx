"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  Layers3,
  MapPin,
  Navigation,
  Shield,
} from "lucide-react";
import MapView from "@/components/map/MapView";
import SafeRoutePanel from "@/components/map/SafeRoutePanel";
import { RouteProvider, useRouteContext } from "@/context/RouteContext";

type RouteVariant = {
  id: string;
  label: string;
  tone: "emerald" | "amber" | "red";
  badge: string;
  stress: number;
  minutes: number;
  distanceKm: number;
  hazards: number;
  recommended?: boolean;
}

function toneClasses(tone: RouteVariant["tone"]) {
  switch (tone) {
    case "emerald":
      return {
        panel: "border-emerald-400/25 bg-emerald-500/[0.05]",
        pill: "border-emerald-400/20 bg-emerald-500/12 text-emerald-200",
        text: "text-emerald-300",
        bar: "bg-emerald-400",
        glow: "shadow-[0_0_24px_rgba(16,185,129,0.2)]",
      };
    case "amber":
      return {
        panel: "border-amber-400/22 bg-amber-500/[0.04]",
        pill: "border-amber-400/20 bg-amber-500/12 text-amber-200",
        text: "text-amber-300",
        bar: "bg-amber-400",
        glow: "shadow-[0_0_24px_rgba(245,158,11,0.16)]",
      };
    default:
      return {
        panel: "border-red-400/22 bg-red-500/[0.04]",
        pill: "border-red-400/20 bg-red-500/12 text-red-200",
        text: "text-red-300",
        bar: "bg-red-400",
        glow: "shadow-[0_0_24px_rgba(239,68,68,0.18)]",
      };
  }
}

function HazardHud() {
  const stats = [
    { value: "47", label: "Potholes", tone: "text-red-300", dot: "bg-red-400" },
    { value: "23", label: "Manholes", tone: "text-amber-300", dot: "bg-amber-400" },
    { value: "31", label: "Cracks", tone: "text-sky-300", dot: "bg-sky-400" },
    { value: "94%", label: "Accuracy", tone: "text-emerald-300", dot: "bg-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="pointer-events-none absolute right-4 top-20 z-[1300] hidden w-[240px] gap-4 lg:grid"
    >
      <div className="glass-map rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.28 + index * 0.06 }}
              className="rounded-2xl border border-white/6 bg-white/[0.02] p-3"
            >
              <div className={`font-mono text-2xl ${item.tone}`}>{item.value}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/42">
                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="glass-map rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
      >
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/36">Hazard type</div>
        <div className="mt-3 space-y-3 text-sm text-white/74">
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-red-400" />Pothole</div>
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Manhole</div>
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" />Crack</div>
        </div>
        <div className="my-4 h-px bg-white/8" />
        <div className="space-y-2 text-sm text-white/5
0">
          <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-sm bg-red-400" />Severe</div>
          <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-sm bg-red-400/80" />Moderate</div>
          <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-sm bg-red-400/60" />Minor</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RouteResultsPanel({
  variants,
  selectedIndex,
  onSelect,
  onClose,
}: {
  variants: RouteVariant[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="glass-map absolute right-4 top-20 z-[1300] hidden w-[360px] rounded-[26px] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:block"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl tracking-tight text-[#f0f4ff]">3 routes found</div>
          <div className="mt-1 text-sm text-[#f0f4ff]/45">Choose the balance of calm, time, and distance.</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-white/50 transition hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-emerald-400/70 to-transparent" />

      <div className="mt-5 space-y-4">
        {variants.map((variant, index) => {
          const tone = toneClasses(variant.tone);
          const isActive = selectedIndex === index;
          return (
            <motion.button
              key={variant.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelect(index)}
              className={`w-full rounded-[22px] border p-4 text-left transition-all ${tone.panel} ${tone.glow} ${
                isActive ? "ring-1 ring-white/14" : "opacity-90 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {variant.tone === "emerald" ? (
                      <Shield className={`h-4 w-4 ${tone.text}`} />
                    ) : (
                      <AlertTriangle className={`h-4 w-4 ${tone.text}`} />
                    )}
                    <span className="font-display text-xl tracking-tight text-[#f0f4ff]">{variant.label}</span>
                  </div>
                  <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] ${tone.pill}`}>
                    {variant.badge}
                  </div>
                </div>
                {variant.recommended ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                    Live
                  </span>
                ) : null}
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${variant.stress}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + index * 0.1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${tone.bar}`}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-[#f0f4ff]/65">
                <div>
                  <div className={`font-mono text-2xl ${tone.text}`}>{variant.stress}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em]">Stress</div>
                </div>
                <div>
                  <div className="font-mono text-lg text-[#f0f4ff]">{variant.minutes} min</div>
                  <div className="text-[11px] uppercase tracking-[0.2em]">Time</div>
                </div>
                <div>
                  <div className="font-mono text-lg text-[#f0f4ff]">{variant.distanceKm} km</div>
                  <div className="text-[11px] uppercase tracking-[0.2em]">Distance</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/8 pt-4">
        <button className="text-sm text-emerald-300 transition hover:text-emerald-200">View breakdown</button>
      </div>
    </motion.aside>
  );
}

function RouteInfoStrip({ variant }: { variant: RouteVariant }) {
  const tone = toneClasses(variant.tone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      className="glass-map absolute bottom-5 left-1/2 z-[1300] hidden w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] md:flex md:items-center md:gap-4"
    >
      <div className={`font-mono text-4xl ${tone.text}`}>{variant.stress}</div>
      <div className="h-12 w-px bg-white/10" />
      <div className="flex-1 text-sm text-[#f0f4ff]/55">
        <div className="font-display text-lg text-[#f0f4ff]">{variant.label}</div>
        <div className="mt-1 flex items-center gap-3">
          <span>{variant.minutes} min</span>
          <span>{variant.distanceKm} km</span>
          <span>{variant.hazards} hazards</span>
        </div>
      </div>
      <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-black">
        Navigate
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function MapScreen() {
  const { routeResult, routeOptions, selectedRouteIndex, setSelectedRouteIndex, resetRoute } = useRouteContext();
  const [showResults, setShowResults] = useState(true);

  const variants = useMemo(() => {
    if (!routeOptions.length) return [];
    return routeOptions.map((route, index) => {
      const isSafest = index === 0;
      const isFastest = route.duration_seconds === Math.min(...routeOptions.map((item) => item.duration_seconds ?? Infinity));
      return {
        id: route.id ?? `route-${index + 1}`,
        label: isSafest ? `Route ${String.fromCharCode(65 + index)} — Safest` : isFastest ? `Route ${String.fromCharCode(65 + index)} — Fastest` : `Route ${String.fromCharCode(65 + index)} — Moderate`,
        tone: isSafest ? "emerald" : route.safe ? "amber" : "red",
        badge: isSafest ? "RECOMMENDED" : isFastest ? "FASTEST" : route.safe ? "MODERATE" : "HIGH RISK",
        stress: route.stress_score,
        minutes: Math.max(1, Math.round((route.duration_seconds ?? 0) / 60)),
        distanceKm: Number((((route.distance_meters ?? 0) / 1000) || 0).toFixed(1)),
        hazards: route.hazards ?? 0,
        recommended: isSafest,
      } satisfies RouteVariant;
    });
  }, [routeOptions]);

  const activeVariant = variants[selectedRouteIndex] ?? variants[0];

  React.useEffect(() => {
    if (routeResult) {
      setShowResults(true);
    }
  }, [routeResult]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0 pt-16"
      >
        <MapView />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute left-4 top-20 z-[1200] md:left-6 md:top-24"
      >
        <SafeRoutePanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25 }}
        className="pointer-events-none absolute left-6 top-[5.5rem] z-[1200] hidden items-center gap-3 rounded-full border border-white/8 bg-black/45 px-4 py-2 backdrop-blur-xl lg:flex"
      >
        <Layers3 className="h-4 w-4 text-cyan-300" />
        <span className="text-sm text-[#f0f4ff]/62">Live network calmness over Bengaluru</span>
      </motion.div>

      <HazardHud />

      <AnimatePresence>
        {routeResult && variants.length && showResults ? (
          <RouteResultsPanel
            variants={variants}
            selectedIndex={selectedRouteIndex}
            onSelect={setSelectedRouteIndex}
            onClose={() => {
              setShowResults(false);
              resetRoute();
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {routeResult && activeVariant ? <RouteInfoStrip variant={activeVariant} /> : null}
      </AnimatePresence>
    </div>
  );
}

export default function MapPage() {
  return (
    <RouteProvider>
      <MapScreen />
    </RouteProvider>
  );
}
