import { useCallback } from 'react';

// نظام تسجيل الأخطاء
export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  component?: string;
  file?: string;
  line?: number;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  logError(error: Error, component?: string, additionalInfo?: any) {
    const errorLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      component,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalInfo
    };

    this.errors.unshift(errorLog);
    
    // الاحتفاظ بآخر 100 خطأ فقط
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // طباعة الخطأ في الكونسول للتطوير
    console.error('🔴 خطأ في التطبيق:', {
      component,
      message: error.message,
      stack: error.stack,
      timestamp: errorLog.timestamp
    });

    // حفظ في localStorage للاستمرارية
    this.saveToStorage();
  }

  logWarning(message: string, component?: string, additionalInfo?: any) {
    const warningLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'warning',
      message,
      component,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalInfo
    };

    this.errors.unshift(warningLog);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.warn('🟡 تحذير في التطبيق:', {
      component,
      message,
      timestamp: warningLog.timestamp
    });

    this.saveToStorage();
  }

  logInfo(message: string, component?: string, additionalInfo?: any) {
    const infoLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      component,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...additionalInfo
    };

    this.errors.unshift(infoLog);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.info('🔵 معلومات التطبيق:', {
      component,
      message,
      timestamp: infoLog.timestamp
    });

    this.saveToStorage();
  }

  getErrors(): ErrorLog[] {
    return this.errors;
  }

  getErrorsByLevel(level: 'error' | 'warning' | 'info'): ErrorLog[] {
    return this.errors.filter(error => error.level === level);
  }

  getErrorsByComponent(component: string): ErrorLog[] {
    return this.errors.filter(error => error.component === component);
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('app_errors');
    console.log('🧹 تم مسح جميع الأخطاء');
  }

  private saveToStorage() {
    try {
      localStorage.setItem('app_errors', JSON.stringify(this.errors));
    } catch (error) {
      console.error('فشل في حفظ الأخطاء في localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('app_errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      console.error('فشل في تحميل الأخطاء من localStorage:', error);
    }
  }

  constructor() {
    this.loadFromStorage();
    
    // التقاط الأخطاء العامة
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), 'Global', {
        file: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    // التقاط أخطاء Promise غير المعالجة
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), 'Promise', {
        reason: event.reason
      });
    });
  }
}

export const errorLogger = new ErrorLogger();

// Hook لاستخدام نظام الأخطاء في React
export const useErrorLogger = () => {
  // استخدام useCallback لضمان استقرار مراجع الدوال
  const logError = useCallback((error: Error, component?: string, additionalInfo?: any) => {
    errorLogger.logError(error, component, additionalInfo);
  }, []);

  const logWarning = useCallback((message: string, component?: string, additionalInfo?: any) => {
    errorLogger.logWarning(message, component, additionalInfo);
  }, []);

  const logInfo = useCallback((message: string, component?: string, additionalInfo?: any) => {
    errorLogger.logInfo(message, component, additionalInfo);
  }, []);

  const getErrors = useCallback(() => {
    return errorLogger.getErrors();
  }, []);

  const clearErrors = useCallback(() => {
    errorLogger.clearErrors();
  }, []);

  return {
    logError,
    logWarning,
    logInfo,
    getErrors,
    clearErrors
  };
};