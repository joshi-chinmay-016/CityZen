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

const express = require('express');
const { getHeatmap } = require('../controllers/heatmapController');

const router = express.Router();

/**
 * GET /heatmap
 * Get heatmap data
 */
router.get('/heatmap', async (req, res) => {
  try {
    const data = await getHeatmap();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get heatmap data' });
  }
});

module.exports = router;