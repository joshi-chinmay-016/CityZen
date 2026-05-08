/*
Owned by Person 2
MODULE: Report Payload Validators
*/

const { REPORT_TYPES } = require("../constants");

function validateReportPayload(payload = {}) {
  const { lat, lng, type } = payload;

  if (lat === undefined || lng === undefined || type === undefined) {
    return "Missing required fields: lat, lng, type";
  }

  if (typeof lat !== "number" || typeof lng !== "number") {
    return "lat and lng must be numbers";
  }

  if (!REPORT_TYPES.includes(type)) {
    return `type must be one of: ${REPORT_TYPES.join(", ")}`;
  }

  return null;
}

module.exports = {
  validateReportPayload,
  ALLOWED_REPORT_TYPES: REPORT_TYPES
};
