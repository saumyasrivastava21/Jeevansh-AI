const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");

const ALLOWED_CATEGORIES = [
  "General Health",
  "Medical Questions",
  "AI & Healthcare",
  "Recovery & Support",
  "Doctors & Professionals",
  "Jeevansh AI",
];

// Helper to optionally extract user ID from token without failing if absent
const getOptionalUserId = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_key_123"
      );
      return decoded._id || decoded.id;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// @desc    Get all community posts with filtering & search
// @route   GET /api/community/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const { category, search, tag, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user ? req.user._id : getOptionalUserId(req);

    const query = {};

    if (category && category !== "All" && category !== "all") {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query),
    ]);

    const formattedPosts = posts.map((post) => {
      const isLiked = currentUserId
        ? post.likes.some((id) => id.toString() === currentUserId.toString())
        : false;
      return {
        _id: post._id,
        author: post.author,
        title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags,
        likesCount: post.likes.length,
        isLiked,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    res.json(
      new ApiResponse(
        200,
        {
          posts: formattedPosts,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
        "Community posts fetched successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/community/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const currentUserId = req.user ? req.user._id : getOptionalUserId(req);

    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email avatar role"
    );

    if (!post) {
      return next(new ApiError(404, "Post not found."));
    }

    const isLiked = currentUserId
      ? post.likes.some((id) => id.toString() === currentUserId.toString())
      : false;

    res.json(
      new ApiResponse(
        200,
        {
          _id: post._id,
          author: post.author,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          likesCount: post.likes.length,
          isLiked,
          commentCount: post.commentCount,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
        "Post retrieved successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new community post
// @route   POST /api/community/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return next(new ApiError(400, "Title and content are required."));
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      return next(new ApiError(400, "Title must be between 3 and 200 characters."));
    }

    if (trimmedContent.length < 5 || trimmedContent.length > 5000) {
      return next(new ApiError(400, "Content must be between 5 and 5000 characters."));
    }

    const validatedCategory = ALLOWED_CATEGORIES.includes(category)
      ? category
      : "General Health";

    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      parsedTags = tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);
    }

    const post = await Post.create({
      author: req.user._id,
      title: trimmedTitle,
      content: trimmedContent,
      category: validatedCategory,
      tags: parsedTags,
      likes: [],
      commentCount: 0,
    });

    const populated = await Post.findById(post._id).populate(
      "author",
      "name email avatar role"
    );

    res.status(201).json(
      new ApiResponse(
        201,
        {
          _id: populated._id,
          author: populated.author,
          title: populated.title,
          content: populated.content,
          category: populated.category,
          tags: populated.tags,
          likesCount: 0,
          isLiked: false,
          commentCount: 0,
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        },
        "Post created successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing post
// @route   PATCH /api/community/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ApiError(404, "Post not found."));
    }

    if (!post.author.equals(req.user._id) && req.user.role !== "admin") {
      return next(new ApiError(403, "Not authorized to update this post."));
    }

    const { title, content, category, tags } = req.body;

    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (category) {
      post.category = ALLOWED_CATEGORIES.includes(category)
        ? category
        : post.category;
    }
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        post.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === "string") {
        post.tags = tags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean);
      }
    }

    await post.save();

    const populated = await Post.findById(post._id).populate(
      "author",
      "name email avatar role"
    );

    const isLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    res.json(
      new ApiResponse(
        200,
        {
          _id: populated._id,
          author: populated.author,
          title: populated.title,
          content: populated.content,
          category: populated.category,
          tags: populated.tags,
          likesCount: populated.likes.length,
          isLiked,
          commentCount: populated.commentCount,
          createdAt: populated.createdAt,
          updatedAt: populated.updatedAt,
        },
        "Post updated successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post and its comments
// @route   DELETE /api/community/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ApiError(404, "Post not found."));
    }

    if (!post.author.equals(req.user._id) && req.user.role !== "admin") {
      return next(new ApiError(403, "Not authorized to delete this post."));
    }

    await Promise.all([
      Post.findByIdAndDelete(post._id),
      Comment.deleteMany({ postId: post._id }),
    ]);

    res.json(new ApiResponse(200, null, "Post and associated comments deleted."));
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/community/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ApiError(404, "Post not found."));
    }

    const userIndex = post.likes.findIndex((id) =>
      id.equals(req.user._id)
    );

    let isLiked = false;
    if (userIndex === -1) {
      post.likes.push(req.user._id);
      isLiked = true;
    } else {
      post.likes.splice(userIndex, 1);
      isLiked = false;
    }

    await post.save();

    res.json(
      new ApiResponse(
        200,
        {
          likesCount: post.likes.length,
          isLiked,
        },
        isLiked ? "Post liked." : "Post unliked."
      )
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/community/posts/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const comments = await Comment.find({ postId: req.params.id })
      .populate("author", "name email avatar role")
      .sort({ createdAt: 1 });

    res.json(new ApiResponse(200, comments, "Comments fetched successfully."));
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment on a post
// @route   POST /api/community/posts/:id/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, "Invalid Post ID."));
    }

    const { content } = req.body;
    const trimmedContent = (content || "").trim();
    if (!trimmedContent) {
      return next(new ApiError(400, "Comment text cannot be empty."));
    }
    if (trimmedContent.length > 2000) {
      return next(new ApiError(400, "Comment must not exceed 2000 characters."));
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(new ApiError(404, "Post not found."));
    }

    const comment = await Comment.create({
      postId: post._id,
      author: req.user._id,
      content: trimmedContent,
    });

    // Increment comment count on the post
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name email avatar role"
    );

    res.status(201).json(
      new ApiResponse(201, populatedComment, "Comment added successfully.")
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/community/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
      return next(new ApiError(400, "Invalid Comment ID."));
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ApiError(404, "Comment not found."));
    }

    const post = await Post.findById(comment.postId);

    // Authorization: comment author, post author, or admin
    const isCommentAuthor = comment.author.equals(req.user._id);
    const isPostAuthor = post && post.author.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return next(new ApiError(403, "Not authorized to delete this comment."));
    }

    await Comment.findByIdAndDelete(comment._id);

    if (post) {
      post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
      await post.save();
    }

    res.json(new ApiResponse(200, null, "Comment deleted successfully."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getComments,
  createComment,
  deleteComment,
};
