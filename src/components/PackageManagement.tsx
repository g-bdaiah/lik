import React, { useState, useEffect } from 'react';
import { ArrowRight, Package, Plus, Search, Filter, Download, Eye, Edit, Copy, Trash2, Send, Truck, CheckCircle, Clock, AlertTriangle, MapPin, Calendar, FileText, Star, Heart, Layers, Users, Building2 } from 'lucide-react';

interface PackageManagementProps {
  onBack: () => void;
  initialTab?: string;
}

interface PackageTemplate {
  id: string;
  name: string;
  type: 'food' | 'medical' | 'clothing' | 'blankets';
  institution: string;
  description?: string;
  contents: PackageContent[];
  status: 'active' | 'draft' | 'inactive';
  created: string;
  usageCount: number;
  lastUsed: string;
  totalWeight: number;
}

interface PackageContent {
  name: string;
  quantity: number;
  unit: string;
  weight: number;
}

interface Beneficiary {
  id: string;
  name: string;
  idNumber: string;
  phone: string;
  area: string;
  familySize: 'small' | 'medium' | 'large';
  hasChildren: boolean;
  hasElderly: boolean;
  lastReceived: string;
  dateAdded: string;
}

interface Delivery {
  id: string;
  lat: number;
  lng: number;
  status: 'delivered' | 'in-progress' | 'preparing' | 'failed' | 'delayed';
  beneficiary: string;
  package: string;
  agent: string;
  time: string;
  date: string;
  phone: string;
  address: string;
}

