import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
  label?: string;
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  iconPosition = 'right',
  error,
  disabled = false,
  required = false,
  className = '',
  rows = 3,
  label
}: InputProps) {
  const baseClasses = 'w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  const sizeClasses = type === 'textarea' ? 'px-4 py-3' : 'px-4 py-3';
  
  const stateClasses = error 
    ? 'border-red-300 bg-red-50 focus:ring-red-500' 
    : 'border-gray-300 focus:ring-blue-500';
    
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : '';
  
  const iconPadding = Icon ? (iconPosition === 'right' ? 'pr-12' : 'pl-12') : '';

  const inputClasses = `${baseClasses} ${sizeClasses} ${stateClasses} ${disabledClasses} ${iconPadding} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={inputClasses}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
          />
        )}
        
        {Icon && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${
            iconPosition === 'right' ? 'right-4' : 'left-4'
          }`}>
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-1 flex items-center">
          <span className="w-4 h-4 mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}