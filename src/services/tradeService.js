// tradeService.js — จัดการการจับคู่ซื้อ-ขาย + execute trade
const prisma = require("../config/db");

const toNum = (v) => parseFloat(v.toString());

// ดึง trades ทั้งหมดของตลาด (ผ่าน order)
const findTradesByMarketId = (marketId) => {
  return prisma.trade.findMany({
    where: {
      buyOrder: { marketId },
    },
    include: {
      buyOrder: true,
      sellOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง trades ของ user (ทั้งฝั่งซื้อและขาย)
const findTradesByUserId = (userId) => {
  return prisma.trade.findMany({
    where: {
      OR: [{ buyOrder: { userId } }, { sellOrder: { userId } }],
    },
    include: {
      buyOrder: {
        include: {
          market: { include: { baseCurrency: true, quoteCurrency: true } },
        },
      },
      sellOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง trade ตาม id
const findTradeById = (id) => {
  return prisma.trade.findUnique({
    where: { id },
    include: {
      buyOrder: true,
      sellOrder: true,
    },
  });
};

// ────── Execute a single trade match (atomic) ──────
const executeTrade = async ({
  buyOrder,
  sellOrder,
  tradeAmount,
  tradePrice,
  tradeCost,
  market,
}) => {
  await prisma.$transaction(async (tx) => {
    // 1. สร้าง trade record
    const trade = await tx.trade.create({
      data: {
        buyOrderId: buyOrder.id,
        sellOrderId: sellOrder.id,
        price: tradePrice,
        amount: tradeAmount,
      },
    });

    // 2. อัปเดต filledAmount ของทั้ง 2 orders
    const buyFilled = toNum(buyOrder.filledAmount) + tradeAmount;
    const buyFullyFilled = buyFilled >= toNum(buyOrder.amount);
    await tx.order.update({
      where: { id: buyOrder.id },
      data: {
        filledAmount: buyFilled,
        status: buyFullyFilled ? "FILLED" : "OPEN",
      },
    });

    const sellFilled = toNum(sellOrder.filledAmount) + tradeAmount;
    const sellFullyFilled = sellFilled >= toNum(sellOrder.amount);
    await tx.order.update({
      where: { id: sellOrder.id },
      data: {
        filledAmount: sellFilled,
        status: sellFullyFilled ? "FILLED" : "OPEN",
      },
    });

    // ──────── 3. BUYER wallets ────────
    const buyerQuoteWallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: {
          userId: buyOrder.userId,
          currencyId: market.quoteCurrencyId,
        },
      },
    });
    const buyerBaseWallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: {
          userId: buyOrder.userId,
          currencyId: market.baseCurrencyId,
        },
      },
    });

    // ถ้า buy price สูงกว่า trade price → refund ส่วนต่าง
    const buyerLockedPerUnit = toNum(buyOrder.price);
    const refund = (buyerLockedPerUnit - tradePrice) * tradeAmount;
    const lockedCost = buyerLockedPerUnit * tradeAmount;

    const newBuyerQuoteLock = Math.max(
      0,
      toNum(buyerQuoteWallet.lockBalance) - lockedCost,
    );
    const newBuyerQuoteBalance = toNum(buyerQuoteWallet.balance) + refund;
    await tx.wallet.update({
      where: { id: buyerQuoteWallet.id },
      data: { lockBalance: newBuyerQuoteLock, balance: newBuyerQuoteBalance },
    });

    const newBuyerBaseBalance = toNum(buyerBaseWallet.balance) + tradeAmount;
    await tx.wallet.update({
      where: { id: buyerBaseWallet.id },
      data: { balance: newBuyerBaseBalance },
    });

    // ──────── 4. SELLER wallets ────────
    const sellerBaseWallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: {
          userId: sellOrder.userId,
          currencyId: market.baseCurrencyId,
        },
      },
    });
    const sellerQuoteWallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: {
          userId: sellOrder.userId,
          currencyId: market.quoteCurrencyId,
        },
      },
    });

    const newSellerBaseLock = Math.max(
      0,
      toNum(sellerBaseWallet.lockBalance) - tradeAmount,
    );
    await tx.wallet.update({
      where: { id: sellerBaseWallet.id },
      data: { lockBalance: newSellerBaseLock },
    });

    const newSellerQuoteBalance = toNum(sellerQuoteWallet.balance) + tradeCost;
    await tx.wallet.update({
      where: { id: sellerQuoteWallet.id },
      data: { balance: newSellerQuoteBalance },
    });

    // ──────── 5. Transaction records ────────

    // BUYER: ได้ crypto เข้า (IN)
    await tx.transaction.create({
      data: {
        userId: buyOrder.userId,
        currencyId: market.baseCurrencyId,
        amount: tradeAmount,
        balanceAfter: newBuyerBaseBalance,
        type: "TRADE",
        direction: "IN",
        refType: "TRADE",
        refId: trade.id,
      },
    });

    // BUYER: จ่าย quote currency (OUT) — settled from lock
    await tx.transaction.create({
      data: {
        userId: buyOrder.userId,
        currencyId: market.quoteCurrencyId,
        amount: tradeCost,
        balanceAfter: newBuyerQuoteBalance,
        type: "TRADE",
        direction: "OUT",
        refType: "TRADE",
        refId: trade.id,
      },
    });

    // SELLER: จ่าย crypto (OUT) — settled from lock
    await tx.transaction.create({
      data: {
        userId: sellOrder.userId,
        currencyId: market.baseCurrencyId,
        amount: tradeAmount,
        balanceAfter: toNum(sellerBaseWallet.balance),
        type: "TRADE",
        direction: "OUT",
        refType: "TRADE",
        refId: trade.id,
      },
    });

    // SELLER: ได้ quote currency เข้า (IN)
    await tx.transaction.create({
      data: {
        userId: sellOrder.userId,
        currencyId: market.quoteCurrencyId,
        amount: tradeCost,
        balanceAfter: newSellerQuoteBalance,
        type: "TRADE",
        direction: "IN",
        refType: "TRADE",
        refId: trade.id,
      },
    });
  });
};

module.exports = {
  findTradesByMarketId,
  findTradesByUserId,
  findTradeById,
  executeTrade,
};
