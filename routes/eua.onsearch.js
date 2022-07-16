const uuid = require("uuid");
const axios = require("axios");

// MongoDB
const mongo = require("../mongo");
const euaDatabase = mongo.db("eua");

// Mocks
const searchResponse = require("../mocks/eua.search.json");

// Collections
const euaOnSearchCollection = euaDatabase.collection("on_search");

module.exports = async function (request, response) {
	response.json({});
};
