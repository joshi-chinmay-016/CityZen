"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  type?: "card" | "list" | "table" | "text";
  count?: number;
  className?: string;
}

export default function Loader({ type = "card", count = 1, className = "" }: LoaderProps) {
  // Skeleton generic pulse animation
  const skeletonBaseClass = "bg-slate-800/60 rounded-xl overflow-hidden relative border border-slate-700/30";
  
  const SkeletonPulse = () => (
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-700/20 to-transparent"
      animate={{ translateX: ["-100%", "200%"] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  );

  const renderCardSkeleton = (key: number) => (
    <div key={key} className={`${skeletonBaseClass} p-6 h-32 w-full ${className}`}>
      <SkeletonPulse />
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
        <div className="w-16 h-6 rounded-full bg-slate-700/50" />
      </div>
      <div className="mt-4 w-1/3 h-4 rounded-md bg-slate-700/50" />
      <div className="mt-2 w-2/3 h-8 rounded-md bg-slate-700/50" />
    </div>
  );

  const renderListSkeleton = (key: number) => (
    <div key={key} className={`${skeletonBaseClass} p-4 flex items-center gap-4 w-full ${className}`}>
      <SkeletonPulse />
      <div className="w-10 h-10 rounded-full bg-slate-700/50 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-1/2 h-4 rounded-md bg-slate-700/50" />
        <div className="w-3/4 h-3 rounded-md bg-slate-700/30" />
      </div>
    </div>
  );

  const renderTextSkeleton = (key: number) => (
    <div key={key} className={`w-full space-y-2 ${className}`}>
      <div className="w-full h-4 rounded-md bg-slate-800 relative overflow-hidden"><SkeletonPulse /></div>
      <div className="w-5/6 h-4 rounded-md bg-slate-800 relative overflow-hidden"><SkeletonPulse /></div>
      <div className="w-4/6 h-4 rounded-md bg-slate-800 relative overflow-hidden"><SkeletonPulse /></div>
    </div>
  );

  const elements = Array.from({ length: count });

  return (
    <div className={`flex flex-col gap-4 w-full ${type === "card" && count > 1 ? "md:grid md:grid-cols-2 lg:grid-cols-4" : ""}`}>
      {elements.map((_, idx) => {
        if (type === "card") return renderCardSkeleton(idx);
        if (type === "list" || type === "table") return renderListSkeleton(idx);
        if (type === "text") return renderTextSkeleton(idx);
        return null;
      })}
    </div>
  );
}
