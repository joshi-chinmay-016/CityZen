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

const routeStressService = require('../services/routeStressService');
const { getRouteCoordinates } = require('../services/osrmService');

/**
 * Route Controller
 * 
 * Handles route-related requests including:
 * - Route generation testing (OSRM integration)
 * - Safe route calculation (route stress analysis)
 */

const routeController = {
  /**
   * Test endpoint for OSRM route generation.
   * 
   * Used for validating basic route coordinate fetching before integrating
   * with route stress analysis.
   * 
   * Request body:
   * {
   *   "source": [latitude, longitude],
   *   "destination": [latitude, longitude]
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "route": {
   *     "distance": number (meters),
   *     "duration": number (seconds),
   *     "coordinates": [[lat, lng], ...]
   *   }
   * }
   * 
   * @route POST /test-route
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {number[]} req.body.source - Starting coordinates [lat, lng]
   * @param {number[]} req.body.destination - Ending coordinates [lat, lng]
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with route data or error
   */
  testRouteGeneration: async (req, res) => {
    try {
      // Extract source and destination from request body
      const { source, destination } = req.body;

      // Validate required fields
      if (!source) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: source [lat, lng]'
        });
      }

      if (!destination) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: destination [lat, lng]'
        });
      }

      // Validate source and destination are arrays
      if (!Array.isArray(source) || !Array.isArray(destination)) {
        return res.status(400).json({
          success: false,
          error: 'source and destination must be arrays [lat, lng]'
        });
      }

      // Call OSRM service to fetch route
      const route = await getRouteCoordinates(source, destination);

      // Return successful response with route data
      return res.status(200).json({
        success: true,
        route
      });
    } catch (error) {
      // Log error for debugging
      console.error('Error in testRouteGeneration:', error.message);

      // Return error response with appropriate status code
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate route'
      });
    }
  },

  /**
   * Calculate safe route with stress analysis.
   * 
   * Integrates OSRM route generation with route stress service for
   * safer navigation recommendations.
   * 
   * @route POST /safe-route
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSafeRoute: async (req, res) => {
    try {
      const { source, destination } = req.body;

      // Validate required payload fields for intelligent route analysis.
      if (!source) {
        return res.status(400).json({ error: 'Missing required field: source [lat, lng]' });
      }

      if (!destination) {
        return res.status(400).json({ error: 'Missing required field: destination [lat, lng]' });
      }

      // Validate coordinate structure and ranges.
      if (!Array.isArray(source) || !Array.isArray(destination) || source.length !== 2 || destination.length !== 2) {
        return res.status(400).json({ error: 'source and destination must be [lat, lng]' });
      }

      const [sourceLat, sourceLng] = source;
      const [destinationLat, destinationLng] = destination;

      const isValidSource =
        typeof sourceLat === 'number' &&
        typeof sourceLng === 'number' &&
        Number.isFinite(sourceLat) &&
        Number.isFinite(sourceLng) &&
        sourceLat >= -90 &&
        sourceLat <= 90 &&
        sourceLng >= -180 &&
        sourceLng <= 180;

      const isValidDestination =
        typeof destinationLat === 'number' &&
        typeof destinationLng === 'number' &&
        Number.isFinite(destinationLat) &&
        Number.isFinite(destinationLng) &&
        destinationLat >= -90 &&
        destinationLat <= 90 &&
        destinationLng >= -180 &&
        destinationLng <= 180;

      if (!isValidSource || !isValidDestination) {
        return res.status(400).json({ error: 'Invalid coordinates. Latitude must be [-90, 90] and longitude must be [-180, 180].' });
      }

      const data = await routeStressService.calculateRouteStress(source, destination);

      // Return the full multi-route response while preserving the legacy fields.
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error calculating safe route:', error.message);
      return res.status(500).json({ error: 'Failed to calculate safe route' });
    }
  }
};

module.exports = routeController;
