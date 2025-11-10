import React, { useState } from 'react';
import { Shield, Search, Package, CheckCircle, Clock, AlertCircle, MessageCircle, Phone, ArrowLeft, HelpCircle, Users, Building2, Heart, LogIn, Info, ChevronDown, PlayCircle, Lightbulb, UserPlus } from 'lucide-react';
import { beneficiaryAuthService } from '../services/beneficiaryAuthService';
import { Button, Input, Card, SearchLoadingSkeleton } from './ui';
import BeneficiaryPortalModal from './BeneficiaryPortalModal';
import RegistrationWizard from './RegistrationWizard';
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
  const [showHelp, setShowHelp] = useState(false);
  const [showExampleImage, setShowExampleImage] = useState(false);
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false);

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

  const handleRegistrationComplete = async (beneficiaryId: string) => {
    setShowRegistrationWizard(false);
    await handleSearch();
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
                <label className="block text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>رقم الهوية الوطني</span>
                  <span className="text-sm font-normal text-gray-500">(9 أرقام)</span>
                  <button
                    type="button"
                    onClick={() => setShowExampleImage(!showExampleImage)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    title="عرض مثال على رقم الهوية"
                  >
                    <Info className="w-4 h-4" />
                    مثال
                  </button>
                </label>

                {showExampleImage && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-2">أين أجد رقم الهوية؟</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <p className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>انظر في <strong>بطاقة الهوية الفلسطينية</strong></span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>الرقم يتكون من <strong>9 أرقام فقط</strong></span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>مثال: <code className="px-2 py-1 bg-white rounded text-blue-900 font-mono font-bold">900123456</code></span>
                          </p>
                          <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300">
                            <p className="text-xs text-gray-600 mb-1">بطاقة الهوية - مثال توضيحي:</p>
                            <div className="bg-gray-100 rounded p-3 border-2 border-dashed border-gray-400">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">الرقم الوطني</p>
                                <p className="text-2xl font-bold text-gray-800 font-mono tracking-widest">900123456</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={nationalId}
                    onChange={(e) => {
                      setNationalId(e.target.value.replace(/\D/g, '').slice(0, 9));
                      setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب 9 أرقام هنا"
                    maxLength={9}
                    dir="ltr"
                    className="text-2xl tracking-widest font-mono text-center"
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
                <div className="p-5 bg-red-50 border-2 border-red-300 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900 mb-1">هناك مشكلة!</h4>
                      <p className="text-base text-red-800">{error}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-gray-700 font-semibold mb-2">ماذا أفعل؟</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• تأكد من كتابة 9 أرقام بالضبط</li>
                      <li>• تأكد من صحة رقم الهوية</li>
                      <li>• أو اضغط على "مساعدة فورية" للتواصل معنا</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Instructions - Enhanced for Non-Technical Users */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-full flex items-center justify-between text-right mb-3"
                >
                  <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6" />
                    كيف أبحث عن معلوماتي؟
                  </h3>
                  <ChevronDown className={`w-5 h-5 text-green-700 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                </button>

                {showHelp && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">اكتب رقم هويتك</p>
                        <p className="text-sm text-gray-600">الرقم موجود في بطاقة الهوية الفلسطينية (9 أرقام)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">اضغط زر "بحث"</p>
                        <p className="text-sm text-gray-600">أو اضغط Enter من لوحة المفاتيح</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">شاهد معلوماتك</p>
                        <p className="text-sm text-gray-600">ستظهر جميع الطرود المخصصة لك مع حالة كل طرد</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span><strong>هل تحتاج مساعدة؟</strong> اضغط على زر "مساعدة فورية" أسفل الصفحة للتواصل معنا عبر واتساب</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isSearching && (
          <SearchLoadingSkeleton message="جاري البحث عن معلوماتك، يرجى الانتظار..." />
        )}

        {/* Search Results */}
        {searchResult && !isSearching && (
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
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <AlertCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    لم نجد معلومات بهذا الرقم
                  </h3>
                  <p className="text-lg text-gray-700 mb-6 max-w-md mx-auto leading-relaxed">
                    {searchResult.message || 'رقم الهوية الذي أدخلته غير موجود في قاعدة بياناتنا'}
                  </p>

                  <div className="bg-white rounded-xl p-6 mb-6 max-w-md mx-auto border-2 border-orange-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                      <Lightbulb className="w-5 h-5 text-orange-600" />
                      ماذا يمكنك أن تفعل؟
                    </h4>
                    <ul className="space-y-3 text-right">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</span>
                        <span className="text-gray-700">تأكد من كتابة رقم الهوية بشكل صحيح (9 أرقام)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</span>
                        <span className="text-gray-700">جرب البحث مرة أخرى</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</span>
                        <span className="text-gray-700">تواصل مع فريق الدعم للمساعدة</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setShowRegistrationWizard(true)}
                      className="px-6 py-3 text-base font-bold bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-5 h-5 ml-2" />
                      تسجيل حساب جديد
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="px-6 py-3 text-base font-bold"
                    >
                      <Search className="w-5 h-5 ml-2" />
                      بحث مرة أخرى
                    </Button>
                    <Button
                      onClick={handleWhatsAppSupport}
                      className="px-6 py-3 text-base font-bold bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-5 h-5 ml-2" />
                      تواصل معنا الآن
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Instant Help Button - Prominent for Non-Technical Users */}
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={handleWhatsAppSupport}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 animate-pulse hover:animate-none"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-bold text-lg">مساعدة فورية</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </button>
        </div>

        {/* Help Section */}
        {!searchResult && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card hover className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">هل تحتاج مساعدة؟</h3>
                  <p className="text-base text-gray-700 mb-4 leading-relaxed">
                    فريقنا جاهز للمساعدة على مدار الساعة عبر واتساب
                  </p>
                  <button
                    onClick={handleWhatsAppSupport}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    تواصل الآن عبر واتساب
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

      {showRegistrationWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <RegistrationWizard
            initialNationalId={nationalId}
            onComplete={handleRegistrationComplete}
            onCancel={() => setShowRegistrationWizard(false)}
          />
        </div>
      )}
    </div>
  );
}
