const uuid = require("uuid");

// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");
const euaDatabase = mongo.db("eua");

// Mocks
const searchResponse = require("../mocks/hspa.onsearch.json");

// Collections
const hspaProviderDetailsCollection =
	hspaDatabase.collection("provider_details");
const hspaSearchCollection = hspaDatabase.collection("search");
const euaOnSearchCollection = euaDatabase.collection("onSearch");

module.exports = async function (request, response) {
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
		_id: searchResponse.context.transaction_id,
		request: request.body,
		response: searchResponse,
	});
	response.json(searchResponse);
};
