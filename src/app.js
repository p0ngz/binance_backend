const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Binance Backend API is running" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: Add your routes here
// app.use('/api', require('./routes'));

module.exports = app;
