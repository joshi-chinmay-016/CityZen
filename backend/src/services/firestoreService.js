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

  getById: async (collection, id) => {
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  update: async (collection, id, data) => {
    await db.collection(collection).doc(id).update(data);
    return true;
  }
};

module.exports = firestoreService;
