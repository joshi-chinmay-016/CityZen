const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", reportRoutes);

// Use PORT env var or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CityZen API server running on port ${PORT}`);
});
