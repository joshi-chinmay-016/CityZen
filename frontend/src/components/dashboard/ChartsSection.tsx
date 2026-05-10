"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import Loader from "@/components/common/Loader";
import { Toast } from "@/components/ui/Toast";

const COLORS = ["#06b6d4", "#6366f1", "#f43f5e", "#f59e0b"];
const SEVERITY_COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#9f1239"];

export default function ChartsSection() {
  const { analytics, isLoading, error } = useAnalytics();

  useEffect(() => {
    if (error) {
      // Avoid spamming toasts if it fails consistently, but handle it gracefully
      console.error(error);
    }
  }, [error]);

  if (isLoading && !analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Loader type="card" className="lg:col-span-2 h-[300px]" />
        <Loader type="card" className="h-[300px]" />
        <Loader type="card" className="lg:col-span-3 h-[250px]" />
      </div>
    );
  }

  const timeData = analytics?.reportsOverTime || [
    { name: "Mon", reports: 4000 },
    { name: "Tue", reports: 3000 },
    { name: "Wed", reports: 2000 },
    { name: "Thu", reports: 2780 },
    { name: "Fri", reports: 1890 },
    { name: "Sat", reports: 2390 },
    { name: "Sun", reports: 3490 },
  ];

  const hazardData = analytics?.hazardDistribution || [
    { name: "Potholes", value: 400 },
    { name: "Cracks", value: 300 },
    { name: "Debris", value: 300 },
    { name: "Faded Lines", value: 200 },
  ];

  const severityData = analytics?.severityDistribution || [
    { name: "Low", value: 120 },
    { name: "Medium", value: 250 },
    { name: "High", value: 380 },
    { name: "Critical", value: 90 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reports Over Time - Line/Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Reports Over Time</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="reports" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Hazard Distribution - Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Hazard Distribution</h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hazardData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {hazardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Severity Distribution - Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="lg:col-span-3 p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Severity Distribution</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                cursor={{ fill: '#334155', opacity: 0.4 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
