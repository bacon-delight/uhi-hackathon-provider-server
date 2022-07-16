require("dotenv").config();

// MongoDB'
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

module.exports = client;
