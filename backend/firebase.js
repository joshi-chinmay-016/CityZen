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

// Resolve absolute path
const resolvedPath = path.resolve(process.cwd(), credentialsPath);

// Check if file exists
if (!fs.existsSync(resolvedPath)) {
  throw new Error(`Service account key not found at: ${resolvedPath}`);
}

// Load JSON properly (IMPORTANT FIX)
serviceAccount = require(resolvedPath);

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Optional setting (safe)
db.settings({ ignoreUndefinedProperties: true });

console.log("Firebase connected successfully");

module.exports = db;