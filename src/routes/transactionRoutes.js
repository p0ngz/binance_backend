const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const {
  validateParamId,
  validateParamUserId,
} = require("../validators/transactionValidator");
const handleValidation = require("../middleware/handleValidation");

router.get(
  "/user/:userId",
  validateParamUserId,
  handleValidation,
  transactionController.getTransactionsByUserId,
);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  transactionController.getTransactionById,
);

module.exports = router;
