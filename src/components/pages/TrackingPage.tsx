import React, { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, AlertTriangle, TrendingUp, Package, Users, BarChart3, RefreshCw, Download, Calendar, MapPin, Truck, X } from 'lucide-react'; // No change needed for icons
import { mockTasks, mockBeneficiaries, mockPackages, mockCouriers, type Task, type Beneficiary } from '../../data/mockData';
import GazaMap, { type MapPoint } from '../GazaMap';
import BeneficiaryProfileModal from '../BeneficiaryProfileModal';

interface TrackingPageProps {
  onNavigateToIndividualSend?: (beneficiaryId: string) => void;
}

export default function TrackingPage({ onNavigateToIndividualSend }: TrackingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBeneficiaryDetailsModal, setShowBeneficiaryDetailsModal] = useState(false);
  const [selectedBeneficiaryForModal, setSelectedBeneficiaryForModal] = useState<Beneficiary | null>(null);

  // Generate map points from tasks and beneficiaries
  const mapPoints: MapPoint[] = mockTasks.map(task => {
    const beneficiary = mockBeneficiaries.find(b => b.id === task.beneficiaryId);
    if (!beneficiary || !beneficiary.location) return null;

    let mapStatus: 'delivered' | 'problem' | 'rescheduled' | 'pending' = 'pending';
    if (task.status === 'delivered') mapStatus = 'delivered';
    else if (task.status === 'failed') mapStatus = 'problem';
    else if (task.status === 'rescheduled') mapStatus = 'rescheduled';
    else mapStatus = 'pending';

    return {
      id: task.id,
      lat: beneficiary.location.lat,
      lng: beneficiary.location.lng,
      status: mapStatus,
      title: beneficiary.name,
      description: `${task.id} - ${mockPackages.find(p => p.id === task.packageId)?.name || 'طرد'}`,
      data: beneficiary
    };
  }).filter(Boolean) as MapPoint[];

  // Get unique values for filters
  const provinces = [...new Set(mockBeneficiaries.map(b => b.detailedAddress.governorate))];
  const cities = [...new Set(mockBeneficiaries
    .filter(b => provinceFilter === 'all' || b.detailedAddress.governorate === provinceFilter)
    .map(b => b.detailedAddress.city))];
  const districts = [...new Set(mockBeneficiaries
    .filter(b => 
      (provinceFilter === 'all' || b.detailedAddress.governorate === provinceFilter) &&
      (cityFilter === 'all' || b.detailedAddress.city === cityFilter)
    )
    .map(b => b.detailedAddress.district))];

  // Calculate statistics
  const deliveredCount = mockTasks.filter(t => t.status === 'delivered').length;
  const inPreparationCount = mockTasks.filter(t => t.status === 'pending').length;
  const inTransitCount = mockTasks.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
  const needsFollowUpCount = mockTasks.filter(t => t.status === 'failed' || t.status === 'rescheduled').length;

  const getIdentityColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter map points based on all filters
  const filteredMapPoints = mapPoints.filter(point => {
    const beneficiary = point.data;
    const task = mockTasks.find(t => t.beneficiaryId === beneficiary.id);
    const packageInfo = task ? mockPackages.find(p => p.id === task.packageId) : null;

    // Status filter
    if (statusFilter !== 'all' && point.status !== statusFilter) return false;
    
    // Type filter
    if (typeFilter !== 'all' && packageInfo?.type !== typeFilter) return false;
    
    // Geographic filters
    if (provinceFilter !== 'all' && beneficiary.detailedAddress.governorate !== provinceFilter) return false;
    if (cityFilter !== 'all' && beneficiary.detailedAddress.city !== cityFilter) return false;
    if (districtFilter !== 'all' && beneficiary.detailedAddress.district !== districtFilter) return false;
    
    // Date filter
    if (task) {
      const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
      if (taskDate < fromDate || taskDate > toDate) return false;
    }

    return true;
  });

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiaryForModal(beneficiary);
    setShowBeneficiaryDetailsModal(true);
  };

  const handleExportReport = () => {
    const reportData = {
      date: new Date().toISOString(),
      filters: {
        status: statusFilter,
        type: typeFilter,
        province: provinceFilter,
        city: cityFilter,
        district: districtFilter,
        fromDate,
        toDate
      },
      statistics: {
        delivered: deliveredCount,
        inPreparation: inPreparationCount,
        inTransit: inTransitCount,
        needsFollowUp: needsFollowUpCount,
        totalPoints: filteredMapPoints.length
      },
      points: filteredMapPoints.map(p => ({
        id: p.id,
        beneficiary: p.data.name,
        status: p.status,
        location: `${p.data.detailedAddress.governorate} - ${p.data.detailedAddress.city}`
      }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_الخريطة_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('تم تصدير تقرير الخريطة بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards - Updated to match screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">طرود تم توصيلها</p>
              <p className="text-3xl font-bold text-gray-900">1,247</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 ml-1" />
                +156 اليوم
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">طرود قيد التحضير</p>
              <p className="text-3xl font-bold text-gray-900">89</p>
              <p className="text-blue-600 text-sm mt-2 flex items-center">
                <Clock className="w-4 h-4 ml-1" />
                متوسط 24 ساعة
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">طرود في الطريق</p>
              <p className="text-3xl font-bold text-gray-900">1,247</p>
              <p className="text-orange-600 text-sm mt-2 flex items-center">
                <Truck className="w-4 h-4 ml-1" />
                متوسط 4 ساعات
              </p>
            </div>
            <div className="bg-orange-100 p-4 rounded-2xl">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">طرود لم يتم توصيلها</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertTriangle className="w-4 h-4 ml-1" />
                تحتاج إجراء فوري
              </p>
            </div>
            <div className="bg-red-100 p-4 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Geographical Area Selection */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">اختيار المنطقة الجغرافية</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setCityFilter('all');
                setDistrictFilter('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المحافظات</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدينة / المخيم</label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setDistrictFilter('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">اختر المحافظة أولاً</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحي / المنطقة</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">اختر المدينة أولاً</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">الخريطة التفاعلية - التتبع الجغرافي المباشر</h3>
            <p className="text-gray-600 text-sm mt-1">انقر على أي نقطة لعرض ملف المستفيد كاملاً مع سجل الطرود و إثبات التسليم</p>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={handleExportReport}
              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير التقرير
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </button>
          </div>
        </div>

        {/* Map Filters */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حالة التوصيل</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="delivered">تم التوصيل</option>
              <option value="problem">مشكلة في التسليم</option>
              <option value="rescheduled">معاد جدولتها</option>
              <option value="pending">في الانتظار</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع المساعدة</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="مواد غذائية">مواد غذائية</option>
              <option value="ملابس">ملابس</option>
              <option value="أدوية">أدوية</option>
              <option value="بطانيات">بطانيات</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">إلى التاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setProvinceFilter('all');
                setCityFilter('all');
                setDistrictFilter('all');
                setFromDate('2024-01-01');
                setToDate(new Date().toISOString().split('T')[0]);
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <GazaMap
            points={filteredMapPoints}
            onPointClick={handleViewDetails}
            activeFilter={statusFilter}
            className="w-full"
          />
          
          {/* Map Info Overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 z-10">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">معلومات الخريطة</h4>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>النقاط المعروضة:</span>
                <span className="font-medium">{filteredMapPoints.length}</span>
              </div>
              <div className="flex justify-between">
                <span>المنطقة:</span>
                <span className="font-medium">قطاع غزة</span>
              </div>
              <div className="flex justify-between">
                <span>آخر تحديث:</span>
                <span className="font-medium">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Statistics */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="font-medium text-green-800">تم التوصيل</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {filteredMapPoints.filter(p => p.status === 'delivered').length}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="font-medium text-red-800">فشل التسليم</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {filteredMapPoints.filter(p => p.status === 'problem').length}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="font-medium text-orange-800">في الانتظار</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">
              {filteredMapPoints.filter(p => p.status === 'rescheduled').length}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="font-medium text-blue-800">قيد التوصيل</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {filteredMapPoints.filter(p => p.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Beneficiary Details Modal */}
      {showBeneficiaryDetailsModal && selectedBeneficiaryForModal && (
        <BeneficiaryProfileModal
          beneficiary={selectedBeneficiaryForModal}
          onClose={() => {
            setShowBeneficiaryDetailsModal(false);
            setSelectedBeneficiaryForModal(null);
          }}
          onNavigateToIndividualSend={onNavigateToIndividualSend}
          onEditBeneficiary={(beneficiary) => {
            alert('لا يمكن التعديل من هذه الشاشة، يرجى الانتقال إلى قائمة المستفيدين');
          }}
        />
      )}
    </div>
  );
}