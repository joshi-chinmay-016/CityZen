"use client";

import { motion } from "framer-motion";
import { Activity, AlertTriangle, CircleDashed, ScanSearch, Waves } from "lucide-react";
import { AnalyticsData } from "@/services/analyticsService";

type Props = {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  routeCount: number;
};

const statConfig = [
  {
    key: "potholes",
    label: "Potholes",
    icon: AlertTriangle,
    accent: "text-rose-300",
    border: "border-rose-400/14",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.14)]",
  },
  {
    key: "manholes",
    label: "Manholes",
    icon: CircleDashed,
    accent: "text-amber-300",
    border: "border-amber-400/14",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.14)]",
  },
  {
    key: "cracks",
    label: "Cracks",
    icon: Waves,
    accent: "text-sky-300",
    border: "border-sky-400/14",
    glow: "shadow-[0_0_40px_rgba(56,189,248,0.14)]",
  },
  {
    key: "accuracy",
    label: "Accuracy",
    icon: ScanSearch,
    accent: "text-emerald-300",
    border: "border-emerald-400/14",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.14)]",
  },
] as const;

function buildStats(analytics: AnalyticsData | null, routeCount: number) {
  const hazardDistribution = analytics?.hazardDistribution ?? [];
  const totalHazards = hazardDistribution.reduce((sum, item) => sum + item.value, 0);
  const findCount = (name: string) =>
    hazardDistribution.find((item) => item.name.toLowerCase().includes(name))?.value ?? 0;

  return {
    potholes: findCount("pothole"),
    manholes: findCount("manhole"),
    cracks: findCount("crack"),
    accuracy: analytics ? `${Math.max(86, Math.min(99, 100 - Math.round((analytics.stats.averageStressScore ?? 0) / 7)))}%` : "--",
    totalHazards,
    safeRoutesGenerated: analytics?.stats.safeRoutesGenerated ?? routeCount,
  };
}

export default function StatsPanel({ analytics, isLoading, routeCount }: Props) {
  const stats = buildStats(analytics, routeCount);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35 }}
      className="pointer-events-auto w-[min(360px,calc(100vw-1.5rem))] rounded-[28px] border border-white/6 bg-[rgba(5,5,5,0.88)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-2.5 text-cyan-300">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-2xl tracking-tight text-[#f0f4ff]">City surface monitor</div>
              <div className="mt-1 text-sm text-[#f0f4ff]/45">
                Live hazard density and model confidence around your route space.
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-full border border-emerald-400/16 bg-emerald-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-200">
          {isLoading ? "Syncing" : "Live"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {statConfig.map((item, index) => {
          const Icon = item.icon;
          const value = stats[item.key];
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.05 }}
              className={`rounded-[22px] border ${item.border} bg-white/[0.03] p-4 ${item.glow}`}
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-2xl border border-white/8 bg-black/18 p-2 ${item.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/28">Now</span>
              </div>
              <div className={`mt-4 font-display text-3xl ${item.accent}`}>{isLoading ? "--" : value}</div>
              <div className="mt-1 text-sm text-[#f0f4ff]/54">{item.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#f0f4ff]/34">Hazard legend</div>
        <div className="mt-4 space-y-3 text-sm text-[#f0f4ff]/66">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
              Calm corridor
            </div>
            <span className="text-[#f0f4ff]/42">Monitored</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
              Moderate watch
            </div>
            <span className="text-[#f0f4ff]/42">Review</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-400" />
              Elevated hazard
            </div>
            <span className="text-[#f0f4ff]/42">Alerted</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-white/6 bg-black/18 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#f0f4ff]/32">Hazards tracked</div>
          <div className="mt-2 font-mono text-2xl text-[#f0f4ff]">{isLoading ? "--" : stats.totalHazards}</div>
        </div>
        <div className="rounded-[22px] border border-white/6 bg-black/18 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#f0f4ff]/32">Routes ranked</div>
          <div className="mt-2 font-mono text-2xl text-[#f0f4ff]">{routeCount || stats.safeRoutesGenerated}</div>
        </div>
      </div>
    </motion.aside>
  );
}
