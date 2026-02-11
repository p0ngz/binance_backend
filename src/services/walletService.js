// walletService.js — จัดการกระเป๋าเงินของ user (ดูยอด, สร้าง, อัพเดทยอด)
const prisma = require("../config/db");

// ดึง wallets ทั้งหมดของ user
const findWalletsByUserId = (userId) => {
  return prisma.wallet.findMany({
    where: { userId },
    include: { currency: true },
  });
};

// ดึง wallet ตาม userId + currencyId
const findWalletByUserAndCurrency = (userId, currencyId) => {
  return prisma.wallet.findUnique({
    where: { userId_currencyId: { userId, currencyId } },
    include: { currency: true },
  });
};

// สร้าง wallet ใหม่ — whitelist fields
const createWallet = (data) => {
  const { userId, currencyId } = data;
  return prisma.wallet.create({
    data: { userId, currencyId },
    include: { currency: true },
  });
};

// อัพเดทยอดเงิน
const updateWalletBalance = (id, balance, lockBalance) => {
  return prisma.wallet.update({
    where: { id },
    data: { balance, lockBalance },
  });
};

// สร้าง wallets ทุกสกุลเงินให้ user — เฉพาะที่ยังไม่มี (ไม่ซ้ำ)
const createAllWalletsForUser = async (userId) => {
  const currencies = await prisma.currency.findMany();
  const existingWallets = await prisma.wallet.findMany({
    where: { userId },
    select: { currencyId: true },
  });

  const existingIds = new Set(existingWallets.map((w) => w.currencyId));
  const missing = currencies.filter((c) => !existingIds.has(c.id));

  if (missing.length === 0) {
    return { count: 0 };
  }

  return prisma.wallet.createMany({
    data: missing.map((c) => ({
      userId,
      currencyId: c.id,
    })),
  });
};

// ────── helper ──────
const toNum = (v) => parseFloat(v.toString());

// ────────── โอนเงินภายใน (User → User) — atomic ──────────
const internalTransfer = async (senderId, receiverId, currencyId, amount) => {
  const amountNum = parseFloat(amount);

  if (senderId === receiverId) {
    throw Object.assign(new Error("Cannot transfer to yourself"), {
      statusCode: 400,
    });
  }

  return prisma.$transaction(async (tx) => {
    // ─── ตรวจ sender wallet ───
    const senderWallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId: senderId, currencyId } },
      include: { currency: true },
    });
    if (!senderWallet) {
      throw Object.assign(new Error("Sender wallet not found"), {
        statusCode: 404,
      });
    }
    const senderBalance = toNum(senderWallet.balance);
    if (senderBalance < amountNum) {
      throw Object.assign(
        new Error(
          `Insufficient balance. Required: ${amountNum}, Available: ${senderBalance}`,
        ),
        { statusCode: 400 },
      );
    }

    // ─── ตรวจ receiver wallet ───
    const receiverWallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId: receiverId, currencyId } },
      include: { currency: true },
    });
    if (!receiverWallet) {
      throw Object.assign(new Error("Receiver wallet not found"), {
        statusCode: 404,
      });
    }

    // ─── อัปเดต balances ───
    const newSenderBalance = senderBalance - amountNum;
    const newReceiverBalance = toNum(receiverWallet.balance) + amountNum;

    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { balance: newSenderBalance },
    });
    await tx.wallet.update({
      where: { id: receiverWallet.id },
      data: { balance: newReceiverBalance },
    });

    // ─── Transaction records (2 rows) ───
    await tx.transaction.create({
      data: {
        userId: senderId,
        currencyId,
        amount: amountNum,
        balanceAfter: newSenderBalance,
        type: "TRANSFER",
        direction: "OUT",
        refType: "TRANSFER",
      },
    });
    await tx.transaction.create({
      data: {
        userId: receiverId,
        currencyId,
        amount: amountNum,
        balanceAfter: newReceiverBalance,
        type: "TRANSFER",
        direction: "IN",
        refType: "TRANSFER",
      },
    });

    return {
      sender: { userId: senderId, balanceAfter: newSenderBalance },
      receiver: { userId: receiverId, balanceAfter: newReceiverBalance },
      currency: senderWallet.currency.symbol,
      amount: amountNum,
    };
  });
};

// ────────── เติมเงิน (สำหรับทดสอบ / Deposit / Bonus) ──────────
const depositToWallet = async (
  userId,
  currencyId,
  amount,
  type = "DEPOSIT",
) => {
  const amountNum = parseFloat(amount);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
      include: { currency: true },
    });
    if (!wallet) {
      throw Object.assign(new Error("Wallet not found"), { statusCode: 404 });
    }

    const newBalance = toNum(wallet.balance) + amountNum;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    await tx.transaction.create({
      data: {
        userId,
        currencyId,
        amount: amountNum,
        balanceAfter: newBalance,
        type,
        direction: "IN",
        refType: "DEPOSIT",
      },
    });

    return {
      userId,
      currency: wallet.currency.symbol,
      deposited: amountNum,
      balanceAfter: newBalance,
    };
  });
};

module.exports = {
  findWalletsByUserId,
  findWalletByUserAndCurrency,
  createWallet,
  updateWalletBalance,
  createAllWalletsForUser,
  internalTransfer,
  depositToWallet,
};
