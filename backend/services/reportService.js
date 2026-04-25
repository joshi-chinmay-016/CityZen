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
