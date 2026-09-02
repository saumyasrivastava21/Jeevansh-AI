const express = require("express");
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Patient/General appointment routes
router.post("/", protect, createAppointment);
router.get("/my", protect, getMyAppointments);
router.get("/doctor", protect, authorize("doctor", "admin"), getDoctorAppointments);
router.get("/:id", protect, getAppointmentById);
router.patch("/:id/cancel", protect, cancelAppointment);

// Doctor action routes
router.patch("/:id/confirm", protect, authorize("doctor", "admin"), confirmAppointment);
router.patch("/:id/reject", protect, authorize("doctor", "admin"), rejectAppointment);
router.patch("/:id/complete", protect, authorize("doctor", "admin"), completeAppointment);

module.exports = router;
