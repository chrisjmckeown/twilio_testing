require("dotenv").config();
const _ = require("lodash");
const logger = require("./loggerService");

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

module.exports = {
  /**
   * @param {string} subAccountSid
   * @returns {Promise} Account
   */
  returnSubAccounts: async function (subAccountSid) {
    if (!subAccountSid || !accountSid || !authToken) {
      return false;
    }
    const account = require("twilio")(accountSid, authToken);
    const subAccounts = await account.api.accounts(subAccountSid).fetch();
    return subAccounts;
  },

  /**
   * @param {string} countryCode
   * @returns {Promise} phoneNumber[]
   */
  availablePhoneNumbers: async function (countryCode) {
    if (!countryCode || !accountSid || !authToken) {
      return false;
    }
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
  },
  /**
   * @param {Object} params
   * @param {string} params.body
   * @param {string} params.to
   * @param {Object} params.from
   * @returns {Promise} phoneNumber[]
   */
  createSubAccount: async function () {
    if (!countryCode || !accountSid || !authToken) {
      return false;
    }
    const client = require("twilio")(accountSid, authToken);
    const availableNumbers = await client
      .availablePhoneNumbers("US")
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

    const account = await client.api.accounts.create({
      friendlyName: "This is a test",
    });

    const subAccountTwilioAPIApp = require("twilio")(
      account.sid,
      account.authToken
    );
    return subAccountTwilioAPIApp;
  },
  /**
   * @param {Object} params
   * @param {string} params.body
   * @param {string} params.to
   * @param {string} params.from
   * @returns {Promise} <String>
   */
  sendSMS: async function (params) {
    const { body, to, from } = params;
    if ((!accountSid || !authToken, !body || !to || !from)) {
      return false;
    }
    try {
      const account = require("twilio")(accountSid, authToken);
      const result = await account.messages.create({ body, from, to });
      return result;
    } catch (error) {
      return { error };
    }
  },
  /**
   * @param {String} subAccountSid
   * @returns {Promise} <Boolean> Whether the credentials are valid or not
   */
  checkCredentialsAsync: async (subAccountSid) => {
    if (!subAccountSid || !accountSid || !authToken) {
      return false;
    }
    // Master API client
    const account = require("twilio")(accountSid, authToken);

    const subAaccount = await account.api.accounts(subAccountSid).fetch();
    logger.info(
      `TwilioService.checkCredentials          - lookup succeeded: name: ${subAaccount.friendlyName}, status: ${subAaccount.status}`
    );
    return _.get(subAaccount, "status", "") === "active";
  },
  /**
   * @param {string} timezone
   * @returns {Array} of objects summarising messaging and cost data for each month since August 2019
   */
  calculateAccountSegmentBilling: async function (timezone) {
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
  },

  listAllMessages: async function () {
    if (!accountSid || !authToken) {
      return false;
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
    } catch (error) {
      return { error };
    }
  },

  listFilteredMessages: async function (filter) {
    if (!accountSid || !authToken) {
      return false;
    }
    try {
      const account = require("twilio")(accountSid, authToken);
      const messages = await account.messages.list(filter);
      const result = messages.map((message) => ({
        to: message.to,
        from: message.from,
        status: message.status,
        sid: message.sid,
      }));
      return result;
    } catch (error) {
      return { error };
    }
  },
};
