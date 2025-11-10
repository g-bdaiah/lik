import React, { useState } from 'react';
import { ArrowRight, Users, Search, Filter, Plus, Eye, Edit, Phone, MessageSquare, CheckCircle, Clock, AlertTriangle, Star, UserCheck, MapPin, Calendar, FileText, Download, UserPlus } from 'lucide-react';
import { 
  mockBeneficiaries, 
  mockPackages, 
  mockTasks,
  type Beneficiary,
  type Package as PackageType,
  type Task
} from '../data/mockData';
import BeneficiaryDetailsModal from './BeneficiaryDetailsModal';

interface BeneficiariesManagementProps {
  initialTab?: string;
}

export default function BeneficiariesManagement({ initialTab = 'list' }: BeneficiariesManagementProps) {
  const activeTab = initialTab === 'beneficiaries-list' ? 'list' : 
                   initialTab === 'beneficiaries' ? 'list' : 
                   initialTab.replace('beneficiaries-', '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'message'>('add');

  const tabs = [
    { id: 'list', name: 'قائمة المستفيدين', icon: Users },
    { id: 'status-management', name: 'إدارة الحالات', icon: UserCheck },
    { id: 'delayed', name: 'المتأخرين', icon: Clock },
    { id: 'activity-log', name: 'سجل النشاط', icon: FileText },
  ];

  const handleViewBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDetailsModal(true);
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSendMessage = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalType('message');
    setShowModal(true);
  };

  const handleCall = (phone: string) => {
    if (confirm(`هل تريد الاتصال بالرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  };

  const filteredBeneficiaries = mockBeneficiaries.filter(ben => 
    ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ben.nationalId.includes(searchTerm) ||
    ben.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdentityColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المستفيدين</h1>
              <p className="text-gray-600 mt-1">إدارة شاملة لجميع المستفيدين في النظام</p>
            </div>
          </div>
        </div>

        {/* Beneficiaries List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">قائمة المستفيدين</h2>
                <p className="text-gray-600 mt-1">إدارة جميع المستفيدين المسجلين في النظام</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير القائمة
                </button>
                <button 
                  onClick={() => {
                    setModalType('add');
                    setSelectedBeneficiary(null);
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مستفيد جديد
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المستفيدين (الاسم، رقم الهوية، الهاتف)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 space-x-reverse px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 ml-2" />
                  <span>فلترة متقدمة</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المستفيدين</p>
                    <p className="text-3xl font-bold text-gray-900">{mockBeneficiaries.length}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-2xl">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">موثقين</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockBeneficiaries.filter(b => b.identityStatus === 'verified').length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-2xl">
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">بانتظار التوثيق</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockBeneficiaries.filter(b => b.identityStatus === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-2xl">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">مرفوض التوثيق</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {mockBeneficiaries.filter(b => b.identityStatus === 'rejected').length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficiaries Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">قائمة المستفيدين ({filteredBeneficiaries.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستفيد
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الهوية
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الهاتف
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المنطقة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        آخر استلام
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBeneficiaries.map((beneficiary) => (
                      <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-xl ml-4">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-sm font-medium text-gray-900">{beneficiary.name}</span>
                                {beneficiary.identityStatus === 'verified' && (
                                  <Star className="w-4 h-4 text-green-600" title="موثق" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{beneficiary.detailedAddress.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beneficiary.nationalId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beneficiary.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beneficiary.detailedAddress.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getIdentityColor(beneficiary.identityStatus)}`}>
                              {beneficiary.identityStatus === 'verified' ? 'موثق' :
                               beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(beneficiary.status)}`}>
                              {beneficiary.status === 'active' ? 'نشط' :
                               beneficiary.status === 'pending' ? 'معلق' : 'متوقف'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(beneficiary.lastReceived).toLocaleDateString('en-CA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button 
                              onClick={() => handleViewBeneficiary(beneficiary)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditBeneficiary(beneficiary)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleSendMessage(beneficiary)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                              title="إرسال رسالة"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCall(beneficiary.phone)}
                              className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                              title="اتصال"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Status Management Tab */}
        {activeTab === 'status-management' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">إدارة حالات المستفيدين</h2>
                <p className="text-gray-600 mt-1">تصنيف وإدارة حالات الأهلية للمستفيدين</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
                  تحديث الحالات
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  تصدير التقرير
                </button>
              </div>
            </div>

            {/* Status Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {mockBeneficiaries.filter(b => b.eligibilityStatus === 'eligible').length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">مؤهلين</h3>
                <p className="text-sm text-gray-600 mb-4">مستفيد مؤهل</p>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  عرض القائمة
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <span className="text-3xl font-bold text-yellow-600">
                    {mockBeneficiaries.filter(b => b.eligibilityStatus === 'under_review').length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">تحت المراجعة</h3>
                <p className="text-sm text-gray-600 mb-4">تحت المراجعة</p>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                  مراجعة الطلبات
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <span className="text-3xl font-bold text-red-600">
                    {mockBeneficiaries.filter(b => b.eligibilityStatus === 'rejected').length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">مرفوضين</h3>
                <p className="text-sm text-gray-600 mb-4">مرفوض</p>
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  عرض المرفوضين
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <UserCheck className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-600">
                    {mockBeneficiaries.filter(b => b.status === 'suspended').length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">موقوفين</h3>
                <p className="text-sm text-gray-600 mb-4">موقوف</p>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                  إدارة الموقوفين
                </button>
              </div>
            </div>

            {/* Verification Queue */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">قائمة التحقق</h3>
              <p className="text-gray-600 mb-4">المستفيدين الجدد في انتظار التحقق من البيانات</p>
              
              <div className="space-y-4">
                {mockBeneficiaries.filter(b => b.identityStatus === 'pending').map((beneficiary) => (
                  <div key={beneficiary.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <UserCheck className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600">رقم الهوية: {beneficiary.nationalId}</p>
                        <p className="text-xs text-gray-500">تم الإضافة: {new Date(beneficiary.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                        موافقة
                      </button>
                      <button className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                        رفض
                      </button>
                      <button 
                        onClick={() => handleViewBeneficiary(beneficiary)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        مراجعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delayed Tab */}
        {activeTab === 'delayed' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">المستفيدين المتأخرين</h2>
                <p className="text-gray-600 mt-1">المستفيدين الذين لم يستلموا طرودهم في الوقت المحدد</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
                  إرسال تذكير جماعي
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  تصدير القائمة
                </button>
              </div>
            </div>

            {/* Delayed Beneficiaries */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-900">قائمة المتأخرين (5 مستفيدين)</h3>
              </div>
              <div className="p-6 space-y-4">
                {mockBeneficiaries.slice(0, 5).map((beneficiary) => (
                  <div key={beneficiary.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600">متأخر منذ 3 أيام - {beneficiary.detailedAddress.district}</p>
                        <p className="text-xs text-gray-500">آخر محاولة: {new Date(beneficiary.lastReceived).toLocaleDateString('en-CA')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleEditBeneficiary(beneficiary)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        تعديل البيانات
                      </button>
                      <button 
                        onClick={() => handleCall(beneficiary.phone)}
                        className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                      >
                        اتصال
                      </button>
                      <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                        إعادة جدولة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity-log' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">سجل النشاط</h2>
                <p className="text-gray-600 mt-1">سجل جميع الأنشطة والعمليات في النظام</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير السجل
                </button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">آخر الأنشطة</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">تم تسليم طرد مواد غذائية</p>
                      <span className="text-sm text-gray-500">منذ 5 دقائق</span>
                    </div>
                    <p className="text-sm text-gray-600">المستفيد: أحمد محمد الغزاوي - المندوب: محمد علي</p>
                    <p className="text-xs text-green-600 mt-1">تم التوثيق بالصورة والموقع</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">إضافة مستفيد جديد</p>
                      <span className="text-sm text-gray-500">منذ 15 دقيقة</span>
                    </div>
                    <p className="text-sm text-gray-600">المستفيد: فاطمة أحمد الشوا - بواسطة: سارة المشرفة</p>
                    <p className="text-xs text-blue-600 mt-1">في انتظار التحقق من الهوية</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Star className="w-5 h-5 text-green-500 fill-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">تم التحقق من هوية مستفيد</p>
                      <span className="text-sm text-gray-500">منذ 30 دقيقة</span>
                    </div>
                    <p className="text-sm text-gray-600">المستفيد: خالد الغزاوي - بواسطة: أحمد المراجع</p>
                    <p className="text-xs text-purple-600 mt-1">تم قبول الوثائق والموافقة</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">تحديث عنوان مستفيد</p>
                      <span className="text-sm text-gray-500">منذ ساعة</span>
                    </div>
                    <p className="text-sm text-gray-600">المستفيد: مريم أبو النجا - بواسطة: فاطمة الموظفة</p>
                    <p className="text-xs text-orange-600 mt-1">يحتاج إعادة جدولة التوصيل</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beneficiary Details Modal */}
      {showDetailsModal && selectedBeneficiary && (
        <BeneficiaryDetailsModal
          beneficiary={selectedBeneficiary}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBeneficiary(null);
          }}
        />
      )}

      {/* Add/Edit/Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'add' ? 'إضافة مستفيد جديد' :
                 modalType === 'edit' ? 'تعديل بيانات المستفيد' :
                 'إرسال رسالة'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-xl p-8 mb-4">
                {modalType === 'add' && <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                {modalType === 'edit' && <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                {modalType === 'message' && <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                <p className="text-gray-600">
                  {modalType === 'add' ? 'نموذج إضافة مستفيد جديد' :
                   modalType === 'edit' ? 'نموذج تعديل بيانات المستفيد' :
                   'نموذج إرسال رسالة'}
                </p>
                <p className="text-sm text-gray-500 mt-2">سيتم تطوير النماذج التفاعلية هنا</p>
              </div>
              
              <div className="flex space-x-3 space-x-reverse justify-center">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  {modalType === 'add' ? 'إضافة المستفيد' :
                   modalType === 'edit' ? 'حفظ التغييرات' :
                   'إرسال الرسالة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}