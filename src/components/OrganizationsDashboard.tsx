import React, { useState } from 'react';
import { Users, Package, Truck, Bell, BarChart3, Plus, Building2, Search, Filter, Eye, Edit, Phone, Mail, CheckCircle, Clock, AlertTriangle, MapPin, Star, Calendar, FileText, UserPlus, RefreshCw, Download, TrendingUp, Activity, Heart } from 'lucide-react';
import { // Removed Shield
  mockBeneficiaries, 
  mockPackages, 
  mockTasks, 
  mockAlerts,
  mockOrganizations,
  getBeneficiariesByOrganization,
  type Organization,
  type Beneficiary,
  type Package as PackageType
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Badge, StatCard } from './ui';

interface OrganizationsDashboardProps {
  onNavigateBack: () => void;
}

export default function OrganizationsDashboard({ onNavigateBack }: OrganizationsDashboardProps) {
  const { loggedInUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const currentOrganization = loggedInUser.associatedId 
    ? mockOrganizations.find(org => org.id === loggedInUser.associatedId) || mockOrganizations[0]
    : mockOrganizations[0];
  
  const organizationBeneficiaries = currentOrganization ? getBeneficiariesByOrganization(currentOrganization.id) : [];
  const organizationPackages = currentOrganization ? mockPackages.filter(p => p.organizationId === currentOrganization.id) : [];
  const organizationTasks = currentOrganization ? mockTasks.filter(t => {
    const pkg = mockPackages.find(p => p.id === t.packageId);
    return pkg?.organizationId === currentOrganization.id;
  }) : [];

  const sidebarItems = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'beneficiaries', name: 'المستفيدين', icon: Users },
    { id: 'packages', name: 'الطرود', icon: Package },
    { id: 'tasks', name: 'المهام', icon: Truck },
    { id: 'reports', name: 'التقارير', icon: FileText },
  ];

  const handleAddNew = (type: string) => {
    setModalType('add');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalType('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleView = (item: any) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const filteredBeneficiaries = organizationBeneficiaries.filter(ben => 
    ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ben.nationalId.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/30 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">لوحة المؤسسة</h1>
              <p className="text-sm text-gray-500">{currentOrganization?.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 border-l-2 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-green-600' : ''}`} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Organization Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm font-medium text-green-800 mb-2">معلومات المؤسسة</div>
            {currentOrganization ? (
              <div className="space-y-1 text-xs text-green-700">
                <div className="flex justify-between">
                  <span>المستفيدين:</span>
                  <span className="font-medium">{currentOrganization.beneficiariesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>الطرود:</span>
                  <span className="font-medium">{currentOrganization.packagesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة الإنجاز:</span>
                  <span className="font-medium">{currentOrganization.completionRate}%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-green-700 text-center">
                <p>لا توجد بيانات متاحة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    نظرة عامة - {currentOrganization?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">إدارة المستفيدين والطرود</p>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <Button variant="secondary" icon={Download} iconPosition="right">
                    تصدير
                  </Button>
                  <Button variant="success" icon={RefreshCw} iconPosition="right">
                    تحديث
                  </Button>
                </div>
              </div>

              {/* Welcome Card */}
              {currentOrganization && (
                <Card>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">مرحباً بمؤسسة {currentOrganization.name}</h3>
                      <p className="text-gray-600">نشكرك على جهودك في دعم المحتاجين في غزة</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="المستفيدين"
                  value={currentOrganization?.beneficiariesCount || 0}
                  icon={Users}
                  trend={{
                    value: '+12 هذا الشهر',
                    direction: 'up',
                    label: ''
                  }}
                  color="blue"
                />

                <StatCard
                  title="الطرود"
                  value={currentOrganization?.packagesCount || 0}
                  icon={Package}
                  trend={{
                    value: '+5 اليوم',
                    direction: 'up',
                    label: ''
                  }}
                  color="green"
                />

                <StatCard
                  title="نسبة الإنجاز"
                  value={`${currentOrganization?.completionRate || 0}%`}
                  icon={BarChart3}
                  trend={{
                    value: 'ممتاز',
                    direction: 'up',
                    label: ''
                  }}
                  color="purple"
                />

                <StatCard
                  title="المهام النشطة"
                  value={organizationTasks.length}
                  icon={Truck}
                  trend={{
                    value: 'تحتاج متابعة',
                    direction: 'down',
                    label: ''
                  }}
                  color="orange"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card hover>
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">إضافة مستفيد</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">أضف مستفيد جديد للمؤسسة</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddNew('beneficiary')}
                    className="w-full"
                  >
                    إضافة مستفيد
                  </Button>
                </Card>

                <Card hover>
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">إنشاء طرد</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">إنشاء طرد جديد للتوزيع</p>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAddNew('package')}
                    className="w-full"
                  >
                    إنشاء طرد
                  </Button>
                </Card>
              </div>

              {/* Recent Activities and Distribution Map */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر الأنشطة</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 space-x-reverse p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تم تسليم طرد مواد غذائية</p>
                        <p className="text-xs text-gray-500 mt-1">منذ 5 دقائق</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 space-x-reverse p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <UserPlus className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">إضافة مستفيد جديد</p>
                        <p className="text-xs text-gray-500 mt-1">منذ 15 دقيقة</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 space-x-reverse p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تحديث عنوان مستفيد</p>
                        <p className="text-xs text-gray-500 mt-1">منذ 30 دقيقة</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    عرض جميع الأنشطة
                  </Button>
                </Card>

                {/* Distribution Map */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">خريطة التوزيع</h3>
                  <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center relative">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">مناطق التوزيع</p>
                      <p className="text-xs text-gray-500 mt-1">{organizationBeneficiaries.length} مستفيد</p>
                    </div>
                    <div className="absolute top-12 left-16 w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="absolute top-20 right-20 w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="absolute bottom-16 left-24 w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="absolute bottom-24 right-16 w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </Card>
              </div>

              {/* Alerts */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">التنبيهات</h3>
                  <Badge variant="warning">2 تنبيه</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">طرد متأخر</p>
                        <p className="text-xs text-gray-600">لم يتم استلامه</p>
                      </div>
                    </div>
                    <Button variant="warning" size="sm">
                      متابعة
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">طرد جاهز</p>
                        <p className="text-xs text-gray-600">جاهز للإرسال</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      إرسال
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Beneficiaries Tab */}
          {activeTab === 'beneficiaries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">مستفيدي المؤسسة</h2>
                  <p className="text-gray-600 mt-1">إدارة مستفيدي {currentOrganization?.name}</p>
                </div>
                <Button
                  variant="primary"
                  icon={Plus}
                  iconPosition="right"
                  onClick={() => handleAddNew('beneficiary')}
                >
                  إضافة مستفيد
                </Button>
              </div>

              {/* Search */}
              <Card padding="sm">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Input
                    type="text"
                    icon={Search}
                    iconPosition="right"
                      placeholder="البحث في المستفيدين..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="secondary" icon={Filter} iconPosition="right" size="sm">
                    فلترة
                  </Button>
                </div>
              </Card>

              {/* Beneficiaries Table */}
              {currentOrganization ? (
                <Card padding="none" className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستفيد</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهوية</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر استلام</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {organizationBeneficiaries.length > 0 ? (
                          organizationBeneficiaries.map((beneficiary) => (
                            <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center ml-3">
                                    <Users className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{beneficiary.name}</div>
                                    <div className="text-xs text-gray-500">{beneficiary.detailedAddress?.city}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{beneficiary.nationalId}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{beneficiary.phone}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {new Date(beneficiary.lastReceived).toLocaleDateString('en-CA')}
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant={
                                    beneficiary.status === 'active' ? 'success' :
                                    beneficiary.status === 'pending' ? 'warning' : 'error'
                                  }
                                  size="sm"
                                >
                                  {beneficiary.status === 'active' ? 'نشط' : 
                                   beneficiary.status === 'pending' ? 'معلق' : 'متوقف'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-1 space-x-reverse">
                                  <button 
                                    onClick={() => handleView(beneficiary)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                    title="عرض"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleEdit(beneficiary)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                    title="تعديل"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                                    title="اتصال"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="text-gray-500">
                                <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">لا توجد مستفيدين</p>
                                <p className="text-sm mt-1">لم يتم إضافة أي مستفيدين لهذه المؤسسة بعد</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="bg-gray-50 p-12">
                  <div className="text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">لا توجد مؤسسة محددة</p>
                    <p className="text-sm mt-2">يرجى تحديد مؤسسة لعرض المستفيدين</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Other tabs */}
          {['packages', 'tasks', 'reports'].includes(activeTab) && (
            <Card className="p-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'packages' && <Package className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'tasks' && <Truck className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'reports' && <FileText className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  قسم {
                    activeTab === 'packages' ? 'الطرود' :
                    activeTab === 'tasks' ? 'المهام' :
                    activeTab === 'reports' ? 'التقارير' : ''
                  }
                </h3>
                <p className="text-gray-600 mb-6">هذا القسم قيد التطوير</p>
                <Button variant="success">
                  ابدأ التطوير
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}