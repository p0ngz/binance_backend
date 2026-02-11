// orderService.js — จัดการคำสั่งซื้อ/ขาย (พร้อม business logic)
const prisma = require("../config/db");
const matchingService = require("./matchingService");

// ────── helper ──────
const toNum = (v) => parseFloat(v.toString());

// ดึง orders ทั้งหมดของ user
const findOrdersByUserId = (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      market: {
        include: { baseCurrency: true, quoteCurrency: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง order ตาม id
const findOrderById = (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      market: {
        include: { baseCurrency: true, quoteCurrency: true },
      },
      buyTrades: true,
      sellTrades: true,
    },
  });
};

// ดึง orders ที่ยังเปิดอยู่ของตลาดนั้น
const findOpenOrdersByMarket = (marketId, side) => {
  return prisma.order.findMany({
    where: {
      marketId,
      side,
      status: "OPEN",
    },
    orderBy: [{ price: side === "BUY" ? "desc" : "asc" }, { createdAt: "asc" }],
  });
};

// ────── สร้าง order ใหม่ (BUY / SELL) พร้อม lock balance + จับคู่อัตโนมัติ ──────
const createOrder = async (data) => {
  const {
    userId,
    marketId,
    side,
    type,
    price,
    amount,
    filledType = "SINGLE",
  } = data;

  // 1. ตรวจสอบ market ต้อง ACTIVE
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: { baseCurrency: true, quoteCurrency: true },
  });
  if (!market) {
    throw Object.assign(new Error("Market not found"), { statusCode: 404 });
  }
  if (market.status !== "ACTIVE") {
    throw Object.assign(new Error("Market is not active"), { statusCode: 400 });
  }

  const amountNum = parseFloat(amount);
  let priceNum;

  if (type === "MARKET") {
    // MARKET order → ดึงราคาจาก exchange_rates (base → quote)
    const rate = await prisma.exchangeRate.findUnique({
      where: {
        fromCurrencyId_toCurrencyId: {
          fromCurrencyId: market.baseCurrencyId,
          toCurrencyId: market.quoteCurrencyId,
        },
      },
    });
    if (!rate) {
      throw Object.assign(new Error("No exchange rate found for this market"), {
        statusCode: 400,
      });
    }
    priceNum = toNum(rate.rate);
  } else {
    // LIMIT order → ใช้ราคาที่ user กำหนด
    if (!price) {
      throw Object.assign(new Error("price is required for LIMIT orders"), {
        statusCode: 400,
      });
    }
    priceNum = parseFloat(price);
  }

  const cost = priceNum * amountNum;

  // 2. คำนวณว่าต้อง lock wallet ไหน
  let lockCurrencyId, lockAmount;
  if (side === "BUY") {
    // BUY: lock quote currency (เช่น THB)
    lockCurrencyId = market.quoteCurrencyId;
    lockAmount = cost;
  } else {
    // SELL: lock base currency (เช่น BTC)
    lockCurrencyId = market.baseCurrencyId;
    lockAmount = amountNum;
  }

  // 3. DB Transaction: check balance → lock → create order → create transaction
  const order = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId, currencyId: lockCurrencyId } },
    });
    if (!wallet) {
      throw Object.assign(
        new Error("Wallet not found. Please create wallet first."),
        { statusCode: 404 },
      );
    }

    const available = toNum(wallet.balance);
    if (available < lockAmount) {
      throw Object.assign(
        new Error(
          `Insufficient balance. Required: ${lockAmount}, Available: ${available}`,
        ),
        { statusCode: 400 },
      );
    }

    // ย้าย balance → lockBalance
    const newBalance = available - lockAmount;
    const newLock = toNum(wallet.lockBalance) + lockAmount;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance, lockBalance: newLock },
    });

    // สร้าง order
    const newOrder = await tx.order.create({
      data: {
        userId,
        marketId,
        side,
        type,
        price: priceNum,
        amount: amountNum,
        filledType,
      },
    });

    // สร้าง transaction record (LOCK / OUT)
    await tx.transaction.create({
      data: {
        userId,
        currencyId: lockCurrencyId,
        amount: lockAmount,
        balanceAfter: newBalance,
        type: "TRADE",
        direction: "OUT",
        refType: "ORDER",
        refId: newOrder.id,
      },
    });

    return newOrder;
  });

  // 4. ลองจับคู่อัตโนมัติ (นอก transaction หลัก)
  try {
    await matchingService.tryMatch(order);
  } catch (err) {
    console.error("Matching error:", err.message);
  }

  // 5. คืน order ล่าสุดพร้อม includes
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      market: { include: { baseCurrency: true, quoteCurrency: true } },
      buyTrades: true,
      sellTrades: true,
    },
  });
};

// อัพเดท order (เช่น filled_amount, status)
const updateOrder = (id, data) => {
  return prisma.order.update({ where: { id }, data });
};

// ────── ยกเลิก order พร้อมคืนเงินที่ lock ไว้ ──────
const cancelOrder = async (orderId, userId = null) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { market: true },
    });
    if (!order) {
      throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    }
    if (userId && order.userId !== userId) {
      throw Object.assign(new Error("Not your order"), { statusCode: 403 });
    }
    if (order.status !== "OPEN") {
      throw Object.assign(new Error("Only OPEN orders can be cancelled"), {
        statusCode: 400,
      });
    }

    // คำนวณส่วนที่เหลือ (remaining)
    const remainingAmount = toNum(order.amount) - toNum(order.filledAmount);

    let unlockCurrencyId, unlockAmount;
    if (order.side === "BUY") {
      unlockCurrencyId = order.market.quoteCurrencyId;
      unlockAmount = toNum(order.price) * remainingAmount;
    } else {
      unlockCurrencyId = order.market.baseCurrencyId;
      unlockAmount = remainingAmount;
    }

    // คืนเงินจาก lock กลับสู่ balance
    const wallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: {
          userId: order.userId,
          currencyId: unlockCurrencyId,
        },
      },
    });
    const newBalance = toNum(wallet.balance) + unlockAmount;
    const newLock = Math.max(0, toNum(wallet.lockBalance) - unlockAmount);
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance, lockBalance: newLock },
    });

    // อัพเดท order status
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // สร้าง transaction record (คืนเงิน / IN)
    await tx.transaction.create({
      data: {
        userId: order.userId,
        currencyId: unlockCurrencyId,
        amount: unlockAmount,
        balanceAfter: newBalance,
        type: "TRADE",
        direction: "IN",
        refType: "ORDER",
        refId: orderId,
      },
    });

    return cancelled;
  });
};

// ────── Order Book (ดึง bids + asks ของตลาด) ──────
const findOrderBookByMarket = async (marketId) => {
  const [bids, asks] = await Promise.all([
    prisma.order.findMany({
      where: { marketId, side: "BUY", status: "OPEN" },
      orderBy: [{ price: "desc" }, { createdAt: "asc" }],
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.order.findMany({
      where: { marketId, side: "SELL", status: "OPEN" },
      orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);
  return { bids, asks };
};

module.exports = {
  findOrdersByUserId,
  findOrderById,
  findOpenOrdersByMarket,
  findOrderBookByMarket,
  createOrder,
  updateOrder,
  cancelOrder,
};
