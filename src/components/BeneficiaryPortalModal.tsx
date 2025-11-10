import React, { useState, useEffect } from 'react';
import {
  X, User, Package, Eye, EyeOff, Lock, CheckCircle, AlertCircle,
  Clock, Upload, MapPin, Phone, Edit2, Save, Shield, Camera,
  FileText, Calendar, IdCard, Bell, Activity
} from 'lucide-react';
import { beneficiaryAuthService } from '../services/beneficiaryAuthService';
import { packagesService } from '../services/supabaseRealService';
import { notificationService } from '../services/notificationService';
import { Button, Input, Card } from './ui';
import AccountStatusTab from './portal/AccountStatusTab';
import MyDataTab from './portal/MyDataTab';
import ActivityLogTab from './portal/ActivityLogTab';
import NotificationsDropdown from './portal/NotificationsDropdown';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type PackageType = Database['public']['Tables']['packages']['Row'];

interface BeneficiaryPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  nationalId: string;
  initialBeneficiary?: Beneficiary | null;
}

type ModalStep = 'pin_login' | 'create_pin' | 'dashboard';
type DashboardTab = 'profile' | 'status' | 'mydata' | 'packages' | 'activity' | 'security';

interface ModalState {
  step: ModalStep;
  beneficiary: Beneficiary | null;
  packages: PackageType[];
  isLoading: boolean;
  error: string;
  success: string;
}

