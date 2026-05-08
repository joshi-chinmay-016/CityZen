// Owned by Person 2: backend/src/routes, backend/src/controllers, backend/src/services

const app = require('./app');

// Use PORT env var or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CityZen API server running on port ${PORT}`);
});
