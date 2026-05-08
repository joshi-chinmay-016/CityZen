// Owned by Person 2: backend/src/routes, backend/src/controllers, backend/src/services

const express = require('express');
const cors = require('cors');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const routeRoutes = require('./routes/routeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/', intelligenceRoutes); // Keep existing paths for intelligence
app.use('/', reportRoutes); // Keep existing paths for reports
app.use('/heatmap', heatmapRoutes);
app.use('/routes', routeRoutes);

module.exports = app;
