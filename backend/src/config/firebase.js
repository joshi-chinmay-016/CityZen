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

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

let serviceAccount;

// Get path from .env
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS in .env file");
}

// Resolve absolute path (adjusted for src directory)
const resolvedPath = path.resolve(process.cwd(), credentialsPath);

// Check if file exists
if (!fs.existsSync(resolvedPath)) {
  throw new Error(`Service account key not found at: ${resolvedPath}`);
}

// Load JSON properly
serviceAccount = require(resolvedPath);

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Optional setting (safe)
db.settings({ ignoreUndefinedProperties: true });

console.log("Firebase connected successfully");

module.exports = db;
