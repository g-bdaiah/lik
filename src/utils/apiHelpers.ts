export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: any) => {
    if (error?.code === 'PGRST301') return false;
    if (error?.message?.includes('JWT')) return false;
    return true;
  }
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, retryDelay, retryCondition } = { ...DEFAULT_CONFIG, ...config };

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }

      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export function handleApiError(error: any): ApiError {
  if (error?.message) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  return {
    message: 'حدث خطأ غير متوقع',
    code: 'UNKNOWN_ERROR'
  };
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ETIMEDOUT'
  );
}

export function isAuthError(error: any): boolean {
  return (
    error?.code === '401' ||
    error?.message?.includes('JWT') ||
    error?.message?.includes('auth') ||
    error?.message?.includes('unauthorized')
  );
}

export function getUserFriendlyErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.';
  }

  if (isAuthError(error)) {
    return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}
