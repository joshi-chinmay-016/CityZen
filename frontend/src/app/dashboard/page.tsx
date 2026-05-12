"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MapPin,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricCardProps = {
  icon: typeof AlertTriangle;
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
  tone: string;
  index: number;
};

type TrendRow = {
  label: string;
  potholes: number;
  manholes: number;
  cracks: number;
};

const trendData: Record<"24h" | "7d" | "30d", TrendRow[]> = {
  "24h": [
    { label: "00:00", potholes: 34, manholes: 18, cracks: 12 },
    { label: "04:00", potholes: 28, manholes: 14, cracks: 10 },
    { label: "08:00", potholes: 48, manholes: 24, cracks: 18 },
    { label: "12:00", potholes: 62, manholes: 29, cracks: 22 },
    { label: "16:00", potholes: 74, manholes: 34, cracks: 25 },
    { label: "20:00", potholes: 59, manholes: 27, cracks: 19 },
  ],
  "7d": [
    { label: "Mon", potholes: 198, manholes: 92, cracks: 70 },
    { label: "Tue", potholes: 216, manholes: 106, cracks: 75 },
    { label: "Wed", potholes: 244, manholes: 116, cracks: 81 },
    { label: "Thu", potholes: 238, manholes: 110, cracks: 84 },
    { label: "Fri", potholes: 278, manholes: 124, cracks: 88 },
    { label: "Sat", potholes: 301, manholes: 138, cracks: 99 },
    { label: "Sun", potholes: 266, manholes: 120, cracks: 90 },
  ],
  "30d": [
    { label: "W1", potholes: 812, manholes: 390, cracks: 286 },
    { label: "W2", potholes: 854, manholes: 402, cracks: 301 },
    { label: "W3", potholes: 908, manholes: 446, cracks: 322 },
    { label: "W4", potholes: 962, manholes: 472, cracks: 336 },
  ],
};

const pieData = [
  { name: "Potholes", value: 54, color: "#ef4444" },
  { name: "Manholes", value: 27, color: "#f59e0b" },
  { name: "Cracks", value: 19, color: "#63b3ed" },
];

const zones = [
  { name: "Silk Board – Koramangala", count: 138, value: 87, color: "#ef4444" },
  { name: "MG Road – Brigade Rd", count: 102, value: 72, color: "#f59e0b" },
  { name: "Whitefield Main Road", count: 84, value: 61, color: "#eab308" },
  { name: "Hebbal Flyover", count: 63, value: 48, color: "#f59e0b" },
  { name: "JP Nagar Phase 3", count: 34, value: 34, color: "#10b981" },
];

const feed = [
  { location: "MG Road", type: "Pothole", severity: "Critical", time: "2m ago", color: "bg-red-400", badge: "bg-red-500/12 text-red-200 border-red-400/18" },
  { location: "Koramangala 5th Block", type: "Manhole", severity: "High", time: "6m ago", color: "bg-amber-400", badge: "bg-amber-500/12 text-amber-200 border-amber-400/18" },
  { location: "Indiranagar 100 Ft Rd", type: "Crack", severity: "Medium", time: "11m ago", color: "bg-sky-400", badge: "bg-sky-500/12 text-sky-200 border-sky-400/18" },
  { location: "Silk Board Junction", type: "Pothole", severity: "Critical", time: "16m ago", color: "bg-red-400", badge: "bg-red-500/12 text-red-200 border-red-400/18" },
  { location: "Whitefield", type: "Manhole", severity: "High", time: "23m ago", color: "bg-amber-400", badge: "bg-amber-500/12 text-amber-200 border-amber-400/18" },
  { location: "HSR Layout", type: "Crack", severity: "Low", time: "34m ago", color: "bg-sky-400", badge: "bg-sky-500/12 text-sky-200 border-sky-400/18" },
];

