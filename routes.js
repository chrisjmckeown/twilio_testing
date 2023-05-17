const express = require("express");
const router = express.Router();
const sms = require("./sms");
const logger = require("./log/loggerService");
const _ = require("lodash");
const env = require("./editENV");
const ValidationService = require("./ValidationService");

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
    return res.status(400).send(`returnSubAccounts ${err}`);
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
    return res.status(400).send(`checkCredentialsAsync ${err}`);
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
    return res.status(400).send(`availablePhoneNumbers ${err}`);
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
    return res.status(400).send(`calculateAccountBilling ${err}`);
  }
});
router.post("/send-sms", async (req, res) => {
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
    return res.status(400).send(`listAllMessages ${err}`);
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
    return res.status(400).send(`listFilteredMessages ${err}`);
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
    return res.status(400).send(`changeAccountStatus ${err}`);
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
    return res.status(400).send(`createSubAccount ${err}`);
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
    return res.status(400).send(`validatePhoneNumber ${err}`);
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
    return res.status(400).send(`sendNumberVerification ${err}`);
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
    return res.status(400).send(`updateNumberVerification ${err}`);
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
router.post("/sms_status_callback", async (req, res) => {
  try {
    await ValidationService.validateOrThrow(req.body, {
      MessageSid: "string",
      MessageStatus: "string",
      To: "string",
    });
    const { MessageSid, MessageStatus, To } = req.body;
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
    return res.status(400).send(`sms_status_callback ${err}`);
  }
});
router.get("/health", async (req, res) => {
  return res.status(200).send({ Status: "online", Environment: nodeEnv });
});
router.get("*", (req, res) => {
  return res.status(200).send("catch all end point");
});

module.exports = router;
