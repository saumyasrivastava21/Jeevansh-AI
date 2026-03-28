const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialty: { type: String, required: true },
    subSpecialty: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    experience: { type: Number, required: true },
    hospital: { type: String, required: true },
    location: { type: String, required: true },
    available: { type: Boolean, default: true },
    nextSlot: { type: String },
    consultationFee: { type: Number, required: true },
    languages: [{ type: String }],
    bio: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
