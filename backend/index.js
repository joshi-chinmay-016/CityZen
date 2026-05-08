/*
Owned by Person 2
MODULE: Legacy Intelligence Entry Point Wrapper
*/

const express = require("express");
const cors = require("cors");

const intelligenceRoutes = require("./src/routes/intelligenceRoutes");

const app = express();
const port = process.env.INTELLIGENCE_PORT || 5001;

app.use(cors());
app.use(express.json());
app.use("/", intelligenceRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Intelligence Layer service running on port ${port}`);
  });
}

module.exports = app;
