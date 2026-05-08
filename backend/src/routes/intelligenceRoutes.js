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
const { testIntelligence, simulateReports, getStress, getAreaStress } = require('../controllers/intelligenceController');

// const axios = require('axios');
// const { getReports } = require('../services/reportService');
// const { calculateStress, getGridKey } = require('../utils/helpers');

// const STRESS_WEIGHTS = {
// 	traffic: 3,
// 	pothole: 2,
// 	safety: 4
// };

const router = express.Router();

router.get('/test', (req, res) => {
	res.json(testIntelligence());
});

router.post('/simulate', async (req, res) => {
	try {
		const result = await simulateReports(req.body);
		res.json(result);
	} catch (error) {
		console.error('Simulation failed:', error.message);
		res.status(500).json({ message: 'Simulation failed' });
	}
});

router.get('/stress', async (req, res) => {
	const result = await getStress();
	res.json(result);
});

router.get('/area-stress', async (req, res) => {
	const result = await getAreaStress();
	res.json(result);
});

module.exports = router;
