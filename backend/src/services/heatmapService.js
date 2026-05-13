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
    return await firestoreService.getHeatmapData();
  }
};

module.exports = heatmapService;
