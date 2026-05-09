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

const firestoreService = require('./firestoreService');

/**
 * Intensity mapping for severity levels.
 * Used to convert hazard severity into heatmap visualization intensity (0-1).
 */
const SEVERITY_INTENSITY_MAP = {
  low: 0.3,
  medium: 0.6,
  high: 1.0
};

/**
 * Heatmap Intelligence Service
 * 
 * Provides lightweight heatmap data for frontend map visualization.
 * Converts normalized Firestore reports into [latitude, longitude, intensity] format.
 * 
 * Used by:
 * - Live danger zone visualization
 * - Risk area highlighting
 * - Route stress visualization
 */
const heatmapService = {
  /**
   * Fetches heatmap-ready data for frontend visualization.
   * 
   * @returns {Promise<Array>} Array of [latitude, longitude, intensity] tuples
   * 
   * @example
   * const heatmapData = await getHeatmapData();
   * // Returns: [[12.91, 77.60, 0.8], [12.92, 77.61, 0.4], ...]
   */
  getHeatmapData: async () => {
    try {
      // Fetch normalized reports from Firestore intelligence layer.
      const reports = await firestoreService.getAllReports();

      // Convert reports into [latitude, longitude, intensity] for frontend rendering.
      const heatmapData = reports
        .filter((report) => {
          // Ignore reports with invalid or missing coordinates.
          const lat = Number(report.latitude ?? report.lat);
          const lng = Number(report.longitude ?? report.lng);
          return Number.isFinite(lat) && Number.isFinite(lng);
        })
        .map((report) => {
          const latitude = Number(report.latitude ?? report.lat);
          const longitude = Number(report.longitude ?? report.lng);
          const severity = String(report.severity || 'medium').toLowerCase();
          const intensity = SEVERITY_INTENSITY_MAP[severity] ?? 0.6;

          return [latitude, longitude, intensity];
        });

      return heatmapData;
    } catch (error) {
      console.error('Error fetching heatmap data:', error.message);
      throw new Error('Failed to fetch heatmap data');
    }
  }
};

module.exports = heatmapService;
