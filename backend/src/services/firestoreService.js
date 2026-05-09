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

const db = require('../config/firebase');

const COLLECTION = 'reports';

// ======================================================
// LEGACY NORMALIZATION FALLBACK (TEMPORARILY COMMENTED)
// Previously used when Firestore stored lat/lng/type fields
// instead of standardized schema.
// The ML layer now writes fully normalized reports.
// Can be permanently removed after full migration.
// ======================================================
/*
const HAZARD_SEVERITY_MAP = {
  pothole: 'high',
  traffic: 'medium',
  crack: 'low',
  open_manhole: 'high'
};
*/

const SEVERITY_INTENSITY_MAP = {
  high: 1.0,
  medium: 0.6,
  low: 0.3
};

// ======================================================
// LEGACY TIMESTAMP NORMALIZATION (TEMPORARILY COMMENTED)
// Previously handled multiple timestamp formats when
// Firestore documents came from various sources.
// ML service now writes ISO strings directly.
// ======================================================
/*
const normalizeTimestamp = (timestamp) => {
  if (timestamp === undefined || timestamp === null || timestamp === '') {
    return new Date().toISOString();
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  if (typeof timestamp === 'number') {
    const normalizedValue = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    const parsed = new Date(normalizedValue);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }

  if (typeof timestamp?.seconds === 'number') {
    const millis = (timestamp.seconds * 1000) + Math.floor((timestamp.nanoseconds || 0) / 1000000);
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const getDerivedSeverity = (hazard) => {
  if (!hazard) {
    return 'medium';
  }

  const normalizedHazard = String(hazard).toLowerCase();
  return HAZARD_SEVERITY_MAP[normalizedHazard] || 'medium';
};

const normalizeSeverity = (severity, hazard) => {
  if (severity) {
    return String(severity).toLowerCase();
  }

  return getDerivedSeverity(hazard);
};

const normalizeNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
*/

/**
 * Transforms raw Firestore report into API contract.
 * ML service now writes fully standardized schema,
 * so normalization is straightforward passthrough.
 */
const normalizeReport = (report = {}) => {
  // Active schema (ML writes these fields directly)
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  const hazard = String(report.hazard || 'unknown').toLowerCase();
  const severity = String(report.severity || 'medium').toLowerCase();
  const confidence = Number(report.confidence ?? 1);
  const timestamp = String(report.timestamp || new Date().toISOString());

  return {
    id: report.id ? String(report.id) : '',
    latitude,
    longitude,
    hazard,
    severity,
    confidence,
    timestamp
  };
};

const fetchAllReports = async () => {
  const snapshot = await db.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

const getIntensityFromSeverity = (severity) => {
  return SEVERITY_INTENSITY_MAP[String(severity || '').toLowerCase()] || 0.6;
};

/**
 * Generic firestore service for basic CRUD operations
 */
const firestoreService = {
  add: async (collection, data) => {
    const docRef = await db.collection(collection).add({
      ...data,
      timestamp: Date.now()
    });
    return docRef;
  },

  getAll: async (collection) => {
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * Fetches all reports and normalizes them into the shared API contract.
   */
  getAllReports: async () => {
    try {
      const reports = await fetchAllReports();
      return reports.map((report) => normalizeReport(report));
    } catch (error) {
      console.error('Error fetching normalized reports:', error);
      throw new Error('Failed to fetch reports');
    }
  },

  /**
   * Returns heatmap-ready coordinates in [latitude, longitude, intensity] format.
   */
  getHeatmapData: async () => {
    try {
      const reports = await firestoreService.getAllReports();

      return reports
        .filter((report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude))
        .map((report) => [
          report.latitude,
          report.longitude,
          getIntensityFromSeverity(report.severity)
        ]);
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      throw new Error('Failed to generate heatmap data');
    }
  },

  /**
   * Returns lightweight analytics for reporting and dashboard views.
   */
  getAnalyticsData: async () => {
    try {
      const reports = await firestoreService.getAllReports();

      const hazardDistribution = {};
      const severityDistribution = {};

      reports.forEach((report) => {
        const hazardKey = report.hazard || 'unknown';
        const severityKey = report.severity || 'unknown';

        hazardDistribution[hazardKey] = (hazardDistribution[hazardKey] || 0) + 1;
        severityDistribution[severityKey] = (severityDistribution[severityKey] || 0) + 1;
      });

      return {
        total_reports: reports.length,
        hazard_distribution: hazardDistribution,
        severity_distribution: severityDistribution
      };
    } catch (error) {
      console.error('Error generating analytics data:', error);
      throw new Error('Failed to generate analytics data');
    }
  },

  getById: async (collection, id) => {
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  update: async (collection, id, data) => {
    await db.collection(collection).doc(id).update(data);
    return true;
  },

  normalizeReport
};

module.exports = firestoreService;
