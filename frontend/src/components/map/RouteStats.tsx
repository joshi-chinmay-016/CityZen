"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface RouteStatsProps {
  route: {
    safe: boolean;
    stress_score: number;
    route: any[];
  };
  onCompleteJourney: () => void;
}

export default function RouteStats({
  route,
  onCompleteJourney,
}: RouteStatsProps) {
  const getStressLevel = (score: number) => {
    if (score >= 7)
      return {
        text: "High Stress",
        color: "text-rose-400",
        bg: "bg-rose-500/20",
        border: "border-rose-500/30",
        icon: AlertTriangle,
      };
    if (score >= 4)
      return {
        text: "Moderate Stress",
        color: "text-amber-400",
        bg: "bg-amber-500/20",
        border: "border-amber-500/30",
        icon: Activity,
      };
    return {
      text: "Safe & Low Stress",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/30",
      icon: ShieldCheck,
    };
  };

  const stressLevel = getStressLevel(route.stress_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-3"
    >
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <ShieldCheck className="w-3 h-3 text-cyan-400" /> Path Analysis
      </div>
      <p className="text-xs text-slate-400 leading-relaxed italic">
        "
        {route.safe
          ? "This is a significantly safer path that minimizes exposure to reported hazards and high-stress urban zones."
          : "Attention: This route contains elevated stress segments. Consider the safer alternatives."}
        "
      </p>
      <div className="mt-3 flex items-center gap-4 border-t border-slate-700/30 pt-3">
        <div className="text-center flex-1">
          <div className="text-[10px] text-slate-500 uppercase mb-0.5">
            Checkpoints
          </div>
          <div className="text-xs font-bold text-slate-200">
            {route.route.length}
          </div>
        </div>
        <div className="w-px h-6 bg-slate-700/50" />
        <div className="text-center flex-1">
          <div className="text-[10px] text-slate-500 uppercase mb-0.5">
            Safety Rating
          </div>
          <div className="text-xs font-bold text-emerald-400">
            {(100 - route.stress_score * 10).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Complete Journey Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCompleteJourney}
        className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        <CheckCircle2 className="w-4 h-4" />
        Complete Journey
      </motion.button>
    </motion.div>
  );
}
