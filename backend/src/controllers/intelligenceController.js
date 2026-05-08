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

const axios = require('axios');
const { getReports } = require('../services/reportService');
const { calculateStress, getGridKey } = require('../utils/helpers');
const { SEVERITY_WEIGHTS } = require('../utils/severityWeights');

/**
 * Test endpoint
 * @returns {Object} - { message }
 */
const testIntelligence = () => {
	return { message: 'Intelligence route working' };
};

/**
 * Simulate reports
 * @param {Object} params - { lat, lng }
 * @returns {Object} - { message }
 */
const simulateReports = async (params) => {
	const { lat, lng } = params;

	if (typeof lat !== 'number' || typeof lng !== 'number') {
		throw new Error('lat and lng must be numbers');
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

	return { message: 'Simulation completed' };
};

/**
 * Get overall stress
 * @returns {Object} - { stress }
 */
const getStress = async () => {
	try {
		const reports = await getReports();
		const safeReports = Array.isArray(reports) ? reports : [];
		const stress = calculateStress(safeReports);
		return { stress };
	} catch (error) {
		return { stress: 0 };
	}
};

/**
 * Get area stress map
 * @returns {Array} - Array of { area, stress }
 */
const getAreaStress = async () => {
	try {
		const reports = await getReports();
		const safeReports = Array.isArray(reports) ? reports : [];
		const areaStressMap = new Map();

		for (const report of safeReports) {
			const areaKey = getGridKey(report.lat, report.lng);
			const weight = SEVERITY_WEIGHTS[report.type] || 0;
			const currentStress = areaStressMap.get(areaKey) || 0;

			areaStressMap.set(areaKey, currentStress + weight);
		}

		const areaStress = Array.from(areaStressMap, ([area, stress]) => ({ area, stress }));

		return areaStress;
	} catch (error) {
		return [];
	}
};

module.exports = {
	testIntelligence,
	simulateReports,
	getStress,
	getAreaStress
};