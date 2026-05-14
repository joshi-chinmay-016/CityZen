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
const fs = require('fs');
const path = require('path');

const COLLECTION = 'reports';
const CACHE_FILE_PATH = path.join(__dirname, '../../cache/reports.json');

const SEVERITY_INTENSITY_MAP = {
  high: 1.0,
  medium: 0.6,
  low: 0.3
};

/**
 * Loads hazard reports from the local JSON cache.
 * Used as a robust fallback when Firestore quota is exceeded.
 */
const loadFallbackCache = () => {
  try {
    console.warn('[Firestore] Using cached fallback data from local JSON.');
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const rawData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('[Cache Error] Failed to read fallback cache:', error.message);
  }
  
  // Hardcoded emergency fallback if even the JSON file is missing/corrupt
  return [
    { id: 'f1', latitude: 12.9716, longitude: 77.5946, hazard: 'pothole', severity: 'high', confidence: 0.95, timestamp: new Date().toISOString() },
    { id: 'f2', latitude: 12.9800, longitude: 77.6000, hazard: 'manhole', severity: 'medium', confidence: 0.88, timestamp: new Date().toISOString() }
  ];
};

/**
 * Transforms raw Firestore report into API contract.
 */
const normalizeReport = (report = {}) => {
  const latitude = Number(report.latitude ?? report.lat);
  const longitude = Number(report.longitude ?? report.lng);
  const hazard = String(report.hazard || report.type || 'unknown').toLowerCase();
  const severity = String(report.severity || 'medium').toLowerCase();
  const confidence = Number(report.confidence ?? 1);
  const rawTimestamp = report.timestamp;
  const timestamp =
    typeof rawTimestamp === 'string'
      ? rawTimestamp
      : typeof rawTimestamp?.toDate === 'function'
        ? rawTimestamp.toDate().toISOString()
        : typeof rawTimestamp === 'number'
          ? new Date(rawTimestamp).toISOString()
          : new Date().toISOString();

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
  console.log(`[Firestore] Attempting to fetch reports from collection: ${COLLECTION}`);
  
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore query timed out')), 4000)
    );
    
    const queryPromise = db.collection(COLLECTION).get();
    const snapshot = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log(`[Firestore] Successfully fetched ${snapshot.docs.length} reports.`);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`[Firestore Error] Fetch failed (Quota or Timeout): ${error.message}`);
    throw error;
  }
};

const getIntensityFromSeverity = (severity) => {
  return SEVERITY_INTENSITY_MAP[String(severity || '').toLowerCase()] || 0.6;
};

