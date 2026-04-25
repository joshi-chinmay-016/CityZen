const express = require('express');
const axios = require('axios');
const { getReports } = require('../services/reportService');
const { calculateStress, getGridKey } = require('../utils/helpers');

const STRESS_WEIGHTS = {
	traffic: 3,
	pothole: 2,
	safety: 4
};

const router = express.Router();

router.get('/test', (req, res) => {
	res.json({ message: 'Intelligence route working' });
});

router.post('/simulate', async (req, res) => {
	try {
		const { lat, lng } = req.body;

		if (typeof lat !== 'number' || typeof lng !== 'number') {
			return res.status(400).json({ message: 'lat and lng must be numbers' });
		}

		const timestamp = new Date().toISOString();
		const fakeReports = [
			{
				lat,
				lng,
				type: 'traffic',
				timestamp
			},
			{
				lat: lat + 0.001,
				lng: lng + 0.001,
				type: 'traffic',
				timestamp
			},
			{
				lat: lat - 0.001,
				lng: lng - 0.001,
				type: 'pothole',
				timestamp
			}
		];

		await Promise.all(
			fakeReports.map((report) => axios.post('http://localhost:5000/report', report))
		);

		res.json({ message: 'Simulation completed' });
	} catch (error) {
		console.error('Simulation failed:', error.message);
		res.status(500).json({ message: 'Simulation failed' });
	}
});

router.get('/stress', async (req, res) => {
	try {
		const reports = await getReports();
		const safeReports = Array.isArray(reports) ? reports : [];
		const stress = calculateStress(safeReports);

		res.json({ stress });
	} catch (error) {
		res.status(500).json({ stress: 0 });
	}
});

router.get('/area-stress', async (req, res) => {
	try {
		const reports = await getReports();
		const safeReports = Array.isArray(reports) ? reports : [];
		const areaStressMap = new Map();

		for (const report of safeReports) {
			const areaKey = getGridKey(report.lat, report.lng);
			const weight = STRESS_WEIGHTS[report.type] || 0;
			const currentStress = areaStressMap.get(areaKey) || 0;

			areaStressMap.set(areaKey, currentStress + weight);
		}

		const areaStress = Array.from(areaStressMap, ([area, stress]) => ({ area, stress }));

		res.json(areaStress);
	} catch (error) {
		res.status(500).json([]);
	}
});

module.exports = router;
