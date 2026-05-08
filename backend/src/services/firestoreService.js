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

const db = require('../config/firebase');

const COLLECTION = "reports";

/**
 * Save a report to Firestore
 * @param {Object} report - Report data
 * @returns {string} - Document ID
 */
const saveReport = async (report) => {
  const docRef = await db.collection(COLLECTION).add(report);
  return docRef.id;
};

/**
 * Get all reports from Firestore
 * @returns {Array} - Array of reports
 */
const getAllReports = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  const reports = [];
  snapshot.forEach(doc => {
    reports.push({ id: doc.id, ...doc.data() });
  });
  return reports;
};

/**
 * Get report by ID
 * @param {string} id - Report ID
 * @returns {Object|null} - Report data or null
 */
const getReportById = async (id) => {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  }
  return null;
};

module.exports = {
  saveReport,
  getAllReports,
  getReportById
};