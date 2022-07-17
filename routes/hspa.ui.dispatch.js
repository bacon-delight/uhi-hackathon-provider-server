// MongoDB
const mongo = require("../mongo");
const hspaDatabase = mongo.db("hspa");

// Collections
const transactions = hspaDatabase.collection("transactions");

module.exports = async function (request, response) {
	// Update Transaction
	const transaction = await transactions.findOne({
		_id: request.params.id,
	});
	if (transaction !== null) {
		transaction.status = "dispatched";
		transactions.updateOne(
			{ _id: request.params.id },
			{ $set: transaction }
		);

		response.json({ dispatched: true });
	}

	response.json({ dispatched: false });
};
