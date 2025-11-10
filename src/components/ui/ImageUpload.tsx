import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  label: string;
  value?: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  maxSizeMB?: number;
  accept?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ImageUpload({
  label,
  value,
  onChange,
  maxSizeMB = 4,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  error,
  required = false,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = async (file: File): Promise<string | null> => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `حجم الصورة يجب أن لا يتجاوز ${maxSizeMB} ميغابايت`;
    }

    const validTypes = accept.split(',').map(t => t.trim());
    if (!validTypes.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, أو WEBP';
    }

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 300) {
          resolve('أبعاد الصورة يجب أن تكون 300×300 بكسل على الأقل');
        } else if (img.width > 4000 || img.height > 4000) {
          resolve('أبعاد الصورة يجب أن لا تتجاوز 4000×4000 بكسل');
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve('فشل في قراءة الصورة');
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setPreview(null);
      setValidationError(null);
      onChange(null, null);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const error = await validateImage(file);
    setIsValidating(false);

    if (error) {
      setValidationError(error);
      setPreview(null);
      onChange(null, null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setValidationError(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error || validationError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="relative p-4">
            <img
              src={preview}
              alt="معاينة"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              تم التحميل
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            {isValidating ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-sm text-gray-600">جارٍ التحقق من الصورة...</p>
              </div>
            ) : (
              <>
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  اضغط لاختيار صورة أو اسحب وأفلت
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP (حد أقصى {maxSizeMB} ميغابايت)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {(error || validationError) && (
        <div className="flex items-start gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error || validationError}</span>
        </div>
      )}

      {!error && !validationError && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          الحد الأقصى للحجم: {maxSizeMB} ميغابايت | الأبعاد: 300×300 إلى 4000×4000 بكسل
        </p>
      )}
    </div>
  );
}
