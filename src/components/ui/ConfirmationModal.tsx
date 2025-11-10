import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from './';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: 'warning' | 'danger' | 'success' | 'info';
  confirmButtonVariant?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'تأكيد',
  cancelButtonText = 'إلغاء',
  type = 'warning',
  confirmButtonVariant = 'primary'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-orange-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      dir="rtl"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`${getBackgroundColor()} p-6 rounded-xl mb-6`}>
            <div className="text-center">
              {getIcon()}
              <p className="text-gray-700 mt-4 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 space-x-reverse">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {cancelButtonText}
            </Button>
            <Button
              variant={confirmButtonVariant}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1"
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}