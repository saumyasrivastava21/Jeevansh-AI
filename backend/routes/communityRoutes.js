const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getPosts,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  getNotifications,
  markNotificationsRead,
  searchDoctors,
  getOnlineDoctorsList,
} = require("../controllers/communityController");

// All community routes require authentication
router.use(protect);

// Posts
router.route("/posts").get(getPosts).post(createPost);
router.route("/posts/:id").delete(deletePost);
router.route("/posts/:id/like").post(toggleLike);

// Comments
router.route("/posts/:id/comments").get(getComments).post(addComment);

// Notifications
router.route("/notifications").get(getNotifications);
router.route("/notifications/read").put(markNotificationsRead);

// Doctor search & presence
router.route("/doctors").get(searchDoctors);
router.route("/doctors/online").get(getOnlineDoctorsList);

module.exports = router;
