import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Shield, Save, X, AlertTriangle, CheckCircle, Users, Briefcase, Heart, DollarSign, FileText, Home, UserPlus } from 'lucide-react';
import { type Beneficiary, mockFamilies } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import { Button, Card, Input, Badge } from './ui';

interface FamilyMemberFormProps {
  familyId: string;
  member?: Beneficiary | null;
  onSave: (memberData: Partial<Beneficiary>) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  relationToFamily: string;
  profession: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  economicLevel: 'very_poor' | 'poor' | 'moderate' | 'good';
  membersCount: number;
  notes: string;
}

export default function FamilyMemberForm({ familyId, member, onSave, onCancel }: FamilyMemberFormProps) {
  const { logError, logInfo } = useErrorLogger();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    fullName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    relationToFamily: '',
    profession: '',
    maritalStatus: 'single',
    economicLevel: 'poor',
    membersCount: 1,
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const isEditing = !!member;
  const family = mockFamilies.find(f => f.id === familyId);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        fullName: member.fullName || '',
        nationalId: member.nationalId || '',
        dateOfBirth: member.dateOfBirth || '',
        gender: member.gender || 'male',
        phone: member.phone || '',
        relationToFamily: member.relationToFamily || '',
        profession: member.profession || '',
        maritalStatus: member.maritalStatus || 'single',
        economicLevel: member.economicLevel || 'poor',
        membersCount: member.membersCount || 1,
        notes: member.notes || ''
      });
    }
  }, [member]);

  const relationshipOptions = [
    { value: 'رب الأسرة', label: 'رب الأسرة' },
    { value: 'الزوجة', label: 'الزوجة' },
    { value: 'الابن', label: 'الابن' },
    { value: 'الابنة', label: 'الابنة' },
    { value: 'الأخ', label: 'الأخ' },
    { value: 'الأخت', label: 'الأخت' },
    { value: 'الوالد', label: 'الوالد' },
    { value: 'الوالدة', label: 'الوالدة' },
    { value: 'الجد', label: 'الجد' },
    { value: 'الجدة', label: 'الجدة' },
    { value: 'العم', label: 'العم' },
    { value: 'العمة', label: 'العمة' },
    { value: 'الخال', label: 'الخال' },
    { value: 'الخالة', label: 'الخالة' },
    { value: 'قريب آخر', label: 'قريب آخر' }
  ];

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
    if (!formData.relationToFamily.trim()) {
      newErrors.relationToFamily = 'صلة القرابة مطلوبة';
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
      logError(new Error('فشل في التحقق من صحة البيانات'), 'FamilyMemberForm');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));

      const memberData: Partial<Beneficiary> = {
        name: formData.name.trim(),
        fullName: formData.fullName.trim(),
        nationalId: formData.nationalId.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        familyId: familyId,
        relationToFamily: formData.relationToFamily,
        profession: formData.profession.trim(),
        maritalStatus: formData.maritalStatus,
        economicLevel: formData.economicLevel,
        membersCount: formData.membersCount,
        notes: formData.notes.trim(),
        // استخدام عنوان العائلة كعنوان افتراضي
        address: family?.location || 'غير محدد',
        detailedAddress: {
          governorate: family?.location.split(' - ')[0] || 'غير محدد',
          city: family?.location.split(' - ')[1] || 'غير محدد',
          district: family?.location.split(' - ')[2] || 'غير محدد',
          street: '',
          additionalInfo: ''
        },
        location: { lat: 31.3469, lng: 34.3029 }, // موقع افتراضي في غزة
        identityStatus: 'pending',
        status: 'active',
        eligibilityStatus: 'under_review',
        lastReceived: new Date().toISOString().split('T')[0],
        totalPackages: 0,
        additionalDocuments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'family_admin',
        updatedBy: 'family_admin'
      };

      onSave(memberData);
      
      if (isEditing && member) {
        logInfo(`محاكاة تحديث بيانات فرد العائلة: ${formData.name}`, 'FamilyMemberForm');
      } else {
        logInfo(`محاكاة إضافة فرد جديد للعائلة: ${formData.name}`, 'FamilyMemberForm');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setOperationError(errorMessage);
      logError(new Error(errorMessage), 'FamilyMemberForm');
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
          <div className="bg-purple-100 p-4 rounded-xl w-fit mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل بيانات فرد العائلة' : 'إضافة فرد جديد للعائلة'}
          </h2>
          <p className="text-gray-600 mt-2">
            {family ? `إضافة فرد جديد لـ ${family.name}` : 'إضافة فرد جديد للعائلة'}
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

        {/* Family Information */}
        {family && (
          <Card className="bg-purple-50 border-purple-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Heart className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-800">معلومات العائلة</h3>
                <p className="text-purple-700 text-sm">
                  {family.name} - رب الأسرة: {family.headOfFamily} - الموقع: {family.location}
                </p>
              </div>
            </div>
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

        {/* Family Relationship */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Heart className="w-4 h-4 ml-2 text-purple-600" />
            العلاقة العائلية
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صلة القرابة *
              </label>
              <select
                value={formData.relationToFamily}
                onChange={(e) => handleInputChange('relationToFamily', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">اختر صلة القرابة</option>
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.relationToFamily && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.relationToFamily}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأفراد المعالين
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

        {/* Social and Economic Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Briefcase className="w-4 h-4 ml-2 text-green-600" />
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
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="w-4 h-4 ml-2 text-yellow-600" />
            ملاحظات إضافية
          </h3>
          
          <Input
            type="textarea"
            label="ملاحظات خاصة"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="أي ملاحظات خاصة بفرد العائلة..."
          />
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
              {isEditing ? 'حفظ التغييرات' : 'إضافة فرد العائلة'}
            </Button>
          </div>
        </Card>

        {/* Form Instructions */}
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <Heart className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-800 mb-3">تعليمات إضافة فرد العائلة</h4>
              <ul className="text-sm text-purple-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم ربط الفرد الجديد بعائلة {family?.name || 'المحددة'}</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم استخدام عنوان العائلة كعنوان افتراضي</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم تعيين حالة "بانتظار التوثيق" للفرد الجديد</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>يمكن تعديل العنوان لاحقاً من قائمة المستفيدين</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>لا يمكن إضافة أشخاص متزوجين كأفراد في الأسرة</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}