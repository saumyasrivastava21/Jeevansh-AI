const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    tags: [{ type: String, trim: true }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for feed ordering
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
