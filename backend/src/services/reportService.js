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

const firestoreService = require('./firestoreService');

const COLLECTION = 'reports';

const reportService = {
  createReport: async (reportData) => {
    return await firestoreService.add(COLLECTION, reportData);
  },

  getAllReports: async () => {
    return await firestoreService.getAll(COLLECTION);
  }
};

module.exports = reportService;
