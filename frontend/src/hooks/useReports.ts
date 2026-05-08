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

import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import type { Report } from '../types';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return { reports, loading, refresh: fetchReports };
};
