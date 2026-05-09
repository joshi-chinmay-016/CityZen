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

// Severity fallback map keeps the contract stable even when legacy Firestore
// documents only provide a hazard type.
const HAZARD_SEVERITY_MAP = {
  pothole: 'high',
  traffic: 'medium',
  crack: 'low',
  open_manhole: 'high'
};

const SEVERITY_INTENSITY_MAP = {
  high: 1.0,
  medium: 0.6,
  low: 0.3
};

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

/**
 * Normalizes a raw Firestore report document into the official API contract.
 * This keeps legacy documents compatible with the frontend and future route
 * intelligence features.
 */
const normalizeReport = (report = {}) => {
  const latitude = normalizeNumber(report.latitude ?? report.lat);
  const longitude = normalizeNumber(report.longitude ?? report.lng);
  const hazard = String(report.hazard ?? report.type ?? 'unknown').toLowerCase();
  const severity = normalizeSeverity(report.severity, hazard);
  const confidence = normalizeNumber(report.confidence, 1) ?? 1;

  return {
    id: report.id ? String(report.id) : '',
    latitude,
    longitude,
    hazard,
    severity,
    confidence,
    timestamp: normalizeTimestamp(report.timestamp)
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
