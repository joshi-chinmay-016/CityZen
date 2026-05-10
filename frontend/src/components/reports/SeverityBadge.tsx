import React from "react";

type Severity = "Low" | "Medium" | "High" | "Critical";

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
}

export default function SeverityBadge({ severity, className = "" }: SeverityBadgeProps) {
  let styleClasses = "bg-slate-500/20 text-slate-400 border-slate-500/30";

  switch (severity.toLowerCase()) {
    case "critical":
      styleClasses = "bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
      break;
    case "high":
      styleClasses = "bg-orange-500/20 text-orange-400 border-orange-500/30";
      break;
    case "medium":
      styleClasses = "bg-amber-500/20 text-amber-400 border-amber-500/30";
      break;
    case "low":
      styleClasses = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      break;
  }

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${styleClasses} ${className}`}
    >
      {severity}
    </span>
  );
}
