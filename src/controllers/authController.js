// authController.js — รับ request เกี่ยวกับ auth แล้วเรียก authService
const authService = require("../services/authService");

// ────────── POST /api/auth/register ──────────
const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser({ name, email, password });
    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// ────────── POST /api/auth/login ──────────
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // เก็บ IP + User-Agent สำหรับ device tracking
    const ip = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;

    const { accessToken, refreshToken, user } = await authService.loginUser(
      email,
      password,
      { ip, userAgent },
    );

    // ส่ง refresh token เป็น httpOnly cookie (ป้องกัน XSS)
    const expiredInMs = 7 * 24 * 60 * 60 * 1000; // 7 วัน
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: false, // production ให้เปลี่ยนเป็น true (ใช้กับ HTTPS)
      maxAge: expiredInMs,
    });

    res.status(200).json({ user, accessToken });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// ────────── GET /api/auth/refresh ──────────
const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accessToken } = await authService.refreshAccessToken(cookies.jwt);
    res.status(200).json({ accessToken });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// ────────── POST /api/auth/logout (1 device — ใช้ cookie) ──────────
const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.sendStatus(204); // ไม่มี cookie = logout อยู่แล้ว
    }

    await authService.logoutUser(cookies.jwt);

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: false,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ────────── POST /api/auth/logout-all (ทุก device — ใช้ access token) ──────────
const handleLogoutAll = async (req, res) => {
  try {
    const count = await authService.logoutAllDevices(req.userId);

    // ลบ cookie ด้วย (ถ้ามี)
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: false,
    });

    res.json({ message: `Logged out from ${count} device(s)` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleLogoutAll,
};
