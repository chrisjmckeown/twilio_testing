const fs = require("fs");
const csvParse = require("csv-parser");
const logger = require("../Logger/loggerService");

module.exports = {
  readFromCSV: async (filePath) => {
    logger(`Reading data from ${filePath}`);
    const results = [];
    const batchSize = 500000;
    let count = 0;
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParse())
        .on("data", (data) => {
          if (count === batchSize) {
            logger(`${results.length} read`);
            count = 0;
          }
          count++;
          results.push(data);
        })
        .on("end", () => {
          logger(`All rows read ${filePath} ${results.length}`);
          resolve(results);
        })
        .on("error", (error) => {
          logger(`Failed to read rows`);
          reject(error);
        });
    });
  },
};
