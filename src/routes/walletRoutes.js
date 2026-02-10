const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");

router.get("/user/:userId", walletController.getWalletsByUserId); // GET  /api/wallets/user/:userId
router.get(
  "/user/:userId/currency/:currencyId",
  walletController.getWalletByUserAndCurrency,
); // GET  /api/wallets/user/:userId/currency/:currencyId
router.post("/", walletController.createWallet); // POST /api/wallets

module.exports = router;
