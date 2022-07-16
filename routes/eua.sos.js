const uuid = require("uuid");
const axios = require("axios");

// MongoDB
const mongo = require("../mongo");
const euaDatabase = mongo.db("eua");

// Mocks
const searchResponse = require("../mocks/eua.sos.json");

// Collections
const euaSOSCollection = euaDatabase.collection("sos");

module.exports = async function (request, response) {
	searchResponse.context.action = "on_search";
	searchResponse.context.message_id = uuid.v4();
	searchResponse.context.transaction_id = uuid.v4();
	searchResponse.context.timestamp = new Date();

	// Other Information
	searchResponse.message.intent.fulfillment.start.contact.tags[
		"@abdm/gov/in/lat"
	] = request.body.locationData.latitude;
	searchResponse.message.intent.fulfillment.start.contact.tags[
		"@abdm/gov/in/long"
	] = request.body.locationData.longitude;

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

	await euaSOSCollection.insertOne({
		_id: searchResponse.context.transaction_id,
		request: request.body,
		response: searchResponse,
		status: status,
	});

	response.json({
		status: status,
		search: searchResponse,
	});
};
