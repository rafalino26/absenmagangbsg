'use client';

import { FiX, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

// Tipe untuk mengontrol gaya dan tombol modal
type NotificationType = 'success' | 'error' | 'confirm';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: NotificationType;
  onConfirm?: () => void; // Opsional, hanya untuk tipe 'confirm'
}

const typeStyles = {
  success: {
    icon: <FiCheckCircle size={48} className="text-green-500" />,
    confirmButton: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    icon: <FiAlertTriangle size={48} className="text-red-500" />,
    confirmButton: 'bg-red-600 hover:bg-red-700',
  },
  confirm: {
    icon: <FiAlertTriangle size={48} className="text-yellow-500" />,
    confirmButton: 'bg-red-600 hover:bg-red-700',
  },
};

export default function NotificationModal({ isOpen, onClose, title, message, type, onConfirm }: NotificationModalProps) {
  if (!isOpen) return null;

  const styles = typeStyles[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col items-center text-center p-6">
        <div className="mb-4">{styles.icon}</div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-center gap-4 w-full">
          {type === 'confirm' && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${
              type === 'confirm' ? styles.confirmButton : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {type === 'confirm' ? 'Konfirmasi' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}