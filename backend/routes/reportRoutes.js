const express = require("express");
const {
  createReport,
  getPatientReports,
  getAllReports,
  updateReportStatus,
  getReportById,
  regenerateReport,
  downloadReportPdf,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("patient", "doctor", "admin"),
  upload.single("image"),
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

router.get("/:id", protect, getReportById);
router.post("/:id/regenerate", protect, regenerateReport);
router.get("/:id/regenerate", protect, regenerateReport);
router.get("/:id/download", protect, downloadReportPdf);

module.exports = router;
