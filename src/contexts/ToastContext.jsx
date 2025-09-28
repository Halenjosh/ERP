import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToaster = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToaster must be used within ToasterProvider');
  return ctx;
};

let idSeq = 0;

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, text, opts = {}) => {
    const id = ++idSeq;
    const duration = opts.duration ?? 2500;
    setToasts((prev) => [...prev, { id, type, text }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const api = useMemo(() => ({
    success: (text, opts) => push('success', text, opts),
    error: (text, opts) => push('error', text, opts),
    info: (text, opts) => push('info', text, opts),
    remove,
  }), [push, remove]);

  // Basic styles; can be themed later
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm transform transition-all duration-300 ease-out translate-y-0 opacity-100 ${
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
            }`}
          >
            <div className="mt-0.5">
              {t.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              )}
              {t.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 012 0 1 1 0 01-2 0zm.293-7.707a1 1 0 011.414 0l.293.293a1 1 0 010 1.414L11 9.414V11a1 1 0 11-2 0V9.414L8.293 7.293a1 1 0 010-1.414l.293-.293z" clipRule="evenodd" /></svg>
              )}
              {t.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-3a1 1 0 100-2 1 1 0 000 2zm1 2H9v6h2v-6z"/></svg>
              )}
            </div>
            <div className="flex-1">
              {t.text}
            </div>
            <button
              aria-label="Close notification"
              className="opacity-80 hover:opacity-100 focus:outline-none"
              onClick={() => remove(t.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
