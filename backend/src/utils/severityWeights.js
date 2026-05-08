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

// Severity weights for different report types
const SEVERITY_WEIGHTS = {
  traffic: 3,
  pothole: 2,
  safety: 4
};

/**
 * Get severity weight for a report type
 * @param {string} type - Report type
 * @returns {number} - Weight value
 */
const getSeverityWeight = (type) => {
  return SEVERITY_WEIGHTS[type] || 0;
};

/**
 * Calculate total severity for reports
 * @param {Array} reports - Array of reports
 * @returns {number} - Total severity
 */
const calculateTotalSeverity = (reports) => {
  return reports.reduce((total, report) => {
    return total + getSeverityWeight(report.type);
  }, 0);
};

module.exports = {
  SEVERITY_WEIGHTS,
  getSeverityWeight,
  calculateTotalSeverity
};