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
const { getAllReports } = require('../services/firestoreService');
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

      const { lat, lng, type, latitude, longitude, hazard, severity, confidence, description, timestamp } = req.body;
      const normalizedTimestamp =
        typeof timestamp === "string" && timestamp.trim()
          ? timestamp
          : new Date().toISOString();

      const reportPayload = {
        lat,
        lng,
        type,
        latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : lat,
        longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : lng,
        hazard: typeof hazard === "string" && hazard.trim() ? hazard : type,
        severity: typeof severity === "string" && severity.trim() ? severity : "Medium",
        confidence: Number.isFinite(Number(confidence)) ? Number(confidence) : 90,
        description: typeof description === "string" ? description : "",
        timestamp: normalizedTimestamp,
      };

      const docRef = await reportService.createReport(reportPayload);
      return res.json({ id: docRef.id, ...reportPayload });
    } catch (err) {
      console.error("Error adding report:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getReports: async (req, res) => {
    try {
      // Fetch normalized reports from the Firestore intelligence layer.
      const reports = await getAllReports();

      // Return standardized report documents for the frontend contract.
      return res.json(reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = reportController;
