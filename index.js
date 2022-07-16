const express = require("express");
const uuid = require("uuid");
const app = express();
app.use(express.json());
const port = 3000;

// Mocks
// const InitResponse = require("./mocks/init.json");
// const ConfirmResponse = require("./mocks/init.json");
const searchResponse = require("./mocks/init.json");

// MongoDB
const mongo = require("./mongo");
const hspaDatabase = mongo.db("hspa");
const euaDatabase = mongo.db("eua");

// Collections
const euaOnSearchCollection = euaDatabase.collection("onSearch");

// HSPA - Search
const hspaSearch = require("./routes/hspa.search");
app.post("/hspa/search", (request, response) => hspaSearch(request, response));

// EUA - SOS
const euaSOS = require("./routes/eua.sos");
app.post("/eua/sos", (request, response) => euaSOS(request, response));

// Others
app.post("/eua/onsearch", async (request, response) => {
	await euaOnSearchCollection.insertOne(request.body);
	response.json(searchResponse);
});

// app.get("/init", (req, res) => {
// 	res.json(InitResponse);
// });

// app.get("/confirm", (req, res) => {
// 	res.json(ConfirmResponse);
// });

// Run Server
app.listen(process.env.PORT || port, () => {
	console.log(`Example app listening on port ${port}`);
});
module.exports = app;
