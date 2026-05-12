"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Compass,
  MapPinned,
  Route as RouteIcon,
  Shield,
} from "lucide-react";
import SafeRoutePanel from "./SafeRoutePanel";
import { SafeRouteResponse, classifyRouteRisk } from "@/types/route";

type Props = {
  routes: SafeRouteResponse[];
  selectedRouteIndex: number;
  onSelect: (index: number) => void;
};

const riskStyles = {
  safe: {
    badge: "border-emerald-400/20 bg-emerald-500/12 text-emerald-200",
    card: "border-emerald-400/18 bg-emerald-500/[0.08]",
    text: "text-emerald-300",
    label: "Safe",
  },
  moderate: {
    badge: "border-amber-400/20 bg-amber-500/12 text-amber-200",
    card: "border-amber-400/18 bg-amber-500/[0.08]",
    text: "text-amber-300",
    label: "Moderate",
  },
  risky: {
    badge: "border-rose-400/20 bg-rose-500/12 text-rose-200",
    card: "border-rose-400/18 bg-rose-500/[0.08]",
    text: "text-rose-300",
    label: "Risky",
  },
} as const;

function getRouteTitle(route: SafeRouteResponse, index: number, routes: SafeRouteResponse[]) {
  const risk = classifyRouteRisk(route);
  const fastestDuration = Math.min(...routes.map((item) => item.duration_seconds ?? Number.POSITIVE_INFINITY));
  const routeName = `Route ${String.fromCharCode(65 + index)}`;

  if (risk === "safe") {
    return `${routeName} · Calmest`;
  }

  if ((route.duration_seconds ?? Number.POSITIVE_INFINITY) === fastestDuration) {
    return `${routeName} · Fastest`;
  }

  return `${routeName} · Alternate`;
}

function formatDistance(distanceMeters?: number) {
  return `${(((distanceMeters ?? 0) / 1000) || 0).toFixed(1)} km`;
}

function formatDuration(durationSeconds?: number) {
  return `${Math.max(1, Math.round((durationSeconds ?? 0) / 60))} min`;
}

function getHazardCount(route: SafeRouteResponse) {
  return route.hazards ?? route.nearby_hazards?.length ?? 0;
}

export default function RoutePanel({ routes, selectedRouteIndex, onSelect }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-auto flex max-h-[calc(100vh-9.5rem)] w-[min(430px,calc(100vw-1.5rem))] flex-col gap-4"
    >
      <SafeRoutePanel />

      <div className="glass-map min-h-0 flex-1 overflow-hidden rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <div className="border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,20,34,0.92),rgba(5,5,5,0.74))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-400/16 bg-cyan-500/10 p-2.5 text-cyan-300">
                  <RouteIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-2xl tracking-tight text-[#f0f4ff]">Route intelligence</div>
                  <div className="mt-1 text-sm text-[#f0f4ff]/45">
                    Compare stress, travel time, and hazard exposure before you roll.
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#f0f4ff]/45">
              {routes.length ? `${routes.length} options` : "Planning"}
            </div>
          </div>
        </div>

        <div className="h-full min-h-0 space-y-4 overflow-y-auto p-5">
          {!routes.length ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-400/16 bg-emerald-500/10 p-3 text-emerald-300">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-xl text-[#f0f4ff]">Ready to plan</div>
                  <div className="mt-1 text-sm text-[#f0f4ff]/46">
                    Pick a start and destination to generate alternate routes with stress scoring.
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-[#f0f4ff]/62">
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-300" />
                    Live calmest-route ranking
                  </div>
                </div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    Nearby hazard counts from backend intelligence
                  </div>
                </div>
                <div className="rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-cyan-300" />
                    Synchronized route highlighting on the live map
                  </div>
                </div>
              </div>
            </div>
          ) : (
            routes.map((route, index) => {
              const risk = classifyRouteRisk(route);
              const style = riskStyles[risk];
              const hazards = getHazardCount(route);
              const active = index === selectedRouteIndex;

              return (
                <motion.button
                  key={route.id ?? `${risk}-${index}`}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  onClick={() => onSelect(index)}
                  className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                    active
                      ? `${style.card} shadow-[0_24px_45px_rgba(0,0,0,0.28)] ring-1 ring-white/12`
                      : "border-white/8 bg-white/[0.03] opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl tracking-tight text-[#f0f4ff]">
                        {getRouteTitle(route, index, routes)}
                      </div>
                      <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${style.badge}`}>
                        {style.label}
                      </div>
                    </div>
                    <div className={`font-mono text-3xl ${style.text}`}>{route.stress_score}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/6 bg-black/16 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[#f0f4ff]/34">Distance</div>
                      <div className="mt-2 font-mono text-base text-[#f0f4ff]">{formatDistance(route.distance_meters)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-black/16 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[#f0f4ff]/34">Duration</div>
                      <div className="mt-2 font-mono text-base text-[#f0f4ff]">{formatDuration(route.duration_seconds)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-black/16 px-3 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[#f0f4ff]/34">Stress Score</div>
                      <div className={`mt-2 font-mono text-base ${style.text}`}>{route.stress_score}/100</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/6 bg-black/16 px-3 py-3 text-sm text-[#f0f4ff]/64">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${style.text}`} />
                      Hazard intel
                    </div>
                    <div className="font-mono text-[#f0f4ff]">{hazards} nearby</div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </motion.aside>
  );
}
