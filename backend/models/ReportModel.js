const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, required: true },
    disease: { type: String, required: true },
    diseaseId: { type: String, required: true },
    diseaseName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    hasFinding: { type: Boolean, required: true },
    prediction: { type: String },
    confidence: { type: Number },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "reviewed"],
      default: "pending",
    },
    aiFindings: { type: String },
    recommendation: { type: String },
    doctorNotes: { type: String },
    doctorName: { type: String },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bboxCoords: {
      x: { type: Number },
      y: { type: Number },
      w: { type: Number },
      h: { type: Number },
    },
    heatmapImage: { type: String },
    aiModel: { type: String, required: true },
    aiModelVersion: { type: String },
    inferenceTime: { type: Number },
    probabilities: { type: mongoose.Schema.Types.Mixed },
    taskType: {
      type: String,
      enum: ["classification", "detection"],
      required: true,
      default: "classification"
    },
    detections: [
      {
        label: { type: String },
        confidence: { type: Number },
        percentage: { type: String },
        bbox: {
          x: { type: Number },
          y: { type: Number },
          w: { type: Number },
          h: { type: Number }
        }
      }
    ],
    reviewedAt: { type: Date },
    
    // AI Agentic Report Fields
    medicalReport: {
      summary: { type: String },
      findings: [
        {
          diseaseId: { type: String },
          diseaseName: { type: String },
          status: { type: String },
          prediction: { type: String },
          confidence: { type: Number },
          interpretation: { type: String },
          modelArchitecture: { type: String },
          modelName: { type: String },
          detectionCount: { type: Number }
        }
      ],
      overallAssessment: { type: String },
      recommendations: [{ type: String }],
      limitations: [{ type: String }],
      urgentAttention: { type: Boolean },
      disclaimer: { type: String }
    },
    reportGeneratedAt: { type: Date },
    reportModel: { type: String },
    reportStatus: {
      type: String,
      enum: ["pending", "generating", "completed", "failed", "failed_validation"],
      default: "pending"
    },
    reportError: { type: String },
    reportVersion: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
