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

const heatmapService = require('../services/heatmapService');

/**
 * Heatmap Controller
 * 
 * Handles heatmap API requests for frontend map visualization.
 * Returns danger zone intensity data for live risk rendering.
 */
const heatmapController = {
  /**
   * Fetches heatmap data for frontend visualization.
   * 
   * Returns strict contract:
   * [
   *   [latitude, longitude, intensity],
   *   ...
   * ]
   * 
   * Where intensity ranges from 0 (low) to 1.0 (high).
   * 
   * @route GET /api/heatmap
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Array} Heatmap data array
   */
  getHeatmap: async (req, res) => {
    try {
      // Fetch heatmap data from intelligence layer.
      const heatmapData = await heatmapService.getHeatmapData();

      // Return frontend contract directly: [[lat,lng,intensity], ...]
      return res.status(200).json(heatmapData);
    } catch (error) {
      console.error('Error fetching heatmap:', error.message);
      return res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
  }
};

module.exports = heatmapController;
