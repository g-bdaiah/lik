import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, RefreshCw, CheckCircle, AlertTriangle, Clock, X } from 'lucide-react';
import { Button, Modal } from './ui';
import { smsService } from '../services/smsService';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  beneficiaryName: string;
  beneficiaryId?: string;
  verificationType?: 'registration' | 'login' | 'password_reset' | 'phone_change' | 'data_update';
  onVerificationSuccess: (beneficiaryId?: string) => void;
  onVerificationFail?: (error: string) => void;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  phoneNumber,
  beneficiaryName,
  beneficiaryId,
  verificationType = 'registration',
  onVerificationSuccess,
  onVerificationFail,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && !smsSent) {
      sendOTP();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0 && smsSent) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, smsSent]);

  const resetState = () => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    setSuccess(false);
    setTimeLeft(300);
    setCanResend(false);
    setSmsSent(false);
  };

  const sendOTP = async () => {
    setSending(true);
    setError(null);
    try {
      const result = await smsService.sendOTP(
        phoneNumber,
        beneficiaryName,
        verificationType,
        beneficiaryId
      );

      if (result.success) {
        setSmsSent(true);
        setTimeLeft(300);
        setCanResend(false);
      } else {
        setError(result.error || 'فشل إرسال رمز التحقق');
        if (onVerificationFail) {
          onVerificationFail(result.error || 'فشل إرسال رمز التحقق');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      if (onVerificationFail) {
        onVerificationFail(errorMessage);
      }
    } finally {
      setSending(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError(null);
    await sendOTP();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6);
      const newOtp = pastedCode.split('');
      while (newOtp.length < 6) {
        newOtp.push('');
      }
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await smsService.verifyOTP(phoneNumber, code);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onVerificationSuccess(result.beneficiaryId);
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'رمز التحقق غير صحيح');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        if (onVerificationFail) {
          onVerificationFail(result.error || 'رمز التحقق غير صحيح');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في التحقق';
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      if (onVerificationFail) {
        onVerificationFail(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="التحقق من رقم الهاتف"
      size="md"
    >
      <div className="p-6 space-y-6">
        {sending ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري إرسال رمز التحقق...</p>
          </div>
        ) : success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تم التحقق بنجاح!</h3>
            <p className="text-gray-600">تم التحقق من رقم الهاتف بنجاح</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                أدخل رمز التحقق
              </h3>
              <p className="text-gray-600 mb-2">
                تم إرسال رمز التحقق إلى رقم الهاتف
              </p>
              <p className="text-lg font-bold text-gray-900 dir-ltr">
                {smsService.formatPhoneNumber(phoneNumber)}
              </p>
            </div>

            <div className="flex justify-center gap-2 dir-ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">خطأ في التحقق</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {canResend ? 'يمكنك إعادة الإرسال' : `الوقت المتبقي: ${formatTime(timeLeft)}`}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={!canResend || sending}
                  loading={sending}
                  icon={RefreshCw}
                  iconPosition="right"
                >
                  إعادة الإرسال
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                لم تستلم الرمز؟ تأكد من رقم الهاتف أو اتصل بالدعم
              </p>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={() => verifyOTP(otp.join(''))}
                className="flex-1"
                disabled={otp.some(d => !d) || loading}
                loading={loading}
              >
                تحقق
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
