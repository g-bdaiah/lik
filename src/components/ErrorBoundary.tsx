import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Copy, CheckCircle } from 'lucide-react'; // No change needed for icons
import { errorLogger } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, copied: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // تسجيل الخطأ
    errorLogger.logError(error, this.props.componentName || 'ErrorBoundary', {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, copied: false });
  };

  copyErrorDetails = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      })
      .catch(err => console.error('فشل في نسخ تفاصيل الخطأ:', err));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ غير متوقع</h1>
              <p className="text-gray-600">نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.</p>
            </div>

            {/* تفاصيل الخطأ */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Bug className="w-4 h-4 ml-2" />
                  تفاصيل الخطأ
                </h3>
                <button
                  onClick={this.copyErrorDetails}
                  className="flex items-center space-x-2 space-x-reverse text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {this.state.copied ? (
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
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">الرسالة:</span>
                  <p className="text-red-600 mt-1">{this.state.error?.message}</p>
                </div>
                
                {this.props.componentName && (
                  <div>
                    <span className="font-medium text-gray-700">المكون:</span>
                    <p className="text-gray-600 mt-1">{new Date().toLocaleString('en-US')}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-700">الوقت:</span>
                  <p className="text-gray-600 mt-1">{new Date().toLocaleString('ar-SA')}</p>
                </div>
              </div>

              {/* Stack trace للمطورين */}
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    Stack Trace (للمطورين)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                المحاولة مرة أخرى
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
            </div>

            {/* معلومات إضافية */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>إذا استمر الخطأ، يرجى التواصل مع فريق الدعم الفني</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// مكون مبسط لعرض الأخطاء
export const SimpleErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 m-4" dir="rtl">
    <div className="flex items-center space-x-3 space-x-reverse">
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-medium text-red-800">حدث خطأ في هذا القسم</h3>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
        )}
      </div>
      {resetError && (
        <button
          onClick={resetError}
          className="text-red-600 hover:text-red-700 p-1 rounded"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);