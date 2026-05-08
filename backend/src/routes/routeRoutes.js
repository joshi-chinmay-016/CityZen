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
const routeController = require('../controllers/routeController');

router.post('/safe-route', routeController.getSafeRoute);

module.exports = router;
