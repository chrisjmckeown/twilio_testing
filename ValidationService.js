const _ = require("lodash");

module.exports = {
  validateOrThrow: async (paramsToValidate, rules) => {
    if (
      !paramsToValidate ||
      !_.isPlainObject({ ...paramsToValidate }) ||
      _.isEmpty(paramsToValidate)
    ) {
      throw new Error("Invalid params provided.");
    }

    if (!_.isPlainObject(rules)) {
      throw new Error(
        "Invalid rules provided to HelperService.validateOrThrow()"
      );
    }
    const spreadParameterKeys = Object.keys(rules);
    spreadParameterKeys.forEach((guestParameterKey) => {
      if (!_.get(paramsToValidate, guestParameterKey)) {
        throw new Error(`${guestParameterKey} is missing`);
      }
    });
    return Promise.resolve();
  },
};
