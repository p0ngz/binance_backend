// transactionController.js — รับ request เกี่ยวกับรายการเงิน
const transactionService = require("../services/transactionService");

const getTransactionsByUserId = async (req, res) => {
  try {
    const transactions = await transactionService.findTransactionsByUserId(
      Number(req.params.userId),
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.findTransactionById(
      Number(req.params.id),
    );
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactionsByUserId,
  getTransactionById,
};
