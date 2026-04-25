const express = require('express');
const cors = require('cors');
const intelligenceRoutes = require('./routes/intelligence');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use('/', intelligenceRoutes);

app.listen(port, () => {
	console.log(`Intelligence Layer service running on port ${port}`);
});
