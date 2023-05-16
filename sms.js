require("dotenv").config();
const _ = require("lodash");
const logger = require("./log/loggerService");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

/**
 * @param {string} countryCode
 * @returns {Promise} phoneNumber[]
 */
async function availablePhoneNumbers(countryCode) {
  if (!countryCode || !accountSid || !authToken) {
    throw new Error("Invalid input");
  }
  try {
    const account = require("twilio")(accountSid, authToken);
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
    if (!subAccountSid || !accountSid || !authToken) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(accountSid, authToken);
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
    if (!countryCode || !accountSid || !authToken) {
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
    if (!accountName || !countryCode || !accountSid || !authToken) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(accountSid, authToken);
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
    if ((!accountSid || !authToken, !body || !to || !from)) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(accountSid, authToken);
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
    if (!subAccountSid || !accountSid || !authToken) {
      throw new Error("Invalid input");
    }
    try {
      // Master API client
      const account = require("twilio")(accountSid, authToken);

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
    if (!accountSid || !authToken || !timezone) {
      throw new Error("Invalid input");
    }
    try {
      const moment = require("moment-timezone");

      // Sub-account API client
      const messages = await require("twilio")(
        accountSid,
        authToken
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
  listAllMessages: async function () {
    if (!accountSid || !authToken) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(accountSid, authToken);
      const messages = await account.messages.list();
      const result = messages.map((message) => ({
        to: message.to,
        from: message.from,
        status: message.status,
        sid: message.sid,
      }));
      return result;
    } catch (err) {
      logger.error(`listAllMessages ${err}`);
    }
  },
  /**
   * @param {Object} filter
   * @returns {Promise} Message[] List of all message that meet the criteria
   */
  listFilteredMessages: async function (filter) {
    if (!accountSid || !authToken) {
      throw new Error("Invalid input");
    }
    try {
      const account = require("twilio")(accountSid, authToken);
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
    if (!accountSid || !authToken || !status || !subAccountSid) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(accountSid, authToken);

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
    if (!accountSid || !authToken || !phoneNumber || !inputTypes) {
      throw new Error("Invalid input");
    }
    const account = require("twilio")(accountSid, authToken);

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
};
