const express = require("express");
const {
  createReport,
  getPatientReports,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("patient", "doctor", "admin"),
  createReport
);
router.get("/myreports", protect, authorize("patient"), getPatientReports);
router.get("/", protect, authorize("doctor", "admin"), getAllReports);
router.put(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updateReportStatus
);

module.exports = router;
