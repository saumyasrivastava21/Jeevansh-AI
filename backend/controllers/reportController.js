const Report = require("../models/ReportModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const { predictDisease } = require("../services/aiService");

const createReport = async (req, res, next) => {
  try {
    const { disease, diseaseName } = req.body;

    if (!req.file) {
      return next(new ApiError(400, "Medical scan image file is required"));
    }

    if (!disease) {
      return next(new ApiError(400, "Disease type classification is required"));
    }

    // Map frontend drop-down keys to FastAPI service route IDs
    let normalizedDisease = disease;
    if (disease === "bone-fracture") {
      normalizedDisease = "fracture";
    }

    // Call Python FastAPI service for AI prediction
    let aiResult;
    try {
      aiResult = await predictDisease(req.file.path, normalizedDisease);
    } catch (err) {
      console.error(`[Express] AI Inference failed: ${err.message}`);
      return res.status(500).json({
        success: false,
        status: "failed",
        message: `AI Inference failed: ${err.message}`
      });
    }

    // Determine severity from model-driven findings and confidence
    let severity = "low";
    if (aiResult.has_finding) {
      const confVal = aiResult.confidence || 0.0;
      severity = confVal > 0.85 ? "high" : "medium";
    }

    // Standard medical recommendation mappings
    let recommendation = "Maintain baseline diagnostic checkups and report any changes to your physician.";
    if (severity === "high") {
      recommendation = "URGENT: Schedule an immediate clinical consultation with a specialist physician.";
    } else if (severity === "medium") {
      recommendation = "Recommend arranging a follow-up review with a general practitioner.";
    }

    // Construct image static server link
    const imageUrl = `/uploads/${req.file.filename}`;

    const report = new Report({
      patientId: req.user._id,
      patientName: req.user.name,
      disease,
      diseaseId: aiResult.disease_id,
      diseaseName: aiResult.disease_name,
      imageUrl,
      hasFinding: aiResult.has_finding,
      prediction: aiResult.prediction ? aiResult.prediction.label : null,
      confidence: aiResult.confidence ? Math.round(aiResult.confidence * 100) : null,
      severity,
      aiFindings: (aiResult.findings || []).join("\n"),
      recommendation,
      bboxCoords: null, // Bounding boxes are now inside the detections list
      heatmapImage: aiResult.heatmap_image || null,
      aiModel: aiResult.model.display_name,
      aiModelVersion: aiResult.model.version,
      inferenceTime: aiResult.inference_time_ms,
      probabilities: aiResult.probabilities || null,
      taskType: aiResult.task_type || "classification",
      detections: (aiResult.detections || []).map(d => ({
        label: d.label,
        confidence: Math.round(d.confidence * 100),
        percentage: d.percentage,
        bbox: d.bbox
      })),
      status: "completed",
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
