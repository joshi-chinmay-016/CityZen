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

const express = require("express");
const router = express.Router();
const { addReport, getAllReports } = require('../controllers/reportController');

// const db = require("../config/firebase");

// const COLLECTION = "reports";
// const ALLOWED_TYPES = ["traffic", "pothole", "safety"];

/**
 * POST /report
 * Adds a new traffic report to Firestore
 * Input: { "lat": number, "lng": number, "type": "traffic|pothole|safety" }
 * Output: { "id": "doc_id" }
 */
router.post("/report", async (req, res) => {
  try {
    const result = await addReport(req.body);
    return res.json(result);
  } catch (err) {
    console.error("Error adding report:", err);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /reports
 * Retrieves all reports from Firestore
 * Output: Array of { id, lat, lng, type, timestamp }
 */
router.get("/reports", async (req, res) => {
  try {
    const reports = await getAllReports();
    return res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;