export default function PackageManagement({ onBack, initialTab = 'templates' }: PackageManagementProps) {
  const [activeTab, setActiveTab] = useState(
    initialTab === 'packages' ? 'templates' : 
    initialTab === 'bulk-send' ? 'bulk-send' :
    initialTab === 'individual-send' ? 'individual-send' :
    initialTab === 'tracking' ? 'tracking' :
    initialTab === 'distribution-reports' ? 'reports' :
    'templates'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-template' | 'edit-template' | 'view-template' | 'bulk-send' | 'individual-send' | 'delivery-details' | 'reschedule'>('add-template');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'food' as const,
    institution: '',
    description: '',
    contents: [{ name: '', quantity: 0, unit: 'كيلو', weight: 0 }]
  });

  const [bulkSendFilters, setBulkSendFilters] = useState({
    benefitStatus: '',
    familySize: '',
    hasChildren: '',
    hasElderly: '',
    area: '',
    lastReceived: '',
    dateAdded: ''
  });

  // Mock data
  const [templates, setTemplates] = useState<PackageTemplate[]>([
    {
      id: 'TEMP-001',
      name: 'طرد رمضان كريم 2024',
      type: 'food',
      institution: 'الأونروا',
      description: 'طرد غذائي شامل لشهر رمضان المبارك',
      contents: [
        { name: 'أرز بسمتي', quantity: 5, unit: 'كيلو', weight: 5 },
        { name: 'زيت زيتون', quantity: 1, unit: 'لتر', weight: 1 },
        { name: 'سكر أبيض', quantity: 2, unit: 'كيلو', weight: 2 },
        { name: 'طحين', quantity: 3, unit: 'كيلو', weight: 3 },
        { name: 'عدس أحمر', quantity: 1, unit: 'كيلو', weight: 1 },
        { name: 'تونة معلبة', quantity: 6, unit: 'علبة', weight: 1.2 },
        { name: 'معجون طماطم', quantity: 3, unit: 'علبة', weight: 0.6 },
        { name: 'حليب مجفف', quantity: 2, unit: 'علبة', weight: 0.8 }
      ],
      status: 'active',
      created: '2024-01-10',
      usageCount: 247,
      lastUsed: '2024-12-20',
      totalWeight: 14.6
    },
    {
      id: 'TEMP-002',
      name: 'طرد الشتاء الدافئ',
      type: 'clothing',
      institution: 'الهلال الأحمر',
      description: 'طرد ملابس شتوية للعائلات',
      contents: [
        { name: 'بطانية صوف', quantity: 2, unit: 'قطعة', weight: 3 },
        { name: 'جاكيت شتوي للكبار', quantity: 2, unit: 'قطعة', weight: 1.5 },
        { name: 'جاكيت شتوي للأطفال', quantity: 3, unit: 'قطعة', weight: 0.8 },
        { name: 'جوارب صوفية', quantity: 6, unit: 'زوج', weight: 0.3 },
        { name: 'قبعة صوفية', quantity: 4, unit: 'قطعة', weight: 0.2 },
        { name: 'قفازات', quantity: 4, unit: 'زوج', weight: 0.1 }
      ],
      status: 'active',
      created: '2024-01-08',
      usageCount: 156,
      lastUsed: '2024-12-19',
      totalWeight: 5.9
    },
    {
      id: 'TEMP-003',
      name: 'طرد الإسعافات الأولية',
      type: 'medical',
      institution: 'منظمة الصحة العالمية',
      description: 'طرد طبي للإسعافات الأولية',
      contents: [
        { name: 'ضمادات طبية', quantity: 10, unit: 'قطعة', weight: 0.5 },
        { name: 'مطهر جروح', quantity: 2, unit: 'زجاجة', weight: 0.4 },
        { name: 'مسكنات', quantity: 3, unit: 'علبة', weight: 0.3 },
        { name: 'خافض حرارة', quantity: 2, unit: 'علبة', weight: 0.2 },
        { name: 'شاش طبي', quantity: 5, unit: 'لفة', weight: 0.3 },
        { name: 'لاصق طبي', quantity: 4, unit: 'قطعة', weight: 0.1 }
      ],
      status: 'draft',
      created: '2024-01-12',
      usageCount: 45,
      lastUsed: '2024-12-18',
      totalWeight: 1.8
    }
  ]);

  const [beneficiariesData, setBeneficiariesData] = useState<Beneficiary[]>([
    { id: 'BEN-001', name: 'أحمد محمد الغزاوي', idNumber: '900123456', phone: '0597123456', area: 'north', familySize: 'large', hasChildren: true, hasElderly: false, lastReceived: 'month', dateAdded: 'old' },
    { id: 'BEN-002', name: 'فاطمة سالم النجار', idNumber: '900234567', phone: '0598234567', area: 'gaza', familySize: 'medium', hasChildren: true, hasElderly: true, lastReceived: 'week', dateAdded: 'old' },
    { id: 'BEN-003', name: 'محمود عبد الله زقوت', idNumber: '900345678', phone: '0599345678', area: 'middle', familySize: 'small', hasChildren: false, hasElderly: false, lastReceived: 'never', dateAdded: 'old' },
    { id: 'BEN-004', name: 'مريم إبراهيم شعت', idNumber: '900456789', phone: '0597456789', area: 'khan-younis', familySize: 'large', hasChildren: true, hasElderly: false, lastReceived: 'quarter', dateAdded: 'week' },
    { id: 'BEN-005', name: 'يوسف حسن أبو شبكة', idNumber: '900567890', phone: '0598567890', area: 'rafah', familySize: 'medium', hasChildren: false, hasElderly: true, lastReceived: 'month', dateAdded: 'today' }
  ]);

  const [deliveriesData] = useState<Delivery[]>([
    { id: 'SEND-2024-001', lat: 31.5012, lng: 34.4662, status: 'delivered', beneficiary: 'أحمد محمد الخالدي', package: 'طرد رمضان كريم 2024', agent: 'خالد أحمد', time: '14:30', date: '15/01/2024', phone: '0597123456', address: 'حي الشجاعية، شارع صلاح الدين' },
    { id: 'SEND-2024-002', lat: 31.4876, lng: 34.4196, status: 'in-progress', beneficiary: 'فاطمة سالم النجار', package: 'طرد الشتاء الدافئ', agent: 'محمد سعيد', time: 'قيد التوزيع', date: '15/01/2024', phone: '0598234567', address: 'حي الزيتون، شارع الوحدة' },
    { id: 'SEND-2024-003', lat: 31.4686, lng: 34.3936, status: 'failed', beneficiary: 'محمود عبد الله زقوت', package: 'طرد الإسعافات الأولية', agent: 'أحمد علي', time: 'فشل التسليم', date: '14/01/2024', phone: '0599345678', address: 'مخيم النصيرات، شارع الشهداء' },
    { id: 'SEND-2024-004', lat: 31.3478, lng: 34.3014, status: 'preparing', beneficiary: 'مريم إبراهيم شعت', package: 'طرد رمضان كريم 2024', agent: 'يوسف حسام', time: 'قيد التحضير', date: '15/01/2024', phone: '0597456789', address: 'خان يونس، حي الأمل' },
    { id: 'SEND-2024-005', lat: 31.2856, lng: 34.2486, status: 'delayed', beneficiary: 'يوسف حسن أبو شبكة', package: 'طرد الشتاء الدافئ', agent: 'سامي محمد', time: 'متأخر 3 ساعات', date: '15/01/2024', phone: '0598567890', address: 'رفح، حي البرازيل' }
  ]);

  const tabs = [
    { id: 'templates', name: 'قوالب الطرود', icon: Layers },
    { id: 'bulk-send', name: 'إرسال جماعي', icon: Send },
    { id: 'individual-send', name: 'إرسال فردي', icon: Package },
    { id: 'tracking', name: 'تتبع الإرسالات', icon: Truck },
    { id: 'reports', name: 'تقارير التوزيع', icon: FileText },
  ];

  const institutions = [
    { id: 'unrwa', name: 'الأونروا', packagesAvailable: 347, templatesCount: 8 },
    { id: 'wfp', name: 'برنامج الغذاء العالمي', packagesAvailable: 234, templatesCount: 5 },
    { id: 'red-crescent', name: 'الهلال الأحمر الفلسطيني', packagesAvailable: 189, templatesCount: 6 },
    { id: 'who', name: 'منظمة الصحة العالمية', packagesAvailable: 95, templatesCount: 4 },
    { id: 'unicef', name: 'اليونيسف', packagesAvailable: 156, templatesCount: 7 },
    { id: 'unesco', name: 'منظمة اليونسكو', packagesAvailable: 78, templatesCount: 3 },
    { id: 'qatar-charity', name: 'مؤسسة قطر الخيرية', packagesAvailable: 45, templatesCount: 2 }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'food': return Package;
      case 'medical': return Heart;
      case 'clothing': return Layers;
      case 'blankets': return Layers;
      default: return Package;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'text-orange-600';
      case 'medical': return 'text-red-600';
      case 'clothing': return 'text-blue-600';
      case 'blankets': return 'text-cyan-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeInArabic = (type: string) => {
    switch (type) {
      case 'food': return 'غذائي';
      case 'medical': return 'طبي';
      case 'clothing': return 'ملابس';
      case 'blankets': return 'بطانيات';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'draft': return 'مسودة';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  const getAreaName = (area: string) => {
    const areas = {
      'north': 'شمال غزة',
      'gaza': 'مدينة غزة',
      'middle': 'الوسط',
      'khan-younis': 'خان يونس',
      'rafah': 'رفح'
    };
    return areas[area as keyof typeof areas] || area;
  };

  const getFamilySizeName = (size: string) => {
    const sizes = {
      'small': 'أسرة صغيرة (أقل من 5)',
      'medium': 'أسرة متوسطة (5-10)',
      'large': 'أسرة كبيرة (أكثر من 10)'
    };
    return sizes[size as keyof typeof sizes] || size;
  };

  const handleAddTemplate = () => {
    setModalType('add-template');
    setSelectedItem(null);
    setTemplateForm({
      name: '',
      type: 'food',
      institution: '',
      description: '',
      contents: [{ name: '', quantity: 0, unit: 'كيلو', weight: 0 }]
    });
    setShowModal(true);
  };

  const handleEditTemplate = (template: PackageTemplate) => {
    setModalType('edit-template');
    setSelectedItem(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      institution: template.institution,
      description: template.description || '',
      contents: [...template.contents]
    });
    setShowModal(true);
  };

  const handleViewTemplate = (template: PackageTemplate) => {
    setModalType('view-template');
    setSelectedItem(template);
    setShowModal(true);
  };

  const handleDuplicateTemplate = (template: PackageTemplate) => {
    const newTemplate: PackageTemplate = {
      ...template,
      id: 'TEMP-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      name: template.name + ' (نسخة)',
      status: 'draft',
      created: new Date().toISOString().split('T')[0],
      usageCount: 0,
      lastUsed: ''
    };
    setTemplates(prev => [...prev, newTemplate]);
    alert(`تم نسخ القالب بنجاح!\nمعرف القالب الجديد: ${newTemplate.id}`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟\n\nلن تتمكن من التراجع عن هذا الإجراء.')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      alert('تم حذف القالب بنجاح');
    }
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      alert('اسم القالب مطلوب');
      return;
    }

    if (templateForm.contents.some(c => !c.name.trim())) {
      alert('يرجى ملء جميع أسماء الأصناف');
      return;
    }

    const totalWeight = templateForm.contents.reduce((sum, item) => sum + item.weight, 0);

    if (selectedItem) {
      // Update existing template
      setTemplates(prev => 
        prev.map(template => 
          template.id === selectedItem.id 
            ? { 
                ...template, 
                ...templateForm,
                totalWeight,
                contents: [...templateForm.contents]
              }
            : template
        )
      );
      alert('تم تحديث القالب بنجاح');
    } else {
      // Create new template
      const newTemplate: PackageTemplate = {
        id: 'TEMP-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        ...templateForm,
        totalWeight,
        status: 'active',
        created: new Date().toISOString().split('T')[0],
        usageCount: 0,
        lastUsed: ''
      };
      setTemplates(prev => [...prev, newTemplate]);
      alert(`تم إنشاء القالب بنجاح!\nمعرف القالب: ${newTemplate.id}`);
    }

    setShowModal(false);
  };

  const addContentRow = () => {
    setTemplateForm(prev => ({
      ...prev,
      contents: [...prev.contents, { name: '', quantity: 0, unit: 'كيلو', weight: 0 }]
    }));
  };

  const removeContentRow = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      contents: prev.contents.filter((_, i) => i !== index)
    }));
  };

  const updateContentRow = (index: number, field: string, value: any) => {
    setTemplateForm(prev => ({
      ...prev,
      contents: prev.contents.map((content, i) => 
        i === index ? { ...content, [field]: value } : content
      )
    }));
  };

  const getFilteredBeneficiaries = () => {
    return beneficiariesData.filter(beneficiary => {
      let matches = true;

      if (bulkSendFilters.benefitStatus) {
        if (bulkSendFilters.benefitStatus === 'never' && beneficiary.lastReceived !== 'never') matches = false;
        if (bulkSendFilters.benefitStatus === 'recent' && beneficiary.lastReceived === 'never') matches = false;
        if (bulkSendFilters.benefitStatus === 'old' && (beneficiary.lastReceived === 'never' || beneficiary.lastReceived === 'week')) matches = false;
        if (bulkSendFilters.benefitStatus === 'new-imported' && beneficiary.dateAdded !== 'today') matches = false;
      }

      if (bulkSendFilters.familySize && beneficiary.familySize !== bulkSendFilters.familySize) matches = false;
      if (bulkSendFilters.hasChildren) {
        if (bulkSendFilters.hasChildren === 'yes' && !beneficiary.hasChildren) matches = false;
        if (bulkSendFilters.hasChildren === 'no' && beneficiary.hasChildren) matches = false;
      }
      if (bulkSendFilters.hasElderly) {
        if (bulkSendFilters.hasElderly === 'yes' && !beneficiary.hasElderly) matches = false;
        if (bulkSendFilters.hasElderly === 'no' && beneficiary.hasElderly) matches = false;
      }
      if (bulkSendFilters.area && beneficiary.area !== bulkSendFilters.area) matches = false;
      if (bulkSendFilters.lastReceived && beneficiary.lastReceived !== bulkSendFilters.lastReceived) matches = false;
      if (bulkSendFilters.dateAdded) {
        if (bulkSendFilters.dateAdded === 'today' && beneficiary.dateAdded !== 'today') matches = false;
        if (bulkSendFilters.dateAdded === 'week' && !['today', 'week'].includes(beneficiary.dateAdded)) matches = false;
        if (bulkSendFilters.dateAdded === 'month' && !['today', 'week', 'month'].includes(beneficiary.dateAdded)) matches = false;
      }

      return matches;
    });
  };

  const handleBulkSend = () => {
    if (!selectedInstitution) {
      alert('يرجى اختيار المؤسسة المانحة أولاً');
      return;
    }
    
    if (!selectedTemplate) {
      alert('يرجى اختيار قالب الطرد');
      return;
    }

    const filteredBeneficiaries = getFilteredBeneficiaries();
    if (filteredBeneficiaries.length === 0) {
      alert('لا يوجد مستفيدين مطابقين للفلاتر المحددة');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    const institution = institutions.find(i => i.id === selectedInstitution);

    if (confirm(`تأكيد الإرسال الجماعي:\n\nالمؤسسة المانحة: ${institution?.name}\nقالب الطرد: ${template?.name}\nعدد المستفيدين: ${filteredBeneficiaries.length}\n\nهل تريد المتابعة؟`)) {
      const sendId = 'SEND-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      alert(`تم تأكيد الإرسال بنجاح!\n\nرقم الإرسالية: ${sendId}\nالمؤسسة: ${institution?.name}\nعدد المستفيدين: ${filteredBeneficiaries.length}\n\nسيتم البدء في التحضير والتوزيع`);
      
      // Reset form
      setSelectedTemplate('');
      setSelectedInstitution('');
      setBulkSendFilters({
        benefitStatus: '',
        familySize: '',
        hasChildren: '',
        hasElderly: '',
        area: '',
        lastReceived: '',
        dateAdded: ''
      });
    }
  };

  const handleIndividualSend = () => {
    alert('تم إرسال الطرد الفردي بنجاح!');
  };

  const handleViewDelivery = (delivery: Delivery) => {
    setModalType('delivery-details');
    setSelectedItem(delivery);
    setShowModal(true);
  };

  const handleRescheduleDelivery = (delivery: Delivery) => {
    setModalType('reschedule');
    setSelectedItem(delivery);
    setShowModal(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBeneficiaries = getFilteredBeneficiaries();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                <span>العودة للوحة الرئيسية</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">إدارة الطرود</h1>
                  <p className="text-sm text-gray-600">إنشاء وإدارة قوالب الطرود وعمليات التوزيع</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 ml-2" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Package Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">قوالب الطرود</h2>
                <p className="text-gray-600 mt-1">إنشاء وإدارة قوالب الطرود العامة</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </button>
                <button 
                  onClick={handleAddTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء قالب جديد
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
                    placeholder="البحث في قوالب الطرود..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">جميع الأنواع</option>
                  <option value="food">غذائي</option>
                  <option value="medical">طبي</option>
                  <option value="clothing">ملابس</option>
                  <option value="blankets">بطانيات</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="draft">مسودة</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            {/* Templates Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">قوالب الطرود ({filteredTemplates.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        معرف القالب
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        اسم القالب
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المؤسسة المانحة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عدد الأصناف
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الوزن الإجمالي
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTemplates.map((template) => {
                      const TypeIcon = getTypeIcon(template.type);
                      return (
                        <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">{template.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">استخدم {template.usageCount} مرة</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <TypeIcon className={`w-4 h-4 ${getTypeColor(template.type)}`} />
                              <span className="text-sm text-gray-900">{getTypeInArabic(template.type)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {template.institution}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {template.contents.length} أصناف
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {template.totalWeight} كيلو
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                              {getStatusText(template.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2 space-x-reverse">
                              <button 
                                onClick={() => handleViewTemplate(template)}
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                                title="عرض التفاصيل"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditTemplate(template)}
                                className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDuplicateTemplate(template)}
                                className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                                title="نسخ القالب"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" 
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Send Tab */}
        {activeTab === 'bulk-send' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">إرسال طرد جماعي</h2>
                <p className="text-gray-600 mt-1">إرسال طرود لمجموعة مستفيدين بناءً على فلاتر محددة</p>
              </div>
            </div>

            {/* Institution Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">اختيار المؤسسة المانحة</h3>
              
              {/* Popular Institutions */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">المؤسسات الأكثر استخداماً</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {institutions.slice(0, 4).map((institution) => (
                    <button
                      key={institution.id}
                      onClick={() => setSelectedInstitution(institution.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedInstitution === institution.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {institution.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* All Institutions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">جميع المؤسسات</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {institutions.map((institution) => (
                    <div
                      key={institution.id}
                      onClick={() => setSelectedInstitution(institution.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedInstitution === institution.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{institution.name}</div>
                          <div className="text-sm text-gray-600">
                            {institution.packagesAvailable} طرد متاح • {institution.templatesCount} قوالب
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 ${
                          selectedInstitution === institution.id
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedInstitution === institution.id && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Selection */}
            {selectedInstitution && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">اختيار قالب الطرد</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.filter(t => {
                    const institutionName = institutions.find(i => i.id === selectedInstitution)?.name;
                    return t.institution === institutionName;
                  }).map((template) => {
                    const TypeIcon = getTypeIcon(template.type);
                    return (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse mb-3">
                          <TypeIcon className={`w-5 h-5 ${getTypeColor(template.type)}`} />
                          <div className="font-medium text-gray-900">{template.name}</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {template.contents.length} أصناف • {template.totalWeight} كيلو
                          <br />
                          <span className="text-green-600">متاح للإرسال</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Beneficiaries Filters */}
            {selectedTemplate && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">فلاتر المستفيدين</h3>
                
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة الاستفادة</label>
                    <select 
                      value={bulkSendFilters.benefitStatus}
                      onChange={(e) => setBulkSendFilters(prev => ({...prev, benefitStatus: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="never">لم يستفيدوا مطلقاً</option>
                      <option value="recent">استفادوا مؤخراً</option>
                      <option value="old">لم يستفيدوا منذ فترة</option>
                      <option value="new-imported">المستفيدين الجدد المستوردين</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حجم الأسرة</label>
                    <select 
                      value={bulkSendFilters.familySize}
                      onChange={(e) => setBulkSendFilters(prev => ({...prev, familySize: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">جميع الأحجام</option>
                      <option value="small">أقل من 5 أشخاص</option>
                      <option value="medium">5-10 أشخاص</option>
                      <option value="large">أكبر من 10 أشخاص</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
                    <select 
                      value={bulkSendFilters.area}
                      onChange={(e) => setBulkSendFilters(prev => ({...prev, area: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">جميع المناطق</option>
                      <option value="north">شمال غزة</option>
                      <option value="gaza">مدينة غزة</option>
                      <option value="middle">الوسط</option>
                      <option value="khan-younis">خان يونس</option>
                      <option value="rafah">رفح</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">آخر استلام</label>
                    <select 
                      value={bulkSendFilters.lastReceived}
                      onChange={(e) => setBulkSendFilters(prev => ({...prev, lastReceived: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">غير محدد</option>
                      <option value="week">خلال أسبوع</option>
                      <option value="month">خلال شهر</option>
                      <option value="quarter">خلال 3 أشهر</option>
                      <option value="never">لم يستلم أبداً</option>
                    </select>
                  </div>
                </div>

                {/* Beneficiaries Preview */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-lg font-bold text-blue-600 mb-3">
                    عدد المستفيدين المطابقين: {filteredBeneficiaries.length}
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredBeneficiaries.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        يرجى اختيار الفلاتر لعرض المستفيدين المطابقين
                      </div>
                    ) : (
                      filteredBeneficiaries.slice(0, 10).map((beneficiary) => (
                        <div key={beneficiary.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{beneficiary.name}</div>
                            <div className="text-sm text-gray-600">
                              {beneficiary.idNumber} - {getAreaName(beneficiary.area)} - {getFamilySizeName(beneficiary.familySize)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {beneficiary.hasChildren && 'لديه أطفال'} {beneficiary.hasElderly && 'كبار سن'}
                          </div>
                        </div>
                      ))
                    )}
                    {filteredBeneficiaries.length > 10 && (
                      <div className="text-center text-gray-500 py-2">
                        ... و {filteredBeneficiaries.length - 10} مستفيد آخر
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Actions */}
                <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                  <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    معاينة الإرسال
                  </button>
                  <button 
                    onClick={handleBulkSend}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    تأكيد الإرسال
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Individual Send Tab */}
        {activeTab === 'individual-send' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">إرسال طرد فردي</h2>
                <p className="text-gray-600 mt-1">إرسال طرد مخصص لمستفيد واحد للحالات الخاصة</p>
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">اختيار قالب الطرد</h3>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">اختر قالب الطرد</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.institution} ({getTypeInArabic(template.type)})
                  </option>
                ))}
              </select>
            </div>

            {/* Beneficiary Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">اختيار المستفيد</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البحث عن المستفيد</label>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ابحث بالاسم أو رقم الهوية..."
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">أو اختر من القائمة</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">اختر المستفيد</option>
                    {beneficiariesData.map((beneficiary) => (
                      <option key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.name} - {beneficiary.idNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تعليمات خاصة</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سبب الإرسال الفردي</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">اختر السبب</option>
                    <option value="emergency">حالة طوارئ</option>
                    <option value="special-needs">احتياجات خاصة</option>
                    <option value="compensation">تعويض عن طرد مفقود</option>
                    <option value="medical">حالة طبية خاصة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="أي ملاحظات أو تعليمات خاصة للمندوب..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={handleIndividualSend}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الطرد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Package Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">تتبع الإرسالات</h2>
                <p className="text-gray-600 mt-1">متابعة حالة جميع الطرود المرسلة</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="w-4 h-4 ml-2" />
                  تحديث
                </button>
              </div>
            </div>

            {/* Tracking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">طرود تم توصيلها</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <CheckCircle className="w-4 h-4 ml-1" />
                      +156 اليوم
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
                    <p className="text-sm font-medium text-gray-600 mb-1">طرود في الطريق</p>
                    <p className="text-3xl font-bold text-gray-900">89</p>
                    <p className="text-blue-600 text-sm mt-2 flex items-center">
                      <Clock className="w-4 h-4 ml-1" />
                      متوسط 2.4 ساعة
                    </p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-2xl">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">طرود قيد التحضير</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                    <p className="text-yellow-600 text-sm mt-2 flex items-center">
                      <Package className="w-4 h-4 ml-1" />
                      متوسط 4 ساعات
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-2xl">
                    <Package className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">طرود تحتاج متابعة</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 ml-1" />
                      يحتاج إجراء
                    </p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الخريطة التفاعلية - التتبع الجغرافي الحي</h3>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl h-96 flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">خريطة تتبع الطرود في قطاع غزة</p>
                  <p className="text-sm text-gray-500 mt-2">1,247 طرد تم توصيلها • 89 في الطريق</p>
                </div>
                
                {/* Sample delivery points */}
                {deliveriesData.map((delivery, index) => (
                  <div
                    key={delivery.id}
                    className={`absolute w-4 h-4 rounded-full animate-pulse shadow-lg cursor-pointer ${
                      delivery.status === 'delivered' ? 'bg-green-500' :
                      delivery.status === 'in-progress' ? 'bg-blue-500' :
                      delivery.status === 'preparing' ? 'bg-yellow-500' :
                      delivery.status === 'failed' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}
                    style={{
                      top: `${20 + index * 15}%`,
                      left: `${15 + index * 20}%`
                    }}
                    title={`${delivery.beneficiary} - ${delivery.package}`}
                    onClick={() => handleViewDelivery(delivery)}
                  />
                ))}

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">وسائل الإيضاح</div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">تم التوصيل</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">قيد التوزيع</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">قيد التحضير</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">فشل التسليم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">متابعة الطرود</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الإرسالية
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        قالب الطرد
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المستفيد
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المندوب
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الإرسال
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveriesData.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{delivery.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.package}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.beneficiary}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.agent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            delivery.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            delivery.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {delivery.status === 'delivered' ? 'تم التوصيل' :
                             delivery.status === 'in-progress' ? 'قيد التوزيع' :
                             delivery.status === 'preparing' ? 'قيد التحضير' :
                             delivery.status === 'failed' ? 'فشل التسليم' :
                             'متأخر'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button 
                              onClick={() => handleViewDelivery(delivery)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                              title="تتبع على الخريطة"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            {(delivery.status === 'failed' || delivery.status === 'delayed') && (
                              <button 
                                onClick={() => handleRescheduleDelivery(delivery)}
                                className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                                title="إعادة جدولة"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            )}
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

        {/* Distribution Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">تقارير التوزيع</h2>
                <p className="text-gray-600 mt-1">إحصائيات وتحليلات شاملة لعمليات التوزيع</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير التقرير
                </button>
              </div>
            </div>

            {/* Report Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">معدل نجاح التوزيع</p>
                    <p className="text-3xl font-bold text-gray-900">94.2%</p>
                    <p className="text-green-600 text-sm mt-2">+2.1% تحسن</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">متوسط ساعات التوصيل</p>
                    <p className="text-3xl font-bold text-gray-900">2.4</p>
                    <p className="text-green-600 text-sm mt-2">تحسن بـ 0.3 ساعة</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-2xl">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">مستفيدين وصلهم طرود</p>
                    <p className="text-3xl font-bold text-gray-900">3,782</p>
                    <p className="text-green-600 text-sm mt-2">+567 هذا الشهر</p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-2xl">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">إجمالي قيمة التوزيعات</p>
                    <p className="text-3xl font-bold text-gray-900">$89,450</p>
                    <p className="text-green-600 text-sm mt-2">+12% زيادة</p>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-2xl">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع أنواع الطرود</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">طرود غذائية</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">طرود طبية</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">ملابس</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">بطانيات</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">أفضل المندوبين</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">خالد أحمد</div>
                      <div className="text-sm text-gray-600">247 طرد موزع</div>
                    </div>
                    <div className="text-green-600 font-bold">98.5%</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">محمد سعيد</div>
                      <div className="text-sm text-gray-600">234 طرد موزع</div>
                    </div>
                    <div className="text-green-600 font-bold">96.2%</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">أحمد علي</div>
                      <div className="text-sm text-gray-600">189 طرد موزع</div>
                    </div>
                    <div className="text-green-600 font-bold">94.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'add-template' ? 'إنشاء قالب طرد جديد' :
                 modalType === 'edit-template' ? 'تعديل قالب الطرد' :
                 modalType === 'view-template' ? 'تفاصيل القالب' :
                 modalType === 'delivery-details' ? 'تفاصيل الإرسالية' :
                 'إعادة جدولة التوصيل'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template Form */}
            {(modalType === 'add-template' || modalType === 'edit-template') && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم القالب *</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: طرد رمضان كريم 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الطرد *</label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({...prev, type: e.target.value as any}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="food">غذائي</option>
                      <option value="medical">طبي</option>
                      <option value="clothing">ملابس</option>
                      <option value="blankets">بطانيات</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المؤسسة المانحة *</label>
                  <select
                    value={templateForm.institution}
                    onChange={(e) => setTemplateForm(prev => ({...prev, institution: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر المؤسسة</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.name}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف القالب</label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({...prev, description: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="وصف تفصيلي للقالب..."
                  />
                </div>

                {/* Package Contents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">محتويات الطرد</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الصنف</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوزن (كيلو)</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {templateForm.contents.map((content, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={content.name}
                                onChange={(e) => updateContentRow(index, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="مثال: أرز بسمتي"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={content.quantity}
                                onChange={(e) => updateContentRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="5"
                                step="0.1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={content.unit}
                                onChange={(e) => updateContentRow(index, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="كيلو">كيلو</option>
                                <option value="لتر">لتر</option>
                                <option value="عدد">عدد</option>
                                <option value="قطعة">قطعة</option>
                                <option value="علبة">علبة</option>
                                <option value="زوج">زوج</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={content.weight}
                                onChange={(e) => updateContentRow(index, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="5"
                                step="0.1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeContentRow(index)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={addContentRow}
                    className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة صنف جديد
                  </button>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleSaveTemplate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    {modalType === 'add-template' ? 'إنشاء القالب' : 'حفظ التغييرات'}
                  </button>
                </div>
              </div>
            )}

            {/* Template View */}
            {modalType === 'view-template' && selectedItem && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات القالب</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">معرف القالب:</span>
                        <span className="font-medium">{selectedItem.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">اسم القالب:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">النوع:</span>
                        <span className="font-medium">{getTypeInArabic(selectedItem.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المؤسسة:</span>
                        <span className="font-medium">{selectedItem.institution}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">إحصائيات الاستخدام</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد مرات الاستخدام:</span>
                        <span className="font-medium">{selectedItem.usageCount} مرة</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">آخر استخدام:</span>
                        <span className="font-medium">{selectedItem.lastUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الوزن الإجمالي:</span>
                        <span className="font-medium">{selectedItem.totalWeight} كيلو</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد الأصناف:</span>
                        <span className="font-medium">{selectedItem.contents.length} أصناف</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">محتويات الطرد</h4>
                  <div className="space-y-2">
                    {selectedItem.contents.map((content: PackageContent, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{content.name}</div>
                          <div className="text-sm text-gray-600">
                            {content.quantity} {content.unit} = {content.weight} كيلو
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse">
                  <button 
                    onClick={() => handleEditTemplate(selectedItem)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل القالب
                  </button>
                  <button 
                    onClick={() => handleDuplicateTemplate(selectedItem)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Copy className="w-4 h-4 ml-2" />
                    نسخ القالب
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center">
                    <Send className="w-4 h-4 ml-2" />
                    استخدام القالب
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Details */}
            {modalType === 'delivery-details' && selectedItem && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">معلومات الإرسالية</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">رقم الإرسالية:</span>
                        <span className="font-medium">{selectedItem.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع الطرد:</span>
                        <span className="font-medium">{selectedItem.package}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المستفيد:</span>
                        <span className="font-medium">{selectedItem.beneficiary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المندوب:</span>
                        <span className="font-medium">{selectedItem.agent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-3">تفاصيل التوصيل</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">وقت التوصيل:</span>
                        <span className="font-medium">{selectedItem.time} - {selectedItem.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">رقم الهاتف:</span>
                        <span className="font-medium">{selectedItem.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">العنوان:</span>
                        <span className="font-medium">{selectedItem.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery History */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-3">سجل التوصيل</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 space-x-reverse bg-white p-3 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">تم التوصيل بنجاح</div>
                        <div className="text-sm text-gray-600">استلم المستفيد الطرد وتم توقيع الاستلام</div>
                      </div>
                      <div className="text-sm text-gray-500">14:30</div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse bg-white p-3 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">في الطريق للمستفيد</div>
                        <div className="text-sm text-gray-600">المندوب في طريقه لعنوان المستفيد</div>
                      </div>
                      <div className="text-sm text-gray-500">13:45</div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse bg-white p-3 rounded-lg">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Package className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">تم التحضير</div>
                        <div className="text-sm text-gray-600">تم تحضير الطرد وتسليمه للمندوب</div>
                      </div>
                      <div className="text-sm text-gray-500">10:20</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse">
                  <button className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                    <FileText className="w-4 h-4 ml-2" />
                    طباعة التقرير
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

            {/* Reschedule Form */}
            {modalType === 'reschedule' && selectedItem && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سبب إعادة الجدولة</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="font-medium text-gray-900">لم يتم العثور على المستفيد</div>
                      <div className="text-sm text-gray-600">العنوان غير صحيح أو المستفيد غير متواجد</div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="font-medium text-gray-900">رفض الاستلام</div>
                      <div className="text-sm text-gray-600">المستفيد رفض استلام الطرد</div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="font-medium text-gray-900">أسباب أمنية</div>
                      <div className="text-sm text-gray-600">منطقة غير آمنة للتوصيل</div>
                    </div>
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="font-medium text-gray-900">أسباب أخرى</div>
                      <div className="text-sm text-gray-600">سبب غير مذكور أعلاه</div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ إعادة التوصيل</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت إعادة التوصيل</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مندوب بديل (اختياري)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">نفس المندوب</option>
                    <option value="agent-2">محمد سعيد</option>
                    <option value="agent-3">أحمد علي</option>
                    <option value="agent-4">يوسف حسام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="أي ملاحظات أو تعليمات خاصة..."
                  />
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center">
                    <Calendar className="w-4 h-4 ml-2" />
                    تأكيد إعادة الجدولة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}