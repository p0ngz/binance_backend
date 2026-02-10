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

module.exports = {
  getWalletsByUserId,
  getWalletByUserAndCurrency,
  createWallet,
};
