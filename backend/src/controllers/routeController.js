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

const routeController = {
  getSafeRoute: async (req, res) => {
    try {
      const { start, end } = req.body;
      if (!start || !end) {
        return res.status(400).json({ error: 'Start and end locations required' });
      }
      const data = await routeStressService.calculateRouteStress(start, end);
      res.json(data);
    } catch (error) {
      console.error('Error calculating safe route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = routeController;
