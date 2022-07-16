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
const hspaConfirmCollection = hspaDatabase.collection("confirm");

module.exports = async function (request, response) {
	const context = await hspaProviderDetailsCollection.findOne({
		_id: "context",
	});
	searchResponse.context = context.context;
	searchResponse.context.action = "on_confirm";
	searchResponse.context.message_id = uuid.v4();
	searchResponse.context.transaction_id = request.body.context.transaction_id;
	searchResponse.context.timestamp = new Date();
	searchResponse.context.consumer_id = request.body.context.consumer_id;
	searchResponse.context.consumer_uri = request.body.context.consumer_uri;

	const requestMessage = request.body.message.order;
	searchResponse.message.order = {
		state: "CONFIRMED",
		payment: {
			uri: `https://api.bpp.com/pay?amt=${request.body.message.order.quote.price.value}&txn_id=${request.body.context.transaction_id}&mode=upi&karkinos@upi`,
			type: "ON-FULFILLMENT",
			status: "NOT-PAID",
			tl_method: "http/get",
			params: {
				transaction_id: request.body.context.transaction_id,
				amount: request.body.message.order.quote.price.value,
				mode: "UPI",
				vpa: "karkinos@upi",
			},
		},
		...requestMessage,
	};

	let status = null;
	const uhiRequest = await axios
		.post(
			`${request.body.context.consumer_uri}/on_confirm`,
			searchResponse,
			{
				"X-Gateway-Authorization": "value",
			}
		)
		.then((response) => {
			status = "broadcasted";
		})
		.catch((error) => {
			status = "broadcasted_failed";
		});

	// Respond
	await hspaConfirmCollection.insertOne({
		_id: searchResponse.context.transaction_id,
		request: request.body,
		response: searchResponse,
		status: status,
	});

	response.json(searchResponse);
};
