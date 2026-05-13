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

const osrmService = require('./osrmService');
const firestoreService = require('./firestoreService');
const { calculateDistance, isWithinRadius } = require('../utils/distanceCalculator');
const db = require('../config/firebase');

const HAZARD_SEARCH_RADIUS_METERS = 300;
const SAFE_THRESHOLD = 30;

const SEVERITY_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 5
};

// Crowd intelligence weights for journey complaints.
const JOURNEY_COMPLAINT_WEIGHTS = {
  unsafe_road: 4,
  low_rating: 2,
  pothole: 2,
  traffic: 3
};

const classifyRouteType = (stressScore) => {
  if (stressScore <= 25) {
    return 'safe';
  }

  if (stressScore <= 60) {
    return 'moderate';
  }

  return 'risky';
};

/**
 * Finds journey complaints relevant to the route between start and destination.
 * Analyzes crowd-sourced feedback including unsafe roads and low ratings.
 */
const findNearbyJourneyComplaints = (start, destination, journeyReports) => {
  if (!Array.isArray(journeyReports) || journeyReports.length === 0) {
    return [];
  }

  const complaints = [];
  const normalizedStart = String(start || '').toLowerCase().trim();
  const normalizedDest = String(destination || '').toLowerCase().trim();

  for (const report of journeyReports) {
    const reportStart = String(report.start || '').toLowerCase().trim();
    const reportDest = String(report.destination || '').toLowerCase().trim();

    // Match journey reports that are on or near the same route (bidirectional).
    const isRelevantRoute =
      (reportStart === normalizedStart && reportDest === normalizedDest) ||
      (reportStart === normalizedDest && reportDest === normalizedStart);

    if (!isRelevantRoute) {
      continue;
    }

    // Unsafe road complaints directly increase stress.
    if (report.issueType && report.issueType.toLowerCase() === 'unsafe road') {
      complaints.push({
        type: 'unsafe_road',
        weight: JOURNEY_COMPLAINT_WEIGHTS.unsafe_road,
        rating: report.rating,
        timestamp: report.timestamp
      });
    }

    // Low user ratings (<=2) indicate poor journey experience.
    if (report.rating !== undefined && report.rating <= 2) {
      complaints.push({
        type: 'low_rating',
        weight: JOURNEY_COMPLAINT_WEIGHTS.low_rating,
        rating: report.rating,
        timestamp: report.timestamp
      });
    }

    // Pothole complaints from crowd.
    if (report.issueType && report.issueType.toLowerCase() === 'pothole') {
      complaints.push({
        type: 'pothole',
        weight: JOURNEY_COMPLAINT_WEIGHTS.pothole,
        rating: report.rating,
        timestamp: report.timestamp
      });
    }

    // Traffic complaints from crowd.
    if (report.issueType && report.issueType.toLowerCase() === 'traffic') {
      complaints.push({
        type: 'traffic',
        weight: JOURNEY_COMPLAINT_WEIGHTS.traffic,
        rating: report.rating,
        timestamp: report.timestamp
      });
    }
  }

  return complaints;
};

/**
 * Calculates crowd intelligence weight based on complaint frequency and severity.
 * Multiple similar complaints from different users increase the weight.
 */
const calculateJourneyComplaintStress = (complaints) => {
  if (!Array.isArray(complaints) || complaints.length === 0) {
    return 0;
  }

  // Sum weights directly; repeated complaints naturally increase total stress.
  const totalWeight = complaints.reduce((sum, complaint) => sum + complaint.weight, 0);

  // Cap journey complaint stress contribution to prevent dominating AI hazards.
  return Math.min(totalWeight, 40);
};

/**
 * Converts supported location input into [lat, lng] format.
 * Supports both { lat, lng } and [lat, lng] for compatibility.
 */
const toLatLngArray = (point) => {
  if (Array.isArray(point) && point.length === 2) {
    return [Number(point[0]), Number(point[1])];
  }

  if (point && typeof point === 'object') {
    return [Number(point.lat), Number(point.lng)];
  }

  return [NaN, NaN];
};

/**
 * Creates a stable key used to prevent counting the same hazard multiple times
 * while scanning route coordinates.
 */
const getHazardKey = (hazard, lat, lng) => {
  if (hazard?.id) {
    return `id:${hazard.id}`;
  }

  return `coord:${lat}:${lng}:${hazard?.hazard || 'unknown'}`;
};

/**
 * Finds unique hazards located within the given radius of any route coordinate.
 */
