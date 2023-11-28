const winston = require("winston");

// Create a Winston logger
const log = winston.createLogger({
  level: "info",
  // format: winston.format.combine(
  //   winston.format.errors({ stack: true }),
  //   winston.format.timestamp(),
  //   winston.format.json()
  // ),
  // defaultMeta: { service: "twilio-service" },
  transports: [
    new winston.transports.File({
      filename: "./log/output.log",
      json: false,
      timestamp: false,
      showLevel: false,
    }),
  ],
});

function consoleLog(message, consoleLog = true) {
  if (consoleLog) console.log(message);
  log.info(message);
}

module.exports = consoleLog;
