const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this nested frontend isolated from the repo root so Next
  // doesn't fight over the parent lockfile or a stale `.next` folder.
  outputFileTracingRoot: path.resolve(__dirname),
  distDir: ".next-app",
};

module.exports = nextConfig;