const findNearbyHazards = (routeCoordinates, reports, radius) => {
  if (!Array.isArray(routeCoordinates) || !Array.isArray(reports)) {
    return [];
  }

  const nearbyHazardsMap = new Map();

  for (const [routeLat, routeLng] of routeCoordinates) {
    if (!Number.isFinite(routeLat) || !Number.isFinite(routeLng)) {
      continue;
    }

    for (const report of reports) {
      // ======================================================
      // LEGACY FALLBACK (TEMPORARILY COMMENTED)
      // Previously supported both report.lat/report.lng
      // and report.latitude/report.longitude.
      // ML service now writes only standardized fields.
      // const hazardLat = Number(report.latitude ?? report.lat);
      // const hazardLng = Number(report.longitude ?? report.lng);
      // ======================================================
      const hazardLat = Number(report.latitude);
      const hazardLng = Number(report.longitude);

      if (!Number.isFinite(hazardLat) || !Number.isFinite(hazardLng)) {
        continue;
      }

      if (!isWithinRadius(routeLat, routeLng, hazardLat, hazardLng, radius)) {
        continue;
      }

      const hazardKey = getHazardKey(report, hazardLat, hazardLng);
      const distanceMeters = calculateDistance(routeLat, routeLng, hazardLat, hazardLng);
      const current = nearbyHazardsMap.get(hazardKey);

      if (!current || distanceMeters < current.closest_distance_meters) {
        // ======================================================
        // LEGACY FALLBACK (TEMPORARILY COMMENTED)
        // Previously supported report.type as fallback for
        // report.hazard field. ML now writes hazard directly.
        // hazard: report.hazard || report.type || 'unknown',
        // ======================================================
        nearbyHazardsMap.set(hazardKey, {
          id: report.id || null,
          latitude: hazardLat,
          longitude: hazardLng,
          hazard: String(report.hazard || 'unknown').toLowerCase(),
          severity: String(report.severity || 'medium').toLowerCase(),
          closest_distance_meters: distanceMeters
        });
      }
    }
  }

  return Array.from(nearbyHazardsMap.values());
};

/**
 * Converts nearby hazards into a deterministic 0-100 stress score.
 * The score increases with both hazard count and severity.
 * Now includes crowd intelligence: journey complaints and low ratings.
 */
const calculateStressScore = (hazards, journeyComplaints = []) => {
  let totalStress = 0;

  // AI hazard stress component.
  if (Array.isArray(hazards) && hazards.length > 0) {
    const hazardWeight = hazards.reduce((sum, hazard) => {
      const weight = SEVERITY_WEIGHTS[String(hazard.severity || '').toLowerCase()] || 1;
      return sum + weight;
    }, 0);
    totalStress += Math.round((hazardWeight / 30) * 100);
  }

  // Crowd intelligence stress component from journey complaints.
  const journeyStress = calculateJourneyComplaintStress(journeyComplaints);
  totalStress += journeyStress;

  // Normalize combined score to 0-100 range.
  return Math.max(0, Math.min(100, totalStress));
};

const analyzeRouteCandidate = (routeData, reports, start, destination, journeyReports = []) => {
  const routeCoordinates = Array.isArray(routeData?.coordinates) ? routeData.coordinates : [];

  // Analyze each alternate route independently so the frontend can compare
  // safer, balanced, and riskier options from the same origin/destination pair.
  const nearbyHazards = findNearbyHazards(
    routeCoordinates,
    reports,
    HAZARD_SEARCH_RADIUS_METERS
  );

  // Find crowd intelligence: journey complaints on this route.
  const journeyComplaints = findNearbyJourneyComplaints(start, destination, journeyReports);

  // Calculate combined stress score integrating both AI hazards and crowd intelligence.
  const stressScore = calculateStressScore(nearbyHazards, journeyComplaints);
  const type = classifyRouteType(stressScore);

  return {
    type,
    stress_score: stressScore,
    safe: type === 'safe',
    distance: routeData?.distance ?? 0,
    duration: routeData?.duration ?? 0,
    route: routeCoordinates,
    nearby_hazards: nearbyHazards
  };
};

const routeStressService = {
  calculateRouteStress: async (start, end) => {
    try {
      const source = toLatLngArray(start);
      const destination = toLatLngArray(end);

      if (
        !Number.isFinite(source[0]) ||
        !Number.isFinite(source[1]) ||
        !Number.isFinite(destination[0]) ||
        !Number.isFinite(destination[1])
      ) {
        throw new Error('Invalid route endpoints. Expected { lat, lng } or [lat, lng].');
      }

      // 1-3) Fetch all data sources in parallel to minimize total latency and prevent timeouts.
      const [routeCandidates, reports, journeyReports] = await Promise.all([
        // OSRM route geometry
        osrmService.getRouteAlternatives(source, destination, 3),
        
        // Hazard reports (already has integrated timeout/fallback in firestoreService)
        firestoreService.getAllReports(),
        
        // Journey reports (direct fetch with integrated timeout)
        (async () => {
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Journey reports fetch timed out')), 3000)
            );
            const queryPromise = db.collection('journeyReports').get();
            const snapshot = await Promise.race([queryPromise, timeoutPromise]);
            return snapshot.docs.map((doc) => doc.data());
          } catch (e) {
            console.warn('[Route Stress] Failed to fetch journey reports (Quota or Timeout). Using empty fallback.');
            return [];
          }
        })()
      ]);

      // 4) Score every alternate route independently integrating both AI hazards
      //    and crowd intelligence, then sort by stress.
      const routes = (Array.isArray(routeCandidates) ? routeCandidates : [])
        .map((route) => analyzeRouteCandidate(route, reports, start, end, journeyReports))
        .sort((left, right) => left.stress_score - right.stress_score);

      const bestRoute = routes[0] || {
        type: 'safe',
        stress_score: 0,
        safe: true,
        distance: 0,
        duration: 0,
        route: [],
        nearby_hazards: []
      };

      // 5) Return a multi-route response while preserving legacy best-route fields.
      return {
        routes,
        stress_score: bestRoute.stress_score,
        safe: bestRoute.safe,
        route: bestRoute.route
      };
    } catch (error) {
      console.error('Error calculating route stress:', error.message);
      throw new Error(`Failed to calculate route stress: ${error.message}`);
    }
  }
};

module.exports = routeStressService;
