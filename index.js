const express = require("express");
const uuid = require("uuid");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const port = 4000;

// Mocks
// const InitResponse = require("./mocks/init.json");
// const ConfirmResponse = require("./mocks/init.json");
const searchResponse = require("./mocks/init.json");

// MongoDB
const mongo = require("./mongo");
const hspaDatabase = mongo.db("hspa");
const euaDatabase = mongo.db("eua");

// Collections
const euaOnSearchCollection = euaDatabase.collection("onSearch");

// HSPA - Search
const hspaSearch = require("./routes/hspa.search");
app.post("/hspa/search", (request, response) => hspaSearch(request, response));

// HSPA - Init
const hspaInit = require("./routes/hspa.init");
app.post("/hspa/init", (request, response) => hspaInit(request, response));

// HSPA - Confirm
const hspaConfirm = require("./routes/hspa.confirm");
app.post("/hspa/confirm", (request, response) =>
	hspaConfirm(request, response)
);

// EUA - SOS
const euaSOS = require("./routes/eua.sos");
app.post("/eua/sos", (request, response) => euaSOS(request, response));

// EUA - Search
// const euaSearch = require("./routes/eua.search");
// app.post("/eua/on_search", (request, response) => euaSearch(request, response));

// app.get("/init", (req, res) => {
// 	res.json(InitResponse);
// });

// app.get("/confirm", (req, res) => {
// 	res.json(ConfirmResponse);
// });

// -------------------------- UI --------------------------
// HSPA - Search
const hspaUISearch = require("./routes/hspa.ui.search");
app.get("/hspa/ui/search", (request, response) =>
	hspaUISearch(request, response)
);

// HSPA - Search
const hspaUIDispatch = require("./routes/hspa.ui.dispatch");
app.put("/hspa/ui/dispatch/:id", (request, response) =>
	hspaUIDispatch(request, response)
);

// Run Server
app.listen(process.env.PORT || port, () => {
	console.log(`Example app listening on port ${port}`);
});
module.exports = app;
