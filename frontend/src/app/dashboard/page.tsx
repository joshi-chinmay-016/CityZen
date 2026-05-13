"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  Map as MapIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  List
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';

/*
SECTION: Metric Cards
Total Reports, High Severity, Dangerous Zones, Safe Routes Generated
*/
const MetricCard = ({ title, value, change, icon: Icon, color, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</div>
  </motion.div>
);

/* Mock Data for Charts */
const timelineData = [
  { time: '00:00', reports: 120, stress: 45 },
  { time: '04:00', reports: 80, stress: 30 },
  { time: '08:00', reports: 450, stress: 85 },
  { time: '12:00', reports: 380, stress: 70 },
  { time: '16:00', reports: 520, stress: 90 },
  { time: '20:00', reports: 290, stress: 60 },
  { time: '23:59', reports: 150, stress: 40 },
];

const hazardDistData = [
  { name: 'Potholes', value: 45, color: '#10b981' },
  { name: 'Structural', value: 25, color: '#06b6d4' },
  { name: 'Debris', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 15, color: '#64748b' },
];

const severityData = [
  { level: 'LVL 1', count: 450 },
  { level: 'LVL 2', count: 820 },
  { level: 'LVL 3', count: 1250 },
  { level: 'LVL 4', count: 640 },
  { level: 'LVL 5', count: 180 },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">City Intelligence</h1>
            <p className="text-slate-500">Real-time geospatial analytics and urban safety metrics.</p>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-md">
            <Calendar className="text-slate-500 ml-2" size={18} />
            <span className="text-sm font-bold text-white pr-4">Last 24 Hours</span>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Reports" value="12.4k" change="+12%" trend="up" icon={AlertTriangle} color="text-emerald-400" />
          <MetricCard title="High Severity" value="142" change="-5%" trend="down" icon={Activity} color="text-rose-400" />
          <MetricCard title="Danger Zones" value="08" change="+2" trend="up" icon={Layers} color="text-amber-400" />
          <MetricCard title="Routes Served" value="3.2k" change="+24%" trend="up" icon={Navigation} color="text-cyan-400" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Timeline Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-400" size={20} />
                Activity Timeline
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="reports" stroke="#10b981" fillOpacity={1} fill="url(#colorReports)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribution Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
          >
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
              <PieChartIcon className="text-cyan-400" size={20} />
              Hazard Distribution
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hazardDistData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {hazardDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reports Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <List className="text-emerald-400" size={20} />
              Live Feed
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <th className="pb-4">Hazard</th>
                    <th className="pb-4">Severity</th>
                    <th className="pb-4">Confidence</th>
                    <th className="pb-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { type: 'Pothole', lvl: 4, conf: '98%', time: '2m ago', color: 'text-rose-400' },
                    { type: 'Manhole', lvl: 2, conf: '95%', time: '12m ago', color: 'text-amber-400' },
                    { type: 'Crack', lvl: 1, conf: '99%', time: '1h ago', color: 'text-emerald-400' },
                    { type: 'Debris', lvl: 5, conf: '92%', time: '3h ago', color: 'text-rose-600' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50 group hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 font-bold text-white">{row.type}</td>
                      <td className={`py-4 font-bold ${row.color}`}>LVL {row.lvl}</td>
                      <td className="py-4 text-slate-400">{row.conf}</td>
                      <td className="py-4 text-right text-slate-600 font-mono text-xs">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* City Stress Score Gauge Area */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 backdrop-blur-xl text-center"
            >
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-4">Avg City Stress Score</div>
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.64)} className="text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">64</span>
                </div>
              </div>
              <div className="mt-4 text-sm font-bold text-rose-400 uppercase tracking-widest">Moderate Friction</div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">System monitoring indicates increased urban friction in central sectors.</p>
            </motion.div>

            {/* Danger Zones List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="text-rose-400" size={20} />
                Danger Zones
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Koramangala 5th Block', stress: 85, color: 'bg-rose-500' },
                  { name: 'Indiranagar 100ft Rd', stress: 72, color: 'bg-rose-400' },
                  { name: 'Whitefield Main Rd', stress: 64, color: 'bg-amber-500' },
                ].map(zone => (
                  <div key={zone.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-bold">{zone.name}</span>
                      <span className="text-slate-500 font-mono">{zone.stress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${zone.stress}%` }}
                        className={`h-full ${zone.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
