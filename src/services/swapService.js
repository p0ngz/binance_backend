// ────────────────────────────────────────────────────────────
//  Swap Service — แลกเปลี่ยนสกุลเงินกับระบบ (ไม่ใช่ order book)
// ────────────────────────────────────────────────────────────
const prisma = require("../config/db");

const toNum = (v) => parseFloat(v.toString());

/**
 * แลกเปลี่ยนสกุลเงิน A → B ตาม exchange rate ของระบบ
 * @param {number} userId
 * @param {number} fromCurrencyId - สกุลเงินต้นทาง
 * @param {number} toCurrencyId   - สกุลเงินปลายทาง
 * @param {number} amount         - จำนวนที่ต้องการแลก
 */
const swapCurrency = async (userId, fromCurrencyId, toCurrencyId, amount) => {
  const amountNum = parseFloat(amount);

  // 1. ดึง exchange rate
  const rate = await prisma.exchangeRate.findUnique({
    where: {
      fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId },
    },
    include: { fromCurrency: true, toCurrency: true },
  });
  if (!rate) {
    throw Object.assign(new Error("Exchange rate not found for this pair"), {
      statusCode: 404,
    });
  }

  const rateNum = toNum(rate.rate);
  const outputAmount = amountNum * rateNum;

  // 2. ทำทุกอย่างใน DB transaction (atomic)
  const result = await prisma.$transaction(async (tx) => {
    // ─── Check & update FROM wallet ───
    const fromWallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId, currencyId: fromCurrencyId } },
      include: { currency: true },
    });
    if (!fromWallet) {
      throw Object.assign(new Error("Source wallet not found"), {
        statusCode: 404,
      });
    }

    const fromBalance = toNum(fromWallet.balance);
    if (fromBalance < amountNum) {
      throw Object.assign(
        new Error(
          `Insufficient ${fromWallet.currency.symbol} balance. Required: ${amountNum}, Available: ${fromBalance}`,
        ),
        { statusCode: 400 },
      );
    }

    const newFromBalance = fromBalance - amountNum;
    await tx.wallet.update({
      where: { id: fromWallet.id },
      data: { balance: newFromBalance },
    });

    // ─── Check & update TO wallet ───
    const toWallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId, currencyId: toCurrencyId } },
      include: { currency: true },
    });
    if (!toWallet) {
      throw Object.assign(new Error("Destination wallet not found"), {
        statusCode: 404,
      });
    }

    const newToBalance = toNum(toWallet.balance) + outputAmount;
    await tx.wallet.update({
      where: { id: toWallet.id },
      data: { balance: newToBalance },
    });

    // ─── Transaction records ───
    // OUT: หัก fromCurrency
    await tx.transaction.create({
      data: {
        userId,
        currencyId: fromCurrencyId,
        amount: amountNum,
        balanceAfter: newFromBalance,
        type: "EXCHANGE",
        direction: "OUT",
        refType: "EXCHANGE",
      },
    });

    // IN: ได้ toCurrency
    await tx.transaction.create({
      data: {
        userId,
        currencyId: toCurrencyId,
        amount: outputAmount,
        balanceAfter: newToBalance,
        type: "EXCHANGE",
        direction: "IN",
        refType: "EXCHANGE",
      },
    });

    return {
      from: {
        currency: fromWallet.currency.symbol,
        amount: amountNum,
        balanceAfter: newFromBalance,
      },
      to: {
        currency: toWallet.currency.symbol,
        amount: outputAmount,
        balanceAfter: newToBalance,
      },
      rate: rateNum,
    };
  });

  return result;
};

module.exports = { swapCurrency };
