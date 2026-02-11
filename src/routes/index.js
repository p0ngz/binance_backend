const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const walletRoutes = require("./walletRoutes");
const currencyRoutes = require("./currencyRoutes");
const marketRoutes = require("./marketRoutes");
const orderRoutes = require("./orderRoutes");
const tradeRoutes = require("./tradeRoutes");
const transactionRoutes = require("./transactionRoutes");
const exchangeRateRoutes = require("./exchangeRateRoutes");
const swapRoutes = require("./swapRoutes");

// ────── public routes (ไม่ต้อง login) ──────
router.use("/auth", authRoutes);

// ────── protected routes (ต้อง login — verifyJWT ทุก request) ──────
router.use(verifyJWT);

router.use("/users", userRoutes);
router.use("/wallets", walletRoutes);
router.use("/currencies", currencyRoutes);
router.use("/markets", marketRoutes);
router.use("/orders", orderRoutes);
router.use("/trades", tradeRoutes);
router.use("/transactions", transactionRoutes);
router.use("/exchange-rates", exchangeRateRoutes);
router.use("/exchange", swapRoutes);

module.exports = router;