export default function BeneficiaryPortalModal({
  isOpen,
  onClose,
  nationalId,
  initialBeneficiary
}: BeneficiaryPortalModalProps) {
  const [state, setState] = useState<ModalState>({
    step: 'pin_login',
    beneficiary: initialBeneficiary || null,
    packages: [],
    isLoading: false,
    error: '',
    success: ''
  });

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Beneficiary>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isOpen && initialBeneficiary) {
      checkAuthStatus();
    }
  }, [isOpen, initialBeneficiary]);

  useEffect(() => {
    if (state.step === 'dashboard' && state.beneficiary) {
      loadUnreadNotifications();
      const interval = setInterval(loadUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [state.step, state.beneficiary]);

  const loadUnreadNotifications = async () => {
    if (!state.beneficiary) return;
    try {
      const count = await notificationService.getUnreadCount(state.beneficiary.id);
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const checkAuthStatus = async () => {
    if (!initialBeneficiary) return;

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const authData = await beneficiaryAuthService.getAuthByNationalId(nationalId);

      if (!authData) {
        setState(prev => ({
          ...prev,
          step: 'create_pin',
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          step: 'pin_login',
          isLoading: false
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ'
      }));
    }
  };

  const handleLogin = async () => {
    if (!beneficiaryAuthService.validatePIN(pin)) {
      setState(prev => ({ ...prev, error: 'كلمة المرور يجب أن تتكون من 6 أرقام' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const passwordHash = beneficiaryAuthService.hashPassword(pin);
      const result = await beneficiaryAuthService.verifyPassword(nationalId, passwordHash);

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'كلمة المرور غير صحيحة'
        }));
        return;
      }

      await loadDashboardData();
      setState(prev => ({
        ...prev,
        step: 'dashboard',
        isLoading: false,
        error: '',
        success: 'تم تسجيل الدخول بنجاح'
      }));

      if (state.beneficiary) {
        await beneficiaryAuthService.logActivity(
          'تسجيل دخول عبر النافذة المنبثقة',
          state.beneficiary.name,
          'beneficiary',
          'review',
          state.beneficiary.id
        );
      }

      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء تسجيل الدخول'
      }));
    }
  };

  const handleCreatePin = async () => {
    if (!beneficiaryAuthService.validatePIN(pin)) {
      setState(prev => ({ ...prev, error: 'كلمة المرور يجب أن تتكون من 6 أرقام' }));
      return;
    }

    if (pin !== confirmPin) {
      setState(prev => ({ ...prev, error: 'كلمة المرور غير متطابقة' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      if (!state.beneficiary) throw new Error('لا توجد بيانات مستفيد');

      const passwordHash = beneficiaryAuthService.hashPassword(pin);
      await beneficiaryAuthService.createAuth(
        state.beneficiary.id,
        nationalId,
        passwordHash
      );

      await loadDashboardData();
      setState(prev => ({
        ...prev,
        step: 'dashboard',
        isLoading: false,
        success: 'تم إنشاء كلمة المرور بنجاح'
      }));

      await beneficiaryAuthService.logActivity(
        'إنشاء حساب جديد عبر النافذة المنبثقة',
        state.beneficiary.name,
        'beneficiary',
        'create',
        state.beneficiary.id
      );

      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء إنشاء كلمة المرور'
      }));
    }
  };

  const loadDashboardData = async () => {
    if (!state.beneficiary) return;

    try {
      const packages = await packagesService.getByBeneficiary(state.beneficiary.id);
      setState(prev => ({ ...prev, packages }));
      await beneficiaryAuthService.updateBeneficiaryPortalAccess(state.beneficiary.id);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' }));
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: 'تم حفظ التغييرات بنجاح',
        beneficiary: { ...prev.beneficiary!, ...editedData }
      }));

      setIsEditing(false);
      setEditedData({});

      if (state.beneficiary) {
        await beneficiaryAuthService.logActivity(
          'تحديث البيانات الشخصية',
          state.beneficiary.name,
          'beneficiary',
          'update',
          state.beneficiary.id
        );
      }

      setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء حفظ التغييرات'
      }));
    }
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setState(prev => ({
            ...prev,
            success: `تم مشاركة موقعك: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));

          if (state.beneficiary) {
            await beneficiaryAuthService.logActivity(
              `مشاركة الموقع: ${latitude}, ${longitude}`,
              state.beneficiary.name,
              'beneficiary',
              'update',
              state.beneficiary.id
            );
          }

          setTimeout(() => setState(prev => ({ ...prev, success: '' })), 5000);
        },
        () => {
          setState(prev => ({
            ...prev,
            error: 'لم نتمكن من الحصول على موقعك. يرجى السماح بالوصول للموقع.'
          }));
        }
      );
    } else {
      setState(prev => ({ ...prev, error: 'متصفحك لا يدعم خاصية تحديد الموقع' }));
    }
  };

  const getVerificationBadge = () => {
    const status = state.beneficiary?.identity_status || 'pending';
    const config: Record<string, { label: string; color: string; icon: any }> = {
      verified: {
        label: 'موثق',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle
      },
      pending: {
        label: 'قيد المراجعة',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock
      },
      rejected: {
        label: 'مرفوض',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle
      }
    };

    const { label, color, icon: Icon } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${color}`}>
        <Icon className="w-4 h-4" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      in_delivery: { label: 'قيد التوصيل', color: 'bg-orange-100 text-orange-700', icon: Clock },
      assigned: { label: 'جاري التحضير', color: 'bg-blue-100 text-blue-700', icon: Package },
      pending: { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-700', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const renderPinLogin = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          مرحباً {state.beneficiary?.name}
        </h2>
        <p className="text-gray-600">
          يرجى إدخال كلمة المرور للدخول إلى حسابك
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور (6 أرقام)
          </label>
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                setState(prev => ({ ...prev, error: '' }));
              }}
              onKeyPress={(e) => e.key === 'Enter' && pin.length === 6 && handleLogin()}
              placeholder="••••••"
              maxLength={6}
              dir="ltr"
              className="text-center text-2xl tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{state.error}</span>
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={pin.length !== 6 || state.isLoading}
          className="w-full"
        >
          {state.isLoading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
              جارٍ تسجيل الدخول...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </Button>

        <div className="text-center text-sm text-gray-600">
          <p>نسيت كلمة المرور؟ تواصل مع الدعم الفني</p>
        </div>
      </div>
    </div>
  );

  const renderCreatePin = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          مرحباً {state.beneficiary?.name}
        </h2>
        <p className="text-gray-600">
          هذه أول زيارة لك. يرجى إنشاء كلمة مرور مكونة من 6 أرقام
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور (6 أرقام)
          </label>
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                setState(prev => ({ ...prev, error: '' }));
              }}
              placeholder="••••••"
              maxLength={6}
              dir="ltr"
              className="text-center text-2xl tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تأكيد كلمة المرور
          </label>
          <Input
            type={showPin ? 'text' : 'password'}
            value={confirmPin}
            onChange={(e) => {
              setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6));
              setState(prev => ({ ...prev, error: '' }));
            }}
            onKeyPress={(e) => e.key === 'Enter' && pin.length === 6 && confirmPin.length === 6 && handleCreatePin()}
            placeholder="••••••"
            maxLength={6}
            dir="ltr"
            className="text-center text-2xl tracking-widest"
          />
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{state.error}</span>
          </div>
        )}

        <Button
          onClick={handleCreatePin}
          disabled={pin.length !== 6 || confirmPin.length !== 6 || state.isLoading}
          className="w-full"
        >
          {state.isLoading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
              جارٍ الإنشاء...
            </>
          ) : (
            'إنشاء كلمة المرور'
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>نصيحة:</strong> احفظ كلمة المرور في مكان آمن. ستحتاجها لتسجيل الدخول في المرات القادمة.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {state.beneficiary?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{state.beneficiary?.name}</h2>
              <p className="text-blue-100">رقم الهوية: {state.beneficiary?.national_id}</p>
            </div>
          </div>
          <div>
            {getVerificationBadge()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2 border-b border-blue-500/30 flex-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline ml-2" />
              الملف الشخصي
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline ml-2" />
              حالة الحساب
            </button>
            <button
              onClick={() => setActiveTab('mydata')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'mydata'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 inline ml-2" />
              بياناتي
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'packages'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 inline ml-2" />
              الطرود ({state.packages.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 inline ml-2" />
              السجل
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-100 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 inline ml-2" />
              الأمان
            </button>
          </div>
          <div className="relative mr-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
            {state.beneficiary && (
              <NotificationsDropdown
                beneficiaryId={state.beneficiary.id}
                isOpen={showNotifications}
                onClose={() => {
                  setShowNotifications(false);
                  loadUnreadNotifications();
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {state.success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-700">{state.success}</span>
          </div>
        )}

        {state.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{state.error}</span>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">البيانات الشخصية</h3>
                {!isEditing ? (
                  <Button
                    onClick={() => {
                      setIsEditing(true);
                      setEditedData({
                        phone: state.beneficiary?.phone,
                        address: state.beneficiary?.address
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} size="sm">
                      <Save className="w-4 h-4 ml-2" />
                      حفظ
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({});
                      }}
                      variant="outline"
                      size="sm"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded">{state.beneficiary?.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهوية
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded">{state.beneficiary?.national_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline ml-1" />
                    رقم الهاتف
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedData.phone || ''}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      placeholder="رقم الهاتف"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">{state.beneficiary?.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الجنس
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded">
                    {state.beneficiary?.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    العنوان
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedData.address || ''}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="العنوان"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">{state.beneficiary?.address}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button onClick={handleShareLocation} variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 ml-2" />
                  مشاركة موقعي الحالي
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'status' && state.beneficiary && (
          <AccountStatusTab beneficiaryId={state.beneficiary.id} />
        )}

        {activeTab === 'mydata' && state.beneficiary && (
          <MyDataTab
            beneficiary={state.beneficiary}
            onUpdate={async () => {
              if (state.beneficiary) {
                const updated = await beneficiaryAuthService.searchByNationalId(nationalId);
                if (updated) {
                  setState(prev => ({ ...prev, beneficiary: updated }));
                }
              }
            }}
          />
        )}

        {activeTab === 'activity' && state.beneficiary && (
          <ActivityLogTab beneficiaryId={state.beneficiary.id} />
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">صورة الهوية</h3>

              <div className="space-y-4">
                {state.beneficiary?.identity_image_url && !imagePreview && (
                  <div className="relative">
                    <img
                      src={state.beneficiary.identity_image_url}
                      alt="صورة الهوية"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div className="absolute top-2 right-2">
                      {getVerificationBadge()}
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="w-full h-64 object-cover rounded-lg border-2 border-blue-300"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="absolute top-2 left-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!state.beneficiary?.identity_image_url && !imagePreview && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">لم يتم رفع صورة الهوية بعد</p>
                    <p className="text-sm text-gray-500">قم برفع صورة واضحة لبطاقة الهوية</p>
                  </div>
                )}

                <div>
                  <label className="block w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5" />
                      <span>رفع صورة الهوية</span>
                    </div>
                  </label>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    الحد الأقصى لحجم الملف: 5 ميجابايت
                  </p>
                </div>

                {selectedImage && (
                  <Button onClick={() => {
                    setState(prev => ({
                      ...prev,
                      success: 'تم رفع صورة الهوية بنجاح. جاري المراجعة...'
                    }));
                    setImagePreview(null);
                    setSelectedImage(null);
                    setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
                  }} className="w-full">
                    <Save className="w-5 h-5 ml-2" />
                    حفظ الصورة
                  </Button>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">متطلبات صورة الهوية:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>صورة واضحة وغير مشوشة</li>
                        <li>جميع البيانات مقروءة بوضوح</li>
                        <li>الهوية سارية المفعول</li>
                        <li>بصيغة JPG أو PNG</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-4">
            {state.packages.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طرود</h3>
                  <p className="text-gray-600">لم يتم تخصيص أي طرود لك حتى الآن</p>
                </div>
              </Card>
            ) : (
              state.packages.map((pkg) => (
                <Card key={pkg.id} hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{pkg.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      {pkg.scheduled_delivery_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            التسليم المتوقع: {new Date(pkg.scheduled_delivery_date).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    {getStatusBadge(pkg.status)}
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                    <span className="text-gray-600">القيمة: {pkg.value} ₪</span>
                    <span className="text-gray-600">الممول: {pkg.funder}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الأمان</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">كلمة المرور</p>
                      <p className="text-sm text-gray-600">محمي بكلمة مرور من 6 أرقام</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    تغيير
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">حالة التوثيق</p>
                      <p className="text-sm text-gray-600">
                        {state.beneficiary?.identity_status === 'verified' ? 'حساب موثق' :
                         state.beneficiary?.identity_status === 'pending' ? 'قيد المراجعة' : 'غير موثق'}
                      </p>
                    </div>
                  </div>
                  {getVerificationBadge()}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">آخر دخول</p>
                      <p className="text-sm text-gray-600">
                        {state.beneficiary?.last_portal_access
                          ? new Date(state.beneficiary.last_portal_access).toLocaleString('ar-EG')
                          : 'هذا هو دخولك الأول'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-semibold mb-1">نصائح الأمان:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>لا تشارك كلمة المرور مع أي شخص</li>
                        <li>احفظ كلمة المرور في مكان آمن</li>
                        <li>تواصل مع الدعم فوراً إذا لاحظت نشاط مشبوه</li>
                        <li>قم بتحديث بياناتك بشكل دوري</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 left-0 right-0 md:left-1/4 md:right-1/4 lg:left-1/3 lg:right-1/3">
        <div className="bg-white h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-900">
              {state.step === 'dashboard' ? 'حسابي الشخصي' : 'تسجيل الدخول'}
            </h1>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {state.step === 'pin_login' && renderPinLogin()}
            {state.step === 'create_pin' && renderCreatePin()}
            {state.step === 'dashboard' && renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
}
