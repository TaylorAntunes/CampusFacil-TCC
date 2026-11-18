import React from 'react';
import { useToast } from '../contexts/ToastContext';

export function ToastNotification() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {toasts.map((toast) => {
        const bgColor = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-blue-500',
          warning: 'bg-yellow-500',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex justify-between items-center animate-in fade-in slide-in-from-bottom-4`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 font-bold hover:opacity-80"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
