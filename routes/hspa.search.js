const uuid = require("uuid");
const axios = require("axios");

// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");

// Mocks
const searchResponse = require("../mocks/hspa.onsearch.json");

// Collections
const hspaProviderDetailsCollection =
	hspaDatabase.collection("provider_details");
const hspaSearchCollection = hspaDatabase.collection("search");

module.exports = async function (request, response) {
	// Not Serviced
	if (
		!(
			request.body.message?.intent?.fulfillment?.type ===
				"EMERGENCY-PICKUP" ||
			request.body.message?.intent?.fulfillment?.type === "DROP"
		)
	) {
		response.json({ accepted: false, reason: "not_serviced" });
	}

	// Respond
	const context = await hspaProviderDetailsCollection.findOne({
		_id: "context",
	});
	searchResponse.context = context.context;
	searchResponse.context.action = "on_search";
	searchResponse.context.message_id = uuid.v4();
	searchResponse.context.transaction_id = request.body.context.transaction_id;
	searchResponse.context.timestamp = new Date();
	searchResponse.context.consumer_id = request.body.context.consumer_id;
	searchResponse.context.consumer_uri = request.body.context.consumer_uri;

	// Descriptor
	const descriptor = await hspaProviderDetailsCollection.findOne({
		_id: "descriptor",
	});
	searchResponse.message.catalog.descriptor = descriptor.descriptor;

	// Fulfillments
	searchResponse.message.catalog.fulfillments =
		request.body.message.intent.fulfillment;

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

	let status = null;
	const uhiRequest = await axios
		.post("http://121.242.73.120:8083/api/v1/on_search", searchResponse, {
			"X-Gateway-Authorization": "value",
		})
		.then((response) => {
			status = "broadcasted";
		})
		.catch((error) => {
			status = "broadcasted_failed";
		});

	// Respond
	try {
		await hspaSearchCollection.insertOne({
			_id: searchResponse.context.transaction_id,
			request: request.body,
			response: searchResponse,
			status: status,
		});
	} catch {
		response.json({
			accepted: false,
			reason: "duplicate",
		});
	}

	response.json({
		accepted: true,
	});
};
