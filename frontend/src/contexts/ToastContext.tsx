import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (props: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = Info;
            let themeClass = 'bg-background border-border text-foreground';

            if (t.variant === 'success') {
              Icon = CheckCircle2;
              themeClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 backdrop-blur-xl';
            } else if (t.variant === 'destructive') {
              Icon = AlertCircle;
              themeClass = 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 backdrop-blur-xl';
            } else if (t.variant === 'warning') {
              Icon = AlertCircle;
              themeClass = 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 backdrop-blur-xl';
            } else if (t.variant === 'info') {
              Icon = Info;
              themeClass = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 backdrop-blur-xl';
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg relative overflow-hidden',
                  themeClass
                )}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 pr-4 min-w-0">
                  <p className="font-bold text-sm leading-none mb-1">{t.title}</p>
                  {t.description && (
                    <p className="text-xs opacity-90 leading-normal">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
