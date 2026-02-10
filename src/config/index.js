require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
  },
};
