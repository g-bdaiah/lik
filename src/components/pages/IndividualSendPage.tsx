import React, { useState } from 'react';
import { User, Search, Send, Package, MapPin, Phone, CheckCircle, AlertTriangle, Clock, FileText, Star, RefreshCw, X } from 'lucide-react';
import { 
  type Beneficiary, 
  mockBeneficiaries, 
  mockOrganizations, 
  mockPackageTemplates,
  type Organization,
  type PackageTemplate
} from '../../data/mockData';
import { Modal } from '../ui';

interface IndividualSendPageProps {
  beneficiaryIdToPreselect?: string | null;
  onBeneficiaryPreselected?: () => void;
}

export default function IndividualSendPage({ beneficiaryIdToPreselect, onBeneficiaryPreselected }: IndividualSendPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [reason, setReason] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | null } | null>(null);

  // استخدام البيانات الوهمية مباشرة
  const allBeneficiaries = mockBeneficiaries;
  const institutions = mockOrganizations;
  const packageTemplates = mockPackageTemplates;
  const loading = false;
  const organizationsError = null;
  const packageTemplatesError = null;
  const beneficiariesError = null;

  // Handle preselected beneficiary
  React.useEffect(() => {
    if (beneficiaryIdToPreselect && allBeneficiaries.length > 0) {
      const beneficiary = allBeneficiaries.find(b => b.id === beneficiaryIdToPreselect);
      if (beneficiary) {
        setSelectedBeneficiary(beneficiary);
        setSearchTerm(beneficiary.name);
        setShowSearchResults(false);
        if (onBeneficiaryPreselected) {
          onBeneficiaryPreselected();
        }
      }
    }
  }, [beneficiaryIdToPreselect, onBeneficiaryPreselected, allBeneficiaries]);

  const reasons = [
    { id: 'emergency', name: 'حالة طوارئ', description: 'حالة طارئة تحتاج تدخل فوري' },
    { id: 'special-needs', name: 'احتياجات خاصة', description: 'احتياجات خاصة للمستفيد' },
    { id: 'compensation', name: 'تعويض', description: 'تعويض عن طرد مفقود أو تالف' },
    { id: 'medical', name: 'حالة طبية', description: 'حالة طبية خاصة تحتاج رعاية' },
    { id: 'other', name: 'أخرى', description: 'سبب آخر غير مذكور' }
  ];

  const filteredBeneficiaries = allBeneficiaries.filter(ben =>
    ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ben.nationalId.includes(searchTerm) ||
    ben.phone.includes(searchTerm)
  );

  const selectedTemplateData = packageTemplates.find(t => t.id === selectedTemplate);

  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setSearchTerm(beneficiary.name);
    setShowSearchResults(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSendPackage = () => {
    if (!selectedBeneficiary || !selectedTemplate || !reason) {
      setNotification({ message: 'يرجى اختيار المستفيد ونوع الطرد وسبب الإرسال', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setShowConfirmSendModal(true);
  };

  const executeSendPackage = () => {
    setShowConfirmSendModal(false);

    const sendId = `SEND-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    setNotification({
      message: `تم إرسال الطرد بنجاح! رقم الإرسالية: ${sendId}. سيتم إشعار المستفيد قريباً.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 5000);

    resetForm();
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedInstitution('');
    setSelectedBeneficiary(null);
    setSelectedTemplate('');
    setNotes('');
    setPriority('normal');
    setReason('');
  };

  const getConfirmMessageDetails = () => {
    const templateInfo = selectedTemplateData;
    const reasonInfo = reasons.find(r => r.id === reason);

    return {
      beneficiaryName: selectedBeneficiary?.name,
      templateName: templateInfo?.name,
      institutionName: institutions.find(inst => inst.id === templateInfo?.organization_id)?.name || 'غير محدد',
      reasonName: reasonInfo?.name,
      priorityText: priority === 'high' ? 'عالية' : priority === 'low' ? 'منخفضة' : 'عادية',
      estimatedCost: templateInfo?.estimatedCost,
    };
  };

  const getNotificationClasses = (type: 'success' | 'error' | 'warning' | null) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-200 text-orange-800';
      default: return '';
    }
  };

  const getNotificationIcon = (type: 'success' | 'error' | 'warning' | null) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
      default: return null;
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

  const getTemplatesByInstitution = () => {
    const grouped: { [key: string]: PackageTemplate[] } = {};
    packageTemplates.forEach(template => {
      const institutionName = institutions.find(inst => inst.id === template.organization_id)?.name || 'غير محدد';
      if (!grouped[institutionName]) {
        grouped[institutionName] = [];
      }
      grouped[institutionName].push(template);
    });
    return grouped;
  };

  const templatesByInstitution = getTemplatesByInstitution();
  const institutionNames = Object.keys(templatesByInstitution);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${getNotificationClasses(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">خطوات الإرسال الفردي</h3>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>الخطوة {selectedBeneficiary ? (selectedTemplate ? (reason ? '4' : '3') : '2') : '1'} من 4</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`flex items-center space-x-2 space-x-reverse ${selectedBeneficiary ? 'text-green-600' : 'text-blue-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBeneficiary ? 'bg-green-100' : 'bg-blue-100'}`}>
              {selectedBeneficiary ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm font-bold">1</span>}
            </div>
            <span className="text-sm font-medium">اختيار المستفيد</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 space-x-reverse ${selectedTemplate ? 'text-green-600' : selectedBeneficiary ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedTemplate ? 'bg-green-100' : selectedBeneficiary ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {selectedTemplate ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm font-bold">2</span>}
            </div>
            <span className="text-sm font-medium">اختيار القالب</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 space-x-reverse ${reason ? 'text-green-600' : selectedTemplate ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reason ? 'bg-green-100' : selectedTemplate ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {reason ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm font-bold">3</span>}
            </div>
            <span className="text-sm font-medium">تحديد السبب</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 space-x-reverse ${reason && selectedTemplate && selectedBeneficiary ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reason && selectedTemplate && selectedBeneficiary ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-sm font-bold">4</span>
            </div>
            <span className="text-sm font-medium">تأكيد الإرسال</span>
          </div>
        </div>
      </div>

      {/* Beneficiary Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">البحث عن المستفيد</h3>
          {selectedBeneficiary && (
            <div className="flex items-center space-x-2 space-x-reverse text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">تم الاختيار</span>
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم، رقم الهوية، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchResults(searchTerm.length > 0)}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Search Results */}
          {showSearchResults && searchTerm && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto z-10 shadow-lg">
              {filteredBeneficiaries.length > 0 ? (
                filteredBeneficiaries.slice(0, 10).map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    onClick={() => handleBeneficiarySelect(beneficiary)}
                    className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600">
                          {beneficiary.nationalId} - {beneficiary.phone}
                        </p>
                        <p className="text-sm text-gray-500">{beneficiary.detailedAddress.district}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIdentityColor(beneficiary.identityStatus)}`}>
                        {beneficiary.identityStatus === 'verified' ? 'موثق' :
                         beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  لا توجد نتائج للبحث
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Beneficiary Info */}
      {selectedBeneficiary && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">المستفيد المحدد</h3>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{selectedBeneficiary.name}</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getIdentityColor(selectedBeneficiary.identityStatus)}`}>
                    {selectedBeneficiary.identityStatus === 'verified' ? 'موثق' :
                     selectedBeneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">رقم الهوية:</span>
                    <span className="font-medium text-gray-900">{selectedBeneficiary.nationalId}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium text-gray-900">{selectedBeneficiary.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">المنطقة:</span>
                    <span className="font-medium text-gray-900">{selectedBeneficiary.detailedAddress.district}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">إجمالي الطرود:</span>
                    <span className="font-medium text-gray-900">{selectedBeneficiary.totalPackages}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">آخر استلام:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedBeneficiary.lastReceived).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">العنوان الكامل:</span>
                    <span className="font-medium text-gray-900">{selectedBeneficiary.detailedAddress.street}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection */}
      {selectedBeneficiary && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">اختيار قالب الطرد</h3>
            {selectedTemplate && (
              <div className="flex items-center space-x-2 space-x-reverse text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">تم الاختيار</span>
              </div>
            )}
          </div>

          {/* Institution Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">اختيار المؤسسة المانحة</label>
            <select
              value={selectedInstitution}
              onChange={(e) => {
                setSelectedInstitution(e.target.value);
                setSelectedTemplate('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر المؤسسة المانحة...</option>
              {institutionNames.map(institutionName => {
                const inst = institutions.find(i => i.name === institutionName);
                return inst ? (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ) : null;
              })}
            </select>
          </div>

          {/* Templates for Selected Institution */}
          {selectedInstitution && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">قوالب الطرود المتاحة من {institutions.find(inst => inst.id === selectedInstitution)?.name || 'غير محدد'}</h4>
              {templatesByInstitution[institutions.find(inst => inst.id === selectedInstitution)?.name || 'غير محدد']?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templatesByInstitution[institutions.find(inst => inst.id === selectedInstitution)?.name || 'غير محدد']?.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">
                          {template.type === 'food' ? '🍚' :
                           template.type === 'clothing' ? '👕' :
                           template.type === 'medical' ? '💊' :
                           template.type === 'hygiene' ? '🧼' : '🚨'}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{template.totalWeight} كيلو</p>
                        </div>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">{template.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{template.contents.length} أصناف</p>
                      <div className="text-xs text-gray-500">
                        {template.contents.slice(0, 2).map(item => item.name).join(', ')}
                        {template.contents.length > 2 && '...'}
                      </div>

                      {template.usageCount > 0 && (
                        <div className="mt-2 flex items-center space-x-1 space-x-reverse text-xs text-blue-600">
                          <Star className="w-3 h-3" />
                          <span>استُخدم {template.usageCount} مرة</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد قوالب متاحة لهذه المؤسسة</p>
                </div>
              )}
            </div>
          )}

          {!selectedInstitution && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">اختر المؤسسة المانحة أولاً</p>
              <p className="text-sm">لعرض قوالب الطرود المتاحة</p>
            </div>
          )}
        </div>
      )}

      {/* Template Details */}
      {selectedTemplate && selectedTemplateData && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل القالب المحدد</h3>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">معلومات القالب</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">اسم القالب:</span>
                    <span className="font-medium text-green-900">{selectedTemplateData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">المؤسسة:</span>
                    <span className="font-medium text-green-900">{institutions.find(inst => inst.id === selectedTemplateData.organization_id)?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">عدد الأصناف:</span>
                    <span className="font-medium text-green-900">{selectedTemplateData.contents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">الوزن الإجمالي:</span>
                    <span className="font-medium text-green-900">{selectedTemplateData.totalWeight} كيلو</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-3">محتويات الطرد</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedTemplateData.contents.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-green-700">{item.name}:</span>
                      <span className="font-medium text-green-900">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Selection */}
      {selectedTemplate && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">سبب الإرسال الفردي</h3>
            {reason && (
              <div className="flex items-center space-x-2 space-x-reverse text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">تم التحديد</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reasons.map((reasonOption) => (
              <div
                key={reasonOption.id}
                onClick={() => setReason(reasonOption.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  reason === reasonOption.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{reasonOption.name}</h4>
                <p className="text-sm text-gray-600">{reasonOption.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Options */}
      {reason && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">خيارات إضافية</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">أولوية التسليم</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">منخفضة - خلال 3-5 أيام</option>
                <option value="normal">عادية - خلال 1-2 يوم</option>
                <option value="high">عالية - خلال 24 ساعة</option>
                <option value="urgent">عاجلة - خلال 6 ساعات</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات خاصة</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات خاصة للمندوب أو تعليمات إضافية..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Send Summary */}
      {selectedBeneficiary && selectedTemplate && reason && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">ملخص الطرد الفردي</h3>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-xl mb-2">
                  <User className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">المستفيد</p>
                <p className="font-bold text-gray-900">{selectedBeneficiary.name}</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-xl mb-2">
                  <Package className="w-6 h-6 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">نوع الطرد</p>
                <p className="font-bold text-gray-900">{selectedTemplateData?.name}</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-xl mb-2">
                  <AlertTriangle className="w-6 h-6 text-purple-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">السبب</p>
                <p className="font-bold text-gray-900">{reasons.find(r => r.id === reason)?.name}</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-xl mb-2">
                  <Star className="w-6 h-6 text-orange-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">التكلفة</p>
                <p className="font-bold text-gray-900">{selectedTemplateData?.estimatedCost} ₪</p>
              </div>
            </div>
          </div>

          {/* Priority and Notes Summary */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">أولوية التسليم</h4>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                priority === 'urgent' ? 'bg-red-100 text-red-800' :
                priority === 'high' ? 'bg-orange-100 text-orange-800' :
                priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <Clock className="w-4 h-4 ml-1" />
                {priority === 'urgent' ? 'عاجلة' :
                 priority === 'high' ? 'عالية' :
                 priority === 'normal' ? 'عادية' : 'منخفضة'}
              </div>
            </div>

            {notes && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">الملاحظات</h4>
                <p className="text-sm text-gray-700">{notes}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSendPackage}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center text-lg"
          >
            <Send className="w-5 h-5 ml-2" />
            إرسال الطرد الفردي
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3 space-x-reverse">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 mb-3">تعليمات الإرسال الفردي</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-sm text-yellow-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>الإرسال الفردي مخصص للحالات الخاصة والطارئة</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>يجب تحديد سبب واضح للإرسال الفردي</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم إنشاء مهمة توزيع فورية</span>
                </li>
              </ul>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم إرسال رسالة تأكيد للمستفيد</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>يمكن تتبع حالة الطرد من صفحة التتبع</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>سيتم تعيين أفضل مندوب متاح حسب المنطقة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSendModal && (
        <Modal
          isOpen={showConfirmSendModal}
          onClose={() => setShowConfirmSendModal(false)}
          title="تأكيد إرسال الطرد الفردي"
          size="sm"
        >
          <div className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">هل أنت متأكد من إرسال هذا الطرد؟</h3>
            <p className="text-gray-600 mb-6">
              سيتم إنشاء مهمة توزيع لهذا الطرد وإشعار المستفيد.
            </p>
            
            {/* Confirmation Details */}
            <div className="bg-gray-50 p-4 rounded-lg text-right mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">المستفيد:</span>
                <span className="font-medium text-gray-900">{getConfirmMessageDetails().beneficiaryName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">نوع الطرد:</span>
                <span className="font-medium text-gray-900">{getConfirmMessageDetails().templateName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">المؤسسة:</span>
                <span className="font-medium text-gray-900">{getConfirmMessageDetails().institutionName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">السبب:</span>
                <span className="font-medium text-gray-900">{getConfirmMessageDetails().reasonName}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">الأولوية:</span>
                <span className="font-medium text-gray-900">{getConfirmMessageDetails().priorityText}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">التكلفة المتوقعة:</span>
                <span className="font-medium text-green-600">{getConfirmMessageDetails().estimatedCost} ₪</span>
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse justify-center">
              <button
                onClick={() => setShowConfirmSendModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={executeSendPackage}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                تأكيد الإرسال
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}