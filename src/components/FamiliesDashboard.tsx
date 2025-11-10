import React, { useState } from 'react';
import { Users, Package, Truck, Bell, BarChart3, Plus, Heart, Search, Filter, Eye, Edit, Phone, CheckCircle, Clock, AlertTriangle, MapPin, Star, Calendar, FileText, UserPlus, RefreshCw } from 'lucide-react';
import { 
  mockBeneficiaries, 
  mockPackages, 
  mockTasks, 
  mockAlerts,
  mockFamilies,
  getBeneficiariesByFamily,
  type Family,
  type Beneficiary,
  type Package as PackageType
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Badge, StatCard } from './ui';
import FamilyMemberForm from './FamilyMemberForm';
import { Modal } from './ui';

interface FamiliesDashboardProps {
  onNavigateBack: () => void;
}

export default function FamiliesDashboard({ onNavigateBack }: FamiliesDashboardProps) {
  const { loggedInUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalContent, setModalContent] = useState<string>('');

  const families: Family[] = mockFamilies;

  const currentFamily = loggedInUser.associatedId 
    ? families.find(family => family.id === loggedInUser.associatedId) || families[0]
    : families[0];
  const familyMembers = currentFamily ? getBeneficiariesByFamily(currentFamily.id) : [];
  const familyPackages = currentFamily ? mockPackages.filter(p => p.familyId === currentFamily.id) : [];
  const familyTasks = currentFamily ? mockTasks.filter(t => {
    const pkg = mockPackages.find(p => p.id === t.packageId);
    return pkg?.familyId === currentFamily.id;
  }) : [];

  const sidebarItems = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'beneficiaries', name: 'أفراد العائلة', icon: Users },
    { id: 'packages', name: 'الطرود', icon: Package },
    { id: 'tasks', name: 'متابعة التوزيع', icon: Clock },
    { id: 'alerts', name: 'التنبيهات', icon: Bell },
  ];

  const handleAddNew = (type: string) => {
    setModalType('add');
    setSelectedItem(null);
    setModalContent(type);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setModalType('edit');
    setSelectedItem(item);
    setModalContent('member');
    setShowModal(true);
  };

  const handleView = (item: any) => {
    setModalType('view');
    setSelectedItem(item);
    setModalContent('member');
    setShowModal(true);
  };

  const handleSaveMember = (memberData: Partial<Beneficiary>) => {
    if (modalType === 'add') {
      // محاكاة إضافة فرد جديد للعائلة
      const newMember: Beneficiary = {
        id: `member-${Date.now()}`,
        name: memberData.name || '',
        fullName: memberData.fullName || '',
        nationalId: memberData.nationalId || '',
        dateOfBirth: memberData.dateOfBirth || '',
        gender: memberData.gender || 'male',
        phone: memberData.phone || '',
        address: memberData.address || '',
        detailedAddress: memberData.detailedAddress || {
          governorate: '',
          city: '',
          district: '',
          street: '',
          additionalInfo: ''
        },
        location: memberData.location || { lat: 31.3469, lng: 34.3029 },
        familyId: currentFamily?.id,
        relationToFamily: memberData.relationToFamily,
        profession: memberData.profession || '',
        maritalStatus: memberData.maritalStatus || 'single',
        economicLevel: memberData.economicLevel || 'poor',
        membersCount: memberData.membersCount || 1,
        additionalDocuments: [],
        identityStatus: 'pending',
        status: 'active',
        eligibilityStatus: 'under_review',
        lastReceived: new Date().toISOString().split('T')[0],
        totalPackages: 0,
        notes: memberData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'family_admin',
        updatedBy: 'family_admin'
      };
      
      // إضافة الفرد الجديد للبيانات الوهمية
      mockBeneficiaries.unshift(newMember);
      
      alert(`تم إضافة ${memberData.name} بنجاح كفرد جديد في العائلة`);
    } else if (modalType === 'edit' && selectedItem) {
      // محاكاة تحديث بيانات فرد العائلة
      const memberIndex = mockBeneficiaries.findIndex(b => b.id === selectedItem.id);
      if (memberIndex !== -1) {
        mockBeneficiaries[memberIndex] = {
          ...mockBeneficiaries[memberIndex],
          ...memberData,
          updatedAt: new Date().toISOString(),
          updatedBy: 'family_admin'
        };
        alert(`تم تحديث بيانات ${memberData.name} بنجاح`);
      }
    }
    
    // إغلاق النافذة المنبثقة وإعادة تعيين الحالة
    setShowModal(false);
    setSelectedItem(null);
    setModalContent('');
  };

  const handleCancelMember = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalContent('');
  };

  const handleUpdateData = () => {
    alert('تم تحديث بيانات العائلة بنجاح');
  };

  const handleExportReport = () => {
    alert('تم تصدير تقرير العائلة بنجاح');
  };

  const handleCall = (phone: string) => {
    if (confirm(`هل تريد الاتصال بالرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  };

  const handleFollowUp = (alertType: string) => {
    switch (alertType) {
      case 'delayed':
        alert('تم التواصل مع المندوب لمتابعة الطرد المتأخر');
        break;
      case 'ready':
        alert('تم إرسال الطرد للمندوب');
        break;
    }
  };

  const filteredMembers = familyMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nationalId.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50/30 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">لوحة العائلات</h1>
              <p className="text-sm text-gray-500">
                {currentFamily?.name || 'غير محدد'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 border-l-2 border-purple-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-purple-600' : ''}`} />
                    <span>{item.name}</span>
                  </button>
              );
            })}
        </nav>

        {/* Family Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-800 mb-2">معلومات العائلة</div>
            {currentFamily ? (
              <div className="space-y-1 text-xs text-purple-700">
                <div className="flex justify-between">
                  <span>أفراد العائلة:</span>
                  <span className="font-medium">{currentFamily.membersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>الطرود الموزعة:</span>
                  <span className="font-medium">{currentFamily.packagesDistributed}</span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة الإنجاز:</span>
                  <span className="font-medium">{currentFamily.completionRate}%</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-purple-700 text-center">
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentFamily?.name || 'غير محدد'}
                  </h2>
                  <p className="text-gray-600 mt-1">إدارة أفراد العائلة والمساعدات</p>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <Button variant="secondary">
                    تحديث البيانات
                  </Button>
                  <Button variant="primary" icon={FileText} iconPosition="right">
                    تقرير العائلة
                  </Button>
                </div>
              </div>

              {/* Welcome Card */}
              {currentFamily && (
                <Card className="bg-purple-600 text-white border-purple-700">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">مرحباً بعائلة {currentFamily.name.split(' ')[2] || currentFamily.name}</h2>
                      <p className="text-purple-100">نشكرك على مساعدتك في دعم المحتاجين من أفراد عائلتك</p>
                      <p className="text-purple-200 text-sm mt-1">رب الأسرة: {currentFamily.headOfFamily}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="أفراد العائلة"
                  value={currentFamily?.membersCount || 0}
                  icon={Users}
                  trend={{
                    value: 'جميعهم مسجلون',
                    direction: 'up',
                    label: ''
                  }}
                  color="purple"
                />

                <StatCard
                  title="الطرود المقدمة"
                  value={currentFamily?.packagesDistributed || 0}
                  icon={Package}
                  trend={{
                    value: '+5 هذا الشهر',
                    direction: 'up',
                    label: ''
                  }}
                  color="blue"
                />

                <StatCard
                  title="الطرود الموزعة"
                  value={currentFamily ? Math.floor(currentFamily.packagesDistributed * currentFamily.completionRate / 100) : 0}
                  icon={Truck}
                  trend={{
                    value: `نسبة التوزيع ${currentFamily?.completionRate || 0}%`,
                    direction: 'up',
                    label: ''
                  }}
                  color="green"
                />

                <StatCard
                  title="الطرود المعلقة"
                  value={currentFamily ? currentFamily.packagesDistributed - Math.floor(currentFamily.packagesDistributed * currentFamily.completionRate / 100) : 0}
                  icon={Bell}
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
                  <div className="flex items-center space-x-4 space-x-reverse mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">إضافة فرد للعائلة</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">أضف فرد جديد من العائلة لقائمة المستفيدين</p>
                  <Button
                    variant="primary"
                    icon={Plus}
                    iconPosition="right"
                    onClick={() => handleAddNew('member')}
                    className="w-full"
                  >
                    إضافة فرد جديد
                  </Button>
                </Card>

                <Card hover>
                  <div className="flex items-center space-x-4 space-x-reverse mb-4">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">تحديد طرد للتوزيع</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">حدد الطرود المراد توزيعها على أفراد العائلة</p>
                  <Button
                    variant="success"
                    icon={Plus}
                    iconPosition="right"
                    onClick={() => handleAddNew('package')}
                    className="w-full"
                  >
                    تحديد طرد
                  </Button>
                </Card>
              </div>

              {/* Recent Activities and Family Map */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر الأنشطة</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تم تسليم طرد مواد غذائية لخالد الغزاوي</p>
                        <p className="text-xs text-gray-500 mt-1">منذ ساعتين</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تحديث بيانات أحمد الغزاوي</p>
                        <p className="text-xs text-gray-500 mt-1">أمس</p>
                        <p className="text-xs text-blue-600 mt-1">تم تحديث العنوان</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 space-x-reverse p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">إضافة طرد ملابس شتوية للعائلة</p>
                        <p className="text-xs text-gray-500 mt-1">منذ يومين</p>
                        <p className="text-xs text-purple-600 mt-1">جاهز للتوزيع</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 space-x-reverse p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">تنبيه: طرد فاطمة الغزاوي متأخر</p>
                        <p className="text-xs text-gray-500 mt-1">منذ 3 أيام</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    عرض جميع الأنشطة
                  </Button>
                </Card>

                {/* Family Distribution Map */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">خريطة أفراد العائلة</h3>
                  <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center relative">
                    <div className="text-center z-10">
                      <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">مواقع أفراد العائلة</p>
                      <p className="text-sm text-gray-500 mt-2">{currentFamily?.membersCount || 0} فرد في مناطق مختلفة</p>
                    </div>
                    <div className="absolute top-16 left-16 w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="absolute top-24 right-20 w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="absolute bottom-16 left-24 w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="absolute bottom-24 right-16 w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </Card>
              </div>

              {/* Alerts */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">التنبيهات</h3>
                  <Badge variant="warning">2 تنبيه</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">طرد متأخر</p>
                        <p className="text-xs text-gray-600 mt-1">طرد فاطمة الغزاوي لم يتم استلامه</p>
                      </div>
                    </div>
                    <Button variant="warning" size="sm">
                      متابعة
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">طرد جاهز للتوزيع</p>
                        <p className="text-xs text-gray-600 mt-1">طرد محمد الغزاوي جاهز للإرسال</p>
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

          {/* Family Members Tab */}
          {activeTab === 'beneficiaries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">أفراد العائلة المستفيدين</h2>
                  <p className="text-gray-600 mt-1">إدارة مستفيدي {currentFamily?.name || 'العائلة'}</p>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <button 
                    onClick={() => handleAddNew('member')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center shadow-lg"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فرد جديد
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      icon={Search}
                      iconPosition="right"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Button variant="secondary" icon={Filter} iconPosition="right" size="sm">
                    فلترة
                  </Button>
                </div>
              </div>

              {/* Family Members Table */}
              {currentFamily ? (
                <Card padding="none" className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          صلة القرابة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          رقم الهاتف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          آخر استلام
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center ml-3">
                                  {member.isHeadOfFamily ? (
                                    <Crown className="w-4 h-4 text-blue-600" />
                                  ) : member.relationToFamily === 'زوجة' ? (
                                    <Heart className="w-4 h-4 text-pink-600" />
                                  ) : (
                                    <Users className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                                    {member.isHeadOfFamily && (
                                      <Badge variant="info" size="sm">رب الأسرة</Badge>
                                    )}
                                    {member.medicalConditions.length > 0 && (
                                      <Badge variant="warning" size="sm">
                                        {member.medicalConditions.length} حالة مرضية
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{member.address.split(' - ')[1]}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.isHeadOfFamily ? 'رب الأسرة' : 
                               member.relationToFamily || 'فرد من العائلة'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(member.lastReceived).toLocaleDateString('en-CA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={
                                  member.status === 'active' ? 'success' :
                                  member.status === 'pending' ? 'warning' : 'error'
                                }
                                size="sm"
                              >
                                {member.status === 'active' ? 'تم التسليم' : 
                                 member.status === 'pending' ? 'لم يتم الاستلام' : 'معلق'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2 space-x-reverse">
                                <button 
                                  onClick={() => handleView(member)}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                                  title="عرض السجل"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEdit(member)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleCall(member.phone)}
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
                              <p className="text-sm mt-2">لم يتم إضافة أي أفراد لهذه العائلة بعد</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>
              ) : (
                <Card className="bg-gray-50 p-8">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm mt-2">يرجى إضافة عائلة أولاً لعرض الأعضاء</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Other tabs */}
          {['packages', 'tasks', 'alerts'].includes(activeTab) && (
            <Card className="p-8">
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  {activeTab === 'packages' && <Package className="w-8 h-8 mx-auto mb-3" />}
                  {activeTab === 'tasks' && <Clock className="w-8 h-8 mx-auto mb-3" />}
                  {activeTab === 'alerts' && <Bell className="w-8 h-8 mx-auto mb-3" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  قسم {
                    activeTab === 'packages' ? 'الطرود' :
                    activeTab === 'tasks' ? 'متابعة التوزيع' :
                    activeTab === 'alerts' ? 'التنبيهات' : ''
                  }
                </h3>
                <p className="text-gray-600 mb-4">هذا القسم قيد التطوير - سيتم إضافة التفاصيل الكاملة قريباً</p>
                <Button variant="primary">
                  عرض التفاصيل
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit/View Family Members */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add' && modalContent === 'member' ? 'إضافة فرد جديد للعائلة' :
            modalType === 'edit' && modalContent === 'member' ? 'تعديل بيانات فرد العائلة' :
            modalType === 'view' && modalContent === 'member' ? 'عرض تفاصيل فرد العائلة' :
            modalType === 'add' && modalContent === 'package' ? 'تحديد طرد للتوزيع' :
            'إجراء'
          }
          size="lg"
        >
          {/* Family Member Form */}
          {modalContent === 'member' && (modalType === 'add' || modalType === 'edit') && currentFamily && (
            <FamilyMemberForm
              familyId={currentFamily.id}
              member={modalType === 'edit' ? selectedItem : null}
              onSave={handleSaveMember}
              onCancel={handleCancelMember}
            />
          )}

          {/* View Family Member Details */}
          {modalContent === 'member' && modalType === 'view' && selectedItem && (
            <div className="p-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 mb-6">
                <h4 className="text-lg font-bold text-purple-800 mb-4">تفاصيل فرد العائلة</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">الاسم الكامل:</span>
                      <span className="font-medium text-purple-900">{selectedItem.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">رقم الهوية:</span>
                      <span className="font-medium text-purple-900">{selectedItem.nationalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">رقم الهاتف:</span>
                      <span className="font-medium text-purple-900">{selectedItem.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">صلة القرابة:</span>
                      <span className="font-medium text-purple-900">{selectedItem.relationToFamily || 'فرد من العائلة'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">المهنة:</span>
                      <span className="font-medium text-purple-900">{selectedItem.profession}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">الحالة الاجتماعية:</span>
                      <span className="font-medium text-purple-900">
                        {selectedItem.maritalStatus === 'single' ? 'أعزب' :
                         selectedItem.maritalStatus === 'married' ? 'متزوج' :
                         selectedItem.maritalStatus === 'divorced' ? 'مطلق' : 'أرمل'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">عدد الأفراد المعالين:</span>
                      <span className="font-medium text-purple-900">{selectedItem.membersCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">آخر استلام:</span>
                      <span className="font-medium text-purple-900">
                        {new Date(selectedItem.lastReceived).toLocaleDateString('en-CA')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedItem.notes && (
                  <div className="mt-4">
                    <span className="text-purple-700 text-sm">ملاحظات:</span>
                    <p className="text-purple-900 mt-1 text-sm">{selectedItem.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 space-x-reverse justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  إغلاق
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setModalType('edit');
                    // لا نحتاج لتغيير selectedItem لأنه نفس الفرد
                  }}
                >
                  تعديل البيانات
                </Button>
              </div>
            </div>
          )}

          {/* Package Assignment (placeholder for now) */}
          {modalContent === 'package' && (
            <div className="p-6 text-center">
              <div className="bg-gray-100 rounded-xl p-8 mb-4">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">نموذج تحديد طرد للتوزيع</p>
                <p className="text-sm text-gray-500 mt-2">سيتم تطوير هذا النموذج في المرحلة التالية</p>
              </div>
              
              <div className="flex space-x-3 space-x-reverse justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </Button>
                <Button variant="primary">
                  تحديد الطرد
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}