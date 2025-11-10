import React, { useState } from 'react';
import { Save, X, MapPin, Phone, Home, Briefcase, Users, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, Modal } from '../ui';
import { dataUpdateService } from '../../services/dataUpdateService';
import { beneficiaryAuthService } from '../../services/beneficiaryAuthService';
import type { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface UpdateDataFormProps {
  beneficiary: Beneficiary;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UpdateDataForm({ beneficiary, onSuccess, onCancel }: UpdateDataFormProps) {
  const [formData, setFormData] = useState({
    phone: beneficiary.phone || '',
    whatsapp_number: beneficiary.whatsapp_number || '',
    address: beneficiary.address || '',
    profession: beneficiary.profession || '',
    members_count: beneficiary.members_count || 0,
    marital_status: beneficiary.marital_status || 'single',
    economic_level: beneficiary.economic_level || 'moderate'
  });

  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasChanges = () => {
    return (
      formData.phone !== beneficiary.phone ||
      formData.whatsapp_number !== beneficiary.whatsapp_number ||
      formData.address !== beneficiary.address ||
      formData.profession !== beneficiary.profession ||
      formData.members_count !== beneficiary.members_count ||
      formData.marital_status !== beneficiary.marital_status ||
      formData.economic_level !== beneficiary.economic_level
    );
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!hasChanges()) {
      setError('لم يتم إجراء أي تغييرات');
      return;
    }

    setShowPasswordConfirm(true);
  };

  const handleConfirmWithPassword = async () => {
    if (!beneficiaryAuthService.validatePIN(password)) {
      setError('كلمة المرور يجب أن تتكون من 6 أرقام');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const passwordHash = beneficiaryAuthService.hashPassword(password);
      const result = await beneficiaryAuthService.verifyPassword(
        beneficiary.national_id,
        passwordHash
      );

      if (!result.success) {
        setError(result.message || 'كلمة المرور غير صحيحة');
        setIsSubmitting(false);
        return;
      }

      const changes: Record<string, any> = {};

      if (formData.phone !== beneficiary.phone) changes.phone = formData.phone;
      if (formData.whatsapp_number !== beneficiary.whatsapp_number) changes.whatsapp_number = formData.whatsapp_number;
      if (formData.address !== beneficiary.address) changes.address = formData.address;
      if (formData.profession !== beneficiary.profession) changes.profession = formData.profession;
      if (formData.members_count !== beneficiary.members_count) changes.members_count = formData.members_count;
      if (formData.marital_status !== beneficiary.marital_status) changes.marital_status = formData.marital_status;
      if (formData.economic_level !== beneficiary.economic_level) changes.economic_level = formData.economic_level;

      await dataUpdateService.submitDataUpdateRequest({
        beneficiaryId: beneficiary.id,
        updateType: 'data_update',
        changes
      });

      setSuccess(true);
      setShowPasswordConfirm(false);

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            تم إرسال طلب التحديث بنجاح
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            سيتم مراجعة طلبك من قبل الإدارة وسنقوم بإشعارك بالنتيجة قريباً
          </p>
          <Button onClick={onSuccess} className="px-8">
            العودة
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            تحديث البيانات الشخصية
          </h2>
          <p className="text-gray-600">
            قم بتحديث بياناتك وسيتم مراجعتها من قبل الإدارة
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                رقم الواتساب
              </label>
              <Input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="05xxxxxxxx"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              العنوان
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="المدينة، الحي، الشارع"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                المهنة
              </label>
              <Input
                type="text"
                value={formData.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
                placeholder="مثل: موظف، عامل، طالب"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                عدد أفراد الأسرة
              </label>
              <Input
                type="number"
                value={formData.members_count}
                onChange={(e) => handleChange('members_count', parseInt(e.target.value) || 0)}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة الاجتماعية
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => handleChange('marital_status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="single">أعزب/عزباء</option>
                <option value="married">متزوج/ة</option>
                <option value="divorced">مطلق/ة</option>
                <option value="widowed">أرمل/ة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى الاقتصادي
              </label>
              <select
                value={formData.economic_level}
                onChange={(e) => handleChange('economic_level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="very_poor">فقير جداً</option>
                <option value="poor">فقير</option>
                <option value="moderate">متوسط</option>
                <option value="good">جيد</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges() || isSubmitting}
              className="flex-1"
            >
              <Save className="w-5 h-5 ml-2" />
              حفظ التغييرات
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 ml-2" />
              إلغاء
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showPasswordConfirm}
        onClose={() => !isSubmitting && setShowPasswordConfirm(false)}
        title="تأكيد التحديث"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            يرجى إدخال كلمة المرور الخاصة بك لتأكيد التحديث
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور (6 أرقام)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="••••••"
                maxLength={6}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleConfirmWithPassword}
              disabled={password.length !== 6 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'جارٍ الإرسال...' : 'تأكيد'}
            </Button>
            <Button
              onClick={() => setShowPasswordConfirm(false)}
              variant="outline"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
