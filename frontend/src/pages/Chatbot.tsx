import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  History,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import AI3DVisualization from '@/components/AI3DVisualization';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED = [
  'What are the symptoms of pneumonia?',
  'Is my condition serious?',
  'What treatment is recommended for tuberculosis?',
  'How accurate is the AI diagnosis?',
  'Should I see a specialist?',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'assistant',
    content: "Hello! I'm Jeevansh AI's medical assistant. I can help you understand your diagnosis, explain medical conditions, and answer healthcare questions. How can I assist you today?\n\nYou can ask me about your recent scan results, treatment options, or any medical concerns.",
    timestamp: new Date(),
  },
];

export default function Chatbot() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const token = localStorage.getItem('jeevansh_token');
      // Build history excluding initial greeting
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('http://localhost:5000/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Chatbot service unavailable');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[Chatbot] Error:', err);
      setError(err.message || 'Failed to get a response. Please try again.');
    } finally {
      setTyping(false);
    }
  };

  const handleRetry = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1].content;
      sendMessage(lastUserMsg);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied',
      description: 'Response copied to clipboard.',
      variant: 'success',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left: Sidebar (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-80 border-r border-border bg-card/40 backdrop-blur-xl shrink-0 p-5 space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary" />
            AI Consultation Core
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your conversational companion dynamically referencing RAG (Retrieval-Augmented Generation) medical guidelines.
          </p>
        </div>

        {/* 3D Visualization inside Sidebar */}
        <div className="flex-1 rounded-2xl border border-primary/20 bg-background/30 flex items-center justify-center relative overflow-hidden h-48 max-h-64 shadow-inner">
          <AI3DVisualization className="absolute inset-0 z-0" />
          <div className="absolute bottom-3 left-3 right-3 z-10 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-mono text-center backdrop-blur-sm">
            Interactive AI Node
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <p className="text-xs font-bold text-foreground flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            Privacy Assurance
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Conversations are secure and fully compliant with HIPAA guidelines. Model queries are processed locally and securely.
          </p>
        </div>
      </div>

      {/* Main Conversation Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-medical-cyan" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-sm">Jeevansh AI Medical Assistant</p>
              <p className="text-[10px] text-muted-foreground">Nemotron-3.5-Lightning · Connected</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="gap-1.5 text-xs rounded-xl h-9 border-border hover:bg-muted"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
          </Button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn('flex gap-3 max-w-4xl mx-auto', msg.role === 'user' && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm',
                    msg.role === 'assistant'
                      ? 'bg-medical-blue border border-primary/20'
                      : 'bg-medical-green border border-emerald-500/20'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4.5 h-4.5 text-medical-cyan" />
                  ) : (
                    <User className="w-4.5 h-4.5 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div className={cn('min-w-0 max-w-[80%]', msg.role === 'user' && 'items-end flex flex-col')}>
                  <div
                    className={cn(
                      'px-4 py-3.5 rounded-2xl text-sm leading-relaxed relative group',
                      msg.role === 'assistant'
                        ? 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm'
                        : 'bg-primary text-white rounded-tr-sm shadow-md'
                    )}
                  >
                    {/* Markdown rendering for assistant */}
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content space-y-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{msg.content}</p>
                    )}

                    {/* Quick Action Overlay (Copy Button) */}
                    {msg.role === 'assistant' && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1.5 rounded-lg border border-border shadow-sm flex items-center">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-1 px-1.5 font-mono">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 max-w-4xl mx-auto"
              >
                <div className="w-9 h-9 rounded-xl bg-medical-blue flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
                  <Bot className="w-4.5 h-4.5 text-medical-cyan" />
                </div>
                <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 bg-primary/40 rounded-full"
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Suggested Queries */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2 max-w-3xl w-full mx-auto">
            <p className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              Frequently Asked Medical Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3.5 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-6 py-4 border-t border-border bg-background/80 backdrop-blur-md">
          {error && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center justify-between max-w-3xl mx-auto">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg h-7 text-[11px] font-bold"
              >
                Retry Request
              </Button>
            </div>
          )}

          <div className="flex gap-3 items-end max-w-3xl mx-auto">
            <Textarea
              className="flex-1 min-h-[44px] max-h-32 resize-none rounded-2xl border-border px-4 py-3 text-sm focus:ring-primary focus:border-primary"
              placeholder="Ask Jeevansh Doctor about your diagnosis or guidelines..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              variant="medical"
              size="icon"
              className="h-11 w-11 rounded-2xl flex-shrink-0 glow-cyan"
            >
              {typing ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Disclaimer: AI responses are generated dynamically and are not a substitute for professional clinical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
