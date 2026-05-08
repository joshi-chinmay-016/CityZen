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

const reportService = require('../services/reportService');
const { validateReportPayload, ALLOWED_REPORT_TYPES } = require('../validators/reportValidator');

const reportController = {
  createReport: async (req, res) => {
    try {
      const validationError = validateReportPayload(req.body);
      if (validationError) {
        return res.status(400).json({
          error: validationError,
          allowedTypes: ALLOWED_REPORT_TYPES
        });
      }

      const { lat, lng, type } = req.body;
      const docRef = await reportService.createReport({ lat, lng, type });
      return res.json({ id: docRef.id });
    } catch (err) {
      console.error("Error adding report:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getReports: async (req, res) => {
    try {
      const reports = await reportService.getAllReports();
      return res.json(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = reportController;
