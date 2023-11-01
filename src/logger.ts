import winston from "winston";

const logger = winston.createLogger({
  level: "debug",
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: new winston.transports.Console(),
});

export default logger;
