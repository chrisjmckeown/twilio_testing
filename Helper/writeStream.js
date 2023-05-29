const fs = require("fs");
const _ = require("lodash");
const logger = require("../Logger/loggerService");

function handleComma(value) {
  if (typeof value === "string" && value.includes(",")) {
    return `"${value}"`;
  }
  return value;
}

function objectToStringWithCommaSeparator(obj) {
  return _.map(obj, (value, key) => `${handleComma(value)}`).join(",");
}

module.exports = {
  writeToCSV: async (filePath, data) => {
    try {
      const writeStream = fs.createWriteStream(filePath, { flags: "a+" });
      for (const item of data) {
        try {
          const line = `${objectToStringWithCommaSeparator(item)}\n`;

          const overWatermark = await writeStream.write(line);
          if (!overWatermark) {
            await new Promise((resolve) => writeStream.once("drain", resolve));
          }
        } catch (error) {
          logger("writeToCSV row error", error);
        }
      }
      writeStream.end();
    } catch (error) {
      logger("writeToCSV global error", error);
    }
  },
};
