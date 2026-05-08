// Owned by Person 2: backend/src/routes, backend/src/controllers, backend/src/services

// Application constants
const PORTS = {
  BACKEND: 5000,
  INTELLIGENCE: 5001,
  ML_SERVICE: 8000
};

const COLLECTIONS = {
  REPORTS: 'reports',
  HAZARDS: 'hazards'
};

const REPORT_TYPES = ['traffic', 'pothole', 'safety'];

const HAZARD_TYPES = ['pothole', 'crack', 'manhole'];

module.exports = {
  PORTS,
  COLLECTIONS,
  REPORT_TYPES,
  HAZARD_TYPES
};