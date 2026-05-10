"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useReports } from "@/hooks/useReports";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { FileText } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { Report } from "@/services/reportService";

export default function RecentReportsTable() {
  const { reports, isLoading, error } = useReports();

  useEffect(() => {
    if (error) {
      Toast.error("Reports Error", error);
    }
  }, [error]);

  if (isLoading && reports.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-6">Recent AI Detections</h3>
        <Loader type="table" count={5} />
      </div>
    );
  }

  // Fallback to dummy data if API returns empty array or error (to preserve MVP UI if backend isn't populated)
  const displayReports = reports.length > 0 ? reports : [
    { id: "REP-1042", hazard: "Deep Pothole", severity: "Critical", timestamp: "2 mins ago", confidence: 98, latitude: 0, longitude: 0 },
    { id: "REP-1041", hazard: "Faded Crosswalk", severity: "Medium", timestamp: "15 mins ago", confidence: 85, latitude: 0, longitude: 0 },
    { id: "REP-1040", hazard: "Surface Crack", severity: "Low", timestamp: "1 hour ago", confidence: 92, latitude: 0, longitude: 0 },
    { id: "REP-1039", hazard: "Fallen Debris", severity: "High", timestamp: "3 hours ago", confidence: 88, latitude: 0, longitude: 0 },
    { id: "REP-1038", hazard: "Uneven Surface", severity: "Medium", timestamp: "5 hours ago", confidence: 76, latitude: 0, longitude: 0 },
  ] as Report[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="p-6 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-200">Recent AI Detections</h3>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View All</button>
      </div>

      {displayReports.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="No Reports Found"
          message="There are currently no hazard reports in the system. Check back later or upload a new report."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400">
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 px-4 font-medium">Hazard Type</th>
                <th className="pb-3 px-4 font-medium">Severity</th>
                <th className="pb-3 px-4 font-medium">Confidence</th>
                <th className="pb-3 pl-4 font-medium text-right">Detected</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayReports.slice(0, 5).map((report, idx) => (
                <tr 
                  key={report.id || idx} 
                  className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors last:border-0"
                >
                  <td className="py-4 pr-4 text-slate-500 font-mono text-xs">{report.id}</td>
                  <td className="py-4 px-4 text-slate-200 font-medium">{report.hazard}</td>
                  <td className="py-4 px-4">
                    <SeverityBadge severity={report.severity} className="text-[10px] px-2 py-1" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full" 
                          style={{ width: `${report.confidence || 0}%` }} 
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{report.confidence}%</span>
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-slate-400 text-right whitespace-nowrap">{report.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
