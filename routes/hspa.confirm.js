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
const transactions = hspaDatabase.collection("transactions");

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

	searchResponse.message.order.fulfillment.agent.tags = {
		"@abdm/gov/in/driverName": "Prakhya Shastry",
		"@abdm/gov/in/registrationNumber": "KA 03 MW 1151",
		"@abdm/gov/in/driverPhoneNumber": "8437273627",
		"@abdm/gov/in/otp": "3847",
	};

	// Update Transaction
	const transaction = await transactions.findOne({
		_id: request.body.context.transaction_id,
	});
	if (transaction !== null) {
		transaction.status = "confirmed";
		transaction.dispatch = {
			driver_name: "Prakhya Shastry",
			registration_number: "KA 03 MW 1151",
			phone_number: 8437273627,
			otp: 3857,
		};
		transactions.updateOne(
			{ _id: request.body.context.transaction_id },
			{ $set: transaction }
		);
	}

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
