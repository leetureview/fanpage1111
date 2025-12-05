
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const bgColors = {
    SUCCESS: 'bg-white border-l-4 border-green-500',
    ERROR: 'bg-white border-l-4 border-red-500',
    INFO: 'bg-white border-l-4 border-blue-500',
  };

  const icons = {
    SUCCESS: <CheckCircle className="text-green-500" size={20} />,
    ERROR: <AlertCircle className="text-red-500" size={20} />,
    INFO: <AlertCircle className="text-blue-500" size={20} />,
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg border border-gray-100 min-w-[300px] animate-in slide-in-from-right fade-in duration-300 ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
