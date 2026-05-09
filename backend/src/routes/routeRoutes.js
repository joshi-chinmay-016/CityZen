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
const { testRouteGeneration, getSafeRoute } = require('../controllers/routeController');

/**
 * Test endpoint for OSRM route generation
 * POST /api/routes/test-route
 * Body: { "source": [lat, lng], "destination": [lat, lng] }
 */
router.post('/test-route', testRouteGeneration);

/**
 * Safe route calculation with stress analysis
 * POST /api/routes/safe-route
 */
router.post('/safe-route', getSafeRoute);

module.exports = router;
