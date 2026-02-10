// credentials middleware
const allowedList = require("../config/allowedOrigin");

const credentials = (req, res, next) => {
  const origin = req.headers.origin;

  if (allowedList.indexOf(origin) !== -1) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  next();
};

module.exports = credentials;
