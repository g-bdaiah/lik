import React, { useState, useEffect } from 'react';
import { Search, User, Package, AlertCircle, MapPin, MessageCircle, Shield, Bell } from 'lucide-react';
import { beneficiaryAuthService } from '../services/beneficiaryAuthService';
import { packagesService } from '../services/supabaseRealService';
import { Button, Input, Card, Modal } from './ui';
import RegistrationWizard from './RegistrationWizard';
import AccountStatusCard from './portal/AccountStatusCard';
import PackagesListWithFilters from './portal/PackagesListWithFilters';
import UpdateDataForm from './portal/UpdateDataForm';
import MyDataTab from './portal/MyDataTab';
import ActivityLogTab from './portal/ActivityLogTab';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type PackageType = Database['public']['Tables']['packages']['Row'];

interface BeneficiaryPortalState {
  step: 'search' | 'dashboard' | 'register';
  beneficiary: Beneficiary | null;
  packages: PackageType[];
  isLoading: boolean;
  error: string;
}

export default function BeneficiaryPortal({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<BeneficiaryPortalState>({
    step: 'search',
    beneficiary: null,
    packages: [],
    isLoading: false,
    error: ''
  });

  const [nationalId, setNationalId] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'packages' | 'info' | 'activity'>('status');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [packageFilter, setPackageFilter] = useState<'all' | 'delivered' | 'current' | 'future'>('all');
  const [features, setFeatures] = useState<any>({
    otp_verification: false,
    password_recovery: false,
    support_phone: '+970599505699'
  });

  useEffect(() => {
    loadSystemFeatures();
  }, []);

  const loadSystemFeatures = async () => {
    try {
      const allFeatures = await beneficiaryAuthService.getAllSystemFeatures();
      const featuresMap: any = {};
      allFeatures.forEach(f => {
        featuresMap[f.feature_key] = f.is_enabled;
        if (f.settings?.support_phone) {
          featuresMap.support_phone = f.settings.support_phone;
        }
      });
      setFeatures(featuresMap);
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const handleSearch = async () => {
    if (!beneficiaryAuthService.validateNationalId(nationalId)) {
      setState(prev => ({ ...prev, error: 'رقم الهوية يجب أن يتكون من 9 أرقام' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const beneficiary = await beneficiaryAuthService.searchByNationalId(nationalId);

      if (!beneficiary) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'register',
          error: ''
        }));
        return;
      }

      await loadDashboardData(beneficiary.id);

      setState(prev => ({
        ...prev,
        beneficiary,
        step: 'dashboard',
        isLoading: false,
        error: ''
      }));

      await beneficiaryAuthService.logActivity(
        `الوصول إلى البوابة برقم هوية: ${nationalId}`,
        beneficiary?.name || 'غير معروف',
        'beneficiary',
        'review',
        beneficiary?.id
      );
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء البحث'
      }));
    }
  };


  const loadDashboardData = async (beneficiaryId: string) => {
    try {
      const packages = await packagesService.getByBeneficiary(beneficiaryId);
      setState(prev => ({ ...prev, packages }));
      await beneficiaryAuthService.updateBeneficiaryPortalAccess(beneficiaryId);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleWhatsAppSupport = () => {
    const phone = features.support_phone || '+970599505699';
    const message = encodeURIComponent('مرحباً، أحتاج مساعدة في بوابة المستفيدين');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleShareLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location shared:', { latitude, longitude });

          if (state.beneficiary) {
            try {
              await beneficiaryAuthService.logActivity(
                `مشاركة الموقع: ${latitude}, ${longitude}`,
                state.beneficiary.name,
                'beneficiary',
                'update',
                state.beneficiary.id
              );
              alert('تم مشاركة موقعك بنجاح');
            } catch (error) {
              console.error('Error logging location:', error);
            }
          }
        },
        (error) => {
          alert('لم نتمكن من الحصول على موقعك. يرجى التأكد من السماح بالوصول للموقع.');
        }
      );
    } else {
      alert('متصفحك لا يدعم خاصية تحديد الموقع');
    }
  };

  const getFilteredPackages = () => {
    if (packageFilter === 'all') return state.packages;
    if (packageFilter === 'delivered') {
      return state.packages.filter(p => p.status === 'delivered');
    }
    if (packageFilter === 'current') {
      return state.packages.filter(p => ['assigned', 'in_delivery'].includes(p.status));
    }
    if (packageFilter === 'future') {
      return state.packages.filter(p => p.status === 'pending' && p.scheduled_delivery_date);
    }
    return state.packages;
  };

  const renderSearchStep = () => (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          بوابة المستفيدين
        </h2>
        <p className="text-gray-600">
          ابحث عن بياناتك باستخدام رقم الهوية الوطني
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهوية الوطني (9 أرقام)
          </label>
          <Input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="123456789"
            maxLength={9}
            dir="ltr"
          />
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{state.error}</span>
          </div>
        )}

        <Button
          onClick={handleSearch}
          disabled={nationalId.length !== 9 || state.isLoading}
          className="w-full"
        >
          {state.isLoading ? 'جارٍ البحث...' : 'بحث'}
        </Button>

        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </Card>
  );


  const renderDashboard = () => {
    const filteredPackages = getFilteredPackages();

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{state.beneficiary?.name}</h2>
                <p className="text-sm text-gray-600">رقم الهوية: {state.beneficiary?.national_id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShareLocation}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="مشاركة الموقع"
              >
                <MapPin className="w-5 h-5" />
              </button>
              <button
                onClick={handleWhatsAppSupport}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                title="تواصل عبر واتساب"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'status'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              حالة الحساب
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'packages'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4" />
              الطرود ({state.packages.length})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              بياناتي
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              النشاطات
            </button>
          </div>
        </div>

        {activeTab === 'status' && state.beneficiary && (
          <AccountStatusCard
            beneficiary={state.beneficiary}
            onUpdateData={() => setShowUpdateForm(true)}
          />
        )}

        {activeTab === 'info' && state.beneficiary && (
          showUpdateForm ? (
            <UpdateDataForm
              beneficiary={state.beneficiary}
              onSuccess={async () => {
                setShowUpdateForm(false);
                const updatedBeneficiary = await beneficiaryAuthService.searchByNationalId(nationalId);
                if (updatedBeneficiary) {
                  setState(prev => ({ ...prev, beneficiary: updatedBeneficiary }));
                }
              }}
              onCancel={() => setShowUpdateForm(false)}
            />
          ) : (
            <MyDataTab
              beneficiary={state.beneficiary}
              onEdit={() => setShowUpdateForm(true)}
            />
          )
        )}

        {activeTab === 'activity' && state.beneficiary && (
          <ActivityLogTab beneficiaryId={state.beneficiary.id} />
        )}

        {activeTab === 'packages' && (
          <PackagesListWithFilters packages={state.packages} />
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  };

  const handleRegistrationComplete = async (beneficiaryId: string) => {
    try {
      const beneficiary = await beneficiaryAuthService.searchByNationalId(nationalId);
      if (beneficiary) {
        await loadDashboardData(beneficiary.id);
        setState(prev => ({
          ...prev,
          beneficiary,
          step: 'dashboard',
          isLoading: false,
          error: ''
        }));
      }
    } catch (error) {
      console.error('Error after registration:', error);
    }
  };

  const renderRegisterStep = () => (
    <RegistrationWizard
      initialNationalId={nationalId}
      onComplete={handleRegistrationComplete}
      onCancel={() => setState(prev => ({ ...prev, step: 'search' }))}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="container mx-auto">
        {state.step === 'search' && renderSearchStep()}
        {state.step === 'dashboard' && renderDashboard()}
        {state.step === 'register' && renderRegisterStep()}
      </div>
    </div>
  );
}
