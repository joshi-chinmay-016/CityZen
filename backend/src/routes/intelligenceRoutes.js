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
const intelligenceController = require('../controllers/intelligenceController');
const { testDistanceCalculation } = require('../controllers/intelligenceController');

router.get('/test', (req, res) => {
  res.json({ message: 'Intelligence route working' });
});

/**
 * Temporary endpoint for testing geographic distance calculations.
 * POST /api/intelligence/test-distance
 */
router.post('/test-distance', testDistanceCalculation);

router.post('/simulate', intelligenceController.simulate);
router.get('/stress', intelligenceController.getStress);
router.get('/area-stress', intelligenceController.getAreaStress);

module.exports = router;
