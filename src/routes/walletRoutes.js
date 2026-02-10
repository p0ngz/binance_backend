const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const {
  validateParamUserId,
  validateParamUserAndCurrency,
  validateCreateWallet,
} = require("../validators/walletValidator");
const handleValidation = require("../middleware/handleValidation");

router.get(
  "/user/:userId",
  validateParamUserId,
  handleValidation,
  walletController.getWalletsByUserId,
);
router.get(
  "/user/:userId/currency/:currencyId",
  validateParamUserAndCurrency,
  handleValidation,
  walletController.getWalletByUserAndCurrency,
);
router.post(
  "/",
  validateCreateWallet,
  handleValidation,
  walletController.createWallet,
);

module.exports = router;
