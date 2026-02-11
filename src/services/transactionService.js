// transactionService.js — บันทึกรายการเงินเข้า-ออก
const prisma = require("../config/db");

// ────── helper: ดึงข้อมูลอ้างอิงตาม refType + refId ──────
const populateRef = async (tx) => {
  if (!tx.refId) return { ...tx, ref: null };

  let ref = null;
  switch (tx.refType) {
    case "ORDER":
      ref = await prisma.order.findUnique({
        where: { id: tx.refId },
        include: {
          market: { include: { baseCurrency: true, quoteCurrency: true } },
        },
      });
      break;
    case "TRADE":
      ref = await prisma.trade.findUnique({
        where: { id: tx.refId },
        include: {
          buyOrder: {
            include: {
              market: { include: { baseCurrency: true, quoteCurrency: true } },
            },
          },
          sellOrder: true,
        },
      });
      break;
    case "EXCHANGE":
      // refId = transaction id ของฝั่งตรงข้าม (swap)
      ref = await prisma.transaction.findUnique({
        where: { id: tx.refId },
        include: { currency: true },
      });
      break;
    default:
      break;
  }

  return { ...tx, ref };
};

// ดึง transactions ของ user (พร้อมข้อมูลอ้างอิง)
const findTransactionsByUserId = async (userId) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { currency: true },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(transactions.map(populateRef));
};

// ดึง transactions ตาม currency (พร้อมข้อมูลอ้างอิง)
// const findTransactionsByUserAndCurrency = async (userId, currencyId) => {
//   const transactions = await prisma.transaction.findMany({
//     where: { userId, currencyId },
//     include: { currency: true },
//     orderBy: { createdAt: "desc" },
//   });
//   return Promise.all(transactions.map(populateRef));
// };

// ดึง transaction ตาม id (พร้อมข้อมูลอ้างอิง)
const findTransactionById = async (id) => {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { currency: true },
  });
  if (!tx) return null;
  return populateRef(tx);
};

// สร้าง transaction ใหม่
const createTransaction = (data) => {
  return prisma.transaction.create({ data });
};

module.exports = {
  findTransactionsByUserId,
  // findTransactionsByUserAndCurrency,
  findTransactionById,
  createTransaction,
};
