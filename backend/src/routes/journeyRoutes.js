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

// Analyze crowd intelligence data to calculate route stress scoring.
// Integrates AI hazard reports, journey feedback, and user ratings.
router.post("/route-stress", async (req, res) => {
  try {
    const { start, destination } = req.body || {};

    // Validate required route parameters.
    if (typeof start !== "string" || start.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid start value",
      });
    }

    if (typeof destination !== "string" || destination.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination value",
      });
    }

    // Fetch AI hazard reports from reports collection.
    const reportsSnapshot = await db.collection("reports").get();
    const reports = reportsSnapshot.docs.map(doc => doc.data());

    // Fetch crowd journey complaints from journeyReports collection.
    const journeySnapshot = await db.collection("journeyReports").get();
    const journeyReports = journeySnapshot.docs.map(doc => doc.data());

    // Count AI-reported potholes for damage stress.
    const potholes = reports.filter(r =>
      (r.hazard && r.hazard.toLowerCase() === "pothole") ||
      (r.type && r.type.toLowerCase() === "pothole")
    ).length;

    // Count AI-reported traffic issues for congestion stress.
    const trafficIssues = reports.filter(r =>
      (r.hazard && r.hazard.toLowerCase() === "traffic") ||
      (r.type && r.type.toLowerCase() === "traffic")
    ).length;

    // Count crowd-reported unsafe road complaints.
    const unsafeRoads = journeyReports.filter(j =>
      j.issueType && j.issueType.toLowerCase() === "unsafe road"
    ).length;

    // Count low user ratings (rating <= 2) indicating poor experience.
    const lowRatings = journeyReports.filter(j =>
      j.rating !== undefined && j.rating <= 2
    ).length;

    // Calculate overall route stress using weighted crowd intelligence formula.
    // potholes (damage) = 2x, traffic (congestion) = 3x,
    // unsafe roads (safety) = 4x, low ratings (experience) = 2x
    const stressScore =
      (potholes * 2) +
      (trafficIssues * 3) +
      (unsafeRoads * 4) +
      (lowRatings * 2);

    // Classify severity based on stress threshold boundaries.
    let severity;
    if (stressScore <= 5) {
      severity = "low";
    } else if (stressScore <= 15) {
      severity = "medium";
    } else {
      severity = "high";
    }

    // Recommend route only if stress is acceptable (medium or lower).
    const recommended = stressScore <= 15;

    return res.status(200).json({
      stressScore,
      severity,
      recommended,
    });
  } catch (error) {
    console.error("Error calculating route stress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
