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
const router = express.Router();
const { getHeatmap } = require('../controllers/heatmapController');

/**
 * Heatmap API route
 * GET /api/heatmap
 * 
 * Returns danger zone intensity data for frontend map visualization.
 * Response format: [[latitude, longitude, intensity], ...]
 */
router.get('/', getHeatmap);

module.exports = router;
