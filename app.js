// const express = require("express");
// const bodyParser = require("body-parser");
// const logger = require("./Logger/loggerService");
// const routes = require("./routes");
// const { connectToDb } = require("./Helper/db");
// const client = require("./Helper/whatsapp");

// require("dotenv").config();

// client;

// const app = express();
// const port = process.env.PORT || 7000;

// // connect to db
// connectToDb((err) => {
//   if (!err) {
//     app.use(bodyParser.urlencoded({ extended: false }));
//     app.use(bodyParser.json());

//     // Log requests using Winston
//     app.use((req, res, next) => {
//       res.header("Access-Control-Allow-Origin", "*");
//       res.header("Access-Control-Allow-Headers", "*");
//       logger(`${req.method} ${req.url} ${res.statusCode}`);
//       next();
//     });
//     // Use API routes
//     app.use("/api", routes);

//     app.listen(port, () => {
//       logger(`Server listening at http://localhost:${port}`);
//     });
//     logger("Twilio app running");
//   }
// });
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;

const app = express();

app.post('/sms', (req, res) => {
  // const twiml = new MessagingResponse();

  // twiml.message('The Robots are coming! Head for the hills!');

  // res.type('text/xml').send(twiml.toString());
  console.log("hello world")
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
})