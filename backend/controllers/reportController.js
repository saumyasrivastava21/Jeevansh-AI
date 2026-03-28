const Report = require("../models/ReportModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");

const createReport = async (req, res, next) => {
  try {
    const {
      disease,
      diseaseName,
      imageUrl,
      confidence,
      severity,
      aiFindings,
      recommendation,
      bboxCoords,
    } = req.body;

    const report = new Report({
      patientId: req.user._id,
      patientName: req.user.name,
      disease,
      diseaseName,
      imageUrl,
      confidence,
      severity,
      aiFindings,
      recommendation,
      bboxCoords,
    });

    const createdReport = await report.save();
    res
      .status(201)
      .json(new ApiResponse(201, createdReport, "Report created successfully"));
  } catch (error) {
    next(error);
  }
};

const getPatientReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ patientId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(new ApiResponse(200, reports, "Reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find({}).sort({ createdAt: -1 });
    res.json(new ApiResponse(200, reports, "All reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (report) {
      report.status = status || report.status;
      report.doctorNotes = doctorNotes || report.doctorNotes;

      if (req.user.role === "doctor") {
        report.doctorId = req.user._id;
        report.doctorName = req.user.name;
        report.reviewedAt = Date.now();
      }

      const updatedReport = await report.save();
      res.json(
        new ApiResponse(200, updatedReport, "Report updated successfully")
      );
    } else {
      next(new ApiError(404, "Report not found"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getPatientReports,
  getAllReports,
  updateReportStatus,
};
