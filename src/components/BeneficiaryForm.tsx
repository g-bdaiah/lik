import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Shield, Save, X, AlertTriangle, CheckCircle, Users, Briefcase, Heart, DollarSign, FileText, Home } from 'lucide-react';
import { type Beneficiary } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import { Button, Card, Input, Badge } from './ui';

interface BeneficiaryFormProps {
  beneficiary?: Beneficiary | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  detailedAddress: {
    governorate: string;
    city: string;
    district: string;
    street: string;
    additionalInfo: string;
  };
  profession: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  economicLevel: 'very_poor' | 'poor' | 'moderate' | 'good';
  membersCount: number;
  notes: string;
}

export default function BeneficiaryForm({ beneficiary, onSave, onCancel }: BeneficiaryFormProps) {
  const { logError, logInfo } = useErrorLogger();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    fullName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    address: '',
    detailedAddress: {
      governorate: '',
      city: '',
      district: '',
      street: '',
      additionalInfo: ''
    },
    profession: '',
    maritalStatus: 'single',
    economicLevel: 'poor',
    membersCount: 1,
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const isEditing = !!beneficiary;

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        name: beneficiary.name || '',
        fullName: beneficiary.fullName || '',
        nationalId: beneficiary.nationalId || '',
        dateOfBirth: beneficiary.dateOfBirth || '',
        gender: beneficiary.gender || 'male',
        phone: beneficiary.phone || '',
        address: beneficiary.address || '',
        detailedAddress: {
          governorate: beneficiary.detailedAddress?.governorate || '',
          city: beneficiary.detailedAddress?.city || '',
          district: beneficiary.detailedAddress?.district || '',
          street: beneficiary.detailedAddress?.street || '',
          additionalInfo: beneficiary.detailedAddress?.additionalInfo || ''
        },
        profession: beneficiary.profession || '',
        maritalStatus: beneficiary.maritalStatus || 'single',
        economicLevel: beneficiary.economicLevel || 'poor',
        membersCount: beneficiary.membersCount || 1,
        notes: beneficiary.notes || ''
      });
    }
  }, [beneficiary]);

  const governorates = ['غزة', 'خان يونس', 'الوسطى', 'شمال غزة', 'رفح'];
  const maritalStatusOptions = [
    { value: 'single', label: 'أعزب' },
    { value: 'married', label: 'متزوج' },
    { value: 'divorced', label: 'مطلق' },
    { value: 'widowed', label: 'أرمل' }
  ];
  const economicLevelOptions = [
    { value: 'very_poor', label: 'فقير جداً' },
    { value: 'poor', label: 'فقير' },
    { value: 'moderate', label: 'متوسط' },
    { value: 'good', label: 'ميسور' }
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

  const handleDetailedAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      detailedAddress: {
        ...prev.detailedAddress,
        [field]: value
      }
    }));
    
    const newDetailedAddress = {
      ...formData.detailedAddress,
      [field]: value
    };
    
    const shortAddress = [
      newDetailedAddress.governorate,
      newDetailedAddress.city,
      newDetailedAddress.district
    ].filter(Boolean).join(' - ');
    
    setFormData(prev => ({
      ...prev,
      address: shortAddress
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'رقم الهوية مطلوب';
    } else if (!/^\d{9}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'رقم الهوية يجب أن يكون 9 أرقام';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }
    if (!formData.detailedAddress.governorate) {
      newErrors.governorate = 'المحافظة مطلوبة';
    }
    if (!formData.detailedAddress.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }
    if (!formData.detailedAddress.district.trim()) {
      newErrors.district = 'الحي مطلوب';
    }
    if (!formData.profession.trim()) {
      newErrors.profession = 'المهنة مطلوبة';
    }
    if (formData.membersCount < 1) {
      newErrors.membersCount = 'عدد أفراد الأسرة يجب أن يكون 1 على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      logError(new Error('فشل في التحقق من صحة البيانات'), 'BeneficiaryForm');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      const dataToSave = {
        name: formData.name.trim(),
        full_name: formData.fullName.trim(),
        national_id: formData.nationalId.trim(),
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        detailed_address: formData.detailedAddress,
        location: { lat: 31.3469, lng: 34.3029 },
        profession: formData.profession.trim(),
        marital_status: formData.maritalStatus,
        economic_level: formData.economicLevel,
        members_count: formData.membersCount,
        notes: formData.notes.trim(),
        identity_status: 'pending',
        status: 'active',
        eligibility_status: 'under_review',
        last_received: new Date().toISOString().split('T')[0],
        total_packages: 0,
        created_by: 'admin',
        updated_by: 'admin'
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditing && beneficiary) {
        logInfo(`محاكاة تحديث بيانات المستفيد: ${formData.name}`, 'BeneficiaryForm');
      } else {
        logInfo(`محاكاة إضافة مستفيد جديد: ${formData.name}`, 'BeneficiaryForm');
      }

      onSave();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setOperationError(errorMessage);
      logError(new Error(errorMessage), 'BeneficiaryForm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting;
  const error = operationError;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-xl w-fit mx-auto mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل بيانات المستفيد' : 'إضافة مستفيد جديد'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'تحديث معلومات المستفيد في النظام' : 'إضافة مستفيد جديد إلى قاعدة البيانات'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200" padding="sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">خطأ في حفظ البيانات:</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{error}</p>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-4 h-4 ml-2 text-blue-600" />
            المعلومات الشخصية
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="الاسم الأول *"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="مثال: محمد"
              error={errors.name}
              required
            />

            <Input
              label="الاسم الكامل *"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="مثال: محمد أحمد عبدالله الغزاوي"
              error={errors.fullName}
              required
            />

            <Input
              label="رقم الهوية الوطنية *"
                type="text"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                placeholder="مثال: 900123456"
              error={errors.nationalId}
              required
            />

            <Input
              label="تاريخ الميلاد *"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجنس *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <Input
              label="رقم الهاتف *"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="مثال: 0591234567"
              error={errors.phone}
              required
            />
          </div>
        </Card>

        {/* Address Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <MapPin className="w-4 h-4 ml-2 text-green-600" />
            معلومات العنوان
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المحافظة *
              </label>
              <select
                value={formData.detailedAddress.governorate}
                onChange={(e) => handleDetailedAddressChange('governorate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">اختر المحافظة</option>
                {governorates.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              {errors.governorate && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.governorate}
                </p>
              )}
            </div>

            <Input
              label="المدينة / المخيم *"
                type="text"
                value={formData.detailedAddress.city}
                onChange={(e) => handleDetailedAddressChange('city', e.target.value)}
                placeholder="مثال: خان يونس"
              error={errors.city}
              required
            />

            <Input
              label="الحي / المنطقة *"
                type="text"
                value={formData.detailedAddress.district}
                onChange={(e) => handleDetailedAddressChange('district', e.target.value)}
                placeholder="مثال: الكتيبة"
              error={errors.district}
              required
            />

            <Input
              label="الشارع"
                type="text"
                value={formData.detailedAddress.street}
                onChange={(e) => handleDetailedAddressChange('street', e.target.value)}
                placeholder="مثال: شارع الشهداء"
            />

            <div className="md:col-span-2">
              <Input
                label="معلومات إضافية عن العنوان"
                type="text"
                value={formData.detailedAddress.additionalInfo}
                onChange={(e) => handleDetailedAddressChange('additionalInfo', e.target.value)}
                placeholder="مثال: بجانب مسجد الكتيبة الكبير"
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="العنوان المختصر (يتم إنشاؤه تلقائياً)"
                type="text"
                value={formData.address}
                placeholder="سيتم إنشاؤه تلقائياً من العنوان المفصل"
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Social and Economic Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-4 h-4 ml-2 text-purple-600" />
            المعلومات الاجتماعية والاقتصادية
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="المهنة *"
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="مثال: عامل بناء"
              error={errors.profession}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة الاجتماعية *
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {maritalStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى الاقتصادي *
              </label>
              <select
                value={formData.economicLevel}
                onChange={(e) => handleInputChange('economicLevel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {economicLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد أفراد الأسرة *
              </label>
              <input
                type="number"
                value={formData.membersCount}
                onChange={(e) => handleInputChange('membersCount', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                min="1"
                max="20"
              />
              {errors.membersCount && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.membersCount}
                </p>
              )}
            </div>
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
              {isEditing ? 'حفظ التغييرات' : 'إضافة المستفيد'}
            </Button>
          </div>
        </Card>

        {/* Form Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-3">تعليمات مهمة</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تأكد من صحة رقم الهوية الوطنية (9 أرقام)</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>العنوان المفصل مطلوب لضمان دقة التوصيل</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم تعيين حالة "بانتظار التوثيق" للمستفيد الجديد</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>الأشخاص المتزوجين يجب أن يكونوا أرباب أسر منفصلة</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}