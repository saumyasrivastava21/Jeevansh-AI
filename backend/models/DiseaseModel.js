const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    imageUrl: { type: String },
    color: { type: String },
    bgColor: { type: String },
    icon: { type: String },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    treatment: [{ type: String }],
    prevention: [{ type: String }],
    prevalence: { type: String },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disease", diseaseSchema);
