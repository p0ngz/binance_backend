const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateParamId,
  validateCreateUser,
  validateUpdateUser,
} = require("../validators/userValidator");
const handleValidation = require("../middleware/handleValidation");

router.get("/", userController.getAllUsers); // GET    /api/users
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  userController.getUserById,
); // GET    /api/users/:id
router.post(
  "/",
  validateCreateUser,
  handleValidation,
  userController.createUser,
); // POST   /api/users
router.put(
  "/:id",
  validateUpdateUser,
  handleValidation,
  userController.updateUser,
); // PUT    /api/users/:id
router.delete(
  "/:id",
  validateParamId,
  handleValidation,
  userController.removeUser,
); // DELETE /api/users/:id

module.exports = router;
