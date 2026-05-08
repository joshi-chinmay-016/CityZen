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

const { saveReport, getAllReports: getReportsFromDB } = require('../services/firestoreService');
const { validateReport } = require('../validators/reportValidator');

const { REPORT_TYPES } = require('../constants');

const addReport = async (reportData) => {
  // Validate input
  const validation = validateReport(reportData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Add timestamp
  const report = {
    lat: reportData.lat,
    lng: reportData.lng,
    type: reportData.type,
    timestamp: new Date()
  };

  const id = await saveReport(report);
  return { id };
};

/**
 * Get all reports
 * @returns {Array} - Array of reports
 */
const getAllReports = async () => {
  return await getReportsFromDB();
};

module.exports = {
  addReport,
  getAllReports
};