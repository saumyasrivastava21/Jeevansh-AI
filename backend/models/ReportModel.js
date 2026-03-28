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
    diseaseName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    confidence: { type: Number, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "reviewed"],
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
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
