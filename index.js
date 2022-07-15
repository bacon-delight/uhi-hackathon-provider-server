const express = require("express");
const app = express();
const port = 3000;

// Mocks
const InitResponse = require("./mocks/init.json");
const ConfirmResponse = require("./mocks/init.json");
const SearchResponse = require("./mocks/init.json");

app.get("/search", (req, res) => {
	res.json(SearchResponse);
});

app.get("/init", (req, res) => {
	res.json(InitResponse);
});

app.get("/confirm", (req, res) => {
	res.json(ConfirmResponse);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
