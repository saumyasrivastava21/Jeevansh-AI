const express = require("express");
const {
  registerUser,
  authUser,
  getUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", registerUser);
router.post("/login", authUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;

