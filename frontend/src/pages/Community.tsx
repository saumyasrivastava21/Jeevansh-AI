import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, PenLine, X, Send, Bell,
  Circle, Search, AtSign, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// ─── Types ──────────────────────────────────────────────────

interface Author {
  _id: string;
  name: string;
  role: string;
  avatar: string;
  specialty?: string | null;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  createdAt: string;
}

interface Comment {
  _id: string;
  author: Author;
  text: string;
  createdAt: string;
}

interface DoctorSearch {
  _id: string;
  name: string;
  avatar: string;
  specialty: string;
  online: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function roleBadgeVariant(role: string): 'success' | 'info' | 'warning' {
  if (role === 'doctor') return 'success';
  if (role === 'admin') return 'warning';
  return 'info';
}

function roleLabel(author: Author) {
  if (author.role === 'doctor' && author.specialty) return author.specialty;
  if (author.role === 'admin') return 'Admin';
  return 'Patient';
}

// ─── MentionInput ───────────────────────────────────────────

interface MentionInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  maxLength?: number;
}

function MentionInput({ value, onChange, placeholder, rows = 4, maxLength = 1000 }: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [doctors, setDoctors] = useState<DoctorSearch[]>([]);
  const [caretPos, setCaretPos] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    const pos = e.target.selectionStart ?? 0;
    setCaretPos(pos);
    onChange(v);

    // Detect @ trigger
    const textBefore = v.slice(0, pos);
    const match = textBefore.match(/@([\w\s.]*)$/);
    if (match) {
      const q = match[1];
      setMentionQuery(q);
      setShowDropdown(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchDoctors(q), 300);
    } else {
      setShowDropdown(false);
    }
  };

  const fetchDoctors = async (q: string) => {
    try {
      const res = await apiFetch(`/community/doctors?search=${encodeURIComponent(q)}`);
      if (res.success) setDoctors(res.data.slice(0, 6));
    } catch { setDoctors([]); }
  };

  const insertMention = (doctor: DoctorSearch) => {
    const textBefore = value.slice(0, caretPos);
    const textAfter = value.slice(caretPos);
    const mentionStart = textBefore.lastIndexOf('@');
    const newText = textBefore.slice(0, mentionStart) + `@${doctor.name} ` + textAfter;
    onChange(newText);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Textarea
        className="resize-none"
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        autoFocus
      />
      <AnimatePresence>
        {showDropdown && doctors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            {doctors.map(doc => (
              <button
                key={doc._id}
                onMouseDown={e => { e.preventDefault(); insertMention(doc); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
              >
                <div className="relative">
                  <img src={doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&size=32`}
                    className="w-7 h-7 rounded-full" alt="" />
                  <Circle className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-current ${doc.online ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialty} · {doc.online ? 'Online' : 'Offline'}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── NotificationPanel ──────────────────────────────────────

function NotificationPanel() {
  const { notifications, unreadCount, markNotificationsRead } = useSocket();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && unreadCount > 0) markNotificationsRead();
  };

  return (
    <div className="relative">
      <button onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-muted transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="font-semibold text-sm">Notifications</p>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">No notifications yet</p>
              ) : notifications.map(n => (
                <div key={n._id} className={`px-4 py-3 border-b border-border/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className="flex gap-2 items-start">
                    <img src={n.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender.name)}&size=32`}
                      className="w-7 h-7 rounded-full flex-shrink-0" alt="" />
                    <div>
                      <p className="text-xs">{n.message}</p>
                      {n.post?.content && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">"{n.post.content}"</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── OnlineDocPanel ─────────────────────────────────────────

function OnlineDoctorsPanel() {
  const { onlineDoctors } = useSocket();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-4 mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />
          <span className="text-sm font-semibold">Online Doctors</span>
          <span className="text-xs text-muted-foreground">({onlineDoctors.length})</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="mt-3 space-y-2">
              {onlineDoctors.length === 0 ? (
                <p className="text-xs text-muted-foreground">No doctors online right now</p>
              ) : onlineDoctors.map(d => (
                <div key={d.userId} className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=0B3C5D&color=fff&size=32`}
                      className="w-7 h-7 rounded-full" alt="" />
                    <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-green-500 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PostCard ────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  currentUserRole?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

function PostCard({ post, currentUserId, currentUserRole, onLike, onDelete }: PostCardProps) {
  const { socket, joinPostRoom, leavePostRoom } = useSocket();
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount);
  const [copyMsg, setCopyMsg] = useState(false);

  // Live comment subscription
  useEffect(() => {
    if (!socket || !expanded) return;
    joinPostRoom(post._id);

    const handler = (comment: Comment) => {
      setComments(prev => [...prev, comment]);
      setLocalCommentsCount(c => c + 1);
    };
    socket.on('comment:new', handler);

    return () => {
      socket.off('comment:new', handler);
      leavePostRoom(post._id);
    };
  }, [socket, expanded, post._id, joinPostRoom, leavePostRoom]);

  const loadComments = async () => {
    if (commentsLoaded) return;
    try {
      const res = await apiFetch(`/community/posts/${post._id}/comments`);
      if (res.success) setComments(res.data.comments);
      setCommentsLoaded(true);
    } catch { /* ignore */ }
  };

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) loadComments();
  };

  const submitComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await apiFetch(`/community/posts/${post._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      // Socket broadcasts the new comment back to us
    } catch { /* ignore */ } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community#${post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(true);
      setTimeout(() => setCopyMsg(false), 2000);
    });
  };

  const canDelete = currentUserId === post.author._id || currentUserRole === 'admin';

  return (
    <Card className="medical-card" id={post._id}>
      <CardContent className="p-5">
        {/* Author */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&size=64`}
              alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{post.author.name}</p>
                <Badge variant={roleBadgeVariant(post.author.role)} className="text-[10px] py-0">
                  {roleLabel(post.author)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {canDelete && (
            <button onClick={() => onDelete(post._id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button onClick={() => onLike(post._id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}>
            <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>
          <button onClick={handleExpand}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{localCommentsCount}</span>
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
            <Share2 className="w-4 h-4" />
            <span>{copyMsg ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-border">
                {comments.map(c => (
                  <div key={c._id} className="flex items-start gap-2.5">
                    <img src={c.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author.name)}&size=32`}
                      alt="" className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="flex-1 p-2.5 rounded-xl bg-muted text-sm">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-xs">{c.author.name}</span>
                        <Badge variant={roleBadgeVariant(c.author.role)} className="text-[9px] py-0 px-1.5">
                          {roleLabel(c.author)}
                        </Badge>
                        <span className="text-muted-foreground text-[10px] ml-auto">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex gap-2 mt-2">
                  <MentionInput value={commentText} onChange={setCommentText}
                    placeholder="Add a comment... use @Name to mention a doctor" rows={2} maxLength={500} />
                  <button onClick={submitComment} disabled={!commentText.trim() || submittingComment}
                    className="self-end p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ─── Main Community Page ─────────────────────────────────────

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composing, setComposing] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await apiFetch(`/community/posts?page=${p}&limit=10`);
      if (res.success) {
        setPosts(prev => append ? [...prev, ...res.data.posts] : res.data.posts);
        setTotalPages(res.data.totalPages);
        setPage(p);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  const handleLike = async (id: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => p._id === id
      ? { ...p, liked: !p.liked, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 }
      : p));
    try {
      await apiFetch(`/community/posts/${id}/like`, { method: 'POST' });
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p => p._id === id
        ? { ...p, liked: !p.liked, likesCount: p.liked ? p.likesCount - 1 : p.likesCount + 1 }
        : p));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/community/posts/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch { /* ignore */ }
  };

  const submitPost = async () => {
    if (!newPost.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiFetch('/community/posts', {
        method: 'POST',
        body: JSON.stringify({ content: newPost }),
      });
      if (res.success) {
        setPosts(prev => [res.data, ...prev]);
        setNewPost('');
        setComposing(false);
      }
    } catch { /* ignore */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Community <span className="gradient-text">Forum</span>
          </h1>
          <p className="text-muted-foreground text-sm">Share experiences, ask questions, and connect with patients and doctors.</p>
        </div>
        <NotificationPanel />
      </motion.div>

      {/* Online doctors */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <OnlineDoctorsPanel />
      </motion.div>

      {/* Compose */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="medical-card">
          <CardContent className="p-4">
            {composing ? (
              <div className="space-y-3">
                <MentionInput value={newPost} onChange={setNewPost}
                  placeholder="Share your experience... Use #tags and @DoctorName to mention. Max 1000 chars."
                  rows={4} maxLength={1000} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AtSign className="w-3 h-3" />
                    <span>Type @ to mention a doctor</span>
                    <span className="ml-2">{newPost.length}/1000</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setComposing(false); setNewPost(''); }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="medical" size="sm" disabled={!newPost.trim() || submitting} onClick={submitPost} className="gap-2">
                      <Send className="w-3.5 h-3.5" />{submitting ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setComposing(true)} className="w-full flex items-center gap-3 text-left">
                <img src={user?.avatar ?? `https://ui-avatars.com/api/?name=User&size=64`}
                  alt="" className="w-9 h-9 rounded-full" />
                <div className="flex-1 h-10 rounded-full bg-muted flex items-center px-4 text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  <PenLine className="w-4 h-4 mr-2" />Share your health experience or ask a question...
                </div>
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div key={post._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ delay: i * 0.04 }}>
              <PostCard post={post} currentUserId={user?.id} currentUserRole={user?.role}
                onLike={handleLike} onDelete={handleDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Load more */}
      {!loading && page < totalPages && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={() => loadPosts(page + 1, true)} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load more posts'}
          </Button>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No posts yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}
