const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./loggerService");
const runners = require("./runners");

require("dotenv").config();

const app = express();
const port = 7000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests using Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  next();
});

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
  console.log(`Server listening at http://localhost:${port}`);
});

console.log("---  -    -    -   o    |     o    -    | | |");
console.log(" |    \\   /\\   /   |    |     |  /   \\  | | |");
console.log(" |     \\ /  \\ /    |    |     |  \\   /  | | |");
console.log(" |      -    -     |    ----  |    -    o o o");
console.log("---------------------------------------------");

runners.runThisOne();

app.post("/MessageStatus", (req, res) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;

  console.log(`SID: ${messageSid}, Status: ${messageStatus}`);

  res.sendStatus(200);
});
