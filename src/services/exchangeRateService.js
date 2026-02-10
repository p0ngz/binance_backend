// exchangeRateService.js — จัดการอัตราแลกเปลี่ยน
const prisma = require("../config/db");

// ดึงอัตราแลกเปลี่ยนทั้งหมด
const findAllExchangeRates = () => {
  return prisma.exchangeRate.findMany({
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
};

// ดึงอัตราแลกเปลี่ยนตาม id
const findExchangeRateById = (id) => {
  return prisma.exchangeRate.findUnique({
    where: { id },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
};

// ดึงอัตราแลกเปลี่ยนตามคู่สกุลเงิน
const findExchangeRateByPair = (fromCurrencyId, toCurrencyId) => {
  return prisma.exchangeRate.findUnique({
    where: {
      fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId },
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
  });
};

// สร้างหรืออัพเดทอัตราแลกเปลี่ยน (upsert)
const upsertExchangeRate = (fromCurrencyId, toCurrencyId, rate) => {
  return prisma.exchangeRate.upsert({
    where: {
      fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId },
    },
    update: { rate },
    create: { fromCurrencyId, toCurrencyId, rate },
  });
};

// ลบอัตราแลกเปลี่ยน
const removeExchangeRate = (id) => {
  return prisma.exchangeRate.delete({ where: { id } });
};

module.exports = {
  findAllExchangeRates,
  findExchangeRateById,
  findExchangeRateByPair,
  upsertExchangeRate,
  removeExchangeRate,
};
