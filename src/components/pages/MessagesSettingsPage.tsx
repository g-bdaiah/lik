import React, { useState } from 'react';
import { MessageSquare, Mail, Phone, Bell, Settings, Save, Plus, Edit, Trash2, Eye, Copy, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, Clock, Users, Send, FileText, Star, Activity, X, Search, Filter } from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';

interface MessageTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push' | 'whatsapp';
  category: 'delivery' | 'reminder' | 'confirmation' | 'alert' | 'welcome' | 'custom';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  createdBy: string;
}

interface NotificationSettings {
  id: string;
  category: string;
  name: string;
  description: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
}

interface MessageLog {
  id: string;
  templateId: string;
  templateName: string;
  type: 'sms' | 'email' | 'push' | 'whatsapp';
  recipient: string;
  recipientName: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
  cost?: number;
}

export default function MessagesSettingsPage() {
  const { logInfo, logError } = useErrorLogger();
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-template' | 'edit-template' | 'view-template' | 'test-template' | 'view-log'>('add-template');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Mock data for message templates
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      name: 'تأكيد استلام الطرد',
      type: 'sms',
      category: 'confirmation',
      content: 'مرحباً {name}، تم تسليم طردك بنجاح. رقم الإرسالية: {tracking_number}. شكراً لك.',
      variables: ['name', 'tracking_number'],
      isActive: true,
      usageCount: 247,
      lastUsed: '2024-12-21',
      createdAt: '2024-01-15',
      createdBy: 'أحمد الإدمن'
    },
    {
      id: '2',
      name: 'تذكير بموعد التسليم',
      type: 'sms',
      category: 'reminder',
      content: 'عزيزي {name}، سيتم تسليم طردك غداً في تمام الساعة {delivery_time}. يرجى التواجد في المنزل.',
      variables: ['name', 'delivery_time'],
      isActive: true,
      usageCount: 156,
      lastUsed: '2024-12-20',
      createdAt: '2024-01-20',
      createdBy: 'فاطمة المشرفة'
    },
    {
      id: '3',
      name: 'إشعار فشل التسليم',
      type: 'sms',
      category: 'alert',
      content: 'عذراً {name}، لم نتمكن من تسليم طردك بسبب {failure_reason}. سيتم إعادة المحاولة قريباً.',
      variables: ['name', 'failure_reason'],
      isActive: true,
      usageCount: 23,
      lastUsed: '2024-12-19',
      createdAt: '2024-02-01',
      createdBy: 'أحمد الإدمن'
    },
    {
      id: '4',
      name: 'ترحيب بمستفيد جديد',
      type: 'email',
      category: 'welcome',
      subject: 'مرحباً بك في منصة المساعدات الإنسانية',
      content: 'مرحباً {name}،\n\nنرحب بك في منصة المساعدات الإنسانية. تم تسجيلك بنجاح برقم الهوية {national_id}.\n\nسيتم التواصل معك قريباً لتحديد احتياجاتك.\n\nشكراً لك.',
      variables: ['name', 'national_id'],
      isActive: true,
      usageCount: 89,
      lastUsed: '2024-12-18',
      createdAt: '2024-01-10',
      createdBy: 'سارة المنسقة'
    },
    {
      id: '5',
      name: 'تنبيه طرد متأخر',
      type: 'whatsapp',
      category: 'alert',
      content: '⚠️ تنبيه: طرد {package_name} متأخر منذ {days_delayed} أيام. المستفيد: {beneficiary_name}. يرجى المتابعة فوراً.',
      variables: ['package_name', 'days_delayed', 'beneficiary_name'],
      isActive: true,
      usageCount: 45,
      lastUsed: '2024-12-21',
      createdAt: '2024-02-15',
      createdBy: 'أحمد الإدمن'
    }
  ]);

  // Mock data for notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>([
    {
      id: '1',
      category: 'delivery',
      name: 'إشعارات التسليم',
      description: 'إشعارات عند تسليم الطرود بنجاح',
      smsEnabled: true,
      emailEnabled: false,
      pushEnabled: true,
      whatsappEnabled: true,
      priority: 'high',
      recipients: ['beneficiary', 'admin']
    },
    {
      id: '2',
      category: 'alerts',
      name: 'تنبيهات الطوارئ',
      description: 'تنبيهات للحالات الطارئة والمشاكل الحرجة',
      smsEnabled: true,
      emailEnabled: true,
      pushEnabled: true,
      whatsappEnabled: true,
      priority: 'critical',
      recipients: ['admin', 'supervisor']
    },
    {
      id: '3',
      category: 'reminders',
      name: 'تذكيرات المواعيد',
      description: 'تذكيرات بمواعيد التسليم والمتابعة',
      smsEnabled: true,
      emailEnabled: false,
      pushEnabled: true,
      whatsappEnabled: false,
      priority: 'medium',
      recipients: ['beneficiary']
    }
  ]);

  // Mock data for message logs
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([
    {
      id: '1',
      templateId: '1',
      templateName: 'تأكيد استلام الطرد',
      type: 'sms',
      recipient: '0591234567',
      recipientName: 'محمد أبو عامر',
      status: 'delivered',
      sentAt: '2024-12-21T10:30:00',
      deliveredAt: '2024-12-21T10:31:00',
      cost: 0.05
    },
    {
      id: '2',
      templateId: '2',
      templateName: 'تذكير بموعد التسليم',
      type: 'sms',
      recipient: '0592345678',
      recipientName: 'فاطمة الفرا',
      status: 'sent',
      sentAt: '2024-12-21T09:15:00',
      cost: 0.05
    },
    {
      id: '3',
      templateId: '3',
      templateName: 'إشعار فشل التسليم',
      type: 'sms',
      recipient: '0593456789',
      recipientName: 'خالد النجار',
      status: 'failed',
      sentAt: '2024-12-20T16:45:00',
      failureReason: 'رقم غير صحيح'
    }
  ]);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'sms' as MessageTemplate['type'],
    category: 'custom' as MessageTemplate['category'],
    subject: '',
    content: '',
    variables: [] as string[]
  });

  const tabs = [
    { id: 'templates', name: 'قوالب الرسائل', icon: MessageSquare },
    { id: 'settings', name: 'إعدادات الإشعارات', icon: Settings },
    { id: 'logs', name: 'سجل الرسائل', icon: Activity },
    { id: 'statistics', name: 'الإحصائيات', icon: Star }
  ];

  const templateCategories = [
    { value: 'delivery', label: 'التسليم' },
    { value: 'reminder', label: 'التذكيرات' },
    { value: 'confirmation', label: 'التأكيد' },
    { value: 'alert', label: 'التنبيهات' },
    { value: 'welcome', label: 'الترحيب' },
    { value: 'custom', label: 'مخصص' }
  ];

  const messageTypes = [
    { value: 'sms', label: 'رسالة نصية', icon: Phone },
    { value: 'email', label: 'بريد إلكتروني', icon: Mail },
    { value: 'push', label: 'إشعار فوري', icon: Bell },
    { value: 'whatsapp', label: 'واتساب', icon: MessageSquare }
  ];

  // فلترة القوالب
  const filteredTemplates = messageTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // فلترة سجل الرسائل
  const filteredLogs = messageLogs.filter(log => {
    const matchesSearch = log.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.recipient.includes(searchTerm);
    return matchesSearch;
  });

  // إحصائيات
  const statistics = {
    totalTemplates: messageTemplates.length,
    activeTemplates: messageTemplates.filter(t => t.isActive).length,
    totalSent: messageLogs.length,
    delivered: messageLogs.filter(l => l.status === 'delivered').length,
    failed: messageLogs.filter(l => l.status === 'failed').length,
    pending: messageLogs.filter(l => l.status === 'pending').length,
    totalCost: messageLogs.reduce((sum, log) => sum + (log.cost || 0), 0)
  };

  const handleAddTemplate = () => {
    setModalType('add-template');
    setSelectedItem(null);
    setTemplateForm({
      name: '',
      type: 'sms',
      category: 'custom',
      subject: '',
      content: '',
      variables: []
    });
    setShowModal(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setModalType('edit-template');
    setSelectedItem(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables
    });
    setShowModal(true);
  };

  const handleViewTemplate = (template: MessageTemplate) => {
    setModalType('view-template');
    setSelectedItem(template);
    setShowModal(true);
  };

  const handleTestTemplate = (template: MessageTemplate) => {
    setModalType('test-template');
    setSelectedItem(template);
    setShowModal(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      setNotification({ message: 'يرجى إدخال اسم القالب والمحتوى', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (selectedItem) {
      // تحديث قالب موجود
      setMessageTemplates(prev => 
        prev.map(template => 
          template.id === selectedItem.id 
            ? {
                ...template,
                name: templateForm.name,
                type: templateForm.type,
                category: templateForm.category,
                subject: templateForm.subject,
                content: templateForm.content,
                variables: extractVariables(templateForm.content)
              }
            : template
        )
      );
      setNotification({ message: 'تم تحديث القالب بنجاح', type: 'success' });
    } else {
      // إضافة قالب جديد
      const newTemplate: MessageTemplate = {
        id: `template-${Date.now()}`,
        name: templateForm.name,
        type: templateForm.type,
        category: templateForm.category,
        subject: templateForm.subject,
        content: templateForm.content,
        variables: extractVariables(templateForm.content),
        isActive: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'أحمد الإدمن'
      };
      setMessageTemplates(prev => [newTemplate, ...prev]);
      setNotification({ message: 'تم إضافة القالب بنجاح', type: 'success' });
    }

    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
    setSelectedItem(null);
    logInfo(`تم ${selectedItem ? 'تحديث' : 'إضافة'} قالب الرسالة: ${templateForm.name}`, 'MessagesSettingsPage');
  };

  const handleDeleteTemplate = (template: MessageTemplate) => {
    if (confirm(`هل أنت متأكد من حذف القالب "${template.name}"؟`)) {
      setMessageTemplates(prev => prev.filter(t => t.id !== template.id));
      setNotification({ message: 'تم حذف القالب بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف قالب الرسالة: ${template.name}`, 'MessagesSettingsPage');
    }
  };

  const handleToggleTemplate = (template: MessageTemplate) => {
    setMessageTemplates(prev => 
      prev.map(t => 
        t.id === template.id 
          ? { ...t, isActive: !t.isActive }
          : t
      )
    );
    setNotification({ 
      message: `تم ${template.isActive ? 'إلغاء تفعيل' : 'تفعيل'} القالب`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTestSend = () => {
    if (!selectedItem) return;
    
    // محاكاة إرسال رسالة تجريبية
    const testLog: MessageLog = {
      id: `test-${Date.now()}`,
      templateId: selectedItem.id,
      templateName: selectedItem.name,
      type: selectedItem.type,
      recipient: '0591234567',
      recipientName: 'مستخدم تجريبي',
      status: 'sent',
      sentAt: new Date().toISOString(),
      cost: 0.05
    };
    
    setMessageLogs(prev => [testLog, ...prev]);
    setNotification({ message: 'تم إرسال الرسالة التجريبية بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    setShowModal(false);
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = messageTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : MessageSquare;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sms': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'push': return 'bg-purple-100 text-purple-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'confirmation': return 'bg-purple-100 text-purple-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'welcome': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'تم الإرسال';
      case 'delivered': return 'تم التسليم';
      case 'failed': return 'فشل';
      case 'pending': return 'في الانتظار';
      default: return 'غير محدد';
    }
  };

  const getCategoryText = (category: string) => {
    const categoryInfo = templateCategories.find(c => c.value === category);
    return categoryInfo ? categoryInfo.label : 'غير محدد';
  };

  const getNotificationClasses = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-200 text-orange-800';
    }
  };

  const getNotificationIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const handleExportTemplates = () => {
    const exportData = {
      date: new Date().toISOString(),
      totalTemplates: messageTemplates.length,
      activeTemplates: messageTemplates.filter(t => t.isActive).length,
      templates: messageTemplates.map(t => ({
        name: t.name,
        type: t.type,
        category: getCategoryText(t.category),
        content: t.content,
        variables: t.variables,
        usageCount: t.usageCount,
        isActive: t.isActive
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `قوالب_الرسائل_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تصدير قوالب الرسائل بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportLogs = () => {
    const exportData = {
      date: new Date().toISOString(),
      totalMessages: messageLogs.length,
      statistics,
      logs: messageLogs.map(log => ({
        templateName: log.templateName,
        type: log.type,
        recipient: log.recipientName,
        status: getStatusText(log.status),
        sentAt: log.sentAt,
        deliveredAt: log.deliveredAt,
        cost: log.cost
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_الرسائل_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تصدير سجل الرسائل بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

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

      {/* Tabs */}
      <Card>
        <div className="flex space-x-1 space-x-reverse">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3 space-x-reverse">
              <Button variant="success" icon={Download} iconPosition="right" onClick={handleExportTemplates}>
                تصدير القوالب
              </Button>
              <Button variant="primary" icon={Plus} iconPosition="right" onClick={handleAddTemplate}>
                إضافة قالب جديد
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card>
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في قوالب الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-xl mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-blue-600">إجمالي القوالب</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.totalTemplates}</p>
              </div>
            </Card>

            <Card className="bg-green-50">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-xl mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-green-600">قوالب نشطة</p>
                <p className="text-2xl font-bold text-green-900">{statistics.activeTemplates}</p>
              </div>
            </Card>

            <Card className="bg-purple-50">
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-xl mb-2">
                  <Send className="w-6 h-6 text-purple-600 mx-auto" />
                </div>
                <p className="text-sm text-purple-600">رسائل مرسلة</p>
                <p className="text-2xl font-bold text-purple-900">{statistics.totalSent}</p>
              </div>
            </Card>

            <Card className="bg-orange-50">
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-xl mb-2">
                  <Star className="w-6 h-6 text-orange-600 mx-auto" />
                </div>
                <p className="text-sm text-orange-600">معدل التسليم</p>
                <p className="text-2xl font-bold text-orange-900">
                  {statistics.totalSent > 0 ? ((statistics.delivered / statistics.totalSent) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </Card>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const TypeIcon = getTypeIcon(template.type);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <Badge variant={
                          template.category === 'alert' ? 'error' :
                          template.category === 'delivery' ? 'success' :
                          template.category === 'reminder' ? 'warning' : 'info'
                        } size="sm">
                          {getCategoryText(template.category)}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={template.isActive ? 'success' : 'neutral'} size="sm">
                      {template.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>استُخدم {template.usageCount} مرة</span>
                    <span>{template.variables.length} متغير</span>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="primary" size="sm" onClick={() => handleViewTemplate(template)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleEditTemplate(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="warning" size="sm" onClick={() => handleTestTemplate(template)}>
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={template.isActive ? 'neutral' : 'success'} 
                      size="sm" 
                      onClick={() => handleToggleTemplate(template)}
                    >
                      {template.isActive ? 'إلغاء' : 'تفعيل'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">إعدادات الإشعارات</h3>
            <Button variant="primary" icon={Save} iconPosition="right">
              حفظ الإعدادات
            </Button>
          </div>

          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <Card key={setting.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{setting.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Badge variant={
                    setting.priority === 'critical' ? 'error' :
                    setting.priority === 'high' ? 'warning' :
                    setting.priority === 'medium' ? 'info' : 'neutral'
                  } size="sm">
                    {setting.priority === 'critical' ? 'حرجة' :
                     setting.priority === 'high' ? 'عالية' :
                     setting.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input 
                      type="checkbox" 
                      checked={setting.smsEnabled}
                      onChange={(e) => {
                        setNotificationSettings(prev => 
                          prev.map(s => 
                            s.id === setting.id 
                              ? { ...s, smsEnabled: e.target.checked }
                              : s
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">رسائل نصية</span>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input 
                      type="checkbox" 
                      checked={setting.emailEnabled}
                      onChange={(e) => {
                        setNotificationSettings(prev => 
                          prev.map(s => 
                            s.id === setting.id 
                              ? { ...s, emailEnabled: e.target.checked }
                              : s
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">بريد إلكتروني</span>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input 
                      type="checkbox" 
                      checked={setting.pushEnabled}
                      onChange={(e) => {
                        setNotificationSettings(prev => 
                          prev.map(s => 
                            s.id === setting.id 
                              ? { ...s, pushEnabled: e.target.checked }
                              : s
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">إشعار فوري</span>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input 
                      type="checkbox" 
                      checked={setting.whatsappEnabled}
                      onChange={(e) => {
                        setNotificationSettings(prev => 
                          prev.map(s => 
                            s.id === setting.id 
                              ? { ...s, whatsappEnabled: e.target.checked }
                              : s
                          )
                        );
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">واتساب</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-3 space-x-reverse">
              <Button variant="success" icon={Download} iconPosition="right" onClick={handleExportLogs}>
                تصدير السجل
              </Button>
              <Button variant="secondary" icon={RefreshCw} iconPosition="right">
                تحديث البيانات
              </Button>
            </div>
          </div>

          {/* Search */}
          <Card>
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في سجل الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Card>

          {/* Logs Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">سجل الرسائل ({filteredLogs.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      القالب
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستلم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإرسال
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التكلفة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const TypeIcon = getTypeIcon(log.type);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ml-3 ${getTypeColor(log.type)}`}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{log.templateName}</div>
                                <div className="text-sm text-gray-500">#{log.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="info" size="sm">
                              {messageTypes.find(t => t.value === log.type)?.label || log.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{log.recipientName}</div>
                              <div className="text-sm text-gray-500">{log.recipient}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={
                              log.status === 'delivered' ? 'success' :
                              log.status === 'failed' ? 'error' :
                              log.status === 'sent' ? 'info' : 'warning'
                            } size="sm">
                              {getStatusText(log.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.sentAt).toLocaleString('ar-SA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.cost ? `${log.cost.toFixed(2)} ₪` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => {
                                setSelectedItem(log);
                                setModalType('view-log');
                                setShowModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">لا توجد رسائل في السجل</p>
                          <p className="text-sm mt-2">لم يتم إرسال أي رسائل بعد</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">إحصائيات الرسائل</h3>
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-xl mb-3">
                  <Send className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-blue-600">إجمالي المرسل</p>
                <p className="text-3xl font-bold text-blue-900">{statistics.totalSent}</p>
              </div>
            </Card>

            <Card className="bg-green-50">
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-xl mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-green-600">تم التسليم</p>
                <p className="text-3xl font-bold text-green-900">{statistics.delivered}</p>
              </div>
            </Card>

            <Card className="bg-red-50">
              <div className="text-center">
                <div className="bg-red-100 p-4 rounded-xl mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                </div>
                <p className="text-sm text-red-600">فشل الإرسال</p>
                <p className="text-3xl font-bold text-red-900">{statistics.failed}</p>
              </div>
            </Card>

            <Card className="bg-purple-50">
              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-xl mb-3">
                  <Star className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <p className="text-sm text-purple-600">التكلفة الإجمالية</p>
                <p className="text-3xl font-bold text-purple-900">{statistics.totalCost.toFixed(2)} ₪</p>
              </div>
            </Card>
          </div>

          {/* Usage by Template */}
          <Card>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">الاستخدام حسب القالب</h4>
            <div className="space-y-3">
              {messageTemplates
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5)
                .map((template) => {
                  const percentage = statistics.totalSent > 0 ? (template.usageCount / statistics.totalSent) * 100 : 0;
                  return (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                          {React.createElement(getTypeIcon(template.type), { className: "w-4 h-4" })}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-600">{getCategoryText(template.category)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{template.usageCount}</p>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Performance Metrics */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">معدلات الأداء</h4>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">معدل التسليم</span>
                    <span className="text-2xl font-bold text-green-900">
                      {statistics.totalSent > 0 ? ((statistics.delivered / statistics.totalSent) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700">متوسط وقت التسليم</span>
                    <span className="text-2xl font-bold text-blue-900">2.3 ثانية</span>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-700">متوسط التكلفة</span>
                    <span className="text-2xl font-bold text-purple-900">
                      {statistics.totalSent > 0 ? (statistics.totalCost / statistics.totalSent).toFixed(3) : 0} ₪
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">التوزيع حسب النوع</h4>
              <div className="space-y-3">
                {messageTypes.map((type) => {
                  const count = messageLogs.filter(log => log.type === type.value).length;
                  const percentage = statistics.totalSent > 0 ? (count / statistics.totalSent) * 100 : 0;
                  const TypeIcon = type.icon;
                  
                  return (
                    <div key={type.value} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-600 mr-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal for Templates and Logs */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add-template' ? 'إضافة قالب رسالة جديد' :
            modalType === 'edit-template' ? 'تعديل قالب الرسالة' :
            modalType === 'view-template' ? 'عرض تفاصيل القالب' :
            modalType === 'test-template' ? 'اختبار القالب' :
            'تفاصيل الرسالة'
          }
          size="lg"
        >
          <div className="p-6">
            {/* Add/Edit Template Form */}
            {(modalType === 'add-template' || modalType === 'edit-template') && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="اسم القالب *"
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    placeholder="أدخل اسم القالب..."
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الرسالة *</label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({...templateForm, type: e.target.value as MessageTemplate['type']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {messageTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({...templateForm, category: e.target.value as MessageTemplate['category']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {templateCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  {templateForm.type === 'email' && (
                    <Input
                      label="موضوع الرسالة"
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                      placeholder="أدخل موضوع البريد الإلكتروني..."
                    />
                  )}
                </div>

                <div>
                  <Input
                    label="محتوى الرسالة *"
                    type="textarea"
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    placeholder="أدخل محتوى الرسالة... استخدم {variable_name} للمتغيرات"
                    rows={6}
                    required
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">المتغيرات المتاحة:</p>
                    <div className="flex flex-wrap gap-1">
                      {['name', 'national_id', 'phone', 'address', 'package_name', 'tracking_number', 'delivery_time', 'failure_reason'].map(variable => (
                        <button
                          key={variable}
                          onClick={() => {
                            const newContent = templateForm.content + `{${variable}}`;
                            setTemplateForm({...templateForm, content: newContent});
                          }}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Variables Preview */}
                {templateForm.content && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h5 className="font-medium text-gray-900 mb-2">المتغيرات المكتشفة:</h5>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(templateForm.content).map(variable => (
                        <Badge key={variable} variant="info" size="sm">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleSaveTemplate}>
                    {modalType === 'add-template' ? 'إضافة القالب' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* View Template */}
            {modalType === 'view-template' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">اسم القالب:</span>
                      <p className="text-gray-900 mt-1">{selectedItem.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">النوع:</span>
                      <Badge variant="info" size="sm" className="mt-1">
                        {messageTypes.find(t => t.value === selectedItem.type)?.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">الفئة:</span>
                      <Badge variant="neutral" size="sm" className="mt-1">
                        {getCategoryText(selectedItem.category)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">عدد مرات الاستخدام:</span>
                      <p className="text-gray-900 mt-1">{selectedItem.usageCount}</p>
                    </div>
                  </div>
                </div>

                {selectedItem.subject && (
                  <div>
                    <span className="font-medium text-gray-700">الموضوع:</span>
                    <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedItem.subject}</p>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">المحتوى:</span>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{selectedItem.content}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">المتغيرات:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedItem.variables.map((variable: string) => (
                      <Badge key={variable} variant="info" size="sm">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button variant="warning" onClick={() => handleTestTemplate(selectedItem)}>
                    اختبار القالب
                  </Button>
                  <Button variant="primary" onClick={() => handleEditTemplate(selectedItem)}>
                    تعديل القالب
                  </Button>
                </div>
              </div>
            )}

            {/* Test Template */}
            {modalType === 'test-template' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">اختبار القالب: {selectedItem.name}</h4>
                  <p className="text-yellow-700 text-sm">سيتم إرسال رسالة تجريبية باستخدام هذا القالب</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف التجريبي</label>
                  <input
                    type="tel"
                    defaultValue="0591234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل رقم الهاتف..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h5 className="font-medium text-gray-900 mb-2">معاينة الرسالة:</h5>
                  <p className="text-gray-700 bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                    {selectedItem.content
                      .replace('{name}', 'محمد التجريبي')
                      .replace('{national_id}', '900123456')
                      .replace('{phone}', '0591234567')
                      .replace('{package_name}', 'طرد مواد غذائية')
                      .replace('{tracking_number}', 'TRK-2024-001')
                      .replace('{delivery_time}', '10:00 صباحاً')
                      .replace('{failure_reason}', 'عدم توفر المستفيد')
                      .replace('{days_delayed}', '3')
                      .replace('{beneficiary_name}', 'محمد التجريبي')
                    }
                  </p>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="warning" onClick={handleTestSend}>
                    إرسال تجريبي
                  </Button>
                </div>
              </div>
            )}

            {/* View Log Details */}
            {modalType === 'view-log' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">تفاصيل الرسالة</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">القالب:</span>
                      <p className="text-gray-900 mt-1">{selectedItem.templateName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">النوع:</span>
                      <Badge variant="info" size="sm" className="mt-1">
                        {messageTypes.find(t => t.value === selectedItem.type)?.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">المستلم:</span>
                      <p className="text-gray-900 mt-1">{selectedItem.recipientName}</p>
                      <p className="text-gray-600 text-xs">{selectedItem.recipient}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">الحالة:</span>
                      <Badge variant={
                        selectedItem.status === 'delivered' ? 'success' :
                        selectedItem.status === 'failed' ? 'error' :
                        selectedItem.status === 'sent' ? 'info' : 'warning'
                      } size="sm" className="mt-1">
                        {getStatusText(selectedItem.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">تاريخ الإرسال:</span>
                      <p className="text-gray-900 mt-1">{new Date(selectedItem.sentAt).toLocaleString('ar-SA')}</p>
                    </div>
                    {selectedItem.deliveredAt && (
                      <div>
                        <span className="font-medium text-gray-700">تاريخ التسليم:</span>
                        <p className="text-gray-900 mt-1">{new Date(selectedItem.deliveredAt).toLocaleString('ar-SA')}</p>
                      </div>
                    )}
                    {selectedItem.cost && (
                      <div>
                        <span className="font-medium text-gray-700">التكلفة:</span>
                        <p className="text-gray-900 mt-1">{selectedItem.cost.toFixed(2)} ₪</p>
                      </div>
                    )}
                    {selectedItem.failureReason && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">سبب الفشل:</span>
                        <p className="text-red-600 mt-1">{selectedItem.failureReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            )}

            {/* Test Template */}
            {modalType === 'test-template' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">اختبار القالب: {selectedItem.name}</h4>
                  <p className="text-yellow-700 text-sm">سيتم إرسال رسالة تجريبية باستخدام هذا القالب</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف التجريبي</label>
                  <input
                    type="tel"
                    defaultValue="0591234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل رقم الهاتف..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h5 className="font-medium text-gray-900 mb-2">معاينة الرسالة:</h5>
                  <p className="text-gray-700 bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                    {selectedItem.content
                      .replace('{name}', 'محمد التجريبي')
                      .replace('{national_id}', '900123456')
                      .replace('{phone}', '0591234567')
                      .replace('{package_name}', 'طرد مواد غذائية')
                      .replace('{tracking_number}', 'TRK-2024-001')
                      .replace('{delivery_time}', '10:00 صباحاً')
                      .replace('{failure_reason}', 'عدم توفر المستفيد')
                      .replace('{days_delayed}', '3')
                      .replace('{beneficiary_name}', 'محمد التجريبي')
                    }
                  </p>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="warning" onClick={handleTestSend}>
                    إرسال تجريبي
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <MessageSquare className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات إدارة الرسائل</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>استخدم المتغيرات مثل {'{name}'} لتخصيص الرسائل تلقائياً</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>اختبر القوالب قبل تفعيلها لضمان صحة المحتوى</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>راقب إحصائيات التسليم لتحسين فعالية الرسائل</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>استخدم أولويات مختلفة للرسائل حسب أهميتها</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}