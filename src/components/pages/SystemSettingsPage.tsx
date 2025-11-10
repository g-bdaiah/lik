import React, { useState } from 'react';
import { Settings, Shield, Database, Bell, Globe, Clock, Save, RefreshCw, AlertTriangle, CheckCircle, Lock, Unlock, Eye, EyeOff, Download, Upload, Trash2, Plus, Edit, X, Key, Server, Monitor, Wifi, HardDrive, Activity, Users, Package, Truck, BarChart3, Mail, Phone, MessageSquare } from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';

interface SystemSetting {
  id: string;
  category: string;
  key: string;
  name: string;
  description: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'password';
  options?: string[];
  isSecret?: boolean;
  lastModified: string;
  modifiedBy: string;
}

export default function SystemSettingsPage() {
  const { logInfo, logError } = useErrorLogger();
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'backup' | 'restore'>('add');
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Mock system settings data
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    // General Settings
    {
      id: '1',
      category: 'general',
      key: 'app_name',
      name: 'اسم التطبيق',
      description: 'الاسم الظاهر للتطبيق في جميع الواجهات',
      value: 'منصة المساعدات الإنسانية',
      type: 'text',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '2',
      category: 'general',
      key: 'app_version',
      name: 'إصدار التطبيق',
      description: 'رقم إصدار التطبيق الحالي',
      value: '1.0.0',
      type: 'text',
      lastModified: '2024-12-21',
      modifiedBy: 'النظام'
    },
    {
      id: '3',
      category: 'general',
      key: 'max_beneficiaries_per_page',
      name: 'عدد المستفيدين في الصفحة',
      description: 'الحد الأقصى لعدد المستفيدين المعروضين في صفحة واحدة',
      value: '50',
      type: 'number',
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '4',
      category: 'general',
      key: 'enable_rtl',
      name: 'تفعيل الكتابة من اليمين لليسار',
      description: 'تفعيل دعم اللغة العربية والكتابة من اليمين لليسار',
      value: 'true',
      type: 'boolean',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },

    // Security Settings
    {
      id: '5',
      category: 'security',
      key: 'session_timeout',
      name: 'مهلة انتهاء الجلسة (دقيقة)',
      description: 'المدة بالدقائق قبل انتهاء جلسة المستخدم تلقائياً',
      value: '60',
      type: 'number',
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '6',
      category: 'security',
      key: 'max_login_attempts',
      name: 'الحد الأقصى لمحاولات تسجيل الدخول',
      description: 'عدد المحاولات المسموحة قبل قفل الحساب',
      value: '5',
      type: 'number',
      lastModified: '2024-12-19',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '7',
      category: 'security',
      key: 'require_2fa',
      name: 'إجبار التحقق بخطوتين',
      description: 'إجبار جميع المستخدمين على استخدام التحقق بخطوتين',
      value: 'false',
      type: 'boolean',
      lastModified: '2024-12-18',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '8',
      category: 'security',
      key: 'encryption_key',
      name: 'مفتاح التشفير',
      description: 'مفتاح تشفير البيانات الحساسة',
      value: 'sk_live_51234567890abcdef',
      type: 'password',
      isSecret: true,
      lastModified: '2024-12-15',
      modifiedBy: 'أحمد الإدمن'
    },

    // Notifications Settings
    {
      id: '9',
      category: 'notifications',
      key: 'sms_provider',
      name: 'مزود خدمة الرسائل النصية',
      description: 'مزود الخدمة المستخدم لإرسال الرسائل النصية',
      value: 'twilio',
      type: 'select',
      options: ['twilio', 'nexmo', 'local'],
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '10',
      category: 'notifications',
      key: 'email_notifications',
      name: 'تفعيل الإشعارات بالبريد الإلكتروني',
      description: 'إرسال إشعارات للمستخدمين عبر البريد الإلكتروني',
      value: 'true',
      type: 'boolean',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '11',
      category: 'notifications',
      key: 'sms_api_key',
      name: 'مفتاح API للرسائل النصية',
      description: 'مفتاح API الخاص بمزود خدمة الرسائل النصية',
      value: 'sk_sms_1234567890',
      type: 'password',
      isSecret: true,
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },

    // Performance Settings
    {
      id: '12',
      category: 'performance',
      key: 'cache_duration',
      name: 'مدة التخزين المؤقت (ثانية)',
      description: 'مدة الاحتفاظ بالبيانات في التخزين المؤقت',
      value: '3600',
      type: 'number',
      lastModified: '2024-12-19',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '13',
      category: 'performance',
      key: 'max_concurrent_tasks',
      name: 'الحد الأقصى للمهام المتزامنة',
      description: 'عدد المهام التي يمكن تنفيذها في نفس الوقت',
      value: '10',
      type: 'number',
      lastModified: '2024-12-18',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '14',
      category: 'performance',
      key: 'enable_compression',
      name: 'تفعيل ضغط البيانات',
      description: 'ضغط البيانات المرسلة لتحسين الأداء',
      value: 'true',
      type: 'boolean',
      lastModified: '2024-12-17',
      modifiedBy: 'أحمد الإدمن'
    },

    // Backup Settings
    {
      id: '15',
      category: 'backup',
      key: 'auto_backup_enabled',
      name: 'تفعيل النسخ الاحتياطي التلقائي',
      description: 'إنشاء نسخ احتياطية تلقائية للبيانات',
      value: 'true',
      type: 'boolean',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '16',
      category: 'backup',
      key: 'backup_frequency',
      name: 'تكرار النسخ الاحتياطي',
      description: 'كم مرة يتم إنشاء نسخة احتياطية',
      value: 'daily',
      type: 'select',
      options: ['hourly', 'daily', 'weekly', 'monthly'],
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '17',
      category: 'backup',
      key: 'backup_retention_days',
      name: 'مدة الاحتفاظ بالنسخ الاحتياطية (يوم)',
      description: 'عدد الأيام للاحتفاظ بالنسخ الاحتياطية',
      value: '30',
      type: 'number',
      lastModified: '2024-12-19',
      modifiedBy: 'أحمد الإدمن'
    }
  ]);

  const [editedSettings, setEditedSettings] = useState<{ [key: string]: string }>({});

  const categories = [
    { id: 'general', name: 'الإعدادات العامة', icon: Settings, color: 'blue' },
    { id: 'security', name: 'الأمان والخصوصية', icon: Shield, color: 'red' },
    { id: 'notifications', name: 'الإشعارات', icon: Bell, color: 'green' },
    { id: 'performance', name: 'الأداء', icon: Activity, color: 'purple' },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database, color: 'orange' }
  ];

  const filteredSettings = systemSettings.filter(setting => {
    const matchesCategory = activeCategory === 'all' || setting.category === activeCategory;
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSettingChange = (settingId: string, value: string) => {
    setEditedSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // محاكاة حفظ الإعدادات
      await new Promise(resolve => setTimeout(resolve, 1000));

      // تحديث الإعدادات في البيانات الوهمية
      setSystemSettings(prev => 
        prev.map(setting => ({
          ...setting,
          value: editedSettings[setting.id] || setting.value,
          lastModified: new Date().toISOString().split('T')[0],
          modifiedBy: 'أحمد الإدمن'
        }))
      );

      setEditedSettings({});
      setHasUnsavedChanges(false);
      setNotification({ message: 'تم حفظ الإعدادات بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      logInfo('تم حفظ إعدادات النظام', 'SystemSettingsPage');
    } catch (error) {
      setNotification({ message: 'حدث خطأ في حفظ الإعدادات', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      logError(error as Error, 'SystemSettingsPage');
    }
  };

  const handleResetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      setEditedSettings({});
      setHasUnsavedChanges(false);
      setNotification({ message: 'تم إعادة تعيين الإعدادات', type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExportSettings = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      settings: systemSettings.map(setting => ({
        category: setting.category,
        key: setting.key,
        name: setting.name,
        value: setting.isSecret ? '***' : setting.value,
        type: setting.type
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `إعدادات_النظام_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تصدير الإعدادات بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImportSettings = () => {
    setModalType('restore');
    setShowModal(true);
  };

  const handleCreateBackup = () => {
    setModalType('backup');
    setShowModal(true);
  };

  const toggleSecretVisibility = (settingId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const getSettingValue = (setting: SystemSetting) => {
    return editedSettings[setting.id] !== undefined ? editedSettings[setting.id] : setting.value;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Settings;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return category ? colorClasses[category.color as keyof typeof colorClasses] : 'bg-gray-100 text-gray-600';
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
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const value = getSettingValue(setting);
    const isEdited = editedSettings[setting.id] !== undefined;

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked ? 'true' : 'false')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {value === 'true' ? 'مفعل' : 'معطل'}
            </span>
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showSecrets[setting.id] ? 'text' : 'password'}
              value={value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل القيمة..."
            />
            <button
              type="button"
              onClick={() => toggleSecretVisibility(setting.id)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecrets[setting.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل رقم..."
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل النص..."
          />
        );
    }
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

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button 
            variant="success" 
            icon={Save} 
            iconPosition="right"
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges}
          >
            حفظ التغييرات
          </Button>
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            iconPosition="right"
            onClick={handleResetSettings}
            disabled={!hasUnsavedChanges}
          >
            إعادة تعيين
          </Button>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="secondary" icon={Download} iconPosition="right" onClick={handleExportSettings}>
            تصدير الإعدادات
          </Button>
          <Button variant="secondary" icon={Upload} iconPosition="right" onClick={handleImportSettings}>
            استيراد الإعدادات
          </Button>
          <Button variant="primary" icon={Database} iconPosition="right" onClick={handleCreateBackup}>
            إنشاء نسخة احتياطية
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Card className="bg-orange-50 border-orange-200" padding="sm">
          <div className="flex items-center space-x-3 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <span className="font-medium text-orange-800">يوجد تغييرات غير محفوظة</span>
              <p className="text-orange-700 text-sm mt-1">تأكد من حفظ التغييرات قبل مغادرة الصفحة</p>
            </div>
          </div>
        </Card>
      )}

      {/* Categories and Search */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">فئات الإعدادات</h3>
          <Input
            type="text"
            icon={Settings}
            iconPosition="right"
            placeholder="البحث في الإعدادات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            جميع الفئات ({systemSettings.length})
          </button>
          {categories.map(category => {
            const IconComponent = category.icon;
            const categorySettings = systemSettings.filter(s => s.category === category.id);
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 space-x-reverse ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name} ({categorySettings.length})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Settings List */}
      <div className="space-y-4">
        {filteredSettings.length > 0 ? (
          filteredSettings.map((setting) => {
            const IconComponent = getCategoryIcon(setting.category);
            const isEdited = editedSettings[setting.id] !== undefined;
            
            return (
              <Card key={setting.id} className={isEdited ? 'border-blue-300 bg-blue-50' : ''}>
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-1">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(setting.category)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <h4 className="font-semibold text-gray-900">{setting.name}</h4>
                          {isEdited && (
                            <Badge variant="warning" size="sm">
                              معدل
                            </Badge>
                          )}
                          {setting.isSecret && (
                            <Lock className="w-4 h-4 text-red-500" title="إعداد سري" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        <div className="flex items-center space-x-2 space-x-reverse mt-2 text-xs text-gray-500">
                          <span>آخر تعديل: {new Date(setting.lastModified).toLocaleDateString('ar-SA')}</span>
                          <span>•</span>
                          <span>بواسطة: {setting.modifiedBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القيمة الحالية
                    </label>
                    {renderSettingInput(setting)}
                  </div>

                  <div className="md:col-span-1">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{setting.key}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-gray-500">النوع:</span>
                        <Badge variant="neutral" size="sm">
                          {setting.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                {searchTerm ? 'لا توجد إعدادات مطابقة للبحث' : 'لا توجد إعدادات في هذه الفئة'}
              </p>
              <p className="text-sm mt-2">
                {searchTerm ? 'جرب تعديل مصطلح البحث' : 'اختر فئة أخرى لعرض الإعدادات'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* System Information */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-6">معلومات النظام</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">الخادم</span>
            </div>
            <p className="text-sm text-blue-700">Node.js v18.17.0</p>
            <p className="text-xs text-blue-600">WebContainer</p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Database className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">قاعدة البيانات</span>
            </div>
            <p className="text-sm text-green-700">Supabase PostgreSQL</p>
            <p className="text-xs text-green-600">متصلة</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Monitor className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">الواجهة</span>
            </div>
            <p className="text-sm text-purple-700">React 18.3.1</p>
            <p className="text-xs text-purple-600">Vite + TypeScript</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">الحالة</span>
            </div>
            <p className="text-sm text-orange-700">يعمل بشكل طبيعي</p>
            <p className="text-xs text-orange-600">آخر تحديث: الآن</p>
          </div>
        </div>
      </Card>

      {/* Modal for Backup/Restore */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'backup' ? 'إنشاء نسخة احتياطية' :
            modalType === 'restore' ? 'استيراد الإعدادات' :
            'إجراء'
          }
          size="md"
        >
          <div className="p-6">
            {modalType === 'backup' && (
              <div className="text-center">
                <div className="bg-blue-100 p-6 rounded-xl mb-6">
                  <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">إنشاء نسخة احتياطية</h4>
                  <p className="text-gray-600">سيتم إنشاء نسخة احتياطية من جميع إعدادات النظام</p>
                </div>
                
                <div className="space-y-4 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>عدد الإعدادات:</span>
                    <span className="font-medium">{systemSettings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الفئات:</span>
                    <span className="font-medium">{categories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ النسخة:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-center">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      handleExportSettings();
                      setShowModal(false);
                    }}
                  >
                    إنشاء النسخة الاحتياطية
                  </Button>
                </div>
              </div>
            )}

            {modalType === 'restore' && (
              <div className="text-center">
                <div className="bg-orange-100 p-6 rounded-xl mb-6">
                  <Upload className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 mb-2">استيراد الإعدادات</h4>
                  <p className="text-gray-600">اختر ملف النسخة الاحتياطية لاستعادة الإعدادات</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">اسحب ملف JSON هنا أو اضغط للاختيار</p>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="settings-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`تم اختيار الملف: ${file.name}\nسيتم تطوير وظيفة الاستيراد لاحقاً`);
                        setShowModal(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="settings-upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    اختيار ملف
                  </label>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-center">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Security Warning */}
      <Card className="bg-red-50 border-red-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 mb-3">تحذيرات أمنية مهمة</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>تأكد من عدم مشاركة الإعدادات السرية مع أشخاص غير مخولين</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>قم بإنشاء نسخ احتياطية منتظمة من الإعدادات</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>راجع الإعدادات الأمنية بانتظام وحدثها حسب الحاجة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>تأكد من قوة كلمات المرور ومفاتيح التشفير</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}