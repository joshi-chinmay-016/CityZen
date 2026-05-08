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

const reportService = require('../services/reportService');
const { calculateStress, getGridKey, STRESS_WEIGHTS } = require('../utils/helpers');
const axios = require('axios');

const intelligenceController = {
  simulate: async (req, res) => {
    try {
      const { lat, lng } = req.body;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ message: 'lat and lng must be numbers' });
      }

      const timestamp = new Date().toISOString();
      const fakeReports = [
        { lat, lng, type: 'traffic', timestamp },
        { lat: lat + 0.001, lng: lng + 0.001, type: 'traffic', timestamp },
        { lat: lat - 0.001, lng: lng - 0.001, type: 'pothole', timestamp }
      ];

      // Note: In unified architecture, we might want to call reportService directly
      // but for simulation we'll keep the logic of "reporting"
      await Promise.all(
        fakeReports.map((report) => reportService.createReport(report))
      );

      res.json({ message: 'Simulation completed' });
    } catch (error) {
      console.error('Simulation failed:', error.message);
      res.status(500).json({ message: 'Simulation failed' });
    }
  },

  getStress: async (req, res) => {
    try {
      const reports = await reportService.getAllReports();
      const safeReports = Array.isArray(reports) ? reports : [];
      const stress = calculateStress(safeReports);
      res.json({ stress });
    } catch (error) {
      res.status(500).json({ stress: 0 });
    }
  },

  getAreaStress: async (req, res) => {
    try {
      const reports = await reportService.getAllReports();
      const safeReports = Array.isArray(reports) ? reports : [];
      const areaStressMap = new Map();

      for (const report of safeReports) {
        const areaKey = getGridKey(report.lat, report.lng);
        const weight = STRESS_WEIGHTS[report.type] || 0;
        const currentStress = areaStressMap.get(areaKey) || 0;
        areaStressMap.set(areaKey, currentStress + weight);
      }

      const areaStress = Array.from(areaStressMap, ([area, stress]) => ({ area, stress }));
      res.json(areaStress);
    } catch (error) {
      res.status(500).json([]);
    }
  }
};

module.exports = intelligenceController;
