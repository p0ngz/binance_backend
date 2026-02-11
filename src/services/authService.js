// authService
const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined in .env",
  );
}

// ────────── Register — สร้าง user + wallet ทุกสกุลเงิน ──────────
const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // ใช้ transaction ครอบ user + wallet
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, password: hashedPassword },
    });

    // สร้าง wallet ทุกสกุลเงินที่มีอยู่ในระบบ
    const currencies = await tx.currency.findMany();
    if (currencies.length > 0) {
      await tx.wallet.createMany({
        data: currencies.map((c) => ({
          userId: newUser.id,
          currencyId: c.id,
        })),
      });
    }

    return tx.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        wallets: { include: { currency: true } },
      },
    });
  });

  return user;
};

// ────────── Login — พร้อมบันทึก IP / User-Agent ──────────
const loginUser = async (email, password, { ip, userAgent } = {}) => {
  // หา user จาก email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  //   check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  //   refreshToken expire in 7 days
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const expiredInMs = 7 * 24 * 60 * 60 * 1000; // 7 วัน
  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      ip: ip || null,
      userAgent: userAgent || null,
      expiredAt: new Date(Date.now() + expiredInMs),
    },
  });

  // สร้าง accessToken พร้อมฝัง sessionId เพื่อผูกกับ session
  const accessToken = jwt.sign(
    {
      UserInfo: {
        userId: user.id,
        email: user.email,
        sessionId: refreshTokenRecord.id,
      },
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

// ────────── Refresh Token ──────────
const refreshAccessToken = async (refreshToken) => {
  // หา token ใน DB (include user)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }, // find token and get user data in one query
  });

  if (!storedToken) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  //   check token expired
  if (storedToken.expiredAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const err = new Error("Refresh token expired");
    err.statusCode = 403;
    throw err;
  }

  // verify jwt signature
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || storedToken.user.id !== decoded.userId) {
        const error = new Error("Forbidden");
        error.statusCode = 403;
        return reject(error);
      }

      // สร้าง access token ใหม่ พร้อมฝัง sessionId
      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: decoded.userId,
            email: storedToken.user.email,
            sessionId: storedToken.id,
          },
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
      );

      resolve({ accessToken });
    });
  });
};

// ────────── Logout for 1 device ──────────
const logoutUser = async (refreshToken) => {
  const deleted = await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  return deleted.count > 0;
};

// ────────── Logout for all device  ──────────
const logoutAllDevices = async (userId) => {
  const deleted = await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return deleted.count;
};

// ────────── delete row that token expired ──────────
const deleteExpiredRefreshTokens = () => {
  return prisma.refreshToken.deleteMany({
    where: { expiredAt: { lt: new Date() } },
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  deleteExpiredRefreshTokens,
};
