const express = require("express");
const uuid = require("uuid");
const app = express();
app.use(express.json());
const port = 3000;

// Mocks
const InitResponse = require("./mocks/init.json");
const ConfirmResponse = require("./mocks/init.json");
const searchResponse = require("./mocks/init.json");

// MongoDB
const mongo = require("./mongo");
const hspaDatabase = mongo.db("hspa");
const euaDatabase = mongo.db("eua");

// Collections
const hspaProviderDetailsCollection =
	hspaDatabase.collection("provider_details");
const hspaSearchCollection = hspaDatabase.collection("search");
const euaOnSearchCollection = euaDatabase.collection("onSearch");

app.post("/hspa/search", async (request, response) => {
	const context = await hspaProviderDetailsCollection.findOne({
		_id: "context",
	});
	searchResponse.context = context.context;
	searchResponse.context.message_id = uuid.v4();
	searchResponse.context.transaction_id = uuid.v4();
	searchResponse.context.timestamp = new Date();
	const descriptor = await hspaProviderDetailsCollection.findOne({
		_id: "descriptor",
	});
	searchResponse.message.catalog.descriptor = descriptor.descriptor;
	const fulfillments = await hspaProviderDetailsCollection.findOne({
		_id: "fulfillments",
	});
	searchResponse.message.catalog.fulfillments = fulfillments.fulfillments;
	const services = await hspaProviderDetailsCollection.findOne({
		_id: "services",
	});
	searchResponse.message.catalog.items = services.services;
	const payments = await hspaProviderDetailsCollection.findOne({
		_id: "services",
	});
	searchResponse.message.catalog.payments = payments.payments;
	const locations = await hspaProviderDetailsCollection.findOne({
		_id: "locations",
	});
	searchResponse.message.catalog.locations = locations.locations;

	// Respond
	await hspaSearchCollection.insertOne({
		request: request.body,
		response: searchResponse,
	});
	response.json(searchResponse);
});

app.post("/eua/onsearch", async (request, response) => {
	await euaOnSearchCollection.insertOne(request.body);
	response.json(searchResponse);
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
