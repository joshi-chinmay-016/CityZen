"use client";

import React from "react";
import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "cyan" | "indigo" | "emerald" | "rose" | "slate";
  className?: string;
}

export default function Spinner({ 
  size = "md", 
  color = "cyan", 
  className = "" 
}: SpinnerProps) {
  
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-[3px]",
    xl: "w-12 h-12 border-4",
  };

  const colorMap = {
    cyan: "border-cyan-500/30 border-t-cyan-500",
    indigo: "border-indigo-500/30 border-t-indigo-500",
    emerald: "border-emerald-500/30 border-t-emerald-500",
    rose: "border-rose-500/30 border-t-rose-500",
    slate: "border-slate-500/30 border-t-slate-500",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className={`rounded-full ${sizeMap[size]} ${colorMap[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
