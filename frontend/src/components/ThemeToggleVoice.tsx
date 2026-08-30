import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';

export default function ThemeToggleVoice() {
  const { isDark, toggleTheme, theme } = useTheme();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        toast({
          title: 'Voice Control Active',
          description: 'Listening for "dark mode", "light mode", or "change theme"...',
          variant: 'info',
        });
      };

      rec.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        console.log('[Voice Theme Command]:', command);

        if (
          command.includes('dark mode') ||
          command.includes('switch to dark mode') ||
          command.includes('enable dark mode')
        ) {
          if (!isDark) {
            toggleTheme();
            toast({
              title: 'Theme Changed',
              description: 'Switched to Dark Mode via voice command.',
              variant: 'success',
            });
          } else {
            toast({
              title: 'Dark Mode Already Active',
              variant: 'default',
            });
          }
        } else if (
          command.includes('light mode') ||
          command.includes('switch to light mode') ||
          command.includes('enable light mode')
        ) {
          if (isDark) {
            toggleTheme();
            toast({
              title: 'Theme Changed',
              description: 'Switched to Light Mode via voice command.',
              variant: 'success',
            });
          } else {
            toast({
              title: 'Light Mode Already Active',
              variant: 'default',
            });
          }
        } else if (command.includes('toggle theme') || command.includes('change theme')) {
          toggleTheme();
          toast({
            title: 'Theme Toggled',
            description: 'Switched color theme via voice command.',
            variant: 'success',
          });
        } else {
          toast({
            title: 'Command Unrecognized',
            description: `Heard "${command}". Try "dark mode" or "light mode".`,
            variant: 'warning',
          });
        }
      };

      rec.onerror = (e: any) => {
        console.error('[Speech Recognition Error]:', e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast({
            title: 'Microphone Denied',
            description: 'Please enable microphone access in settings to use voice controls.',
            variant: 'destructive',
          });
        } else if (e.error !== 'no-speech') {
          toast({
            title: 'Voice Control Error',
            description: 'An error occurred during speech recognition.',
            variant: 'destructive',
          });
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isDark, toggleTheme, toast]);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Control Unsupported',
        description: "Voice theme control isn't supported in this browser.",
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Normal Theme Toggle Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle dark and light mode"
          className="rounded-xl h-10 w-10 text-foreground"
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px] text-amber-500" />
          ) : (
            <Moon className="w-[18px] h-[18px] text-primary" />
          )}
        </Button>
      </motion.div>

      {/* Voice Assistant Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant={isListening ? "medical" : "ghost"}
          size="icon"
          onClick={handleVoiceToggle}
          aria-label="Voice theme control"
          className={cn(
            "rounded-xl h-10 w-10 relative",
            isListening && "glow-cyan text-white animate-pulse"
          )}
        >
          {isListening ? (
            <Mic className="w-[18px] h-[18px]" />
          ) : (
            <MicOff className="w-[18px] h-[18px] text-muted-foreground hover:text-foreground" />
          )}
          {isListening && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// Utility class merger helper injection
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
