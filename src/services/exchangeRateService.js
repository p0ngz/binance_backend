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

// สร้างหรืออัพเดทอัตราแลกเปลี่ยน (upsert) — อัปเดตทั้ง 2 ทิศทางอัตโนมัติ
const upsertExchangeRate = async (fromCurrencyId, toCurrencyId, rate) => {
  const inverseRate = 1 / rate;

  const [forward, reverse] = await prisma.$transaction([
    // ทิศทางปกติ เช่น BTC→THB = 3,400,000
    prisma.exchangeRate.upsert({
      where: {
        fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId },
      },
      update: { rate },
      create: { fromCurrencyId, toCurrencyId, rate },
    }),
    // ทิศทางกลับ เช่น THB→BTC = 1/3,400,000
    prisma.exchangeRate.upsert({
      where: {
        fromCurrencyId_toCurrencyId: {
          fromCurrencyId: toCurrencyId,
          toCurrencyId: fromCurrencyId,
        },
      },
      update: { rate: inverseRate },
      create: {
        fromCurrencyId: toCurrencyId,
        toCurrencyId: fromCurrencyId,
        rate: inverseRate,
      },
    }),
  ]);

  return { forward, reverse };
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
