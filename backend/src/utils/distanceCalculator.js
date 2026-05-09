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

const EARTH_RADIUS_METERS = 6371000;

/**
 * Converts degrees to radians for geographic calculations.
 *
 * @param {number} value
 * @returns {number}
 */
function toRadians(value) {
  return (value * Math.PI) / 180;
}

/**
 * Validates a geographic coordinate value.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
function isValidCoordinateValue(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

/**
 * Calculates the real-world distance between two coordinates using the
 * Haversine formula.
 *
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lng1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lng2 - Longitude of the second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (
    !isValidCoordinateValue(lat1, -90, 90) ||
    !isValidCoordinateValue(lat2, -90, 90) ||
    !isValidCoordinateValue(lng1, -180, 180) ||
    !isValidCoordinateValue(lng2, -180, 180)
  ) {
    return 0;
  }

  const latDelta = toRadians(lat2 - lat1);
  const lngDelta = toRadians(lng2 - lng1);
  const latRad1 = toRadians(lat1);
  const latRad2 = toRadians(lat2);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(latRad1) * Math.cos(latRad2) *
      Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks whether two coordinates are within a given radius in meters.
 *
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lng1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lng2 - Longitude of the second point
 * @param {number} radius - Radius in meters
 * @returns {boolean}
 */
function isWithinRadius(lat1, lng1, lat2, lng2, radius) {
  if (typeof radius !== 'number' || !Number.isFinite(radius) || radius < 0) {
    return false;
  }

  return calculateDistance(lat1, lng1, lat2, lng2) <= radius;
}

// Compatibility alias for older call sites that still use the legacy name.
function calculateDistanceMeters(pointA, pointB) {
  if (!pointA || !pointB) {
    return 0;
  }

  return calculateDistance(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
}

module.exports = {
  calculateDistance,
  isWithinRadius,
  calculateDistanceMeters
};
