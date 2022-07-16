// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");

// Collections
const hspaSearchCollection = hspaDatabase.collection("search");

module.exports = async function (request, response) {
	const context = await hspaSearchCollection.find().toArray();
	response.json(context);
};