const firestoreService = {
  add: async (collection, data) => {
    try {
      // 1. Primary: Attempt to save to Firestore
      // Use specific ID if provided, otherwise let Firestore generate one
      const docId = data.id || null;
      let docRef;
      
      const payload = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString()
      };
      // Don't save the ID inside the document data if we use it as the document key
      if (payload.id) delete payload.id;

      if (docId) {
        docRef = db.collection(collection).doc(docId);
        await docRef.set(payload, { merge: true });
        console.log(`[Firestore] Document ${docId} set/updated.`);
      } else {
        docRef = await db.collection(collection).add(payload);
        console.log(`[Firestore] New document created with ID: ${docRef.id}`);
      }

      const finalId = docId || docRef.id;

      // 2. Sync to Local Cache: Ensure the report is visible even in f      // Fallback/Parallel Sync: Ensure local cache is always updated
      if (collection.toLowerCase() === COLLECTION.toLowerCase()) {
        try {
          const cacheDir = path.dirname(CACHE_FILE_PATH);
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }

          let cache = [];
          if (fs.existsSync(CACHE_FILE_PATH)) {
            try {
              const rawData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
              cache = JSON.parse(rawData);
            } catch (pErr) {
              console.error('[Cache] JSON parse error, resetting cache:', pErr.message);
              cache = [];
            }
          }
          
          const normalizeSeverity = (s) => {
            if (!s) return 'Medium';
            const str = String(s).toLowerCase();
            if (str === 'low') return 'Low';
            if (str === 'high') return 'High';
            if (str === 'critical') return 'Critical';
            return 'Medium';
          };
          
          const newReport = {
            id: finalId,
            latitude: Number(data.latitude ?? data.lat),
            longitude: Number(data.longitude ?? data.lng),
            hazard: String(data.hazard || data.type || 'unknown').toLowerCase(),
            severity: normalizeSeverity(data.severity),
            confidence: Number(data.confidence ?? 0.9),
            timestamp: data.timestamp || new Date().toISOString()
          };

          const existingIndex = cache.findIndex(r => r.id === finalId);
          if (existingIndex > -1) {
            cache[existingIndex] = newReport;
          } else {
            cache.push(newReport);
          }
          
          fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf8');
          console.log(`[Cache Sync Success] ID: ${finalId} - Saved to ${CACHE_FILE_PATH}`);
        } catch (cacheErr) {
          console.error('[Cache Error] Local sync failed:', cacheErr.message);
        }
      }

      return { id: finalId };
    } catch (error) {
      console.error(`[Firestore Error] Add failed: ${error.message}`);
      
      const mockId = data.id || 'local-' + Date.now();
      if (collection.toLowerCase() === COLLECTION.toLowerCase()) {
        try {
          let cache = [];
          if (fs.existsSync(CACHE_FILE_PATH)) {
            const rawData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
            cache = JSON.parse(rawData);
          }
          const newReport = {
            id: mockId,
            latitude: Number(data.latitude ?? data.lat),
            longitude: Number(data.longitude ?? data.lng),
            hazard: String(data.hazard || data.type || 'unknown').toLowerCase(),
            severity: String(data.severity || 'medium').toLowerCase(),
            confidence: Number(data.confidence ?? 0.9),
            timestamp: data.timestamp || new Date().toISOString()
          };
          const existingIndex = cache.findIndex(r => r.id === mockId);
          if (existingIndex > -1) cache[existingIndex] = newReport;
          else cache.push(newReport);
          fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
          console.log(`[Emergency Cache Success] ID: ${mockId} (Firestore Offline)`);
        } catch (cacheErr) {
          console.error('[Cache Error] Emergency save failed:', cacheErr.message);
        }
      }
      return { id: mockId };
    }
  },

  getAll: async (collection) => {
    try {
      const snapshot = await db.collection(collection).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`[Firestore Error] getAll failed: ${error.message}`);
      return [];
    }
  },

  getAllReports: async () => {
    try {
      // 1. Fetch from Cache
      const cachedReports = loadFallbackCache();
      const allReportsMap = new Map();
      
      cachedReports.forEach(r => {
        const normalized = normalizeReport(r);
        if (normalized.id) allReportsMap.set(normalized.id, normalized);
      });
      
      // 2. Fetch from Live Firestore
      let liveReports = [];
      try {
        liveReports = await fetchAllReports();
        
        // Update map with live data (overwrites cache if ID matches)
        liveReports.forEach(r => {
          const normalized = normalizeReport(r);
          if (normalized.id) {
            allReportsMap.set(normalized.id, normalized);
          }
        });

        // 3. PROACTIVE SYNC: Write back merged data to local cache
        // This ensures the local JSON stays up-to-date with live Firestore
        const mergedArray = Array.from(allReportsMap.values());
        try {
          fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(mergedArray, null, 2), 'utf8');
          console.log(`[Cache Sync] Proactively updated local cache with ${mergedArray.length} reports.`);
        } catch (syncErr) {
          console.error('[Cache Sync Warning] Periodic write failed:', syncErr.message);
        }

      } catch (err) {
        console.warn('[Firestore] Query failed during getAllReports, serving cached data only.');
      }

      return Array.from(allReportsMap.values());
    } catch (error) {
      console.error('[Firestore] Critical failure in getAllReports:', error.message);
      return loadFallbackCache().map(normalizeReport);
    }
  },

  getHeatmapData: async () => {
    try {
      const reports = await firestoreService.getAllReports();
      const data = reports
        .filter((report) => Number.isFinite(report.latitude) && Number.isFinite(report.longitude))
        .map((report) => [
          report.latitude,
          report.longitude,
          getIntensityFromSeverity(report.severity)
        ]);
        
      if (data.length === 0) {
        return [[12.9716, 77.5946, 0.8], [12.9800, 77.6000, 0.6]];
      }
      return data;
    } catch (error) {
      return [[12.9716, 77.5946, 0.8], [12.9800, 77.6000, 0.6]];
    }
  },

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
      return { total_reports: 0, hazard_distribution: {}, severity_distribution: {} };
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
