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

// Helper: search for a default service account file by walking up directories
function findServiceAccountUpwards(filename, maxDepth = 4) {
  let dir = process.cwd();
  for (let i = 0; i <= maxDepth; i++) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

let resolvedPath;
if (credentialsPath) {
  // Resolve absolute path (relative to current working directory)
  resolvedPath = path.resolve(process.cwd(), credentialsPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Service account key not found at: ${resolvedPath}`);
  }
} else {
  // Fallback: try to find serviceAccountKey.json in current or parent folders
  const found = findServiceAccountUpwards("serviceAccountKey.json", 4);
  if (!found) {
    throw new Error(
      "Missing GOOGLE_APPLICATION_CREDENTIALS in .env file and no serviceAccountKey.json found. Please set GOOGLE_APPLICATION_CREDENTIALS or place a serviceAccountKey.json in a parent folder."
    );
  }
  resolvedPath = found;
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

console.log(`Firebase connected successfully to project: ${serviceAccount.project_id}`);

module.exports = db;
