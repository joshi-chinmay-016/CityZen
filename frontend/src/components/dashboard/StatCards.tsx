"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Route, AlertTriangle } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import Loader from "@/components/common/Loader";
import { Toast } from "@/components/ui/Toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StatCards() {
  const { analytics, isLoading, error } = useAnalytics();

  useEffect(() => {
    if (error) {
      Toast.error("Analytics Error", error);
    }
  }, [error]);

  if (isLoading && !analytics) {
    return <Loader type="card" count={4} />;
  }

  // Fallback to dummy data if API returns null/error to preserve the MVP hackathon demo UI
  const statsData = analytics?.stats || {
    totalReports: 14234,
    totalReportsChange: "+12.5%",
    highSeverityHazards: 1842,
    highSeverityChange: "-4.2%",
    safeRoutesGenerated: 84500,
    safeRoutesChange: "+24.1%",
    averageStressScore: 3.2,
    averageStressChange: "-1.1",
  };

  const formattedStats = [
    {
      title: "Total Reports",
      value: statsData.totalReports.toLocaleString(),
      change: statsData.totalReportsChange,
      trend: statsData.totalReportsChange.startsWith("+") ? "up" : "down",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "High Severity Hazards",
      value: statsData.highSeverityHazards.toLocaleString(),
      change: statsData.highSeverityChange,
      trend: statsData.highSeverityChange.startsWith("-") ? "down" : "up", // Less hazards is 'down' but good
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "Safe Routes Generated",
      value: statsData.safeRoutesGenerated > 1000 ? `${(statsData.safeRoutesGenerated / 1000).toFixed(1)}K` : statsData.safeRoutesGenerated.toString(),
      change: statsData.safeRoutesChange,
      trend: statsData.safeRoutesChange.startsWith("+") ? "up" : "down",
      icon: Route,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Average Stress Score",
      value: `${statsData.averageStressScore}/10`,
      change: statsData.averageStressChange,
      trend: statsData.averageStressChange.startsWith("-") ? "down" : "up",
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {formattedStats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          className={`p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border ${stat.border} hover:bg-slate-800/60 transition-colors`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span
              className={`text-sm font-medium ${
                // Special logic: trend "down" is good for Hazards and Stress, so it should be green. trend "up" is good for Reports and Routes.
                (idx === 1 || idx === 3) 
                  ? (stat.trend === "down" ? "text-emerald-400" : "text-rose-400")
                  : (stat.trend === "up" ? "text-emerald-400" : "text-rose-400")
              }`}
            >
              {stat.change}
            </span>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
