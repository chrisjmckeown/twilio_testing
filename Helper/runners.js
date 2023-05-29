const sms = require("../sms");
const logger = require("./Logger/loggerService");
const _ = require("lodash");
const env = require("../Helper/editENV");

const subAccountSid = process.env.TWILIO_SUBACCOUNT_SID;
const toNumber = process.env.TWILIO_TO_NUMBER;

const ACCOUNT_STATUS = {
  SUSPENDED: "suspended",
  ACTIVE: "active",
  CLOSED: "closed",
};

async function returnSubAccounts() {
  try {
    const result = await sms.returnSubAccounts(subAccountSid);
    const returnForLogging = JSON.stringify(result);
    logger(`returnSubAccounts ${returnForLogging}`);
  } catch (err) {
    logger(`returnSubAccounts ${err}`);
  }
}
async function checkCredentialsAsync() {
  try {
    const result = await sms.checkCredentialsAsync(subAccountSid);
    logger(`checkCredentialsAsync ${result}`);
  } catch (err) {
    logger(`checkCredentialsAsync ${err}`);
  }
}
async function availablePhoneNumbers() {
  try {
    const result = await sms.availablePhoneNumbers("US");
    const returnForLogging = JSON.stringify(result);
    logger(`availablePhoneNumbers ${result.length} ${returnForLogging}`);
  } catch (err) {
    logger(`availablePhoneNumbers ${err}`);
  }
}
async function calculateAccountBilling() {
  try {
    const result = await sms.calculateAccountBilling("America/Dawson");
    const returnForLogging = JSON.stringify(result);
    logger(`calculateAccountBilling ${returnForLogging}`);
  } catch (err) {
    logger(`calculateAccountBilling ${err}`);
  }
}
async function sendSMS() {
  try {
    const toNumber = process.env.TWILIO_TO_NUMBER;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const result = await sms.sendSMS({
      body: `via runner ${toNumber}`,
      from: fromNumber,
      to: toNumber,
      statusCallback:
        "https://fathomless-thicket-45351.herokuapp.com/api/sms_status_callback",
      // mediaUrl: ["https://demo.twilio.com/owl.png"],
    });
    const returnForLogging = JSON.stringify(result);
    logger(`sendSMS ${returnForLogging}`);
  } catch (err) {
    logger(`sendSMS ${err}`);
  }
}
async function listAllMessages() {
  try {
    const result = await sms.listAllMessages();
    const returnForLogging = JSON.stringify(result);
    logger(`listAllMessages ${result.length} ${returnForLogging}`);
  } catch (err) {
    logger(`listAllMessages ${err}`);
  }
}
async function listFilteredMessages() {
  try {
    const dateSent = new Date(Date.UTC(2023, 04, 15));
    const result = await sms.listFilteredMessages({
      dateSent,
      to: "+6421763733",
      //status: "undelivered", status not working...
      limit: 20,
    });
    const returnForLogging = JSON.stringify(result);
    logger(`listFilteredMessages ${result.length} ${returnForLogging}`);
  } catch (err) {
    logger(`listFilteredMessages ${err}`);
  }
}
async function changeAccountStatus(status) {
  try {
    const result = await sms.changeAccountStatus(status, subAccountSid);
    const returnForLogging = JSON.stringify(result);
    logger(`changeAccountStatus ${returnForLogging}`);
  } catch (err) {
    logger(`changeAccountStatus ${err}`);
  }
}
async function createSubAccount() {
  try {
    const result = await sms.createSubAccount("next minute", "US");
    const { accountSid, password } = result;
    env.setEnvValue("TWILIO_SUBACCOUNT_SID", accountSid);
    env.setEnvValue("TWILIO_SUBACCOUNT_AUTH_TOKEN", password);
    const returnForLogging = JSON.stringify(result);
    logger(`createSubAccount ${returnForLogging}`);
    const addPhoneNumberResult = await sms.addPhoneNumber(
      accountSid,
      password,
      "US"
    );
    const returnForLogging2 = JSON.stringify(addPhoneNumberResult);
    logger(`addPhoneNumber ${returnForLogging2}`);
  } catch (err) {
    logger(`createSubAccount ${err}`);
  }
}
async function validatePhoneNumber(phoneNumber) {
  try {
    const result = await sms.validatePhoneNumber(phoneNumber, [
      "lti",
      "carrier",
    ]);
    const returnForLogging = JSON.stringify(result);
    logger(`validatePhoneNumber ${returnForLogging}`);
  } catch (err) {
    logger(`validatePhoneNumber ${err}`);
  }
}

module.exports = {
  runThisOne: async function () {
    // await  returnSubAccounts();
    // await  checkCredentialsAsync();
    // await  availablePhoneNumbers();
    // await calculateAccountBilling();
    await sendSMS();
    // await  listAllMessages();
    // await  listFilteredMessages(); // can't filter by status: "undelivered"
    // await changeAccountStatus(ACCOUNT_STATUS.CLOSED);
    // await createSubAccount(); // can't add phone number with free account
    // await validatePhoneNumber("+6434567890");

    // await trackClicks(); // to review / build
  },
};
