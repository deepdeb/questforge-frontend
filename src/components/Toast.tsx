import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
    achievement: 'bg-amber-500/20 border-amber-500 text-amber-400',
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    achievement: '🏆',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-2xl border backdrop-blur-sm ${colors[type]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </motion.div>
  );
};

export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};