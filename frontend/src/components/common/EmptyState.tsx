"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ 
  icon: Icon = Search, 
  title, 
  message, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`w-full flex flex-col items-center justify-center p-12 text-center bg-slate-800/20 border border-slate-700/30 rounded-2xl border-dashed ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 shadow-lg">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold rounded-xl border border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
