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
const db = require("../config/firebase");

const router = express.Router();

const ALLOWED_ISSUE_TYPES = ["pothole", "crack", "manhole", "traffic", "unsafe road"];
const ALLOWED_SEVERITY = ["low", "medium", "high"];

// Validate crowd journey feedback before storing to Firestore.
function validateJourneyFeedback(payload) {
  const { start, destination, rating, issueType, severity, landmark } = payload || {};

  if (typeof start !== "string" || start.trim().length === 0) {
    return "Invalid start value";
  }

  if (typeof destination !== "string" || destination.trim().length === 0) {
    return "Invalid destination value";
  }

  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return "Invalid rating value";
  }

  if (typeof issueType !== "string" || !ALLOWED_ISSUE_TYPES.includes(issueType.trim().toLowerCase())) {
    return "Invalid issueType value";
  }

  if (typeof severity !== "string" || !ALLOWED_SEVERITY.includes(severity.trim().toLowerCase())) {
    return "Invalid severity value";
  }

  if (landmark !== undefined && typeof landmark !== "string") {
    return "Invalid landmark value";
  }

  return null;
}

// Store completed journey feedback for crowd intelligence and future route insights.
router.post("/journey-feedback", async (req, res) => {
  try {
    const validationError = validateJourneyFeedback(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const { start, destination, rating, issueType, severity, landmark } = req.body;

    const journeyPayload = {
      start: start.trim(),
      destination: destination.trim(),
      rating,
      issueType: issueType.trim().toLowerCase(),
      severity: severity.trim().toLowerCase(),
      landmark: typeof landmark === "string" ? landmark : "",
      timestamp: Date.now(),
    };

    // Persist user journey complaints/ratings into Firestore collection: journeyReports.
    const docRef = await db.collection("journeyReports").add(journeyPayload);

    return res.status(200).json({
      success: true,
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error saving journey feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
