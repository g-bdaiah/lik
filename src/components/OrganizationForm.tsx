import React, { useState, useEffect } from 'react';
import { Building2, Save, X, AlertTriangle, CheckCircle, MapPin, Phone, Mail, User, Activity } from 'lucide-react';
import { type Organization } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import { Button, Card, Input } from './ui';

interface OrganizationFormProps {
  organization?: Organization | null;
  onSave: (data: Partial<Organization>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  type: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
}

export default function OrganizationForm({ organization, onSave, onCancel }: OrganizationFormProps) {
  const { logError, logInfo } = useErrorLogger();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    location: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const isEditing = !!organization;

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        type: organization.type || '',
        location: organization.location || '',
        contactPerson: organization.contactPerson || '',
        phone: organization.phone || '',
        email: organization.email || '',
        status: organization.status || 'pending',
      });
    }
  }, [organization]);

  const organizationTypes = [
    'منظمة دولية', 'منظمة محلية', 'جمعية خيرية', 'مبادرة فردية', 'أخرى'
  ];

  const organizationStatuses = [
    { value: 'active', label: 'نشطة' },
    { value: 'pending', label: 'معلقة' },
    { value: 'suspended', label: 'موقوفة' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المؤسسة مطلوب';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'نوع المؤسسة مطلوب';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'الموقع مطلوب';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'اسم شخص الاتصال مطلوب';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logError(new Error('فشل في التحقق من صحة البيانات'), 'OrganizationForm');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const dataToSave: Partial<Organization> = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        location: formData.location.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        status: formData.status,
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      onSave(dataToSave);
      logInfo('تم محاكاة حفظ بيانات المؤسسة: ' + formData.name, 'OrganizationForm');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setOperationError(errorMessage);
      logError(new Error(errorMessage), 'OrganizationForm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-xl w-fit mx-auto mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل بيانات المؤسسة' : 'إضافة مؤسسة جديدة'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'تحديث معلومات المؤسسة في النظام' : 'إضافة مؤسسة جديدة إلى قاعدة البيانات'}
          </p>
        </div>

        {/* Error Display */}
        {operationError && (
          <Card className="bg-red-50 border-red-200" padding="sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">خطأ في حفظ البيانات:</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{operationError}</p>
          </Card>
        )}

        {/* General Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Building2 className="w-4 h-4 ml-2 text-blue-600" />
            المعلومات العامة
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="اسم المؤسسة *"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="مثال: جمعية الهلال الأحمر"
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المؤسسة *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">اختر النوع</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.type}
                </p>
              )}
            </div>

            <Input
              label="الموقع (المدينة/المنطقة) *"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="مثال: خان يونس - الكتيبة"
              error={errors.location}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة المؤسسة *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {organizationStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-4 h-4 ml-2 text-green-600" />
            معلومات الاتصال
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="اسم شخص الاتصال *"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="مثال: أحمد أبو سالم"
              error={errors.contactPerson}
              required
            />

            <Input
              label="رقم الهاتف *"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="مثال: 0591234567"
              error={errors.phone}
              required
            />

            <Input
              label="البريد الإلكتروني *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="مثال: info@example.com"
              error={errors.email}
              required
            />
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="bg-gray-50">
          <div className="flex space-x-4 space-x-reverse justify-end">
            <Button
              variant="secondary"
              icon={X}
              iconPosition="right"
              onClick={onCancel}
              disabled={loading}
            >
              إلغاء
            </Button>

            <Button
              variant="primary"
              icon={loading ? undefined : Save}
              iconPosition="right"
              type="submit"
              disabled={loading}
              loading={loading}
            >
              {isEditing ? 'حفظ التغييرات' : 'إضافة المؤسسة'}
            </Button>
          </div>
        </Card>

        {/* Form Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Activity className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-3">تعليمات مهمة</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تأكد من إدخال جميع الحقول المطلوبة.</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>البريد الإلكتروني يجب أن يكون بصيغة صحيحة.</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>الحالة الافتراضية للمؤسسة الجديدة هي "معلقة".</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
