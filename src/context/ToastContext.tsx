import { createContext, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'achievement') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' | 'achievement' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'achievement') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};