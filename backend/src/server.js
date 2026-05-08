/*
Owned by Person 2
MODULE: Backend Server Bootstrap
*/

require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CityZen Unified Backend running on port ${PORT}`);
});
