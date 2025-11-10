import React, { useState, useEffect } from 'react';
import { Bug, X, Trash2, Download, Filter, AlertTriangle, AlertCircle, Info, Copy, CheckCircle } from 'lucide-react'; // No change needed for icons
import { errorLogger, ErrorLog, useErrorLogger } from '../utils/errorLogger';

interface ErrorConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorConsole: React.FC<ErrorConsoleProps> = ({ isOpen, onClose }) => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { clearErrors } = useErrorLogger();

  useEffect(() => {
    if (isOpen) {
      const updateErrors = () => {
        const allErrors = errorLogger.getErrors();
        const filteredErrors = filter === 'all' ? allErrors : allErrors.filter(e => e.level === filter);
        setErrors(filteredErrors);
      };

      updateErrors();
      const interval = setInterval(updateErrors, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, filter]);

  const handleClearErrors = () => {
    clearErrors();
    setErrors([]);
    setSelectedError(null);
  };

  const handleExportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `errors_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyErrorDetails = (error: ErrorLog) => {
    const details = {
      timestamp: error.timestamp,
      level: error.level,
      message: error.message,
      component: error.component,
      stack: error.stack,
      url: error.url
    };

    navigator.clipboard.writeText(JSON.stringify(details, null, 2))
      .then(() => {
        setCopied(error.id);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(err => console.error('فشل في نسخ تفاصيل الخطأ:', err));
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Bug className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-red-100 p-2 rounded-lg">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">وحدة تحكم الأخطاء</h2>
              <p className="text-sm text-gray-600">عرض وإدارة أخطاء التطبيق</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأخطاء ({errorLogger.getErrors().length})</option>
                <option value="error">أخطاء ({errorLogger.getErrorsByLevel('error').length})</option>
                <option value="warning">تحذيرات ({errorLogger.getErrorsByLevel('warning').length})</option>
                <option value="info">معلومات ({errorLogger.getErrorsByLevel('info').length})</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleExportErrors}
              className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 ml-1" />
              <span>تصدير</span>
            </button>
            <button
              onClick={handleClearErrors}
              className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 ml-1" />
              <span>مسح الكل</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Errors List */}
          <div className="w-1/2 border-l border-gray-200 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bug className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد أخطاء</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {errors.map((error) => (
                  <div
                    key={error.id}
                    onClick={() => setSelectedError(error)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedError?.id === error.id ? 'ring-2 ring-blue-500' : ''
                    } ${getLevelColor(error.level)}`}
                  >
                    <div className="flex items-start space-x-3 space-x-reverse">
                      {getLevelIcon(error.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {error.component || 'غير محدد'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleTimeString('en-US')}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{error.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Details */}
          <div className="w-1/2 overflow-y-auto">
            {selectedError ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">تفاصيل الخطأ</h3>
                  <button
                    onClick={() => copyErrorDetails(selectedError)}
                    className="flex items-center space-x-2 space-x-reverse text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied === selectedError.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 ml-1" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 ml-1" />
                        <span>نسخ التفاصيل</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getLevelColor(selectedError.level)}`}>
                      {getLevelIcon(selectedError.level)}
                      <span className="mr-2">{selectedError.level}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedError.message}</p>
                  </div>

                  {selectedError.component && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المكون</label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedError.component}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedError.timestamp).toLocaleString('en-US')}
                    </p>
                  </div>

                  {selectedError.url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg break-all">{selectedError.url}</p>
                    </div>
                  )}

                  {selectedError.stack && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stack Trace</label>
                      <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto">
                        {selectedError.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>اختر خطأ لعرض التفاصيل</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};