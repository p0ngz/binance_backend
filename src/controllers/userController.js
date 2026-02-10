// userController.js — รับ request เกี่ยวกับ user แล้วเรียก service
const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.findUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

const removeUser = async (req, res) => {
  try {
    await userService.removeUser(Number(req.params.id));
    res.json({ message: "User deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  removeUser,
};
