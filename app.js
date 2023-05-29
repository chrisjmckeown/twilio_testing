const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./Logger/loggerService");
const routes = require("./routes");
const { connectToDb } = require("./Helper/db");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

// connect to db
connectToDb((err) => {
  if (!err) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Log requests using Winston
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      logger(`${req.method} ${req.url} ${res.statusCode}`);
      next();
    });
    // Use API routes
    app.use("/api", routes);

    app.listen(port, () => {
      logger(`Server listening at http://localhost:${port}`);
    });
    logger("Twilio app running");
  }
});
