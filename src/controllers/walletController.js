// walletController.js — รับ request เกี่ยวกับ wallet
const walletService = require("../services/walletService");

const getWalletsByUserId = async (req, res) => {
  try {
    const wallets = await walletService.findWalletsByUserId(
      Number(req.params.userId),
    );
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWalletByUserAndCurrency = async (req, res) => {
  try {
    const wallet = await walletService.findWalletByUserAndCurrency(
      Number(req.params.userId),
      Number(req.params.currencyId),
    );
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWallet = async (req, res) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Wallet already exists for this currency" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ────────── POST /api/wallets/create-all/:userId — สร้าง wallet ทุกสกุลเงินให้ user ──────────
const createAllWallets = async (req, res) => {
  try {
    const result = await walletService.createAllWalletsForUser(
      Number(req.params.userId),
    );
    res.status(201).json({ message: `Created ${result.count} wallet(s)` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ────────── POST /api/wallets/transfer — โอนเงินภายใน ──────────
const handleTransfer = async (req, res) => {
  try {
    const { senderId, receiverId, currencyId, amount } = req.body;
    const result = await walletService.internalTransfer(
      senderId,
      receiverId,
      currencyId,
      parseFloat(amount),
    );
    res.json({ message: "Transfer successful", ...result });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// ────────── POST /api/wallets/deposit — เติมเงิน (สำหรับทดสอบ) ──────────
const handleDeposit = async (req, res) => {
  try {
    const { userId, currencyId, amount } = req.body;
    const result = await walletService.depositToWallet(
      userId,
      currencyId,
      parseFloat(amount),
    );
    res.json({ message: "Deposit successful", ...result });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = {
  getWalletsByUserId,
  getWalletByUserAndCurrency,
  createWallet,
  createAllWallets,
  handleTransfer,
  handleDeposit,
};
