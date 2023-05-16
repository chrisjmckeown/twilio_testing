const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./log/loggerService");
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
// Endpoint to handle the Twilio status callback
app.post("/sms_status_callback", (req, res) => {
  // Extract the relevant information from the callback request
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;
  const recipientNumber = req.body.To;

  // Process the callback data as per your application's requirements
  // For example, you can update a database, log the status, or trigger other actions

  // Log the received information for demonstration purposes
  console.log(`Message SID: ${messageSid}`);
  console.log(`Message Status: ${messageStatus}`);
  console.log(`Recipient Number: ${recipientNumber}`);

  // Send a response to Twilio
  res.status(200).end();
});

// Endpoint to handle the Twilio status callback
app.get("*", (req, res) => {
  res.status(200).send("catch all end point").end();
});
