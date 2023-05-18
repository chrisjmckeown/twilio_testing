require("dotenv").config();
const _ = require("lodash");
const logger = require("./log/loggerService");

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFICATION_SERVICE_SID = process.env.TWILIO_VERIFICATION_SERVICE_SID;

/**
 * @param {string} countryCode
 * @returns {Promise} phoneNumber[]
 */
async function availablePhoneNumbers(countryCode) {
  if (!countryCode || !ACCOUNT_SID || !AUTH_TOKEN) {
    throw new Error("Invalid input");
  }
  try {
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
    const availableNumbers = await account
      .availablePhoneNumbers(countryCode)
      .local.list({
        limit: 50,
      });
    if (!availableNumbers || _.isEmpty(availableNumbers)) {
      throw new Error("No numbers available");
    }

    const smsCapableNumbers = availableNumbers.filter(
      (number) => number.capabilities.SMS
    );
    if (_.isEmpty(smsCapableNumbers)) {
      throw new Error("No SMS capable numbers available");
    }
    return smsCapableNumbers;
  } catch (err) {
    logger.error(`availablePhoneNumbers ${err}`);
  }
}
module.exports = {
  /**
   * @param {string} subAccountSid
   * @returns {Promise} Account
   */
  returnSubAccounts: async function (subAccountSid) {
    if (!subAccountSid || !ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
      const subAccounts = await account.api.accounts(subAccountSid).fetch();
      return subAccounts;
    } catch (err) {
      logger.error(`returnSubAccounts ${err}`);
    }
  },
  /**
   * @param {string} countryCode
   * @returns {Promise} phoneNumber[]
   */
  availablePhoneNumbers: async function (countryCode) {
    if (!countryCode || !ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      const smsCapableNumbers = await availablePhoneNumbers(countryCode);
      return smsCapableNumbers;
    } catch (err) {
      logger.error(`availablePhoneNumbers ${err}`);
    }
  },
  /**
   * @param {Object} params
   * @returns {Promise} {account}
   */
  createSubAccount: async function (accountName, countryCode) {
    if (!accountName || !countryCode || !ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
      const subAccount = await account.api.accounts.create({
        friendlyName: accountName,
      });
      const subAccountTwilioAPIApp = require("twilio")(
        subAccount.sid,
        subAccount.authToken
      );
      return subAccountTwilioAPIApp;
    } catch (err) {
      logger.error(`createSubAccount ${err}`);
    }
  },
  /**
   * @param {Object} account
   * @returns {Promise} {account}
   */
  addPhoneNumber: async function (accoutSid, accoutAuthToken, countryCode) {
    if (!accoutSid || !accoutAuthToken || !countryCode) {
      throw new Error("Invalid input");
    }
    try {
      const smsCapableNumbers = await availablePhoneNumbers(countryCode);

      const account = require("twilio")(accoutSid, accoutAuthToken);
      await account.incomingPhoneNumbers.create({
        phoneNumber: smsCapableNumbers[0].phoneNumber,
      });
      return account;
    } catch (err) {
      logger.error(`addPhoneNumber ${err}`);
    }
  },
  /**
   * @param {Object} params
   * @param {string} params.body
   * @param {string} params.to
   * @param {string} params.from
   * @returns {Promise} <String>
   */
  sendSMS: async function (params) {
    const { body, to, from, mediaUrl } = params;
    if ((!ACCOUNT_SID || !AUTH_TOKEN, !body || !to || !from)) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
      const result = await account.messages.create(params);
      return result;
    } catch (err) {
      logger.error(`sendSMS ${err}`);
    }
  },
  /**
   * @param {String} subAccountSid
   * @returns {Promise} <Boolean> Whether the credentials are valid or not
   */
  checkCredentialsAsync: async (subAccountSid) => {
    if (!subAccountSid || !ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      // Master API client
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

      const subAaccount = await account.api.accounts(subAccountSid).fetch();
      logger.info(
        `TwilioService.checkCredentials          - lookup succeeded: name: ${subAaccount.friendlyName}, status: ${subAaccount.status}`
      );
      return _.get(subAaccount, "status", "") === "active";
    } catch (err) {
      logger.error(`checkCredentialsAsync ${err}`);
    }
  },
  /**
   * @param {string} timezone
   * @returns {Array}
   */
  calculateAccountBilling: async function (timezone) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !timezone) {
      throw new Error("Invalid input");
    }
    try {
      const moment = require("moment-timezone");

      // Sub-account API client
      const messages = await require("twilio")(
        ACCOUNT_SID,
        AUTH_TOKEN
      ).messages.list({
        // Except for tests, Twilio charges for the previous month and current month to date are returned.
        dateSentAfter: moment
          .tz(moment(), timezone)
          .subtract(1, "month")
          .startOf("month")
          .utc()
          .toDate(),
        dateSentBefore: moment
          .tz(moment(), timezone)
          .endOf("month")
          .utc()
          .toDate(),
      });

      return _.map(
        _.uniq(
          _.map(messages, (message) =>
            moment(message.dateSent).toISOString().substring(0, 7)
          )
        ),
        (yearMonthString) => {
          const messagesSliceByMonth = messages.filter(
            (message) =>
              moment(message.dateSent).toISOString().substring(0, 7) ===
              yearMonthString
          );
          return {
            month: yearMonthString,
            messageCount: messagesSliceByMonth.length,
            monthlyCharge:
              Math.round(
                _.reduce(
                  messagesSliceByMonth,
                  (sum, message) =>
                    sum +
                    (_.isNull(message.price)
                      ? 0
                      : parseFloat(message.price) * -1),
                  0
                ) * 100
              ) / 100,
            currency: messagesSliceByMonth[0].priceUnit,
          };
        }
      );
    } catch (err) {
      logger.error(`calculateAccountBilling ${err}`);
    }
  },
  /**
   * @returns {Promise} Message[] List of all messages
   */
  listAllMessages: async function (filter) {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
      const messages = await account.messages.list(filter);
      const result = messages.map((message) => ({
        to: message.to,
        from: message.from,
        status: message.status,
        sid: message.sid,
      }));
      return messages;
    } catch (err) {
      logger.error(`listAllMessages ${err}`);
    }
  },
  /**
   * @param {Object} filter
   * @returns {Promise} Message[] List of all message that meet the criteria
   */
  listFilteredMessages: async function (filter) {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
      const messages = await account.messages.list(filter);
      if (messages.count === 0) {
        return "No messages found";
      }
      const result = messages.map((message) => ({
        to: message.to,
        from: message.from,
        status: message.status,
        sid: message.sid,
      }));
      return result;
    } catch (err) {
      logger.error(`smsListFilteredMessages ${err}`);
    }
  },
  /**
   * @param {String}status
   * @returns {String} statement describing the action taken
   */
  changeAccountStatus: async function (status, subAccountSid) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !status || !subAccountSid) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

    const subAccount = await account.api
      .accounts(subAccountSid)
      .update({ status });
    return `Account ${subAccount.friendlyName} has been successfully changed to the status:${status}`;
  },
  /**
   * @param {String}status
   * @returns {String} statement describing the action taken
   */
  validatePhoneNumber: async function (phoneNumber, inputTypes) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !phoneNumber || !inputTypes) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

    const types = typeof inputTypes === "object" ? inputTypes : [inputTypes];
    const result = await account.lookups.v1
      .phoneNumbers(phoneNumber)
      .fetch({ type: types });

    if (types.includes("lti")) {
      const { lineTypeIntelligence } = await account.lookups.v2
        .phoneNumbers(phoneNumber)
        .fetch({ fields: "line_type_intelligence" });

      result.lineTypeIntelligence = lineTypeIntelligence;
    }
    return result;
  },
  /**
   * @param {String}phoneNumber
   * @param {String}channel
   * @returns {String}
   */
  sendNumberVerification: async function (phoneNumber, channel) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !phoneNumber || !channel) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

    const result = await account.verify.v2
      .services(VERIFICATION_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel });
    return result;
  },
  /**
   * @param {String}phoneNumber
   * @param {String}verificationCode
   * @returns {boolean}
   */
  updateNumberVerification: async function (phoneNumber, verificationCode) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !phoneNumber || !verificationCode) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

    const verificationCheck = await account.verify.v2
      .services(VERIFICATION_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code: verificationCode });

    if (verificationCheck.status === "approved") {
      return true;
    } else {
      return false;
    }
  },
  /**
   * @param {String}phoneNumber
   * @param {String}friendlyName
   * @returns {object}
   */
  addVerifiedPhoneNumber: async function (phoneNumber, friendlyName) {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !phoneNumber || !friendlyName) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);

    const validationRequests = await account.validationRequests.create({
      phoneNumber,
      friendlyName,
    });
    return validationRequests;
  },
  /**
   * @returns {object}
   */
  verificationAttempts: async function () {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(ACCOUNT_SID, AUTH_TOKEN);
    // const verificationAttempts = await account.verify.v2
    //   .verificationAttempts("VEf83b0a9b5723821977c0ced21aabce4a")
    //   .fetch();

    const verificationAttempts =
      await account.verify.v2.verificationAttempts.list({ limit: 20 });
    return verificationAttempts;
  },
};
