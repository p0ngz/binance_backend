const express = require("express");
const cors = require("cors");
const corsOption = require("./config/corsOption");
const credentials = require("./middleware/credentials");
const setupLogger = require("./middleware/logger");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const app = express();

// middleware
app.use(credentials);
app.use(cors(corsOption));
setupLogger(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// api documentations
const swaggerDocument = YAML.load(
  path.join(__dirname, "..", "Binance_api_collection.yaml"),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.json({ message: "Binance Backend Server is running" });
});

app.get("/hello", (req, res) => {
  res.send(`Hello, ${req.query.person}!`);
});

const routes = require("./routes");
app.use("/api", routes);

module.exports = app;
