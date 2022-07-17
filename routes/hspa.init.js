const uuid = require("uuid");
const axios = require("axios");

// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");

// Mocks
const searchResponse = require("../mocks/hspa.oninit.json");

// Collections
const hspaProviderDetailsCollection =
	hspaDatabase.collection("provider_details");
const hspaInitCollection = hspaDatabase.collection("init");
const transactions = hspaDatabase.collection("transactions");

module.exports = async function (request, response) {
	const context = await hspaProviderDetailsCollection.findOne({
		_id: "context",
	});
	searchResponse.context = context.context;
	searchResponse.context.action = "on_init";
	searchResponse.context.message_id = uuid.v4();
	searchResponse.context.transaction_id = request.body.context.transaction_id;
	searchResponse.context.timestamp = new Date();
	searchResponse.context.consumer_id = request.body.context.consumer_id;
	searchResponse.context.consumer_uri = request.body.context.consumer_uri;

	const requestMessage = request.body.message.order;
	searchResponse.message.order = {
		quote: searchResponse.message.order.quote,
		payment: searchResponse.message.order.payment,
		...requestMessage,
	};

	// Update Transaction
	const transaction = await transactions.findOne({
		_id: request.body.context.transaction_id,
	});
	if (transaction !== null) {
		transaction.status = "initiated";
		transaction.payment = {
			amount: searchResponse.message.order.quote.price,
		};
		transaction.fulfillment_type = "basic_life_support";
		transactions.updateOne(
			{ _id: request.body.context.transaction_id },
			{ $set: transaction }
		);
	}

	let status = null;
	const uhiRequest = await axios
		.post(`${request.body.context.consumer_uri}/on_init`, searchResponse, {
			"X-Gateway-Authorization": "value",
		})
		.then((response) => {
			status = "broadcasted";
		})
		.catch((error) => {
			status = "broadcasted_failed";
		});

	// Respond
	await hspaInitCollection.insertOne({
		_id: searchResponse.context.transaction_id,
		request: request.body,
		response: searchResponse,
		status: status,
	});

	response.json(searchResponse);
};
