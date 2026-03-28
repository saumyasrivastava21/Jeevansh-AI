const express = require("express");
const {
  getDiseases,
  getDiseaseById,
} = require("../controllers/diseaseController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getDiseases);
router.get("/:id", protect, getDiseaseById);

module.exports = router;
