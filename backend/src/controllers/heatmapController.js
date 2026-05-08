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

const heatmapController = {
  getHeatmap: async (req, res) => {
    try {
      const data = await heatmapService.getHeatmapData();
      res.json(data);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = heatmapController;
