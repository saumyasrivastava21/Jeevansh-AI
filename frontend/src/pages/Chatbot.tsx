import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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

const MOCK_RESPONSES: Record<string, string> = {
  default: "Based on your query, here's what our AI medical knowledge base suggests:\n\nThis is detailed medical guidance based on the latest clinical guidelines. Please remember that while I provide evidence-based information, you should always consult a qualified healthcare professional for personal medical advice.\n\nWould you like me to elaborate on any specific aspect of this topic?",
  pneumonia: "Pneumonia is a lung infection that inflames air sacs. Common symptoms include:\n\n• Cough with phlegm\n• Fever, chills, sweating\n• Shortness of breath\n• Chest pain when breathing\n• Fatigue and weakness\n\nTreatment typically involves antibiotics (bacterial type), rest, and fluids. Severe cases may require hospitalization. Recovery usually takes 1–3 weeks with proper treatment.",
  serious: "Based on your scan results showing 91.4% confidence for pneumonia with High severity:\n\n⚠️ **Action Required:**\n1. Start antibiotic treatment immediately as prescribed\n2. Monitor oxygen saturation (should be >95%)\n3. Follow up chest X-ray in 4-6 weeks\n4. Seek emergency care if breathing worsens\n\nWith prompt treatment, most pneumonia patients recover fully. Your assigned doctor Dr. Rajesh Verma has been notified.",
};

function getResponse(input: string): string {
  const low = input.toLowerCase();
  if (low.includes('pneumonia') || low.includes('lung')) return MOCK_RESPONSES.pneumonia;
  if (low.includes('serious') || low.includes('dangerous') || low.includes('worried')) return MOCK_RESPONSES.serious;
  return MOCK_RESPONSES.default;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setTyping(false);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: getResponse(text), timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-medical-blue flex items-center justify-center">
            <Bot className="w-5 h-5 text-medical-cyan" />
          </div>
          <div>
            <p className="font-semibold text-sm">Jeevansh AI Doctor</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online · RAG-powered</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setMessages(INITIAL_MESSAGES)} className="gap-1.5 text-xs">
          <RefreshCw className="w-3 h-3" /> New chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              {/* Avatar */}
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1', msg.role === 'assistant' ? 'bg-medical-blue' : 'bg-medical-green')}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-medical-cyan" /> : <User className="w-4 h-4 text-white" />}
              </div>
              {/* Bubble */}
              <div className={cn('max-w-[75%]', msg.role === 'user' && 'items-end flex flex-col')}>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'assistant'
                    ? 'bg-card border border-border text-foreground rounded-tl-sm'
                    : 'bg-medical-blue text-white rounded-tr-sm'
                )}>
                  {msg.content}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-medical-blue flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-medical-cyan" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 items-end max-w-3xl mx-auto">
          <Textarea
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border-border"
            placeholder="Ask about your diagnosis, symptoms, or treatment..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            variant="medical" size="icon" className="h-11 w-11 rounded-xl flex-shrink-0"
          >
            {typing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">AI responses are for informational purposes only. Always consult a doctor.</p>
      </div>
    </div>
  );
}
