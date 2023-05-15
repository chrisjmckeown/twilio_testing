const sms = require("./sms");
const logger = require("./loggerService");
const _ = require("lodash");

const subAccountSid = process.env.TWILIO_SUBACCOUNT_SID;

async function returnSubAccounts() {
  const result = await sms.returnSubAccounts(subAccountSid);
  const returnForLogging = JSON.stringify(result);
  logger.info(`returnSubAccounts ${returnForLogging}`);
}
async function checkCredentialsAsync() {
  const result = await sms.checkCredentialsAsync(subAccountSid);
  logger.info(`checkCredentialsAsync ${result}`);
}
async function availablePhoneNumbers() {
  const result = await sms.availablePhoneNumbers("US");
  const returnForLogging = JSON.stringify(result);
  logger.info(`availablePhoneNumbers ${result.length} ${returnForLogging}`);
}
async function calculateAccountSegmentBilling() {
  const result = await sms.calculateAccountSegmentBilling("America/Dawson");
  const returnForLogging = JSON.stringify(result);
  logger.info(`calculateAccountSegmentBilling ${list}`);
}

async function sendSMS() {
  const toNumber = process.env.TWILIO_TO_NUMBER;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const result = await sms.sendSMS({
    body: `Hello world code ${toNumber}`,
    from: fromNumber,
    to: toNumber,
  });
  const returnForLogging = JSON.stringify(result);
  logger.info(`sendSMS ${returnForLogging}`);
}
async function listAllMessages() {
  const result = await sms.listAllMessages();
  const returnForLogging = JSON.stringify(result);
  logger.info(`listAllMessages ${result.length} ${returnForLogging}`);
}
async function listFilteredMessages() {
  const dateSent = new Date(Date.UTC(2023, 04, 15));
  console.log(dateSent);
  const result = await sms.listFilteredMessages({
    dateSent,
    to: "+6421763733",
    //status: "undelivered", status not working...
    limit: 20,
  });
  const returnForLogging = JSON.stringify(result);
  logger.info(`listFilteredMessages ${result.length} ${returnForLogging}`);
}

module.exports = {
  runThisOne: function () {
    // sendSMS();
    listFilteredMessages();
  },
};
