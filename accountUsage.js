require('dotenv').config();
// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const subaccountSid = process.env.TWILIO_SUBACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken, { accountSid: subaccountSid });

client.calls
      .list({startTime: new Date(Date.UTC(2018, 0, 15, 0, 0, 0)), limit: 20})
      .then(calls => calls.forEach(c => console.log(c.price)));
