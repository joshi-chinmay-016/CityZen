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

const axios = require('axios');

/**
 * OSRM Routing Service
 * 
 * Provides clean, modular route generation using the public OSRM API.
 * Designed for easy integration with route stress analysis and heatmap services.
 * 
 * Features:
 * - Distance calculation
 * - Duration estimation
 * - Route geometry extraction
 * - Comprehensive error handling
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';
const TIMEOUT_MS = 5000;

/**
 * Fetches a driving route from source to destination using OSRM API.
 * 
 * @param {number[]} source - Starting point [latitude, longitude]
 * @param {number[]} destination - Ending point [latitude, longitude]
 * 
 * @returns {Promise<Object>} Route response containing:
 *   - routes: Array of analyzed route candidates from OSRM
 *   - distance: Legacy best-route distance in meters
 *   - duration: Legacy best-route duration in seconds
 *   - coordinates: Legacy best-route geometry as [lat, lng]
 * 
 * @throws {Error} If API request fails or response is invalid
 * 
 * @example
 * const route = await getRouteCoordinates([40.7128, -74.0060], [40.7580, -73.9855]);
 * // Returns: { distance: 6500, duration: 420, coordinates: [[40.7128, -74.0060], ...] }
 */
async function getRouteAlternatives(source, destination, maxAlternatives = 3) {
  try {
    // Validate input format
    if (
      !Array.isArray(source) ||
      !Array.isArray(destination) ||
      source.length !== 2 ||
      destination.length !== 2
    ) {
      throw new Error(
        'Invalid input format. Expected [latitude, longitude] arrays.'
      );
    }

    const [sourceLat, sourceLng] = source;
    const [destLat, destLng] = destination;

    // Validate coordinates are numbers within valid ranges
    if (
      typeof sourceLat !== 'number' ||
      typeof sourceLng !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLng !== 'number'
    ) {
      throw new Error('Coordinates must be numbers.');
    }

    if (
      sourceLat < -90 ||
      sourceLat > 90 ||
      destLat < -90 ||
      destLat > 90 ||
      sourceLng < -180 ||
      sourceLng > 180 ||
      destLng < -180 ||
      destLng > 180
    ) {
      throw new Error('Coordinates out of valid geographic range.');
    }

    // Build OSRM API URL
    // Format: /route/v1/{profile}/{coordinates}?options
    // profile: driving
    // coordinates: lng,lat;lng,lat (note: OSRM uses lng,lat order)
    // alternatives=true: request OSRM alternate routes for comparison
    // overview=full: get full route geometry
    // geometries=geojson: return geometry in GeoJSON format (array of [lng, lat])
    // OSRM expects coordinates in lng,lat order. Convert here explicitly.
    const url = `${OSRM_BASE_URL}/route/v1/driving/${sourceLng},${sourceLat};${destLng},${destLat}?alternatives=true&overview=full&geometries=geojson&steps=false`;

    // Fetch route from OSRM API
    const response = await axios.get(url, { timeout: TIMEOUT_MS });

    // Check if OSRM returned a valid response
    if (!response.data || response.data.code !== 'Ok') {
      throw new Error(
        `OSRM API error: ${response.data?.code || 'Unknown error'}`
      );
    }

    // Extract up to `maxAlternatives` routes and parse them into a simple
    // structure used by the route stress engine. Convert OSRM's [lng,lat]
    // geometry to internal [lat,lng].
    const routes = Array.isArray(response.data.routes) ? response.data.routes.slice(0, maxAlternatives) : [];
    if (!routes.length) {
      throw new Error('No route found between source and destination.');
    }

    return routes.map((route) => ({
      distance: route.distance,
      duration: route.duration,
      coordinates: Array.isArray(route?.geometry?.coordinates)
        ? route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
        : []
    }));
  } catch (error) {
    // Log error for debugging
    console.error('OSRM Service Error:', error.message);

    // Re-throw with context
    throw new Error(`Failed to fetch route: ${error.message}`);
  }
}

/**
 * Legacy method maintained for backward compatibility.
 * Use getRouteCoordinates() for new code.
 * 
 * @deprecated Use getRouteCoordinates instead
 */
async function getRoute(start, end) {
  // Legacy helper: accept either objects { lat, lng } or arrays [lat, lng]
  const toLatLng = (p) => {
    if (!p) return [NaN, NaN];
    if (Array.isArray(p) && p.length === 2) return [Number(p[0]), Number(p[1])];
    if (typeof p === 'object' && p.lat !== undefined && p.lng !== undefined) return [Number(p.lat), Number(p.lng)];
    return [NaN, NaN];
  };

  const source = toLatLng(start);
  const destination = toLatLng(end);
  const routes = await getRouteAlternatives(source, destination, 1);
  return routes[0];
}

async function getRouteCoordinates(source, destination) {
  const routes = await getRouteAlternatives(source, destination, 1);
  return routes[0];
}

// Export service methods
const osrmService = {
  getRouteAlternatives,
  getRouteCoordinates,
  getRoute
};

module.exports = osrmService;
