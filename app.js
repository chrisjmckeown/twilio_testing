const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./log/loggerService");
const routes = require("./routes");
const runners = require("./runners");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests using Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  next();
});

// Use API routes
app.use("/api", routes);

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
  console.log(`Server listening at http://localhost:${port}`);
});

console.log("---  -    -    -   o    |     o    -    | | |");
console.log("  |    \\   /\\   /   |    |     |  /   \\  | | |");
console.log("  |     \\ /  \\ /    |    |     |  \\   /  | | |");
console.log("  |      -    -     |    ----  |    -    o o o");
console.log("----------------------------------------------");

runners.runThisOne();
