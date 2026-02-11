const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const {
  validateParamUserId,
  validateParamUserAndCurrency,
  validateCreateWallet,
  validateTransfer,
  validateDeposit,
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
router.post(
  "/create-all/:userId",
  validateParamUserId,
  handleValidation,
  walletController.createAllWallets,
);
router.post(
  "/transfer",
  validateTransfer,
  handleValidation,
  walletController.handleTransfer,
);
router.post(
  "/deposit",
  validateDeposit,
  handleValidation,
  walletController.handleDeposit,
);

module.exports = router;
