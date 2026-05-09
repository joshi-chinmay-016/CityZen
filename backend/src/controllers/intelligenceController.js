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
const firestoreService = require('../services/firestoreService');
const { calculateStress, getGridKey, STRESS_WEIGHTS } = require('../utils/helpers');
const { calculateDistance, isWithinRadius } = require('../utils/distanceCalculator');
const axios = require('axios');

const intelligenceController = {
  /**
   * Temporary endpoint for testing geographic distance utilities.
   * 
   * Expected body:
   * {
   *   "pointA": [lat, lng],
   *   "pointB": [lat, lng],
   *   "radius": 100
   * }
   */
  testDistanceCalculation: async (req, res) => {
    try {
      const { pointA, pointB, radius } = req.body;

      // Validate required inputs before performing distance calculations.
      if (!Array.isArray(pointA) || !Array.isArray(pointB)) {
        return res.status(400).json({
          error: 'pointA and pointB must be arrays in [lat, lng] format'
        });
      }

      if (pointA.length !== 2 || pointB.length !== 2) {
        return res.status(400).json({
          error: 'pointA and pointB must each contain exactly two values'
        });
      }

      if (typeof radius !== 'number' || !Number.isFinite(radius) || radius < 0) {
        return res.status(400).json({
          error: 'radius must be a non-negative number'
        });
      }

      const [latA, lngA] = pointA;
      const [latB, lngB] = pointB;

      if (
        typeof latA !== 'number' ||
        typeof lngA !== 'number' ||
        typeof latB !== 'number' ||
        typeof lngB !== 'number'
      ) {
        return res.status(400).json({
          error: 'pointA and pointB values must be numbers'
        });
      }

      // Calculate the distance and radius check using the geographic utility.
      const distance = calculateDistance(latA, lngA, latB, lngB);
      const withinRadius = isWithinRadius(latA, lngA, latB, lngB, radius);

      return res.status(200).json({
        distance_meters: distance,
        within_radius: withinRadius
      });
    } catch (error) {
      console.error('Distance calculation test failed:', error.message);
      return res.status(500).json({
        error: 'Failed to test distance calculation'
      });
    }
  },

  /**
   * Analytics intelligence endpoint for dashboard visualization.
   * 
   * Returns aggregated statistics about hazard reports including:
   * - total count of reports
   * - distribution by hazard type
   * - distribution by severity level
   * - most commonly reported hazard
   * 
   * @route GET /api/intelligence/analytics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Analytics data object
   */
  getAnalytics: async (req, res) => {
    try {
      // Fetch analytics data from Firestore intelligence layer.
      const analyticsData = await firestoreService.getAnalyticsData();

      // Derive the most common hazard from the distribution.
      let mostCommonHazard = null;
      if (analyticsData.hazard_distribution && Object.keys(analyticsData.hazard_distribution).length > 0) {
        mostCommonHazard = Object.keys(analyticsData.hazard_distribution).reduce((a, b) =>
          analyticsData.hazard_distribution[a] > analyticsData.hazard_distribution[b] ? a : b
        );
      }

      // Return analytics response with additional computed fields.
      return res.status(200).json({
        total_reports: analyticsData.total_reports,
        hazard_distribution: analyticsData.hazard_distribution,
        severity_distribution: analyticsData.severity_distribution,
        most_common_hazard: mostCommonHazard
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error.message);
      return res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  },

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
