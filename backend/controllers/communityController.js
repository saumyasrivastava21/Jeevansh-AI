const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const Like = require("../models/LikeModel");
const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");
const Doctor = require("../models/DoctorModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");
const { getIO, getOnlineDoctors, isUserOnline } = require("../utils/socketManager");

// ─── Helpers ───────────────────────────────────────────────

/**
 * Parse #tags from post content.
 * e.g. "My #Pneumonia experience #SuccessStory" → ["Pneumonia", "SuccessStory"]
 */
function parseTags(content) {
  const matches = content.match(/#(\w+)/g);
  return matches ? matches.map((t) => t.slice(1)) : [];
}

/**
 * Parse @mentions from text.
 * Matches @Dr. Firstname Lastname or @Firstname Lastname (2-4 words after @)
 * Returns array of name strings.
 */
function parseMentionNames(text) {
  const regex = /@((?:Dr\.\s)?[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/g;
  const names = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    names.push(match[1].trim());
  }
  return names;
}

/**
 * Resolve mention names to user IDs. Skips self-mentions.
 */
async function resolveMentions(mentionNames, authorId) {
  if (!mentionNames.length) return [];
  const users = await User.find({
    name: { $in: mentionNames },
    role: "doctor",
  }).select("_id name");

  // Filter out self-mentions
  return users.filter((u) => u._id.toString() !== authorId.toString());
}

// ─── Posts ──────────────────────────────────────────────────

/**
 * GET /api/community/posts
 * Paginated feed, newest first.
 * Query: ?page=1&limit=10
 */
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name role avatar")
      .lean();

    // Check which posts the current user has liked
    const postIds = posts.map((p) => p._id);
    const userLikes = await Like.find({
      post: { $in: postIds },
      user: req.user._id,
    }).select("post");
    const likedSet = new Set(userLikes.map((l) => l.post.toString()));

    // Attach doctor specialty if author is a doctor
    const doctorAuthorIds = posts
      .filter((p) => p.author.role === "doctor")
      .map((p) => p.author._id);
    const doctorProfiles = await Doctor.find({
      userId: { $in: doctorAuthorIds },
    }).select("userId specialty");
    const specialtyMap = {};
    doctorProfiles.forEach((d) => {
      specialtyMap[d.userId.toString()] = d.specialty;
    });

    const enrichedPosts = posts.map((p) => ({
      ...p,
      liked: likedSet.has(p._id.toString()),
      author: {
        ...p.author,
        specialty: specialtyMap[p.author._id.toString()] || null,
      },
    }));

    const total = await Post.countDocuments();

    res.status(200).json(
      new ApiResponse(200, {
        posts: enrichedPosts,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      })
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/community/posts
 * Create a new post. Auto-parses #tags from content.
 */
const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return next(new ApiError(400, "Post content is required"));
    }
    if (content.length > 1000) {
      return next(new ApiError(400, "Post content cannot exceed 1000 characters"));
    }

    const tags = parseTags(content);

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      tags,
    });

    const populated = await Post.findById(post._id)
      .populate("author", "name role avatar")
      .lean();

    // Attach specialty if doctor
    let specialty = null;
    if (populated.author.role === "doctor") {
      const doc = await Doctor.findOne({ userId: populated.author._id });
      specialty = doc?.specialty || null;
    }

    const result = {
      ...populated,
      liked: false,
      author: { ...populated.author, specialty },
    };

    // Handle @mentions in post content
    const mentionNames = parseMentionNames(content);
    const mentionedUsers = await resolveMentions(mentionNames, req.user._id);

    for (const mentionedUser of mentionedUsers) {
      const notification = await Notification.create({
        recipient: mentionedUser._id,
        sender: req.user._id,
        type: "mention",
        post: post._id,
        message: `${req.user.name} mentioned you in a post`,
      });

      const populatedNotif = await Notification.findById(notification._id)
        .populate("sender", "name avatar role")
        .populate("post", "content")
        .lean();

      // Send real-time notification via user-specific room
      const io = getIO();
      if (io) {
        io.to(`user:${mentionedUser._id.toString()}`).emit(
          "notification:new",
          populatedNotif
        );
      }
    }

    res.status(201).json(new ApiResponse(201, result, "Post created"));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/community/posts/:id
 * Delete own post or admin can delete any.
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ApiError(404, "Post not found"));

    if (
      !post.author.equals(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return next(new ApiError(403, "Not authorized to delete this post"));
    }

    // Clean up related data
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.status(200).json(new ApiResponse(200, null, "Post deleted"));
  } catch (err) {
    next(err);
  }
};

// ─── Likes ─────────────────────────────────────────────────

/**
 * POST /api/community/posts/:id/like
 * Toggle like/unlike. Uses atomic $inc to avoid race conditions.
 */
const toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ post: postId, user: userId });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      res.status(200).json(new ApiResponse(200, { liked: false }, "Unliked"));
    } else {
      // Like
      await Like.create({ post: postId, user: userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      res.status(200).json(new ApiResponse(200, { liked: true }, "Liked"));
    }
  } catch (err) {
    // Handle duplicate key error gracefully (race condition safety net)
    if (err.code === 11000) {
      return res
        .status(200)
        .json(new ApiResponse(200, { liked: true }, "Already liked"));
    }
    next(err);
  }
};

