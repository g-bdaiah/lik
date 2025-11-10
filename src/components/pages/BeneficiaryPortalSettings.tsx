import React, { useState, useEffect } from 'react';
import { Settings, Shield, MessageCircle, Key, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { beneficiaryAuthService } from '../../services/beneficiaryAuthService';
import { Button, Card } from '../ui';

interface SystemFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  settings: any;
  updated_by: string;
  updated_at: string;
}

export default function BeneficiaryPortalSettings() {
  const [features, setFeatures] = useState<SystemFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [supportPhone, setSupportPhone] = useState('+970599505699');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setIsLoading(true);
      const data = await beneficiaryAuthService.getAllSystemFeatures();
      setFeatures(data);

      const otpFeature = data.find(f => f.feature_key === 'otp_verification');
      if (otpFeature?.settings?.support_phone) {
        setSupportPhone(otpFeature.settings.support_phone);
      }
    } catch (error) {
      console.error('Error loading features:', error);
      setMessage({ type: 'error', text: 'فشل تحميل الإعدادات' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = async (featureKey: string, currentValue: boolean) => {
    try {
      await beneficiaryAuthService.updateSystemFeature(
        featureKey,
        !currentValue,
        { support_phone: supportPhone },
        'admin'
      );

      setFeatures(prev =>
        prev.map(f =>
          f.feature_key === featureKey ? { ...f, is_enabled: !currentValue } : f
        )
      );

      setMessage({ type: 'success', text: 'تم تحديث الإعدادات بنجاح' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating feature:', error);
      setMessage({ type: 'error', text: 'فشل تحديث الإعدادات' });
    }
  };

  const handleSavePhone = async () => {
    try {
      setIsSaving(true);

      for (const feature of features) {
        await beneficiaryAuthService.updateSystemFeature(
          feature.feature_key,
          feature.is_enabled,
          { support_phone: supportPhone },
          'admin'
        );
      }

      setMessage({ type: 'success', text: 'تم حفظ رقم الدعم بنجاح' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving phone:', error);
      setMessage({ type: 'error', text: 'فشل حفظ رقم الدعم' });
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'otp_verification':
        return <Shield className="w-5 h-5" />;
      case 'password_recovery':
        return <Key className="w-5 h-5" />;
      case 'whatsapp_notifications':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getFeatureDescription = (featureKey: string) => {
    switch (featureKey) {
      case 'otp_verification':
        return 'عند التفعيل، سيتم إرسال رمز تحقق OTP عبر واتساب للمستفيدين عند التسجيل الأول';
      case 'password_recovery':
        return 'يسمح للمستفيدين باسترداد كلمة المرور عبر رقم واتساب الدعم';
      case 'whatsapp_notifications':
        return 'إرسال إشعارات تلقائية عبر واتساب عند تحديث حالة الطرد';
      case 'beneficiary_portal':
        return 'تفعيل أو تعطيل بوابة المستفيدين بالكامل';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          إعدادات بوابة المستفيدين
        </h1>
        <p className="text-gray-600">
          إدارة الميزات والإعدادات الخاصة ببوابة المستفيدين
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          رقم واتساب الدعم الفني
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          هذا الرقم سيُستخدم للتواصل مع المستفيدين وإرسال رموز التحقق والإشعارات
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="+970599505699"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="ltr"
          />
          <Button onClick={handleSavePhone} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {features.map((feature) => (
          <Card key={feature.id} className="hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    feature.is_enabled
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  {getFeatureIcon(feature.feature_key)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.feature_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {getFeatureDescription(feature.feature_key)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>آخر تحديث:</span>
                    <span>{new Date(feature.updated_at).toLocaleDateString('ar-EG')}</span>
                    <span>بواسطة: {feature.updated_by}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggleFeature(feature.feature_key, feature.is_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    feature.is_enabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feature.is_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">ملاحظة مهمة:</p>
            <p>
              تتطلب بعض الميزات (مثل إرسال OTP والإشعارات) دمج خدمة واتساب API الخارجية.
              حالياً، يعمل النظام في وضع العرض التوضيحي ولن يتم إرسال رسائل فعلية.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
