import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import styles from './ToastProvider.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string): void => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (message) => show('success', message),
    error: (message) => show('error', message),
    warning: (message) => show('warning', message),
    info: (message) => show('info', message)
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => removeToast(toast.id)} aria-label="Cerrar notificación">
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
};
