/*
Owned by Person 2
MODULE: Legacy Backend Entry Point Wrapper
*/

require("dotenv").config();

const app = require("./src/app");
const journeyRoutes = require("./routes/journeyRoutes");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");

// Keep middleware order correct by mounting journey APIs before terminal handlers.
if (app._router && Array.isArray(app._router.stack)) {
	app._router.stack = app._router.stack.filter(
		(layer) => layer.handle !== notFoundHandler && layer.handle !== errorHandler
	);
}

app.use("/api", journeyRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`CityZen Unified Backend running on port ${PORT}`);
});
