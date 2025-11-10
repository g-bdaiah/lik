import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, Package, CheckCircle, Clock, AlertTriangle, Star, Award, MapPin, Activity, PieChart, LineChart, Truck } from 'lucide-react';
import { mockTasks, mockBeneficiaries, mockPackages, mockCouriers, calculateStats } from '../../data/mockData';

export default function DistributionReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const stats = calculateStats();

  const reportTypes = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'delivery', name: 'تقرير التسليم', icon: CheckCircle },
    { id: 'performance', name: 'تقرير الأداء', icon: TrendingUp },
    { id: 'beneficiaries', name: 'تقرير المستفيدين', icon: Users },
    { id: 'geographical', name: 'التوزيع الجغرافي', icon: MapPin },
  ];

  const regions = [
    { id: 'all', name: 'جميع المناطق', count: 1502 },
    { id: 'north', name: 'شمال غزة', count: 387 },
    { id: 'gaza', name: 'مدينة غزة', count: 456 },
    { id: 'middle', name: 'الوسط', count: 234 },
    { id: 'khan-younis', name: 'خان يونس', count: 298 },
    { id: 'rafah', name: 'رفح', count: 127 }
  ];

  const topCouriers = [
    { name: 'خالد أحمد', delivered: 247, successRate: 98.5, rating: 4.9 },
    { name: 'محمد سعيد', delivered: 234, successRate: 96.2, rating: 4.8 },
    { name: 'أحمد علي', delivered: 189, successRate: 94.8, rating: 4.7 },
    { name: 'يوسف حسام', delivered: 156, successRate: 93.1, rating: 4.6 },
    { name: 'سامي محمد', delivered: 134, successRate: 91.5, rating: 4.5 }
  ];

  const packageTypeDistribution = [
    { type: 'طرود غذائية', count: 987, percentage: 65, color: 'bg-orange-500' },
    { type: 'طرود طبية', count: 304, percentage: 20, color: 'bg-red-500' },
    { type: 'ملابس', count: 152, percentage: 10, color: 'bg-purple-500' },
    { type: 'بطانيات', count: 76, percentage: 5, color: 'bg-blue-500' }
  ];

  const monthlyTrends = [
    { month: 'يناير', delivered: 1247, failed: 45, pending: 89 },
    { month: 'فبراير', delivered: 1356, failed: 32, pending: 67 },
    { month: 'مارس', delivered: 1489, failed: 28, pending: 78 },
    { month: 'أبريل', delivered: 1567, failed: 23, pending: 56 },
    { month: 'مايو', delivered: 1634, failed: 19, pending: 45 }
  ];

  const handleExportReport = () => {
    const reportData = {
      type: reportType,
      dateRange,
      region: selectedRegion,
      generatedAt: new Date().toISOString(),
      stats,
      details: {
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(t => t.status === 'delivered').length,
        pendingTasks: mockTasks.filter(t => t.status === 'pending').length,
        failedTasks: mockTasks.filter(t => t.status === 'failed').length,
        topCouriers,
        packageDistribution: packageTypeDistribution,
        monthlyTrends
      }
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_التوزيع_${reportType}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('تم تصدير التقرير بنجاح');
  };

  const getRegionData = (regionId: string) => {
    return regions.find(r => r.id === regionId) || regions[0];
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">إعدادات التقرير</h3>
          <button 
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </button>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">هذا الربع</option>
              <option value="year">هذا العام</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تصفية إضافية</label>
            <button className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 ml-2" />
              فلاتر متقدمة
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">معدل التسليم</p>
              <p className="text-3xl font-bold text-gray-900">{stats.deliveryRate}%</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <TrendingUp className="w-4 h-4 ml-1" />
                +5% من الشهر الماضي
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">متوسط وقت التسليم</p>
              <p className="text-3xl font-bold text-gray-900">2.3</p>
              <p className="text-blue-600 text-sm mt-2">ساعة</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">رضا المستفيدين</p>
              <p className="text-3xl font-bold text-gray-900">4.7</p>
              <p className="text-yellow-600 text-sm mt-2 flex items-center">
                <Star className="w-4 h-4 ml-1" />
                من 5 نجوم
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-2xl">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">التكلفة لكل طرد</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
              <p className="text-purple-600 text-sm mt-2">شيكل</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-2xl">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <LineChart className="w-6 h-6 ml-2 text-blue-600" />
              اتجاهات التسليم الشهرية
            </h3>
            <div className="text-sm text-gray-600">آخر 5 أشهر</div>
          </div>
          
          <div className="space-y-4">
            {monthlyTrends.map((month, index) => {
              const total = month.delivered + month.failed + month.pending;
              const successRate = ((month.delivered / total) * 100).toFixed(1);
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{month.month}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{month.delivered}</span>
                      <span className="text-sm text-gray-600 mr-1">طرد</span>
                      <div className="text-xs text-green-600">{successRate}% نجاح</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(month.delivered / total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${(month.pending / total) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(month.failed / total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>تم التسليم: {month.delivered}</span>
                    <span>معلق: {month.pending}</span>
                    <span>فشل: {month.failed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Package Types Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <PieChart className="w-6 h-6 ml-2 text-purple-600" />
              توزيع أنواع الطرود
            </h3>
            <div className="text-sm text-gray-600">إجمالي: {packageTypeDistribution.reduce((sum, item) => sum + item.count, 0)}</div>
          </div>
          
          <div className="space-y-4">
            {packageTypeDistribution.map((item, index) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="font-medium text-gray-900">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{item.count}</span>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-6 h-6 ml-2 text-green-600" />
            الأداء حسب المناطق
          </h3>
          <div className="text-sm text-gray-600">إجمالي الطرود الموزعة</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.filter(r => r.id !== 'all').map((region) => {
            const successRate = 75 + Math.random() * 20; // Mock success rate
            const avgTime = 2 + Math.random() * 2; // Mock average time
            
            return (
              <div key={region.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{region.name}</h4>
                  <span className="text-lg font-bold text-blue-600">{region.count}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">معدل النجاح:</span>
                    <span className={`font-medium ${successRate > 80 ? 'text-green-600' : successRate > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${successRate > 80 ? 'bg-green-500' : successRate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${successRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">متوسط الوقت:</span>
                    <span className="font-medium text-gray-900">{avgTime.toFixed(1)} ساعة</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Couriers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Award className="w-6 h-6 ml-2 text-yellow-600" />
              أفضل المندوبين
            </h3>
            <div className="text-sm text-gray-600">هذا الشهر</div>
          </div>
          
          <div className="space-y-4">
            {topCouriers.map((courier, index) => (
              <div key={courier.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{courier.name}</p>
                    <p className="text-sm text-gray-600">{courier.delivered} طرد موزع</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 space-x-reverse mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{courier.rating}</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">{courier.successRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 ml-2 text-purple-600" />
              رؤى الأداء
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Strengths */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                نقاط القوة
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span>معدل تسليم عالي في منطقة خان يونس (75%)</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span>تحسن في أوقات التسليم بنسبة 15%</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span>رضا عالي من المستفيدين (4.7/5)</span>
                </div>
              </div>
            </div>
            
            {/* Areas for Improvement */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 ml-2 text-orange-600" />
                نقاط التحسين
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تحسين التوصيل في منطقة رفح (40%)</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تقليل حالات فشل التسليم</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تحديث قاعدة بيانات العناوين</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 ml-2 text-blue-600" />
          إحصائيات مفصلة
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="font-medium text-green-800 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 ml-2" />
              الطرود المسلمة بنجاح
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">مواد غذائية:</span>
                <span className="font-medium text-green-900">987 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">ملابس:</span>
                <span className="font-medium text-green-900">152 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">أدوية:</span>
                <span className="font-medium text-green-900">304 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">بطانيات:</span>
                <span className="font-medium text-green-900">76 طرد</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 ml-2" />
              الطرود المعلقة
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-yellow-700">في الانتظار:</span>
                <span className="font-medium text-yellow-900">89 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">قيد التوصيل:</span>
                <span className="font-medium text-yellow-900">45 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">تم إعادة الجدولة:</span>
                <span className="font-medium text-yellow-900">23 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">قيد التحضير:</span>
                <span className="font-medium text-yellow-900">67 طرد</span>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h4 className="font-medium text-red-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 ml-2" />
              المشاكل والتحديات
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-red-700">فشل التسليم:</span>
                <span className="font-medium text-red-900">12 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">عناوين خاطئة:</span>
                <span className="font-medium text-red-900">8 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">عدم توفر المستفيد:</span>
                <span className="font-medium text-red-900">4 طرد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">مشاكل أمنية:</span>
                <span className="font-medium text-red-900">2 طرد</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-based Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Clock className="w-6 h-6 ml-2 text-blue-600" />
          تحليل الأوقات والكفاءة
        </h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-xl mb-3">
              <Clock className="w-8 h-8 text-blue-600 mx-auto" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">متوسط وقت التحضير</h4>
            <p className="text-2xl font-bold text-blue-600">1.2</p>
            <p className="text-sm text-gray-600">ساعة</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-xl mb-3">
              <Truck className="w-8 h-8 text-green-600 mx-auto" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">متوسط وقت التوصيل</h4>
            <p className="text-2xl font-bold text-green-600">2.3</p>
            <p className="text-sm text-gray-600">ساعة</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-xl mb-3">
              <Activity className="w-8 h-8 text-purple-600 mx-auto" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">أفضل وقت للتوصيل</h4>
            <p className="text-2xl font-bold text-purple-600">10-14</p>
            <p className="text-sm text-gray-600">صباحاً</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 p-4 rounded-xl mb-3">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">أفضل يوم للتوصيل</h4>
            <p className="text-2xl font-bold text-orange-600">الأحد</p>
            <p className="text-sm text-gray-600">أعلى معدل نجاح</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 ml-2 text-blue-600" />
          توصيات لتحسين الأداء
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800">توصيات فورية:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>زيادة عدد المندوبين في منطقة رفح لتحسين معدل التسليم</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>تحديث قاعدة بيانات العناوين لتقليل حالات العناوين الخاطئة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>تدريب المندوبين على التعامل مع الحالات الصعبة</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-green-800">توصيات طويلة المدى:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>تطوير تطبيق جوال للمندوبين لتحسين التتبع</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>إنشاء نظام تقييم المستفيدين للخدمة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>تطوير شراكات مع مؤسسات محلية لتحسين التغطية</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}