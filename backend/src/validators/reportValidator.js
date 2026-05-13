/*
Owned by Person 2
MODULE: Report Payload Validators
*/

const { REPORT_TYPES } = require("../constants");

function validateReportPayload(payload = {}) {
  const latitude = payload.latitude ?? payload.lat;
  const longitude = payload.longitude ?? payload.lng;
  const type = payload.type ?? payload.hazard;

  if (latitude === undefined || longitude === undefined || type === undefined) {
    return "Missing required fields: coordinates (lat/lng or latitude/longitude) and hazard type";
  }

  if (typeof Number(latitude) !== "number" || typeof Number(longitude) !== "number") {
    return "Coordinates must be valid numbers";
  }

  const normalizedType = String(type).toLowerCase();
  const allowed = REPORT_TYPES.map(t => t.toLowerCase());
  
  if (!allowed.includes(normalizedType)) {
    return `type must be one of: ${REPORT_TYPES.join(", ")}`;
  }

  return null;
}

module.exports = {
  validateReportPayload,
  ALLOWED_REPORT_TYPES: REPORT_TYPES
};
