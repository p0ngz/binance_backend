// exchangeRateController.js — รับ request เกี่ยวกับอัตราแลกเปลี่ยน
const exchangeRateService = require("../services/exchangeRateService");

const getAllExchangeRates = async (req, res) => {
  try {
    const rates = await exchangeRateService.findAllExchangeRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExchangeRateById = async (req, res) => {
  try {
    const rate = await exchangeRateService.findExchangeRateById(
      Number(req.params.id),
    );
    if (!rate)
      return res.status(404).json({ message: "Exchange rate not found" });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExchangeRateByPair = async (req, res) => {
  try {
    const rate = await exchangeRateService.findExchangeRateByPair(
      Number(req.params.fromCurrencyId),
      Number(req.params.toCurrencyId),
    );
    if (!rate)
      return res.status(404).json({ message: "Exchange rate not found" });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upsertExchangeRate = async (req, res) => {
  try {
    const { fromCurrencyId, toCurrencyId, rate } = req.body;
    const exchangeRate = await exchangeRateService.upsertExchangeRate(
      fromCurrencyId,
      toCurrencyId,
      rate,
    );
    res.json(exchangeRate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeExchangeRate = async (req, res) => {
  try {
    await exchangeRateService.removeExchangeRate(Number(req.params.id));
    res.json({ message: "Exchange rate deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Exchange rate not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllExchangeRates,
  getExchangeRateById,
  getExchangeRateByPair,
  upsertExchangeRate,
  removeExchangeRate,
};
