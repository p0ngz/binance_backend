// logger middleware
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// log directory
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// fileName
const getLogFileName = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `access-${y}-${m}-${d}.log`;
};

// customize token morgan
morgan.token("datetime", () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
});

const fileFormat =
  "[:datetime] :method :url :status :response-time[0]ms - :res[content-length]b";

//   middleware logger
const setupLogger = (app) => {
  app.use(morgan("dev"));

  const logStream = {
    write: (message) => {
      const logFile = path.join(logDir, getLogFileName());
      fs.appendFileSync(logFile, message);
    },
  };
  app.use(morgan(fileFormat, { stream: logStream }));
};

module.exports = setupLogger;
