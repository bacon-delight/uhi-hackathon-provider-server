const express = require("express");
const app = express();
app.use(express.json());
const port = 3000;

// Mocks
const InitResponse = require("./mocks/init.json");
const ConfirmResponse = require("./mocks/init.json");
const SearchResponse = require("./mocks/init.json");

// MongoDB
const mongo = require("./mongo");
const hspaDatabase = mongo.db("hspa");
const euaDatabase = mongo.db("eua");

// Collections
const hspaSearchCollection = hspaDatabase.collection("search");
const euaOnSearchCollection = euaDatabase.collection("onSearch");

app.post("/hspa/search", async (request, response) => {
	await hspaSearchCollection.insertOne(request.body);
	response.json(SearchResponse);
});

app.post("/eua/onsearch", async (request, response) => {
	await euaOnSearchCollection.insertOne(request.body);
	response.json(SearchResponse);
});

app.get("/init", (req, res) => {
	res.json(InitResponse);
});

app.get("/confirm", (req, res) => {
	res.json(ConfirmResponse);
});

// Run Server
app.listen(process.env.PORT || port, () => {
	console.log(`Example app listening on port ${port}`);
});
module.exports = app;
