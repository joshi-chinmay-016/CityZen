// Owned by Person 2: backend/src/routes, backend/src/controllers, backend/src/services

const { REPORT_TYPES } = require('../constants');

/**
 * Validate report data
 * @param {Object} data - Report data
 * @returns {Object} - { isValid, errors }
 */
const validateReport = (data) => {
  const errors = [];

  if (!data.lat || typeof data.lat !== 'number') {
    errors.push('lat must be a number');
  }

  if (!data.lng || typeof data.lng !== 'number') {
    errors.push('lng must be a number');
  }

  if (!data.type || !REPORT_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${REPORT_TYPES.join(', ')}`);
  }

  // Validate coordinate ranges
  if (data.lat < -90 || data.lat > 90) {
    errors.push('lat must be between -90 and 90');
  }

  if (data.lng < -180 || data.lng > 180) {
    errors.push('lng must be between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateReport
};