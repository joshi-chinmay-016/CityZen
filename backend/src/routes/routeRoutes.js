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
const { getRouteStress } = require('../controllers/routeController');

const router = express.Router();

/**
 * POST /route-stress
 * Analyze route stress
 */
router.post('/route-stress', async (req, res) => {
  try {
    const data = await getRouteStress(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze route stress' });
  }
});

module.exports = router;