// ─── Comments ──────────────────────────────────────────────

/**
 * GET /api/community/posts/:id/comments
 * Flat comments for a post, oldest first.
 */
const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name role avatar")
      .lean();

    // Attach doctor specialty for doctor authors
    const doctorAuthorIds = comments
      .filter((c) => c.author.role === "doctor")
      .map((c) => c.author._id);
    const doctorProfiles = await Doctor.find({
      userId: { $in: doctorAuthorIds },
    }).select("userId specialty");
    const specialtyMap = {};
    doctorProfiles.forEach((d) => {
      specialtyMap[d.userId.toString()] = d.specialty;
    });

    const enriched = comments.map((c) => ({
      ...c,
      author: {
        ...c.author,
        specialty: specialtyMap[c.author._id.toString()] || null,
      },
    }));

    const total = await Comment.countDocuments({ post: req.params.id });

    res.status(200).json(
      new ApiResponse(200, {
        comments: enriched,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      })
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/community/posts/:id/comments
 * Add a comment. Parses @mentions → creates notifications → broadcasts via socket.
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    if (!text || !text.trim()) {
      return next(new ApiError(400, "Comment text is required"));
    }
    if (text.length > 500) {
      return next(new ApiError(400, "Comment cannot exceed 500 characters"));
    }

    const post = await Post.findById(postId);
    if (!post) return next(new ApiError(404, "Post not found"));

    // Parse mentions
    const mentionNames = parseMentionNames(text);
    const mentionedUsers = await resolveMentions(mentionNames, req.user._id);

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text: text.trim(),
      mentions: mentionedUsers.map((u) => u._id),
    });

    // Atomic increment comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id)
      .populate("author", "name role avatar")
      .lean();

    // Attach specialty
    let specialty = null;
    if (populated.author.role === "doctor") {
      const doc = await Doctor.findOne({ userId: populated.author._id });
      specialty = doc?.specialty || null;
    }
    populated.author.specialty = specialty;

    const io = getIO();

    // Broadcast new comment to everyone in the post room
    if (io) {
      io.to(`post:${postId}`).emit("comment:new", populated);
    }

    // Create notifications for mentioned users
    for (const mentionedUser of mentionedUsers) {
      const notification = await Notification.create({
        recipient: mentionedUser._id,
        sender: req.user._id,
        type: "mention",
        post: postId,
        comment: comment._id,
        message: `${req.user.name} mentioned you in a comment`,
      });

      const populatedNotif = await Notification.findById(notification._id)
        .populate("sender", "name avatar role")
        .populate("post", "content")
        .lean();

      if (io) {
        io.to(`user:${mentionedUser._id.toString()}`).emit(
          "notification:new",
          populatedNotif
        );
      }
    }

    res.status(201).json(new ApiResponse(201, populated, "Comment added"));
  } catch (err) {
    next(err);
  }
};

// ─── Notifications ─────────────────────────────────────────

/**
 * GET /api/community/notifications
 * Get notifications for the current user (newest first).
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name avatar role")
      .populate("post", "content")
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res
      .status(200)
      .json(new ApiResponse(200, { notifications, unreadCount }));
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/community/notifications/read
 * Mark notifications as read. Body: { ids: [...] } or empty to mark all.
 */
const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const filter = { recipient: req.user._id };
    if (ids && ids.length) {
      filter._id = { $in: ids };
    }
    await Notification.updateMany(filter, { $set: { read: true } });
    res.status(200).json(new ApiResponse(200, null, "Notifications marked as read"));
  } catch (err) {
    next(err);
  }
};

// ─── Doctor Search ─────────────────────────────────────────

/**
 * GET /api/community/doctors?search=neha
 * Search all registered doctors. Returns online status per doctor.
 */
const searchDoctors = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const userFilter = { role: "doctor" };
    if (search.trim()) {
      userFilter.name = { $regex: search.trim(), $options: "i" };
    }

    const doctors = await User.find(userFilter)
      .select("name avatar")
      .limit(20)
      .lean();

    // Attach specialty and online status
    const doctorIds = doctors.map((d) => d._id);
    const profiles = await Doctor.find({ userId: { $in: doctorIds } }).select(
      "userId specialty"
    );
    const specialtyMap = {};
    profiles.forEach((p) => {
      specialtyMap[p.userId.toString()] = p.specialty;
    });

    const result = doctors.map((d) => ({
      _id: d._id,
      name: d.name,
      avatar: d.avatar,
      specialty: specialtyMap[d._id.toString()] || "General",
      online: isUserOnline(d._id),
    }));

    res.status(200).json(new ApiResponse(200, result));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/community/doctors/online
 * Get currently online doctors only.
 */
const getOnlineDoctorsList = async (req, res, next) => {
  try {
    const online = getOnlineDoctors();
    res.status(200).json(new ApiResponse(200, online));
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
