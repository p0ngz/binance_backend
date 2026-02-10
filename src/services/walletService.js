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

// สร้าง wallets ทุกสกุลเงินให้ user ใหม่
const createAllWalletsForUser = async (userId) => {
  const currencies = await prisma.currency.findMany();
  const wallets = currencies.map((currency) => ({
    userId,
    currencyId: currency.id,
    balance: 0,
    lockBalance: 0,
  }));
  return prisma.wallet.createMany({ data: wallets });
};

module.exports = {
  findWalletsByUserId,
  findWalletByUserAndCurrency,
  createWallet,
  updateWalletBalance,
  createAllWalletsForUser,
};
