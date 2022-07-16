const mongo = require("../mongo");

module.exports = async function (req, res) {
	const database = mongo.db("insertDB");
	const haiku = database.collection("haiku");
	const doc = {
		title: "Record of a Shriveled Datum",
		content: "No bytes, no problem. Just insert a document, in MongoDB",
	};
	const result = await haiku.insertOne(doc);
	res.json(SearchResponse);
};
