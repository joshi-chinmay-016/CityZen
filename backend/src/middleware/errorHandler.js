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

function notFoundHandler(req, res, next) {
  if (res.headersSent) {
    return next();
  }

  return res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
}

function errorHandler(err, req, res, next) {
  console.error("Unhandled backend error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: "Internal server error"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