function MetricCard({ icon: Icon, title, value, delta, positive = true, tone, index }: MetricCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="glass-card rounded-[28px] p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl border px-3 py-3 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
            positive
              ? "border-emerald-400/16 bg-emerald-500/10 text-emerald-200"
              : "border-red-400/16 bg-red-500/10 text-red-200"
          }`}
        >
          {positive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{delta}</span>
        </div>
      </div>
      <div className="mt-7 font-mono text-4xl text-white">{value}</div>
      <div className="mt-2 text-sm text-white/48">{title}</div>
    </motion.div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#080808]/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="text-xs uppercase tracking-[0.22em] text-white/38">{label}</div>
      <div className="mt-3 space-y-2 text-sm">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-white/60">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-mono text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<keyof typeof trendData>("24h");
  const gaugeRef = useRef<HTMLDivElement | null>(null);
  const gaugeInView = useInView(gaugeRef, { once: true, margin: "-80px" });
  const zonesRef = useRef<HTMLDivElement | null>(null);
  const zonesInView = useInView(zonesRef, { once: true, margin: "-80px" });
  const gaugeValue = 43;
  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference - (gaugeValue / 100) * circumference;
  const chartData = trendData[range].map((row) => ({
    label: row.label,
    Potholes: row.potholes,
    Manholes: row.manholes,
    Cracks: row.cracks,
  }));

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-32 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-white/36">Analytics · Bangalore</div>
            <h1 className="mt-4 font-display text-5xl tracking-[-0.04em] text-white">City Dashboard</h1>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/16 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>Last 24 Hours</span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={AlertTriangle} title="Total hazards" value="2,847" delta="+34" tone="border-emerald-400/16 bg-emerald-500/10 text-emerald-300" index={0} />
          <MetricCard icon={Activity} title="Reports today" value="184" delta="+12%" tone="border-cyan-400/16 bg-cyan-500/10 text-cyan-300" index={1} />
          <MetricCard icon={Zap} title="Avg stress score" value="43.2" delta="-2.1" positive={false} tone="border-amber-400/16 bg-amber-500/10 text-amber-300" index={2} />
          <MetricCard icon={TrendingUp} title="Routes generated" value="6,140" delta="+8%" tone="border-violet-400/16 bg-violet-500/10 text-violet-300" index={3} />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <div className="glass-card rounded-[30px] p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.28em] text-white/36">Traffic intelligence</div>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-white">Reports over time</h2>
              </div>
              <div className="inline-flex rounded-full border border-white/8 bg-white/[0.03] p-1">
                {(["24h", "7d", "30d"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRange(item)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      range === item
                        ? "bg-emerald-500 text-black"
                        : "text-white/42 hover:text-white/72"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="potholesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="manholesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cracksFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#ffffff55" />
                  <YAxis tickLine={false} axisLine={false} stroke="#ffffff55" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Potholes" name="Potholes" stroke="#ef4444" fill="url(#potholesFill)" />
                  <Area type="monotone" dataKey="Manholes" name="Manholes" stroke="#f59e0b" fill="url(#manholesFill)" />
                  <Area type="monotone" dataKey="Cracks" name="Cracks" stroke="#63b3ed" fill="url(#cracksFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-5">
            <div ref={gaugeRef} className="glass-card rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.28em] text-white/36">Stress gauge</div>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-white">Network pressure</h2>
              <div className="mt-6 flex justify-center">
                <div className="relative h-48 w-48">
                  <svg className="-rotate-90" width="192" height="192" viewBox="0 0 192 192">
                    <circle cx="96" cy="96" r="72" stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" />
                    <circle
                      cx="96"
                      cy="96"
                      r="72"
                      stroke="rgba(16,185,129,0.18)"
                      strokeWidth="20"
                      fill="none"
                      className="blur-[8px]"
                      strokeDasharray={circumference}
                      strokeDashoffset={gaugeInView ? dashOffset : circumference}
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="72"
                      stroke="#10b981"
                      strokeWidth="14"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: gaugeInView ? dashOffset : circumference }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      strokeDasharray={circumference}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-5xl text-white">43</div>
                    <div className="text-sm text-white/42">/100</div>
                    <div className="mt-2 rounded-full border border-emerald-400/18 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                      Safe
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-white/58">
                <div className="flex items-center justify-between">
                  <span>54% Potholes</span>
                  <span className="font-mono text-red-300">54%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>27% Manholes</span>
                  <span className="font-mono text-amber-300">27%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>19% Cracks</span>
                  <span className="font-mono text-sky-300">19%</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[30px] p-6">
              <div className="text-sm uppercase tracking-[0.28em] text-white/36">Distribution</div>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-white">Hazard types</h2>
              <div className="mt-6 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={54} outerRadius={82} paddingAngle={3}>
                      {pieData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#090909", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 text-sm text-white/58">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-mono text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div ref={zonesRef} className="glass-card rounded-[30px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-white/36">Hotspots</div>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white">Danger zones</h2>
            <div className="mt-8 space-y-5">
              {zones.map((zone, index) => (
                <div key={zone.name}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-white">{zone.name}</div>
                      <div className="text-sm text-white/42">{zone.count} hazards indexed</div>
                    </div>
                    <div className="font-mono text-white">{zone.value}%</div>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={zonesInView ? { width: `${zone.value}%` } : undefined}
                      transition={{ duration: 0.9, delay: index * 0.08, ease: "easeOut" }}
                      className="h-2.5 rounded-full"
                      style={{ backgroundColor: zone.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.28em] text-white/36">Incident stream</div>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-white">Live feed</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/16 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {feed.map((item) => (
                <div
                  key={`${item.location}-${item.time}`}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-black/18 px-4 py-4 transition-all duration-200 hover:translate-x-1 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <div>
                      <div className="text-white">{item.location}</div>
                      <div className="text-sm text-white/42">{item.type}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className={`rounded-full border px-2.5 py-1 text-xs ${item.badge}`}>{item.severity}</div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs text-white/48">
                      <Clock className="h-3 w-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
              <Eye className="h-4 w-4" />
              View all reports
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
