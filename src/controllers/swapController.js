const swapService = require("../services/swapService");

// POST /api/exchange
const handleSwap = async (req, res) => {
  try {
    const { userId, fromCurrencyId, toCurrencyId, amount } = req.body;
    const uid = userId || req.userId;

    const result = await swapService.swapCurrency(
      uid,
      fromCurrencyId,
      toCurrencyId,
      amount,
    );
    res.json({
      message: `Swapped ${result.from.amount} ${result.from.currency} → ${result.to.amount.toFixed(8)} ${result.to.currency}`,
      ...result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { handleSwap };
