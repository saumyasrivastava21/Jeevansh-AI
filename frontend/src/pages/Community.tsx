import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, PenLine, X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  tags: string[];
  likes: number;
  liked: boolean;
  comments: { author: string; avatar: string; text: string; time: string }[];
  expanded: boolean;
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1', author: 'Arjun Mehta', avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=0B3C5D&color=fff&size=64',
    role: 'Patient', time: '2 hours ago',
    content: "Jeevansh AI flagged an abnormality in my chest X-ray that I'd been ignoring for weeks. Turns out it was early-stage pneumonia. Got on antibiotics immediately. This platform might have saved me from a hospital stay! 🙏",
    tags: ['Success Story', 'Pneumonia'], likes: 24, liked: false, comments: [
      { author: 'Dr. Neha Joshi', avatar: 'https://ui-avatars.com/api/?name=Neha+Joshi&background=00D1FF&color=0B3C5D&size=64', text: 'So glad the AI caught it early! Early detection makes such a difference. 💙', time: '1h ago' },
      { author: 'Priya Sharma', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=2ECC71&color=fff&size=64', text: 'Same thing happened to me! This platform is incredible.', time: '45m ago' },
    ], expanded: false,
  },
  {
    id: 'p2', author: 'Dr. Neha Joshi', avatar: 'https://ui-avatars.com/api/?name=Neha+Joshi&background=00D1FF&color=0B3C5D&size=64',
    role: 'Radiologist', time: '5 hours ago',
    content: "As a radiologist, I was skeptical at first. But after using Jeevansh's AI for 3 months, I'm genuinely impressed. It catches subtle findings I occasionally miss on first pass, especially in high-volume days. The bounding box overlays are clinically meaningful.",
    tags: ['Professional Review', 'AI in Medicine'], likes: 87, liked: true, comments: [
      { author: 'Dr. Rajesh Verma', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Verma&background=2ECC71&color=fff&size=64', text: 'Completely agree. The TB detection model is particularly impressive.', time: '3h ago' },
    ], expanded: false,
  },
  {
    id: 'p3', author: 'Ravi Kumar', avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=8B5CF6&color=fff&size=64',
    role: 'Patient', time: '1 day ago',
    content: "Question for the community: My X-ray showed 87% confidence for bone fracture but the doctor said it's just a sprain. Is this normal? Should I get a second opinion? The AI report said 'hairline fracture' specifically.",
    tags: ['Question', 'Fracture'], likes: 12, liked: false, comments: [
      { author: 'Dr. Neha Joshi', avatar: 'https://ui-avatars.com/api/?name=Neha+Joshi&background=00D1FF&color=0B3C5D&size=64', text: 'Hairline fractures can be subtle. A second opinion or follow-up CT scan would be prudent. 87% confidence is significant.', time: '20h ago' },
    ], expanded: false,
  },
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [composing, setComposing] = useState(false);

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleExpand = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: `p${Date.now()}`, author: user?.name ?? 'Anonymous',
      avatar: user?.avatar ?? 'https://ui-avatars.com/api/?name=User&background=0B3C5D&color=fff&size=64',
      role: user?.role ?? 'Patient', time: 'Just now',
      content: newPost, tags: ['Community'], likes: 0, liked: false, comments: [], expanded: false,
    };
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setComposing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-1">Community <span className="gradient-text">Forum</span></h1>
        <p className="text-muted-foreground">Share experiences, ask questions, and connect with patients and doctors.</p>
      </motion.div>

      {/* Compose */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="medical-card">
          <CardContent className="p-4">
            {composing ? (
              <div className="space-y-3">
                <Textarea
                  className="resize-none"
                  placeholder="Share your experience, ask a question, or start a discussion..."
                  rows={4}
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{newPost.length}/500</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setComposing(false); setNewPost(''); }}><X className="w-3.5 h-3.5" /></Button>
                    <Button variant="medical" size="sm" disabled={!newPost.trim()} onClick={submitPost} className="gap-2"><Send className="w-3.5 h-3.5" />Post</Button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setComposing(true)} className="w-full flex items-center gap-3 text-left">
                <img src={user?.avatar ?? 'https://ui-avatars.com/api/?name=User&size=64'} alt="" className="w-9 h-9 rounded-full" />
                <div className="flex-1 h-10 rounded-full bg-muted flex items-center px-4 text-sm text-muted-foreground hover:bg-muted/80 transition-colors">
                  <PenLine className="w-4 h-4 mr-2" />Share your health experience or ask a question...
                </div>
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Posts feed */}
      <AnimatePresence>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="medical-card">
              <CardContent className="p-5">
                {/* Author */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{post.author}</p>
                        <Badge variant={post.role === 'Radiologist' || post.role === 'doctor' ? 'success' : 'info'} className="text-[10px] py-0">{post.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground leading-relaxed mb-3">{post.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">#{tag.replace(' ', '')}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}>
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500' : ''}`} /> {post.likes}
                  </button>
                  <button onClick={() => toggleExpand(post.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" /> {post.comments.length}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {post.expanded && post.comments.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 pl-4 border-l-2 border-border">
                      {post.comments.map((c, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <img src={c.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
                          <div className="flex-1 p-2.5 rounded-xl bg-muted text-sm">
                            <span className="font-semibold">{c.author}</span>
                            <span className="text-muted-foreground text-xs ml-2">{c.time}</span>
                            <p className="text-muted-foreground mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
