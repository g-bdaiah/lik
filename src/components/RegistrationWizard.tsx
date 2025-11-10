import React, { useState } from 'react';
import {
  User, Phone, MapPin, Briefcase, Users, Heart, FileText, Lock,
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Upload, X, Camera,
  Info, Calendar, Home, DollarSign, Activity
} from 'lucide-react';
import { beneficiaryAuthService } from '../services/beneficiaryAuthService';
import { Button, Input, Card } from './ui';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Insert'];

interface RegistrationWizardProps {
  onComplete: (beneficiaryId: string) => void;
  onCancel: () => void;
  initialNationalId?: string;
}

interface FormData {
  name: string;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  phone: string;
  whatsapp_number: string;
  whatsapp_family_member: string;
  address: string;
  detailed_address: string;
  location_lat: number | null;
  location_lng: number | null;
  profession: string;
  marital_status: string;
  economic_level: string;
  members_count: number;
  family_members: Array<{ name: string; age: number; relation: string }>;
  medical_conditions: string;
  special_needs: string;
  identity_image: File | null;
  personal_photo: File | null;
  password: string;
  confirm_password: string;
}

const STEPS = [
  { id: 1, title: 'البيانات الأساسية', icon: User },
  { id: 2, title: 'بيانات الاتصال', icon: Phone },
  { id: 3, title: 'الموقع الجغرافي', icon: MapPin },
  { id: 4, title: 'البيانات الاقتصادية', icon: Briefcase },
  { id: 5, title: 'بيانات الأسرة', icon: Users },
  { id: 6, title: 'الحالة الصحية', icon: Heart },
  { id: 7, title: 'المستندات', icon: FileText },
  { id: 8, title: 'المراجعة وإنشاء الحساب', icon: Lock }
];

