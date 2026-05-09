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
 * @returns {Promise<Object>} Route object containing:
 *   - distance: Route distance in meters
 *   - duration: Estimated travel time in seconds
 *   - coordinates: Array of [lat, lng] points along the route
 * 
 * @throws {Error} If API request fails or response is invalid
 * 
 * @example
 * const route = await getRouteCoordinates([40.7128, -74.0060], [40.7580, -73.9855]);
 * // Returns: { distance: 6500, duration: 420, coordinates: [[40.7128, -74.0060], ...] }
 */
async function getRouteCoordinates(source, destination) {
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
    // overview=full: get full route geometry
    // geometries=geojson: return geometry in GeoJSON format (array of [lng, lat])
    const url = `${OSRM_BASE_URL}/route/v1/driving/${sourceLng},${sourceLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    // Fetch route from OSRM API
    const response = await axios.get(url, { timeout: TIMEOUT_MS });

    // Check if OSRM returned a valid response
    if (!response.data || response.data.code !== 'Ok') {
      throw new Error(
        `OSRM API error: ${response.data?.code || 'Unknown error'}`
      );
    }

    // Extract the first route (most direct)
    const route = response.data.routes[0];
    if (!route) {
      throw new Error('No route found between source and destination.');
    }

    // Parse route data
    const distance = route.distance; // meters
    const duration = route.duration; // seconds

    // Convert OSRM geometry from [lng, lat] to [lat, lng]
    // OSRM returns geometry as GeoJSON format: [[lng, lat], [lng, lat], ...]
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [
      lat,
      lng
    ]);

    // Return parsed route data
    return {
      distance,
      duration,
      coordinates
    };
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
  // Convert from { lat, lng } format to [lat, lng] format
  const source = [start.lat, start.lng];
  const destination = [end.lat, end.lng];
  return getRouteCoordinates(source, destination);
}

// Export service methods
const osrmService = {
  getRouteCoordinates,
  getRoute
};

module.exports = osrmService;
