const Doctor = require("../models/DoctorModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");

const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({}).populate(
      "userId",
      "name email avatar"
    );
    res.json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email avatar"
    );
    if (doctor) {
      res.json(new ApiResponse(200, doctor, "Doctor fetched successfully"));
    } else {
      next(new ApiError(404, "Doctor not found"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctors, getDoctorById };
