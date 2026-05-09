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

const HAZARD_SEARCH_RADIUS_METERS = 300;
const SAFE_THRESHOLD = 30;

const SEVERITY_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 5
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
 */
const calculateStressScore = (hazards) => {
  if (!Array.isArray(hazards) || hazards.length === 0) {
    return 0;
  }

  const totalWeight = hazards.reduce((sum, hazard) => {
    const weight = SEVERITY_WEIGHTS[String(hazard.severity || '').toLowerCase()] || 1;
    return sum + weight;
  }, 0);

  const normalizedScore = Math.round((totalWeight / 30) * 100);
  return Math.max(0, Math.min(100, normalizedScore));
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

      // 1) Get route geometry from OSRM in [lat, lng] format.
      const routeData = await osrmService.getRouteCoordinates(source, destination);
      const routeCoordinates = Array.isArray(routeData.coordinates) ? routeData.coordinates : [];

      // 2) Pull normalized hazard reports from Firestore intelligence layer.
      const reports = await firestoreService.getAllReports();
      // ======================================================
      // DEBUG LOGGING (TEMPORARILY COMMENTED)
      // Used during Firestore normalization + route matching tests.
      // Can be re-enabled for backend debugging if needed.
      // ======================================================

      // console.log("REPORTS:", reports);

      // 3) Find hazards within 100m of the route and score risk.
      const nearbyHazards = findNearbyHazards(routeCoordinates, reports, HAZARD_SEARCH_RADIUS_METERS);
      const stressScore = calculateStressScore(nearbyHazards);

      // 4) Route safety classification for frontend contract.
      return {
        stress_score: stressScore,
        safe: stressScore < SAFE_THRESHOLD,
        route: routeCoordinates
      };
    } catch (error) {
      console.error('Error calculating route stress:', error.message);
      throw new Error(`Failed to calculate route stress: ${error.message}`);
    }
  }
};

module.exports = routeStressService;
