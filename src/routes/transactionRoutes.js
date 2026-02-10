const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/user/:userId", transactionController.getTransactionsByUserId); // GET /api/transactions/user/:userId
router.get("/:id", transactionController.getTransactionById); // GET /api/transactions/:id

module.exports = router;
