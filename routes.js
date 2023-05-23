const express = require("express");
const router = express.Router();
const sms = require("./sms");
const logger = require("./log/loggerService");
const _ = require("lodash");
const env = require("./editENV");
const ValidationService = require("./ValidationService");
const { getDb } = require("./db");

const nodeEnv = process.env.NODE_ENV;
const ACCOUNT_STATUS = {
  SUSPENDED: "suspended",
  ACTIVE: "active",
  CLOSED: "closed",
};

router.post("/return-sub-accounts", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "returnSubAccounts", message: err.message });
  }
});
router.post("/check-credentials-async", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "checkCredentialsAsync", message: err.message });
  }
});
router.post("/available-phone-numbers", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "availablePhoneNumbers", message: err.message });
  }
});
router.post("/calculate-account-billing", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "calculateAccountBilling", message: err.message });
  }
});
router.post("/send-sms", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      to: "string",
      body: "string",
    });
    const { body, to, from, mediaUrl } = req.body;
    const payload = {
      body,
      to,
    };
    if (from) {
      payload.from = from;
      payload.statusCallback =
        "https://fathomless-thicket-45351.herokuapp.com/api/sms_status_callback";
    } else {
      payload.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
      payload.shortenUrls = true;
    }

    if (mediaUrl) payload.mediaUrl = mediaUrl;
    const result = await sms.sendSMS(payload);
    const returnForLogging = JSON.stringify(result);
    logger.info(`sendSMS ${returnForLogging}`);
    return res.status(200).send(`sendSMS ${returnForLogging}`);
  } catch (err) {
    logger.error(`sendSMS ${err}`);
    return res.status(400).send({ error: "sendSMS", message: err.message });
  }
});
router.post("/list-all-messages", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      limit: "number",
    });
    const { limit } = req.body;
    const result = await sms.listAllMessages({ limit });
    const returnForLogging = JSON.stringify(result);
    logger.info(`listAllMessages ${result.length} ${returnForLogging}`);
    return res.status(200).send(result);
  } catch (err) {
    logger.error(`listAllMessages ${err}`);
    return res
      .status(400)
      .send({ error: "listAllMessages", message: err.message });
  }
});
router.post("/list-filtered-messages", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "listFilteredMessages", message: err.message });
  }
});
router.post("/change-account-status", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "changeAccountStatus", message: err.message });
  }
});
router.post("/create-sub-account", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "createSubAccount", message: err.message });
  }
});
router.post("/validate-phone-number", async (req, res) => {
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
    return res
      .status(400)
      .send({ error: "validatePhoneNumber", message: err.message });
  }
});
router.post("/send-verification", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      phoneNumber: "string",
      channel: "string",
    });
    const { phoneNumber, channel } = req.body;
    const result = await sms.sendNumberVerification(phoneNumber, channel);
    const returnForLogging = JSON.stringify(result);
    logger.info(`sendNumberVerification ${returnForLogging}`);
    return res.status(200).send(`sendNumberVerification ${returnForLogging}`);
  } catch (err) {
    logger.error(`sendNumberVerification ${err}`);
    return res
      .status(400)
      .send({ error: "sendNumberVerification", message: err.message });
  }
});
router.post("/verify-code", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      phoneNumber: "string",
      verificationCode: "string",
    });
    const { phoneNumber, verificationCode } = req.body;
    const result = await sms.updateNumberVerification(
      phoneNumber,
      verificationCode
    );
    const returnForLogging = JSON.stringify(result);
    logger.info(`updateNumberVerification ${returnForLogging}`);
    if (result) {
      // Code verification successful
      return res
        .status(200)
        .send(`updateNumberVerification ${returnForLogging}`);
    } else {
      // Code verification failed
      return res
        .status(400)
        .send(`updateNumberVerification ${returnForLogging}`);
    }
  } catch (err) {
    logger.error(`updateNumberVerification ${err}`);
    return res
      .status(400)
      .send({ error: "updateNumberVerification", message: err.message });
  }
});
router.post("/message-status", async (req, res) => {
  await ValidationService.validateOrThrow(req.body, {
    MessageSid: "string",
    MessageStatus: "string",
  });
  const { MessageSid, MessageStatus } = req.body;
  console.log(`SID: ${MessageSid}, Status: ${MessageStatus}`);

  return res.status(200).send(`SID: ${MessageSid}, Status: ${MessageStatus}`);
});
router.post("/add-verified-phone-number", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      phoneNumber: "string",
      friendlyName: "string",
    });
    const { phoneNumber, friendlyName } = req.body;
    const result = await sms.addVerifiedPhoneNumber(phoneNumber, friendlyName);
    const returnForLogging = JSON.stringify(result);
    logger.info(`addVerifiedPhoneNumber ${returnForLogging}`);
    return res.status(200).send(`addVerifiedPhoneNumber ${returnForLogging}`);
  } catch (err) {
    logger.error(`addVerifiedPhoneNumber ${err}`);
    return res
      .status(400)
      .send({ error: "addVerifiedPhoneNumber", message: err.message });
  }
});
router.post("/verification-attempts", async (req, res) => {
  try {
    const result = await sms.verificationAttempts();
    const returnForLogging = JSON.stringify(result);
    logger.info(`verificationAttempts ${returnForLogging}`);
    return res.status(200).send(`verificationAttempts ${returnForLogging}`);
  } catch (err) {
    logger.error(`verificationAttempts ${err}`);
    return res
      .status(400)
      .send({ error: "verificationAttempts", message: err.message });
  }
});
router.get("/health", async (req, res) => {
  return res
    .status(200)
    .send({ Status: "online and working", Environment: nodeEnv });
});
router.post("/sms_status_callback", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      MessageSid: "string",
      MessageStatus: "string",
      To: "string",
    });
    const { MessageSid, MessageStatus, To } = req.body;
    const db = getDb();
    const message = req.body;
    await db.collection("smsCallbackURL").insertOne(message);
    console.log(
      `essage SID: ${MessageSid}, Message Status: ${MessageStatus}, Recipient Number: ${To}`
    );
    return res
      .status(200)
      .send(
        `Message SID: ${MessageSid}, Message Status: ${MessageStatus}, Recipient Number: ${To}`
      );
  } catch (err) {
    logger.error(`sms_status_callback ${err}`);
    console.log(`sms_status_callback ${err}`);
    return res
      .status(400)
      .send({ error: "sms_status_callback", message: err.message });
  }
});
router.get("/sms_status_callback", async (req, res) => {
  const db = getDb();
  const result = await db.collection("smsCallbackURL").find().toArray();
  res.status(200).json(result);
});
router.post("/messaging_service_callback", async (req, res) => {
  try {
    const db = getDb();
    const message = req.body;
    await db.collection("messageCallbackURL").insertOne(message);
    const returnForLogging = JSON.stringify(message);
    logger.info(`messaging_service_callback ${returnForLogging}`);
    console.log(`messaging_service_callback initiated ${returnForLogging}`);
    return res
      .status(200)
      .send(`messaging_service_callback initiated ${returnForLogging}`);
  } catch (err) {
    logger.error(`messaging_service_callback ${err}`);
    console.log(`messaging_service_callback ${err}`);
    return res
      .status(400)
      .send({ error: "messaging_service_callback", message: err.message });
  }
});
router.get("/messaging_service_callback", async (req, res) => {
  const db = getDb();
  const result = await db.collection("messageCallbackURL").find().toArray();
  res.status(200).json(result);
});
router.post("/messaging_fallback_URL", async (req, res) => {
  try {
    const db = getDb();
    const message = req.body;
    await db.collection("fallBackURL").insertOne(message);
    const returnForLogging = JSON.stringify(message);
    logger.info(`messaging_fallback_URL ${returnForLogging}`);
    console.log(`messaging_fallback_URL initiated ${returnForLogging}`);
    return res
      .status(200)
      .send(`messaging_fallback_URL initiated ${returnForLogging}`);
  } catch (err) {
    logger.error(`messaging_fallback_URL ${err}`);
    console.log(`messaging_fallback_URL ${err}`);
    return res
      .status(400)
      .send({ error: "messaging_fallback_URL", message: err.message });
  }
});
router.get("/messaging_fallback_URL", async (req, res) => {
  const db = getDb();
  const result = await db.collection("fallBackURL").find().toArray();
  res.status(200).json(result);
});
router.post("/messaging_callback_URL", async (req, res) => {
  try {
    const db = getDb();
    const message = req.body;
    await db.collection("callBackURL").insertOne(message);
    const returnForLogging = JSON.stringify(message);
    logger.info(`messaging_callback_URL ${returnForLogging}`);
    console.log(`messaging_callback_URL initiated ${returnForLogging}`);
    return res
      .status(200)
      .send(`messaging_callback_URL initiated ${returnForLogging}`);
  } catch (err) {
    logger.error(`messaging_callback_URL ${err}`);
    console.log(`messaging_callback_URL ${err}`);
    return res
      .status(400)
      .send({ error: "messaging_callback_URL", message: err.message });
  }
});
router.get("/messaging_callback_URL", async (req, res) => {
  const db = getDb();
  const result = await db.collection("callBackURL").find().toArray();
  res.status(200).json(result);
});
router.get("*", (req, res) => {
  return res.status(200).send("catch all end point");
});

module.exports = router;