export default function RegistrationWizard({
  onComplete,
  onCancel,
  initialNationalId = ''
}: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    full_name: '',
    national_id: initialNationalId,
    date_of_birth: '',
    gender: 'male',
    phone: '',
    whatsapp_number: '',
    whatsapp_family_member: '',
    address: '',
    detailed_address: '',
    location_lat: null,
    location_lng: null,
    profession: '',
    marital_status: 'single',
    economic_level: 'medium',
    members_count: 1,
    family_members: [],
    medical_conditions: '',
    special_needs: '',
    identity_image: null,
    personal_photo: null,
    password: '',
    confirm_password: ''
  });

  const [identityPreview, setIdentityPreview] = useState<string | null>(null);
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState<string | null>(null);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    setError('');

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('الاسم مطلوب');
          return false;
        }
        if (!formData.full_name.trim()) {
          setError('الاسم الكامل مطلوب');
          return false;
        }
        if (!beneficiaryAuthService.validateNationalId(formData.national_id)) {
          setError('رقم الهوية يجب أن يتكون من 9 أرقام');
          return false;
        }
        if (!formData.date_of_birth) {
          setError('تاريخ الميلاد مطلوب');
          return false;
        }
        return true;

      case 2:
        if (!formData.phone.trim()) {
          setError('رقم الهاتف مطلوب');
          return false;
        }
        if (formData.phone.length < 9) {
          setError('رقم الهاتف غير صحيح');
          return false;
        }
        if (!formData.address.trim()) {
          setError('العنوان مطلوب');
          return false;
        }
        return true;

      case 3:
        if (!formData.detailed_address.trim()) {
          setError('العنوان التفصيلي مطلوب');
          return false;
        }
        return true;

      case 4:
        if (!formData.profession.trim()) {
          setError('المهنة مطلوبة');
          return false;
        }
        return true;

      case 5:
        if (formData.members_count < 1) {
          setError('عدد أفراد الأسرة يجب أن يكون 1 على الأقل');
          return false;
        }
        return true;

      case 6:
        return true;

      case 7:
        if (!formData.identity_image) {
          setError('صورة الهوية مطلوبة');
          return false;
        }
        return true;

      case 8:
        if (!beneficiaryAuthService.validatePIN(formData.password)) {
          setError('كلمة المرور يجب أن تتكون من 6 أرقام');
          return false;
        }
        if (formData.password !== formData.confirm_password) {
          setError('كلمة المرور غير متطابقة');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleImageSelect = (type: 'identity' | 'personal', file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'identity') {
        setIdentityPreview(reader.result as string);
        updateFormData('identity_image', file);
      } else {
        setPersonalPhotoPreview(reader.result as string);
        updateFormData('personal_photo', file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!validateStep(8)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const beneficiaryData: any = {
        name: formData.name,
        full_name: formData.full_name,
        national_id: formData.national_id,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone,
        whatsapp_number: formData.whatsapp_number || formData.phone,
        whatsapp_family_member: formData.whatsapp_family_member || '',
        address: formData.address,
        detailed_address: formData.detailed_address,
        location: formData.location_lat && formData.location_lng
          ? `${formData.location_lat},${formData.location_lng}`
          : null,
        profession: formData.profession,
        marital_status: formData.marital_status,
        economic_level: formData.economic_level,
        members_count: formData.members_count,
        medical_conditions: formData.medical_conditions || '',
        verification_status: 'under_review',
        qualification_status: 'needs_update',
        phone_locked: true,
        phone_locked_at: new Date().toISOString(),
        status: 'active'
      };

      const beneficiary = await beneficiaryAuthService.createBeneficiary(beneficiaryData);

      if (!beneficiary || !beneficiary.id) {
        throw new Error('فشل إنشاء حساب المستفيد');
      }

      const passwordHash = beneficiaryAuthService.hashPassword(formData.password);
      await beneficiaryAuthService.createAuth(
        beneficiary.id,
        formData.national_id,
        passwordHash
      );

      await beneficiaryAuthService.logActivity(
        'تسجيل مستفيد جديد عبر معالج التسجيل',
        formData.name,
        'system',
        'create',
        beneficiary.id
      );

      onComplete(beneficiary.id);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
      setIsSubmitting(false);
    }
  };

  const addFamilyMember = () => {
    updateFormData('family_members', [
      ...formData.family_members,
      { name: '', age: 0, relation: '' }
    ]);
  };

  const updateFamilyMember = (index: number, field: string, value: any) => {
    const updated = [...formData.family_members];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('family_members', updated);
  };

  const removeFamilyMember = (index: number) => {
    updateFormData('family_members', formData.family_members.filter((_, i) => i !== index));
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFormData('location_lat', position.coords.latitude);
          updateFormData('location_lng', position.coords.longitude);
          setError('');
        },
        (error) => {
          setError('لم نتمكن من الحصول على موقعك. يرجى السماح بالوصول للموقع.');
        }
      );
    } else {
      setError('متصفحك لا يدعم خاصية تحديد الموقع');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="محمد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => updateFormData('full_name', e.target.value)}
                placeholder="محمد أحمد علي"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهوية الوطني (9 أرقام) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.national_id}
                onChange={(e) => updateFormData('national_id', e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="900123456"
                maxLength={9}
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجنس <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>ذكر</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>أنثى</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="0599123456"
                dir="ltr"
              />
              <p className="mt-1 text-xs text-gray-500">
                <Info className="w-3 h-3 inline ml-1" />
                رقم الهاتف سيتم قفله بعد التسجيل ولن يمكن تغييره
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الواتساب (اختياري)
              </label>
              <Input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => updateFormData('whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="0599123456"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صاحب رقم الواتساب (اختياري)
              </label>
              <Input
                value={formData.whatsapp_family_member}
                onChange={(e) => updateFormData('whatsapp_family_member', e.target.value)}
                placeholder="الابن، الزوجة، إلخ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="غزة، خان يونس، رفح، إلخ"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان التفصيلي <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.detailed_address}
                onChange={(e) => updateFormData('detailed_address', e.target.value)}
                placeholder="الحي، الشارع، رقم المنزل، معالم قريبة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">مشاركة الموقع الجغرافي</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    لتسهيل توصيل المساعدات، يمكنك مشاركة موقعك الجغرافي الحالي
                  </p>
                  {formData.location_lat && formData.location_lng ? (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>تم حفظ موقعك بنجاح</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleGetCurrentLocation}
                      variant="secondary"
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 ml-2" />
                      الحصول على موقعي الحالي
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المهنة <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.profession}
                onChange={(e) => updateFormData('profession', e.target.value)}
                placeholder="موظف، عامل، طالب، بدون عمل، إلخ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة الاجتماعية <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.marital_status}
                onChange={(e) => updateFormData('marital_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="single">أعزب</option>
                <option value="married">متزوج</option>
                <option value="divorced">مطلق</option>
                <option value="widowed">أرمل</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى الاقتصادي <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.economic_level}
                onChange={(e) => updateFormData('economic_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="poor">ضعيف</option>
                <option value="medium">متوسط</option>
                <option value="good">جيد</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد أفراد الأسرة <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.members_count}
                onChange={(e) => updateFormData('members_count', parseInt(e.target.value) || 1)}
                min={1}
                max={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  أفراد الأسرة (اختياري)
                </label>
                <Button
                  onClick={addFamilyMember}
                  variant="secondary"
                  size="sm"
                >
                  <Users className="w-4 h-4 ml-1" />
                  إضافة فرد
                </Button>
              </div>
              {formData.family_members.length > 0 && (
                <div className="space-y-3">
                  {formData.family_members.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">فرد {index + 1}</span>
                        <button
                          onClick={() => removeFamilyMember(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Input
                        placeholder="الاسم"
                        value={member.name}
                        onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="العمر"
                          value={member.age || ''}
                          onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="العلاقة"
                          value={member.relation}
                          onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأمراض المزمنة أو الحالات الصحية (اختياري)
              </label>
              <textarea
                value={formData.medical_conditions}
                onChange={(e) => updateFormData('medical_conditions', e.target.value)}
                placeholder="السكري، الضغط، أمراض القلب، إلخ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                احتياجات خاصة (اختياري)
              </label>
              <textarea
                value={formData.special_needs}
                onChange={(e) => updateFormData('special_needs', e.target.value)}
                placeholder="إعاقة حركية، احتياجات غذائية خاصة، إلخ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الهوية الوطنية <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {identityPreview ? (
                  <div className="space-y-3">
                    <img
                      src={identityPreview}
                      alt="معاينة الهوية"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setIdentityPreview(null);
                        updateFormData('identity_image', null);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      حذف الصورة
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">اضغط لرفع صورة الهوية</p>
                    <p className="text-xs text-gray-500 mb-3">JPG, PNG (حد أقصى 5 ميجابايت)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect('identity', file);
                      }}
                      className="hidden"
                      id="identity-upload"
                    />
                    <label htmlFor="identity-upload">
                      <Button as="span" variant="secondary">
                        اختر صورة
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة شخصية (اختياري)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {personalPhotoPreview ? (
                  <div className="space-y-3">
                    <img
                      src={personalPhotoPreview}
                      alt="معاينة الصورة الشخصية"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setPersonalPhotoPreview(null);
                        updateFormData('personal_photo', null);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      حذف الصورة
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">اضغط لرفع صورة شخصية</p>
                    <p className="text-xs text-gray-500 mb-3">JPG, PNG (حد أقصى 5 ميجابايت)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect('personal', file);
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button as="span" variant="secondary">
                        اختر صورة
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">ملخص البيانات</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium">{formData.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهوية:</span>
                  <span className="font-medium">{formData.national_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهاتف:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العنوان:</span>
                  <span className="font-medium">{formData.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المهنة:</span>
                  <span className="font-medium">{formData.profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد أفراد الأسرة:</span>
                  <span className="font-medium">{formData.members_count}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">إنشاء كلمة المرور</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور (6 أرقام) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength={6}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => updateFormData('confirm_password', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength={6}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">ملاحظات مهمة:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>رقم الهاتف سيتم قفله ولن يمكن تغييره</li>
                    <li>حسابك سيكون قيد المراجعة من قبل الإدارة</li>
                    <li>سيتم إشعارك عند الموافقة على حسابك</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تسجيل حساب جديد</h2>
            <p className="text-gray-600">املأ البيانات التالية لإنشاء حسابك</p>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 hidden sm:block">
                        {step.id}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded transition-colors ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {STEPS[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-600">
                الخطوة {currentStep} من {STEPS.length}
              </p>
            </div>
          </div>

          <div className="p-6">
            {renderStepContent()}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={onCancel} variant="secondary">
                إلغاء
              </Button>
              {currentStep > 1 && (
                <Button onClick={handlePrevious} variant="secondary">
                  <ArrowRight className="w-4 h-4 ml-1" />
                  السابق
                </Button>
              )}
            </div>
            <div>
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>
                  التالي
                  <ArrowLeft className="w-4 h-4 mr-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جارٍ التسجيل...' : 'إنشاء الحساب'}
                  <CheckCircle className="w-4 h-4 mr-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
