/*
====================================================
OWNER: Sushanth
MODULE: Maps & Route Visualization

RESPONSIBILITIES:
- Map Rendering
- Heatmaps
- Route Visualization
- Current Location Tracking
- Report Markers
====================================================
*/

import { useState, useEffect } from "react";
import { reportService } from "../services/reportService";
import type { HazardReport } from "../types/report";

export const useReports = () => {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    refresh: fetchReports,
  };
};