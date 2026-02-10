// currencyController.js — รับ request เกี่ยวกับสกุลเงิน
const currencyService = require("../services/currencyService");

const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await currencyService.findAllCurrencies();
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrencyById = async (req, res) => {
  try {
    const currency = await currencyService.findCurrencyById(
      Number(req.params.id),
    );
    if (!currency)
      return res.status(404).json({ message: "Currency not found" });
    res.json(currency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCurrency = async (req, res) => {
  try {
    const currency = await currencyService.createCurrency(req.body);
    res.status(201).json(currency);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Currency symbol already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateCurrency = async (req, res) => {
  try {
    const currency = await currencyService.updateCurrency(
      Number(req.params.id),
      req.body,
    );
    res.json(currency);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

const removeCurrency = async (req, res) => {
  try {
    await currencyService.removeCurrency(Number(req.params.id));
    res.json({ message: "Currency deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  removeCurrency,
};
