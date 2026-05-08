/*
====================================================
OWNER: Vishal
MODULE: Backend Logic & APIs

RESPONSIBILITIES:
- Express APIs
- Route Stress Engine
- Firestore Integration
- OSRM Integration
- Backend Services
====================================================
*/

const reportService = require('./reportService');
const { getGridKey, STRESS_WEIGHTS } = require('../utils/helpers');

const heatmapService = {
  getHeatmapData: async () => {
    const reports = await reportService.getAllReports();
    const heatmapMap = new Map();

    reports.forEach(report => {
      const key = getGridKey(report.lat, report.lng);
      const weight = STRESS_WEIGHTS[report.type] || 1;
      const current = heatmapMap.get(key) || { lat: report.lat, lng: report.lng, intensity: 0 };
      current.intensity += weight;
      heatmapMap.set(key, current);
    });

    return Array.from(heatmapMap.values());
  }
};

module.exports = heatmapService;
