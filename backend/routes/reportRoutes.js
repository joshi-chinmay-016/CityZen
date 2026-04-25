const express = require("express");
const router = express.Router();
const db = require("../firebase");

const COLLECTION = "reports";
const ALLOWED_TYPES = ["traffic", "pothole", "safety"];

/**
 * POST /report
 * Adds a new traffic report to Firestore
 * Input: { "lat": number, "lng": number, "type": "traffic|pothole|safety" }
 * Output: { "id": "doc_id" }
 */
router.post("/report", async (req, res) => {
  try {
    const { lat, lng, type } = req.body;

    // Validate required fields exist
    if (lat === undefined || lng === undefined || type === undefined) {
      return res.status(400).json({ error: "Missing required fields: lat, lng, type" });
    }

    // Validate that lat and lng are numbers
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "lat and lng must be numbers" });
    }

    // Validate that type is one of the allowed values
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${ALLOWED_TYPES.join(", ")}` });
    }

    // Store in Firestore
    const docRef = await db.collection(COLLECTION).add({
      lat,
      lng,
      type,
      timestamp: Date.now(),
    });

    // Return only the document ID as per API contract
    return res.json({ id: docRef.id });
  } catch (err) {
    console.error("Error adding report:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /reports
 * Retrieves all reports from Firestore
 * Output: Array of { id, lat, lng, type, timestamp }
 */
router.get("/reports", async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).get();

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;