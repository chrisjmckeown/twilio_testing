const express = require("express");
const router = express.Router();
const sms = require("./sms");
const logger = require("./log/loggerService");
const _ = require("lodash");
const env = require("./editENV");
const ValidationService = require("./ValidationService");

const ACCOUNT_STATUS = {
  SUSPENDED: "suspended",
  ACTIVE: "active",
  CLOSED: "closed",
};

router.post("/ReturnSubAccounts", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      subAccountSid: "string",
    });
    const { subAccountSid } = req.body;
    const result = await sms.returnSubAccounts(subAccountSid);
    const returnForLogging = JSON.stringify(result);
    logger.info(`returnSubAccounts ${returnForLogging}`);
    return res.status(200).send(`returnSubAccounts ${returnForLogging}`);
  } catch (err) {
    logger.error(`returnSubAccounts ${err}`);
    return res.status(400).send(`returnSubAccounts ${err}`);
  }
});
router.post("/CheckCredentialsAsync", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      subAccountSid: "string",
    });
    const { subAccountSid } = req.body;
    const result = await sms.checkCredentialsAsync(subAccountSid);
    const returnForLogging = JSON.stringify(result);
    logger.info(`checkCredentialsAsync ${returnForLogging}`);
    return res.status(200).send(`checkCredentialsAsync ${returnForLogging}`);
  } catch (err) {
    logger.error(`checkCredentialsAsync ${err}`);
    return res.status(400).send(`checkCredentialsAsync ${err}`);
  }
});
router.post("/AvailablePhoneNumbers", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      country: "string",
    });
    const { country } = req.body;
    const result = await sms.availablePhoneNumbers(country);
    const returnForLogging = JSON.stringify(result);
    logger.info(`availablePhoneNumbers ${result.length} ${returnForLogging}`);
    return res.status(200).send(`availablePhoneNumbers ${returnForLogging}`);
  } catch (err) {
    logger.error(`availablePhoneNumbers ${err}`);
    return res.status(400).send(`availablePhoneNumbers ${err}`);
  }
});
router.post("/CalculateAccountBilling", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      timeZone: "string",
    });
    const { timeZone } = req.body;
    const result = await sms.calculateAccountBilling(timeZone);
    const returnForLogging = JSON.stringify(result);
    logger.info(`calculateAccountBilling ${returnForLogging}`);
    return res.status(200).send(`calculateAccountBilling ${returnForLogging}`);
  } catch (err) {
    logger.error(`calculateAccountBilling ${err}`);
    return res.status(400).send(`calculateAccountBilling ${err}`);
  }
});
router.post("/SendSMS", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      to: "string",
      from: "string",
      body: "string",
    });
    const { body, to, from, mediaUrl } = req.body;
    const payload = {
      body,
      from,
      to,
      statusCallback:
        "https://fathomless-thicket-45351.herokuapp.com/api/sms_status_callback",
    };

    if (mediaUrl) payload.mediaUrl = mediaUrl;
    const result = await sms.sendSMS(payload);
    const returnForLogging = JSON.stringify(result);
    logger.info(`sendSMS ${returnForLogging}`);
    return res.status(200).send(`sendSMS ${returnForLogging}`);
  } catch (err) {
    logger.error(`sendSMS ${err}`);
    return res.status(400).send(`sendSMS ${err}`);
  }
});
router.post("/ListAllMessages", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      limit: "number",
    });
    const { limit } = req.body;
    const result = await sms.listAllMessages({ limit });
    const returnForLogging = JSON.stringify(result);
    logger.info(`listAllMessages ${result.length} ${returnForLogging}`);
    return res.status(200).send(`listAllMessages ${returnForLogging}`);
  } catch (err) {
    logger.error(`listAllMessages ${err}`);
    return res.status(400).send(`listAllMessages ${err}`);
  }
});
router.post("/ListFilteredMessages", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      to: "string",
      limit: "number",
      status: "string",
      date: "date",
    });
    const { to, limit, status, date } = req.body;
    const dateSent = new Date(date);
    const result = await sms.listFilteredMessages({
      dateSent,
      to,
      status,
      limit,
    });
    const returnForLogging = JSON.stringify(result);
    logger.info(`listFilteredMessages ${result.length} ${returnForLogging}`);
    return res.status(200).send(`listFilteredMessages ${returnForLogging}`);
  } catch (err) {
    logger.error(`listFilteredMessages ${err}`);
    return res.status(400).send(`listFilteredMessages ${err}`);
  }
});
router.post("/ChangeAccountStatus", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      subAccountSid: "string",
      status: "string",
    });
    const { subAccountSid, status } = req.body;
    const result = await sms.changeAccountStatus(status, subAccountSid);
    const returnForLogging = JSON.stringify(result);
    logger.info(`changeAccountStatus ${returnForLogging}`);
    return res.status(200).send(`changeAccountStatus ${returnForLogging}`);
  } catch (err) {
    logger.error(`changeAccountStatus ${err}`);
    return res.status(400).send(`changeAccountStatus ${err}`);
  }
});
router.post("/CreateSubAccount", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      country: "string",
      name: "string",
    });
    const { country, name } = req.body;
    const result = await sms.createSubAccount(name, country);
    const { accountSid, password } = result;
    env.setEnvValue("TWILIO_SUBACCOUNT_SID", accountSid);
    env.setEnvValue("TWILIO_SUBACCOUNT_AUTH_TOKEN", password);
    const returnForLogging = JSON.stringify(result);
    logger.info(`createSubAccount ${returnForLogging}`);
    const addPhoneNumberResult = await sms.addPhoneNumber(
      accountSid,
      password,
      country
    );
    const returnForLogging2 = JSON.stringify(addPhoneNumberResult);
    logger.info(`addPhoneNumber ${returnForLogging2}`);
    return res.status(200).send(`createSubAccount ${returnForLogging}`);
  } catch (err) {
    logger.error(`createSubAccount ${err}`);
    return res.status(400).send(`createSubAccount ${err}`);
  }
});
router.post("/ValidatePhoneNumber", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      phoneNumber: "string",
      validationRules: "array",
    });
    const { phoneNumber, validationRules } = req.body;
    const result = await sms.validatePhoneNumber(phoneNumber, validationRules);
    const returnForLogging = JSON.stringify(result);
    logger.info(`validatePhoneNumber ${returnForLogging}`);
    return res.status(200).send(`validatePhoneNumber ${returnForLogging}`);
  } catch (err) {
    logger.error(`validatePhoneNumber ${err}`);
    return res.status(400).send(`validatePhoneNumber ${err}`);
  }
});
router.post("/MessageStatus", async (req, res) => {
  await ValidationService.validateOrThrow(req.body, {
    MessageSid: "string",
    MessageStatus: "string",
  });
  const { MessageSid, MessageStatus } = req.body;
  console.log(`SID: ${MessageSid}, Status: ${MessageStatus}`);

  return res.status(200).send(`SID: ${MessageSid}, Status: ${MessageStatus}`);
});
// Endpoint to handle the Twilio status callback
router.post("/sms_status_callback", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      MessageSid: "string",
      MessageStatus: "string",
      To: "string",
    });
    const { MessageSid, MessageStatus, To, Body } = req.body;
    console.log(req.body);
    console.log(
      `essage SID: ${MessageSid}, Message Status: ${MessageStatus}, Recipient Number: ${To}, Body: ${Body}`
    );
    return res
      .status(200)
      .send(
        `Message SID: ${MessageSid}, Message Status: ${MessageStatus}, Recipient Number: ${To}, Body: ${Body}`
      );
  } catch (err) {
    logger.error(`sms_status_callback ${err}`);
    console.log(`sms_status_callback ${err}`);
    return res.status(400).send(`sms_status_callback ${err}`);
  }
});

// Endpoint to handle the Twilio status callback
router.get("*", (req, res) => {
  return res.status(200).send("catch all end point");
});

module.exports = router;
