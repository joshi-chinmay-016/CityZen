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

async function getReports() {
	try {
		const response = await axios.get('http://localhost:5000/reports');
		return response.data;
	} catch (error) {
		return [];
	}
}

module.exports = { getReports };
