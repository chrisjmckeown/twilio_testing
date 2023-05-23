const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./log/loggerService");
const routes = require("./routes");
const { connectToDb } = require("./db");

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
      logger.info(`${req.method} ${req.url} ${res.statusCode}`);
      next();
    });
    // Use API routes
    app.use("/api", routes);

    app.listen(port, () => {
      logger.info(`Server listening at http://localhost:${port}`);
      console.log(`Server listening at http://localhost:${port}`);
    });
    console.log("Twilio app running");
  }
});
