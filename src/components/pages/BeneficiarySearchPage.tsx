import React, { useState } from 'react';
import { Search, User, FileText, Package, Loader, AlertCircle } from 'lucide-react';
import { Card, Input, Button } from '../ui';
import Tabs from '../ui/Tabs';
import OverviewTab from '../beneficiary-search/OverviewTab';
import BeneficiaryDataTab from '../beneficiary-search/BeneficiaryDataTab';
import PackagesTab from '../beneficiary-search/PackagesTab';
import { searchBeneficiaryByNationalId } from '../../services/beneficiarySearchService';
import { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

export default function BeneficiarySearchPage() {
  const [nationalId, setNationalId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesStats, setPackagesStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    inDelivery: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  const handleSearch = async () => {
    if (!nationalId.trim()) {
      setSearchError('الرجاء إدخال رقم الهوية الوطنية');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await searchBeneficiaryByNationalId(nationalId.trim());

      if (result.error) {
        setSearchError(result.error);
        setBeneficiary(null);
        setPackages([]);
        setPackagesStats({ total: 0, delivered: 0, pending: 0, inDelivery: 0 });
      } else if (result.beneficiary) {
        setBeneficiary(result.beneficiary);
        setPackages(result.packages);
        setPackagesStats({
          total: result.totalPackages,
          delivered: result.deliveredPackages,
          pending: result.pendingPackages,
          inDelivery: result.inDeliveryPackages
        });
        setActiveTab('overview');
      }
    } catch (error) {
      setSearchError('حدث خطأ غير متوقع أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (beneficiary) {
      await handleSearch();
    }
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: User },
    { id: 'data', label: 'بيانات المستفيد', icon: FileText },
    { id: 'packages', label: 'الطرود', icon: Package, badge: packagesStats.total }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ابحث عن معلومات طردك</h1>
              <p className="text-gray-600 mt-1">أدخل رقم الهوية الوطني للاطلاع على حالة الطرود والمساعدات المخصصة لك</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                icon={Search}
                iconPosition="right"
                placeholder="أدخل رقم الهوية الوطني (9 أرقام)..."
                value={nationalId}
                onChange={(e) => {
                  setNationalId(e.target.value);
                  setSearchError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                disabled={isSearching}
                className="text-lg"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={isSearching ? Loader : Search}
              iconPosition="right"
              onClick={handleSearch}
              disabled={isSearching}
              className="md:w-auto w-full"
            >
              {isSearching ? 'جاري البحث...' : 'بحث'}
            </Button>
          </div>

          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 space-x-reverse">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{searchError}</p>
                <p className="text-xs text-red-600 mt-1">
                  تأكد من إدخال رقم الهوية الصحيح وحاول مرة أخرى
                </p>
              </div>
            </div>
          )}
        </Card>

        {!beneficiary && !searchError && !isSearching && (
          <Card className="text-center py-16">
            <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ابحث عن بياناتك</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              قم بإدخال رقم الهوية الوطني الخاص بك في الحقل أعلاه للاطلاع على معلوماتك الكاملة،
              حالة التوثيق، الأهلية، وسجل الطرود المستلمة والقادمة
            </p>
            <div className="mt-8 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">معلوماتك الكاملة</h4>
                <p className="text-sm text-gray-600">اطلع على بياناتك الشخصية والعائلية</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">حالة التوثيق</h4>
                <p className="text-sm text-gray-600">تعرف على حالة توثيق هويتك وأهليتك</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-xl mb-3 mx-auto w-fit">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">سجل الطرود</h4>
                <p className="text-sm text-gray-600">تابع الطرود المستلمة والقادمة</p>
              </div>
            </div>
          </Card>
        )}

        {beneficiary && (
          <div className="space-y-6">
            <Card padding="none">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    {beneficiary.personal_photo_url ? (
                      <img
                        src={beneficiary.personal_photo_url}
                        alt={beneficiary.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{beneficiary.name}</h2>
                      <p className="text-gray-600">رقم الهوية: {beneficiary.national_id}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setBeneficiary(null);
                      setPackages([]);
                      setNationalId('');
                      setSearchError(null);
                    }}
                  >
                    بحث جديد
                  </Button>
                </div>
              </div>

              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
              />

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab
                    beneficiary={beneficiary}
                    packagesStats={packagesStats}
                  />
                )}
                {activeTab === 'data' && (
                  <BeneficiaryDataTab
                    beneficiary={beneficiary}
                    onUpdate={handleRefresh}
                  />
                )}
                {activeTab === 'packages' && (
                  <PackagesTab packages={packages} />
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
