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
const heatmapController = require('../controllers/heatmapController');

router.get('/', heatmapController.getHeatmap);

module.exports = router;
