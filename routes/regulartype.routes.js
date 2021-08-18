module.exports = app => {
  const regulartype = require("../controllers/regulartype.controller.js");

    app.get("/api/:typename", regulartype.findAll);
	app.get("/api/:typename/mongo", regulartype.loadFromMongo);
	app.get("/api/:typename/:id", regulartype.findOne);
	app.post("/api/:typename", regulartype.update);
	app.delete("/api/:typename/:id", regulartype.deleteOne);
};