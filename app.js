const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("./config/mongo.config.js");
const app = express();
const init= require("./models/init.js");

// parse requests of content-type - application/json
//app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

require("./routes/regulartype.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

require('mongodb').MongoClient.connect(mongodb.URL)
.then(client =>{
  const db = client.db(mongodb.DB);
  app.locals.db = db;
  init.prime(db);
});