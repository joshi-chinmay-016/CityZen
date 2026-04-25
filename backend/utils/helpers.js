const STRESS_WEIGHTS = {
	traffic: 3,
	pothole: 2,
	safety: 4
};

function calculateStress(reports = []) {
	if (reports.length === 0) {
		return 0;
	}

	return reports.reduce((total, report) => total + (STRESS_WEIGHTS[report.type] || 0), 0);
}

function getGridKey(lat, lng) {
	const latKey = Number(lat).toFixed(2);
	const lngKey = Number(lng).toFixed(2);

	return `${latKey}_${lngKey}`;
}

module.exports = { calculateStress, getGridKey };

// console.log(
//   calculateStress([
//     { type: "traffic" },
//     { type: "pothole" },
//     { type: "safety" }
//   ])
// );
