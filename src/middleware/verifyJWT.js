// verifyJWT middleware
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const verifyJWT = (req, res, next) => {
  // อ่าน header Authorization: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden — invalid token" });
    }

    // ตรวจว่า session (ตาม sessionId ที่ฝังใน token) ยังอยู่ใน DB
    const sessionId = decoded.UserInfo.sessionId;
    if (sessionId) {
      const activeSession = await prisma.refreshToken.findUnique({
        where: { id: sessionId },
      });

      if (!activeSession) {
        return res
          .status(403)
          .json({ message: "Forbidden — session expired, please login again" });
      }
    } else {
      // token เก่าที่ไม่มี sessionId → fallback เช็คตาม userId
      const activeSession = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.UserInfo.userId,
          expiredAt: { gt: new Date() },
        },
      });

      if (!activeSession) {
        return res
          .status(403)
          .json({ message: "Forbidden — session expired, please login again" });
      }
    }

    // แนบข้อมูล user เข้า req เพื่อให้ controller ถัดไปใช้ได้
    req.userId = decoded.UserInfo.userId;
    req.email = decoded.UserInfo.email;
    next();
  });
};

module.exports = verifyJWT;
