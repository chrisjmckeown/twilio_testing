const fs = require("fs");
const _ = require("lodash");
const logger = require("../Logger/loggerService");

function escapeQuotes(value) {
  if (typeof value === "string" && value.includes('"')) {
    return value.replace(/"/g, '""');
  }
  return value;
}

function handleComma(value) {
  if (typeof value === "string" && value.includes(",")) {
    return `"${value}"`;
  }
  return value;
}

function objectToStringWithCommaSeparator(obj) {
  return _.map(obj, (value, key) => `${handleComma(escapeQuotes(value))}`).join(
    ","
  );
}

module.exports = {
  writeToCSV: async (header, filePath, data, append = true) => {
    try {
      const flags = append ? { flags: "a+" } : {};
      const writeStream = fs.createWriteStream(filePath, flags);
      let headerWritten = false;
      for (const item of data) {
        try {
          if (!headerWritten && !append) {
            await writeStream.write(`${header}\n`);
            headerWritten = true;
          }
          const line = `${objectToStringWithCommaSeparator(item)}\n`;

          const overWatermark = await writeStream.write(line);
          if (!overWatermark) {
            await new Promise((resolve) => writeStream.once("drain", resolve));
          }
        } catch (error) {
          logger(`writeToCSV row error ${error.message}`);
        }
      }
      writeStream.end();
      logger(
        `${data.length} lines ${append ? "written" : "appended"} to ${filePath}`
      );
    } catch (error) {
      logger(`writeToCSV global error ${error.message}`);
    }
  },
};
