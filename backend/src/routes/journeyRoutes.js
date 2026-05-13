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

// Analyze crowd intelligence analytics for city-wide complaint patterns.
// Provides hotspot intelligence and dashboard statistics.
router.get("/journey-analytics", async (req, res) => {
  try {
    // Fetch all crowd journey reports for analytics aggregation.
    const journeySnapshot = await db.collection("journeyReports").get();
    const journeyReports = journeySnapshot.docs.map((doc) => doc.data());

    if (journeyReports.length === 0) {
      return res.status(200).json({
        totalJourneyReports: 0,
        lowRatings: 0,
        unsafeRoadComplaints: 0,
        mostCommonIssue: null,
        averageRating: 0,
        highRiskZones: [],
      });
    }

    // Count total journey reports.
    const totalJourneyReports = journeyReports.length;

    // Count low ratings (user experience < 2).
    const lowRatings = journeyReports.filter(
      (r) => r.rating !== undefined && r.rating <= 2
    ).length;

    // Count unsafe road complaints from crowd intelligence.
    const unsafeRoadComplaints = journeyReports.filter(
      (r) => r.issueType && r.issueType.toLowerCase() === "unsafe road"
    ).length;

    // Calculate average user rating across all journey reports.
    const validRatings = journeyReports.filter(
      (r) => r.rating !== undefined && typeof r.rating === "number"
    );
    const averageRating =
      validRatings.length > 0
        ? (validRatings.reduce((sum, r) => sum + r.rating, 0) /
            validRatings.length).toFixed(2)
        : 0;

    // Determine most common issue type from crowd complaints.
    const issueTypeCounts = {};
    journeyReports.forEach((r) => {
      if (r.issueType) {
        const normalizedType = r.issueType.toLowerCase();
        issueTypeCounts[normalizedType] =
          (issueTypeCounts[normalizedType] || 0) + 1;
      }
    });

    const mostCommonIssue =
      Object.keys(issueTypeCounts).length > 0
        ? Object.entries(issueTypeCounts).sort(
            ([, countA], [, countB]) => countB - countA
          )[0][0]
        : null;

    // Generate hotspot intelligence: top complaint categories ranked by frequency.
    const highRiskZones = Object.entries(issueTypeCounts)
      .map(([issueType, count]) => ({
        issueType,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json({
      totalJourneyReports,
      lowRatings,
      unsafeRoadComplaints,
      mostCommonIssue,
      averageRating: Number(averageRating),
      highRiskZones,
    });
  } catch (error) {
    console.error("Error fetching journey analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
