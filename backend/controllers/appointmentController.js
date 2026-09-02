const mongoose = require("mongoose");
const Appointment = require("../models/AppointmentModel");
const Doctor = require("../models/DoctorModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient/Authenticated)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, symptoms } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return next(
        new ApiError(400, "Please provide doctorId, appointmentDate, appointmentTime, and reason.")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return next(new ApiError(400, "Invalid Doctor ID format."));
    }

    const doctor = await Doctor.findById(doctorId).populate("userId", "name email");
    if (!doctor) {
      return next(new ApiError(404, "Doctor not found."));
    }

    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return next(new ApiError(400, "Invalid appointment date format."));
    }

    // Ensure appointment date is not in the past (compare day start)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(parsedDate);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return next(new ApiError(400, "Appointment date cannot be in the past."));
    }

    // Parse appointment time to check if time has already passed for today
    const parseTimeOnDate = (dateObj, timeStr) => {
      const d = new Date(dateObj);
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[3] ? match[3].toUpperCase() : null;

      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;

      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // If date is today, ensure time slot is in the future
    const now = new Date();
    if (checkDate.getTime() === today.getTime()) {
      const slotDateTime = parseTimeOnDate(checkDate, appointmentTime);
      if (slotDateTime && slotDateTime <= now) {
        return next(
          new ApiError(
            400,
            `The time slot ${appointmentTime} has already passed for today. Please choose a future slot.`
          )
        );
      }
    }

    // Check for conflicting active appointment for the doctor on the same date and time
    // Define date bounds for the whole selected day
    const startOfDay = new Date(checkDate);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingConflict = await Appointment.findOne({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: appointmentTime.trim(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingConflict) {
      return next(
        new ApiError(
          409,
          `The slot ${appointmentTime} on this date is already booked or requested. Please select another slot.`
        )
      );
    }

    // Prevent same patient booking duplicate with same doctor on same day/time
    const patientConflict = await Appointment.findOne({
      patientId: req.user._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      appointmentTime: appointmentTime.trim(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (patientConflict) {
      return next(
        new ApiError(
          409,
          "You already have an active appointment scheduled at this date and time."
        )
      );
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate: parsedDate,
      appointmentTime: appointmentTime.trim(),
      reason: reason.trim(),
      symptoms: symptoms ? symptoms.trim() : "",
      status: "pending",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    res.status(201).json(
      new ApiResponse(
        201,
        populatedAppointment,
        "Appointment booked successfully. Awaiting doctor confirmation."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's appointments
// @route   GET /api/appointments/my
// @access  Private
const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone")
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.json(new ApiResponse(200, appointments, "Appointments fetched successfully."));
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments assigned to logged in doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor / Admin)
const getDoctorAppointments = async (req, res, next) => {
  try {
    let doctorQuery = {};

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return next(new ApiError(404, "No doctor profile associated with this account."));
      }
      doctorQuery = { doctorId: doctor._id };
    } else if (req.user.role === "admin" && req.query.doctorId) {
      if (mongoose.Types.ObjectId.isValid(req.query.doctorId)) {
        doctorQuery = { doctorId: req.query.doctorId };
      }
    }

    const appointments = await Appointment.find(doctorQuery)
      .populate("patientId", "name email avatar phone address")
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(new ApiResponse(200, appointments, "Doctor appointments fetched successfully."));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Appointment ID."));
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    if (!appointment) {
      return next(new ApiError(404, "Appointment not found."));
    }

    // Check authorization: patient who booked it, assigned doctor, or admin
    const isPatient = appointment.patientId && appointment.patientId._id.equals(req.user._id);
    let isAssignedDoctor = false;

    if (req.user.role === "doctor" && appointment.doctorId) {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor && appointment.doctorId._id.equals(doctor._id)) {
        isAssignedDoctor = true;
      }
    }

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isAssignedDoctor && !isAdmin) {
      return next(new ApiError(403, "You are not authorized to view this appointment."));
    }

    res.json(new ApiResponse(200, appointment, "Appointment details retrieved."));
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Appointment ID."));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ApiError(404, "Appointment not found."));
    }

    // Verify ownership
    const isPatient = appointment.patientId.equals(req.user._id);
    let isDoctor = false;
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor && appointment.doctorId.equals(doctor._id)) {
        isDoctor = true;
      }
    }
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return next(new ApiError(403, "Not authorized to cancel this appointment."));
    }

    if (appointment.status === "completed") {
      return next(new ApiError(400, "Completed appointments cannot be cancelled."));
    }
    if (appointment.status === "cancelled") {
      return next(new ApiError(400, "Appointment is already cancelled."));
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = req.body.cancellationReason || "Cancelled by user";
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    res.json(new ApiResponse(200, updated, "Appointment cancelled successfully."));
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm a pending appointment
// @route   PATCH /api/appointments/:id/confirm
// @access  Private (Doctor/Admin)
const confirmAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Appointment ID."));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ApiError(404, "Appointment not found."));
    }

    // Check doctor ownership
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || !appointment.doctorId.equals(doctor._id)) {
        return next(new ApiError(403, "You can only confirm appointments assigned to you."));
      }
    }

    if (appointment.status !== "pending") {
      return next(new ApiError(400, `Cannot confirm an appointment with status '${appointment.status}'.`));
    }

    appointment.status = "confirmed";
    if (req.body.doctorNotes) {
      appointment.doctorNotes = req.body.doctorNotes;
    }
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    res.json(new ApiResponse(200, updated, "Appointment confirmed successfully."));
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a pending appointment
// @route   PATCH /api/appointments/:id/reject
// @access  Private (Doctor/Admin)
const rejectAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Appointment ID."));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ApiError(404, "Appointment not found."));
    }

    // Check doctor ownership
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || !appointment.doctorId.equals(doctor._id)) {
        return next(new ApiError(403, "You can only reject appointments assigned to you."));
      }
    }

    if (appointment.status !== "pending") {
      return next(new ApiError(400, `Cannot reject an appointment with status '${appointment.status}'.`));
    }

    appointment.status = "rejected";
    appointment.rejectionReason = req.body.rejectionReason || "Slot unavailable / Doctor unavailable";
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    res.json(new ApiResponse(200, updated, "Appointment rejected."));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a confirmed appointment as completed
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Doctor/Admin)
const completeAppointment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Appointment ID."));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ApiError(404, "Appointment not found."));
    }

    // Check doctor ownership
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || !appointment.doctorId.equals(doctor._id)) {
        return next(new ApiError(403, "You can only complete appointments assigned to you."));
      }
    }

    if (appointment.status !== "confirmed") {
      return next(
        new ApiError(
          400,
          `Only confirmed appointments can be marked as completed (current: '${appointment.status}').`
        )
      );
    }

    appointment.status = "completed";
    if (req.body.doctorNotes) {
      appointment.doctorNotes = req.body.doctorNotes;
    }
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar phone" },
      })
      .populate("patientId", "name email avatar phone");

    res.json(new ApiResponse(200, updated, "Appointment marked as completed."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
};
