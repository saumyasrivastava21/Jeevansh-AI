const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/communityController");
const { protect } = require("../middlewares/authMiddleware");

// Post Routes
router.get("/posts", getPosts);
router.post("/posts", protect, createPost);
router.get("/posts/:id", getPostById);
router.patch("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.post("/posts/:id/like", protect, toggleLikePost);

// Comment Routes
router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/comments", protect, createComment);
router.delete("/comments/:commentId", protect, deleteComment);

module.exports = router;
