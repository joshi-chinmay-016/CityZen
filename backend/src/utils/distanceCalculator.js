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

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Check if coordinates are within radius
 * @param {number} lat1 - Center latitude
 * @param {number} lng1 - Center longitude
 * @param {number} lat2 - Point latitude
 * @param {number} lng2 - Point longitude
 * @param {number} radiusKm - Radius in km
 * @returns {boolean}
 */
const isWithinRadius = (lat1, lng1, lat2, lng2, radiusKm) => {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusKm;
};

module.exports = {
  calculateDistance,
  isWithinRadius
};