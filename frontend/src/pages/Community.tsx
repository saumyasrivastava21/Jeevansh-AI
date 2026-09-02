import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  PenLine,
  X,
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  User,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { communityApi, Post, Comment } from "@/lib/communityApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CATEGORIES = [
  "All",
  "General Health",
  "Medical Questions",
  "AI & Healthcare",
  "Recovery & Support",
  "Doctors & Professionals",
  "Jeevansh AI",
];

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Post Creation State
  const [composing, setComposing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General Health");
  const [newTags, setNewTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Comments State (keyed by postId)
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentLoadingMap, setCommentLoadingMap] = useState<Record<string, boolean>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [commentSubmittingMap, setCommentSubmittingMap] = useState<Record<string, boolean>>({});

  // Delete Confirmation Dialog
  const [deleteTarget, setDeleteTarget] = useState<{ type: "post" | "comment"; id: string; postId?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await communityApi.getPosts({
        category: category !== "All" ? category : undefined,
        search: searchQuery.trim() || undefined,
      });
      setPosts(res.posts || []);
    } catch (err: any) {
      console.error("Failed to load community feed:", err);
      toast({
        title: "Feed Error",
        description: err.message || "Failed to load community posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  // Submit New Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a title and discussion content.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await communityApi.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean),
      });

      setPosts((prev) => [created, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
      setComposing(false);

      toast({
        title: "Post Published!",
        description: "Your discussion has been posted to the community.",
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to Post",
        description: err.message || "Could not publish post.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Like
  const handleToggleLike = async (post: Post) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts.",
        variant: "info",
      });
      navigate("/login");
      return;
    }

    // Optimistic UI Update
    const prevIsLiked = post.isLiked;
    const prevLikes = post.likesCount;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
              ...p,
              isLiked: !prevIsLiked,
              likesCount: prevIsLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1,
            }
          : p
      )
    );

    try {
      const res = await communityApi.toggleLike(post._id);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount }
            : p
        )
      );
    } catch (err: any) {
      // Revert optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, isLiked: prevIsLiked, likesCount: prevLikes }
            : p
        )
      );
      toast({
        title: "Action Failed",
        description: err.message || "Could not update like.",
        variant: "destructive",
      });
    }
  };

  // Toggle and Load Comments
  const handleToggleComments = async (postId: string) => {
    const isNowExpanded = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isNowExpanded }));

    if (isNowExpanded && !commentsMap[postId]) {
      setCommentLoadingMap((prev) => ({ ...prev, [postId]: true }));
      try {
        const comments = await communityApi.getComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentLoadingMap((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const text = (commentInputMap[postId] || "").trim();
    if (!text) return;

    setCommentSubmittingMap((prev) => ({ ...prev, [postId]: true }));
    try {
      const createdComment = await communityApi.createComment(postId, text);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), createdComment],
      }));
      setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
        )
      );
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Could not post comment.",
        variant: "destructive",
      });
    } finally {
      setCommentSubmittingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Delete Action Execution
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      if (deleteTarget.type === "post") {
        await communityApi.deletePost(deleteTarget.id);
        setPosts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
        toast({
          title: "Post Deleted",
          description: "Your post and comments have been deleted.",
          variant: "success",
        });
      } else if (deleteTarget.type === "comment" && deleteTarget.postId) {
        await communityApi.deleteComment(deleteTarget.id);
        setCommentsMap((prev) => ({
          ...prev,
          [deleteTarget.postId!]: (prev[deleteTarget.postId!] || []).filter(
            (c) => c._id !== deleteTarget.id
          ),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p._id === deleteTarget.postId
              ? { ...p, commentCount: Math.max(0, p.commentCount - 1) }
              : p
          )
        );
        toast({
          title: "Comment Deleted",
          description: "Comment has been removed.",
          variant: "info",
        });
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete item.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community#${post._id}`);
      toast({
        title: "Link Copied!",
        description: "Post link copied to clipboard.",
        variant: "success",
      });
    }
  };

  const renderRoleBadge = (role?: string) => {
    if (role === "doctor") {
      return (
        <Badge variant="success" className="text-[10px] py-0 px-1.5 gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <Stethoscope className="w-2.5 h-2.5" /> Doctor
        </Badge>
      );
    }
    if (role === "admin") {
      return (
        <Badge variant="info" className="text-[10px] py-0 px-1.5 gap-1 bg-purple-500/10 text-purple-400 border-purple-500/30">
          <ShieldCheck className="w-2.5 h-2.5" /> Admin
        </Badge>
      );
    }
    return (
      <Badge variant="info" className="text-[10px] py-0 px-1.5 gap-1 bg-blue-500/10 text-blue-400 border-blue-500/30">
        <User className="w-2.5 h-2.5" /> Patient
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Healthcare <span className="gradient-text">Community Forum</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Share clinical recovery experiences, ask medical questions, and discuss AI diagnostics with patients and certified doctors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={loading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {!composing && (
            <Button
              variant="medical"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                } else {
                  setComposing(true);
                }
              }}
              className="rounded-xl gap-1.5 font-bold"
            >
              <PenLine className="w-4 h-4" /> Start Discussion
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions, symptoms, clinical tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl px-4 text-xs font-bold">
            Search
          </Button>
        </form>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Form */}
      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="medical-card border-primary/30 shadow-lg">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-primary" /> Create Discussion Post
                  </h3>
                  <button
                    onClick={() => setComposing(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Discussion Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Early detection of pneumonia via AI screening..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="rounded-xl font-medium"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        {CATEGORIES.filter((c) => c !== "All").map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">
                        Tags (comma-separated)
                      </label>
                      <Input
                        placeholder="e.g. Pneumonia, AI, ChestXRay"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Share your healthcare experience, question, or diagnosis advice..."
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="rounded-xl resize-none text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">
                      {newContent.length} characters
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setComposing(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="medical"
                        size="sm"
                        disabled={submitting || !newTitle.trim() || !newContent.trim()}
                        onClick={handleCreatePost}
                        className="rounded-xl gap-1.5 font-bold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Publish Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed List */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">Loading community discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="medical-card text-center py-16">
          <CardContent className="space-y-3">
            <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <h3 className="font-bold text-base text-foreground">No posts found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Be the first to start a conversation in this topic or ask medical advice from specialists!
            </p>
            <Button
              variant="medical"
              size="sm"
              onClick={() => {
                if (!isAuthenticated) navigate("/login");
                else setComposing(true);
              }}
              className="rounded-xl gap-2 font-bold"
            >
              <PenLine className="w-4 h-4" /> Start First Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post) => {
              const isOwner =
                user && (post.author?._id === user.id || user.role === "admin");
              const isExpanded = !!expandedComments[post._id];
              const comments = commentsMap[post._id] || [];
              const commentsLoading = !!commentLoadingMap[post._id];
              const commentInput = commentInputMap[post._id] || "";
              const commentSubmitting = !!commentSubmittingMap[post._id];

              const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <Card className="medical-card border-primary/10">
                    <CardContent className="p-5 space-y-3">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              post.author?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                post.author?.name || "User"
                              )}&background=0B3C5D&color=fff`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm text-foreground truncate">
                                {post.author?.name || "Anonymous Member"}
                              </p>
                              {renderRoleBadge(post.author?.role)}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <span>{formattedDate}</span>
                              <span>•</span>
                              <span className="text-primary font-medium">{post.category}</span>
                            </p>
                          </div>
                        </div>

                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDeleteTarget({ type: "post", id: post._id })
                            }
                            className="text-muted-foreground hover:text-red-500 rounded-lg"
                            title="Delete discussion"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-1.5 pt-1">
                        <h3 className="font-bold text-base text-foreground">
                          {post.title}
                        </h3>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                setSearchQuery(tag);
                                fetchPosts();
                              }}
                            >
                              #{tag.replace(/\s+/g, "")}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions Bar */}
                      <div className="flex items-center gap-4 pt-3 border-t border-border text-xs">
                        <button
                          onClick={() => handleToggleLike(post)}
                          className={`flex items-center gap-1.5 font-semibold transition-colors ${
                            post.isLiked
                              ? "text-red-500 fill-red-500"
                              : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.isLiked ? "fill-red-500" : ""}`}
                          />
                          <span>{post.likesCount}</span>
                        </button>

                        <button
                          onClick={() => handleToggleComments(post._id)}
                          className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentCount} Comments</span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Comments Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-border space-y-3"
                          >
                            {/* Comment Input */}
                            <div className="flex gap-2 items-center">
                              <img
                                src={
                                  user?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user?.name || "User"
                                  )}&background=0B3C5D&color=fff`
                                }
                                alt=""
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                              <Input
                                placeholder={
                                  isAuthenticated
                                    ? "Write a reply or medical insight..."
                                    : "Please log in to reply..."
                                }
                                value={commentInput}
                                disabled={!isAuthenticated}
                                onChange={(e) =>
                                  setCommentInputMap((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                                className="h-9 text-xs rounded-xl flex-1"
                              />
                              <Button
                                size="sm"
                                variant="medical"
                                disabled={
                                  !isAuthenticated ||
                                  commentSubmitting ||
                                  !commentInput.trim()
                                }
                                onClick={() => handleAddComment(post._id)}
                                className="h-9 px-3 rounded-xl gap-1 text-xs font-bold"
                              >
                                {commentSubmitting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>

                            {/* Comments List */}
                            {commentsLoading ? (
                              <div className="py-4 text-center">
                                <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mb-1" />
                                <span className="text-[11px] text-muted-foreground">
                                  Loading replies...
                                </span>
                              </div>
                            ) : comments.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2 text-center">
                                No comments yet. Start the discussion!
                              </p>
                            ) : (
                              <div className="space-y-2.5 pl-2 border-l-2 border-primary/20">
                                {comments.map((comment) => {
                                  const isCommentOwner =
                                    user &&
                                    (comment.author?._id === user.id ||
                                      post.author?._id === user.id ||
                                      user.role === "admin");

                                  const commentDate = new Date(
                                    comment.createdAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  });

                                  return (
                                    <div
                                      key={comment._id}
                                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 text-xs group"
                                    >
                                      <img
                                        src={
                                          comment.author?.avatar ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            comment.author?.name || "User"
                                          )}&background=0B3C5D&color=fff`
                                        }
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-foreground">
                                              {comment.author?.name}
                                            </span>
                                            {renderRoleBadge(comment.author?.role)}
                                            <span className="text-[10px] text-muted-foreground">
                                              {commentDate}
                                            </span>
                                          </div>
                                          {isCommentOwner && (
                                            <button
                                              onClick={() =>
                                                setDeleteTarget({
                                                  type: "comment",
                                                  id: comment._id,
                                                  postId: post._id,
                                                })
                                              }
                                              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                              title="Delete comment"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-foreground/90 mt-1 leading-relaxed">
                                          {comment.content}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Delete {deleteTarget?.type === "post" ? "Discussion Post" : "Comment"}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this {deleteTarget?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleExecuteDelete}
              disabled={deleting}
              className="rounded-xl font-bold gap-1.5"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
