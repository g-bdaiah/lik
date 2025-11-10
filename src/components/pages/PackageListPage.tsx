import React, { useState } from 'react';
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Building2, Star, Download, RefreshCw, Copy, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { mockPackageTemplates, mockOrganizations, type PackageTemplate, type Organization, type PackageItem } from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { Modal } from '../ui';
import PackageTemplateForm from '../PackageTemplateForm';

interface PackageListPageProps {
}

export default function PackageListPage({ loggedInUser }: PackageListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'copy'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<PackageTemplate | null>(null);
  const { logError, logInfo } = useErrorLogger();

  // Add missing state variables
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<Error | null>(null);

  // استخدام البيانات الوهمية مباشرة
  // For simplicity, we'll use a mutable copy of mock data for local changes
  const [templates, setTemplates] = useState<PackageTemplate[]>(mockPackageTemplates);
  const availableInstitutions = mockOrganizations;
  const loading = false;
  const refetchTemplates = () => {
    console.log('تحديث البيانات الوهمية');
    // In a real app, this would fetch from a backend.
    // For mock data, we just re-set the state to trigger re-render if mock data was modified.
    setTemplates([...mockPackageTemplates]);
  };

  // محاكاة العمليات
  const insertTemplate = async (data: Partial<PackageTemplate>) => {
    const newTemplate: PackageTemplate = {
      id: `template-${Date.now()}`,
      name: data.name || '',
      type: data.type || 'food',
      organization_id: data.organization_id || '',
      description: data.description || '',
      contents: data.contents || [],
      status: 'draft', // New templates start as draft
      createdAt: new Date().toISOString(),
      usageCount: 0,
      totalWeight: data.totalWeight || 0,
      estimatedCost: data.estimatedCost || 0,
    };
    mockPackageTemplates.unshift(newTemplate); // Add to mock data
    setTemplates([...mockPackageTemplates]); // Update state
    logInfo(`تم إضافة قالب: ${newTemplate.name}`, 'PackageListPage');
    return true;
  };

  const updateTemplate = async (id: string, data: Partial<PackageTemplate>) => {
    logInfo(`محاكاة إضافة قالب: ${data.name}`, 'PackageListPage');
    return true;
  };

  const deleteTemplate = async (id: string) => {
    const initialLength = mockPackageTemplates.length;
    const updatedTemplates = mockPackageTemplates.filter(t => t.id !== id);
    mockPackageTemplates.splice(0, mockPackageTemplates.length, ...updatedTemplates); // Mutate original mock array
    setTemplates([...mockPackageTemplates]); // Update state
    logInfo(`تم حذف القالب: ${id}`, 'PackageListPage');
    return mockPackageTemplates.length < initialLength;
  };

  // فلترة القوالب
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesOrganization = organizationFilter === 'all' || template.organization_id === organizationFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesOrganization;
  });

  // إحصائيات
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.status === 'active').length; // Fix: usage_count is not status
  const draftTemplates = templates.filter(t => t.status === 'draft').length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: PackageTemplate) => {
    setModalType('edit');
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleView = (template: PackageTemplate) => {
    setModalType('view');
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleCopy = (template: PackageTemplate) => {
    setModalType('copy');
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (template: PackageTemplate) => {
    if (confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      try {
        const success = await deleteTemplate(template.id);
        if (success) {
          logInfo(`تم حذف القالب: ${template.name}`, 'PackageListPage');
        } else {
          logError(new Error(`فشل حذف القالب: ${template.name}`), 'PackageListPage');
        }
      } catch (err) {
        logError(err as Error, 'PackageListPage');
      }
    }
  };

  const handleActivateTemplate = async (template: PackageTemplate) => {
    // Simulate update
    await updateTemplate(template.id, { status: 'active' });
    logInfo(`تم تفعيل القالب: ${template.name}`, 'PackageListPage');
    refetchTemplates();
  };

  const handleDeactivateTemplate = async (template: PackageTemplate) => {
    await updateTemplate(template.id, { status: 'inactive' });
    // Simulate update
    logInfo(`تم إلغاء تفعيل القالب: ${template.name}`, 'PackageListPage');
    refetchTemplates();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return '🍚';
      case 'medical': return '💊';
      case 'clothing': return '👕';
      case 'hygiene': return '🧼';
      case 'emergency': return '🚨';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'medical': return 'bg-red-100 text-red-800';
      case 'clothing': return 'bg-purple-100 text-purple-800';
      case 'hygiene': return 'bg-blue-100 text-blue-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'draft': return 'مسودة';
      case 'inactive': return 'غير نشط';
      default: return 'غير محدد';
    }
  };

  const handleExportTemplates = () => {
    const exportData = {
      date: new Date().toISOString(),
      totalTemplates,
      activeTemplates,
      templates: filteredTemplates.map(t => ({
        name: t.name,
        type: t.type,
        organization: availableInstitutions.find(inst => inst.id === t.organization_id)?.name,
        usage_count: t.usageCount,
        estimated_cost: t.estimatedCost,
        total_weight: t.totalWeight,
        items_count: t.contents?.length || 0
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قوالب_الطرود_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('تم تصدير قوالب الطرود بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <button 
            onClick={handleExportTemplates}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير القوالب
          </button>
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة قالب جديد
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في القوالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="food">مواد غذائية</option>
              <option value="medical">طبية</option>
              <option value="clothing">ملابس</option>
              <option value="hygiene">نظافة</option>
              <option value="emergency">طوارئ</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="draft">مسودة</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
          <div>
            <select
              value={organizationFilter}
              onChange={(e) => setOrganizationFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المؤسسات</option>
              {availableInstitutions.map((inst: any) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">إجمالي القوالب</p>
              <p className="text-3xl font-bold text-gray-900">{totalTemplates}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">قوالب نشطة</p>
              <p className="text-3xl font-bold text-gray-900">{activeTemplates}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">مسودات</p>
              <p className="text-3xl font-bold text-gray-900">{draftTemplates}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-2xl">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">إجمالي الاستخدام</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsage}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {!templatesLoading && !templatesError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length > 0 ? ( // Fix: usage_count is not status
            filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Template Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="text-3xl">{getTypeIcon(template.type)}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {template.type === 'food' ? 'مواد غذائية' :
                           template.type === 'medical' ? 'طبية' :
                           template.type === 'clothing' ? 'ملابس' :
                           template.type === 'hygiene' ? 'نظافة' : 'طوارئ'}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                      {getStatusText(template.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

                  {/* Template Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center"> {/* Fix: usage_count is not status */}
                    <div>
                      <p className="text-lg font-bold text-blue-600">{template.items?.length || template.contents.length}</p>
                      <p className="text-xs text-gray-600">عناصر</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{template.totalWeight?.toFixed(1) || 0}</p>
                      <p className="text-xs text-gray-600">كيلو</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{template.estimatedCost}</p>
                      <p className="text-xs text-gray-600">شيكل</p>
                    </div>
                  </div>
                </div>

                {/* Organization Info */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {availableInstitutions.find(inst => inst.id === template.organization_id)?.name || 
                       'غير محدد'}
                    </span>
                  </div>
                  {template.usageCount > 0 && (
                    <div className="flex items-center space-x-2 space-x-reverse mt-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">استُخدم {template.usageCount} مرة</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleView(template)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </button>
                    <button 
                      onClick={() => handleEdit(template)}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </button>
                    <button 
                      onClick={() => handleCopy(template)}
                      className="bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                      title="نسخ القالب"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse mt-2">
                    {template.status === 'active' ? (
                      <button 
                        onClick={() => handleDeactivateTemplate(template)}
                        className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        إلغاء التفعيل
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleActivateTemplate(template)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        تفعيل
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(template)}
                      className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      title="حذف القالب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-2xl p-12">
              <div className="text-center text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || organizationFilter !== 'all' 
                    ? 'لا توجد قوالب مطابقة للفلاتر' 
                    : 'لا توجد قوالب طرود'}
                </p>
                <p className="text-sm mt-2">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || organizationFilter !== 'all'
                    ? 'جرب تعديل الفلاتر أو مصطلح البحث'
                    : 'ابدأ بإضافة قالب طرد جديد'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit/View/Copy */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'add' ? 'إضافة قالب طرد جديد' :
                 modalType === 'edit' ? 'تعديل قالب الطرد' :
                 modalType === 'copy' ? 'نسخ قالب الطرد' :
                 'عرض تفاصيل القالب'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {(modalType === 'add' || modalType === 'edit' || modalType === 'copy') && (
              <PackageTemplateForm
                template={modalType === 'add' ? null : selectedTemplate}
                onSave={async (data) => {
                  try {
                    if (modalType === 'add' || modalType === 'copy') {
                      await insertTemplate(data);
                      logInfo(`تم ${modalType === 'copy' ? 'نسخ' : 'إضافة'} القالب بنجاح: ${data.name}`, 'PackageListPage');
                    } else if (modalType === 'edit' && selectedTemplate) {
                      await updateTemplate(selectedTemplate.id, data);
                      logInfo(`تم تحديث القالب بنجاح: ${data.name}`, 'PackageListPage');
                    }
                    setShowModal(false);
                    setSelectedTemplate(null);
                  } catch (error) {
                    logError(error as Error, 'PackageListPage');
                  }
                }}
                onCancel={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                }}
                isCopy={modalType === 'copy'}
              />
            )}

            {modalType === 'view' && selectedTemplate && (
              <div className="space-y-6">
                {/* Template Details */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">معلومات القالب</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">اسم القالب:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">النوع:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedTemplate.type)}`}>
                            {selectedTemplate.type === 'food' ? 'مواد غذائية' :
                             selectedTemplate.type === 'medical' ? 'طبية' :
                             selectedTemplate.type === 'clothing' ? 'ملابس' :
                             selectedTemplate.type === 'hygiene' ? 'نظافة' : 'طوارئ'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">المؤسسة:</span>
                          <span className="font-medium text-gray-900"> {/* Fix: usage_count is not status */}
                            {availableInstitutions.find((inst: any) => inst.id === selectedTemplate.organization_id)?.name || 
                             'غير محدد'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الحالة:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTemplate.status)}`}>
                            {getStatusText(selectedTemplate.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">إحصائيات الاستخدام</h4>
                      <div className="space-y-3 text-sm"> {/* Fix: usage_count is not status */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">عدد مرات الاستخدام:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.usageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الوزن الإجمالي:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.totalWeight?.toFixed(1) || 0} كيلو</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">التكلفة المتوقعة:</span>
                          <span className="font-medium text-green-600">{selectedTemplate.estimatedCost} ₪</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ الإنشاء:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedTemplate.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTemplate.description && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">الوصف</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedTemplate.description}</p>
                    </div>
                  )}
                </div>

                {/* Template Contents */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">محتويات الطرد</h4>
                  <div className="space-y-3">
                    {selectedTemplate.contents?.map((item: PackageItem, index: number) => (
                      <div key={item.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.notes && (
                              <p className="text-xs text-gray-500">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{item.quantity} {item.unit}</p>
                          {item.weight && (
                            <p className="text-xs text-gray-500">{item.weight} كيلو</p>
                          )}
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleEdit(selectedTemplate)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل القالب
                    </button>
                    <button 
                      onClick={() => handleCopy(selectedTemplate)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ القالب
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State for No Data */}
      {templates.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12">
          <div className="text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">لا توجد قوالب طرود</p>
            <p className="text-sm mt-2">ابدأ بإضافة قالب طرد جديد</p>
            <button 
              onClick={handleAddNew}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة قالب جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}