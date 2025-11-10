import React, { useState } from 'react';
import { Shield, Search, Package, CheckCircle, Clock, AlertCircle, MessageCircle, Phone, ArrowLeft, HelpCircle, Users, Building2, Heart, LogIn } from 'lucide-react';
import { beneficiaryAuthService } from '../services/beneficiaryAuthService';
import { Button, Input, Card } from './ui';
import BeneficiaryPortalModal from './BeneficiaryPortalModal';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface LandingPageProps {
  onNavigateTo: (page: string) => void;
}

interface SearchResult {
  found: boolean;
  beneficiary?: {
    name: string;
    national_id: string;
    status: string;
  };
  packages?: Array<{
    id: string;
    name: string;
    status: string;
    scheduled_delivery_date: string | null;
    tracking_number: string | null;
  }>;
  message?: string;
}

export default function LandingPage({ onNavigateTo }: LandingPageProps) {
  const [nationalId, setNationalId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [fullBeneficiary, setFullBeneficiary] = useState<Beneficiary | null>(null);
  const [error, setError] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);

  const handleSearch = async () => {
    if (!beneficiaryAuthService.validateNationalId(nationalId)) {
      setError('رقم الهوية يجب أن يتكون من 9 أرقام');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      const result = await beneficiaryAuthService.publicSearch(nationalId);
      setSearchResult(result);

      const beneficiary = await beneficiaryAuthService.searchByNationalId(nationalId);
      setFullBeneficiary(beneficiary);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenPortalModal = () => {
    setShowPortalModal(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nationalId.length === 9) {
      handleSearch();
    }
  };

  const handleReset = () => {
    setNationalId('');
    setSearchResult(null);
    setError('');
  };

  const handleWhatsAppSupport = () => {
    const phone = '+970599505699';
    const message = encodeURIComponent('مرحباً، أحتاج مساعدة في البحث عن معلوماتي');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">منصة المساعدات الإنسانية</h1>
                <p className="text-xs text-gray-600">غزة - فلسطين</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                الدخول الإداري
              </button>
              {showAdminMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => onNavigateTo('admin')}
                    className="w-full px-4 py-3 text-right hover:bg-blue-50 flex items-center gap-3 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">لوحة الإدمن</p>
                      <p className="text-xs text-gray-600">التحكم الكامل</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigateTo('organizations')}
                    className="w-full px-4 py-3 text-right hover:bg-green-50 flex items-center gap-3 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">لوحة المؤسسات</p>
                      <p className="text-xs text-gray-600">إدارة المؤسسات</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigateTo('families')}
                    className="w-full px-4 py-3 text-right hover:bg-purple-50 flex items-center gap-3 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">لوحة العائلات</p>
                      <p className="text-xs text-gray-600">إدارة العائلات</p>
                    </div>
                  </button>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => onNavigateTo('beneficiary')}
                      className="w-full px-4 py-3 text-right hover:bg-blue-50 flex items-center gap-3 transition-colors"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">بوابة المستفيدين</p>
                        <p className="text-xs text-gray-600">حسابي الشخصي</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ابحث عن معلومات طردك
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            أدخل رقم الهوية الوطني للاطلاع على حالة الطرود والمساعدات المخصصة لك
          </p>
        </div>

        {/* Search Box */}
        {!searchResult && (
          <Card className="mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  رقم الهوية الوطني (9 أرقام)
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value.replace(/\D/g, '').slice(0, 9));
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="123456789"
                    maxLength={9}
                    dir="ltr"
                    className="text-lg"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={nationalId.length !== 9 || isSearching}
                    className="px-8"
                  >
                    {isSearching ? (
                      <>
                        <Clock className="w-5 h-5 ml-2 animate-spin" />
                        جاري البحث...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 ml-2" />
                        بحث
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  كيفية الاستخدام:
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>أدخل رقم هويتك الوطني المكون من 9 أرقام</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>اضغط على زر "بحث" أو اضغط Enter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>ستظهر معلومات الطرود المخصصة لك وحالتها</span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {searchResult.found && searchResult.beneficiary ? (
              <>
                {/* Beneficiary Info */}
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {searchResult.beneficiary.name}
                        </h3>
                        <p className="text-gray-600">رقم الهوية: {searchResult.beneficiary.national_id}</p>
                      </div>
                    </div>
                    <Button onClick={handleReset} variant="ghost" size="sm">
                      بحث جديد
                    </Button>
                  </div>

                  {/* Packages List */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      الطرود المخصصة ({searchResult.packages?.length || 0})
                    </h4>

                    {searchResult.packages && searchResult.packages.length > 0 ? (
                      <div className="space-y-3">
                        {searchResult.packages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1">{pkg.name}</h5>
                                {pkg.tracking_number && (
                                  <p className="text-sm text-gray-600">
                                    رقم التتبع: <span className="font-mono">{pkg.tracking_number}</span>
                                  </p>
                                )}
                              </div>
                              {getStatusBadge(pkg.status)}
                            </div>
                            {pkg.scheduled_delivery_date && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">لا توجد طرود مسجلة حالياً</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      للوصول إلى معلومات أكثر تفصيلاً وإدارة حسابك:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleOpenPortalModal}
                        className="flex-1"
                      >
                        <LogIn className="w-5 h-5 ml-2" />
                        تسجيل الدخول إلى حسابي
                      </Button>
                      <Button
                        onClick={() => onNavigateTo('beneficiary')}
                        variant="outline"
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        فتح في صفحة كاملة
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    لم يتم العثور على بيانات
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchResult.message || 'رقم الهوية غير موجود في قاعدة البيانات'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleReset} variant="outline">
                      بحث مرة أخرى
                    </Button>
                    <Button onClick={handleWhatsAppSupport} variant="primary">
                      <MessageCircle className="w-4 h-4 ml-2" />
                      تواصل مع الدعم
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        {!searchResult && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card hover>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">تحتاج مساعدة؟</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    تواصل معنا عبر واتساب للحصول على الدعم الفوري
                  </p>
                  <button
                    onClick={handleWhatsAppSupport}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    فتح واتساب
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>

            <Card hover onClick={() => onNavigateTo('beneficiary')}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">بوابة المستفيدين</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    سجل دخولك للوصول إلى معلومات أكثر تفصيلاً
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    تسجيل الدخول
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        {!searchResult && (
          <Card className="mt-8 bg-gradient-to-br from-blue-50 to-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6">أسئلة شائعة</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">ماذا لو لم أجد معلوماتي؟</h4>
                <p className="text-sm text-gray-600">
                  تواصل مع فريق الدعم عبر واتساب أو قم بزيارة أقرب مركز توزيع
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">هل يمكنني تغيير عنوان التسليم؟</h4>
                <p className="text-sm text-gray-600">
                  نعم، سجل دخولك إلى بوابة المستفيدين لتحديث معلوماتك الشخصية
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">متى سأستلم طردي؟</h4>
                <p className="text-sm text-gray-600">
                  يمكنك رؤية التاريخ المتوقع للتسليم في نتائج البحث أعلاه
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">منصة المساعدات الإنسانية</p>
                <p className="text-sm text-gray-400">غزة - فلسطين</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={handleWhatsAppSupport}
                className="flex items-center gap-2 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                واتساب: +970 59 950 5699
              </button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2024 منصة المساعدات الإنسانية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      <BeneficiaryPortalModal
        isOpen={showPortalModal}
        onClose={() => setShowPortalModal(false)}
        nationalId={nationalId}
        initialBeneficiary={fullBeneficiary}
      />
    </div>
  );
}
