const winston = require("winston");

// Create a Winston logger
const log = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "twilio-service" },
  transports: [
    new winston.transports.File({ filename: "./log/err.log", level: "error" }),
    new winston.transports.File({ filename: "./log/output.log" }),
  ],
});
module.exports = log;
