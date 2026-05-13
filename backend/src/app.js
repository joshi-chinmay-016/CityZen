/*
Owned by Person 2
MODULE: Backend Express App
*/

const express = require("express");
const cors = require("cors");

const reportRoutes = require("./routes/reportRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const heatmapRoutes = require("./routes/heatmapRoutes");
const routeRoutes = require("./routes/routeRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Legacy-compatible routes
app.use("/", reportRoutes);
app.use("/", intelligenceRoutes);

// Modular team-owned route groups
app.use("/api/reports", reportRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api", journeyRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "CityZen Unified Backend" });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
