// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");

// Collections
const transactions = hspaDatabase.collection("transactions");

module.exports = async function (request, response) {
	const context = await transactions.find().toArray();
	response.json(context);
};
