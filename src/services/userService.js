// userService
const prisma = require("../config/db");
const bcrypt = require("bcrypt");

// get all users (ไม่ส่ง password กลับ)
const findAllUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// find user by id (ไม่ส่ง password กลับ)
const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      wallets: { include: { currency: true } },
      socialAccounts: true,
    },
  });
};

// find user by email (ใช้ภายใน auth เท่านั้น — ส่ง password ด้วย)
const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

// update user — whitelist fields + hash password ถ้ามี
const updateUser = async (id, data) => {
  const allowed = {};

  if (data.name !== undefined) allowed.name = data.name;
  if (data.email !== undefined) allowed.email = data.email;
  if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl;
  if (data.password !== undefined) {
    allowed.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id },
    data: allowed,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// delete user
const removeUser = (id) => {
  return prisma.user.delete({ where: { id } });
};

module.exports = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  updateUser,
  removeUser,
};
