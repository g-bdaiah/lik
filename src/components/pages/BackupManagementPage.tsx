import React, { useState } from 'react';
import { Database, Download, Upload, Calendar, Shield, Clock, CheckCircle, AlertTriangle, RefreshCw, Trash2, Eye, Settings, Lock, Unlock, HardDrive, Server, Activity, FileText, Save, X, Plus, Filter, Search, Archive, Folder, File } from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';

interface BackupFile {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'settings' | 'users';
  size: string;
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'in_progress' | 'failed';
  encrypted: boolean;
  description: string;
  downloadUrl?: string;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  retentionDays: number;
}

export default function BackupManagementPage() {
  const { logInfo, logError } = useErrorLogger();
  const [activeTab, setActiveTab] = useState('backups');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'restore' | 'schedule' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Mock backup files data
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([
    {
      id: 'backup-1',
      name: 'نسخة_احتياطية_كاملة_2024-12-21',
      type: 'full',
      size: '45.2 MB',
      createdAt: '2024-12-21T10:30:00',
      createdBy: 'أحمد الإدمن',
      status: 'completed',
      encrypted: true,
      description: 'نسخة احتياطية كاملة تشمل جميع البيانات والإعدادات'
    },
    {
      id: 'backup-2',
      name: 'نسخة_احتياطية_تزايدية_2024-12-20',
      type: 'incremental',
      size: '12.8 MB',
      createdAt: '2024-12-20T22:00:00',
      createdBy: 'النظام التلقائي',
      status: 'completed',
      encrypted: true,
      description: 'نسخة احتياطية تزايدية للتغييرات الأخيرة'
    },
    {
      id: 'backup-3',
      name: 'نسخة_إعدادات_النظام_2024-12-19',
      type: 'settings',
      size: '2.1 MB',
      createdAt: '2024-12-19T15:45:00',
      createdBy: 'أحمد الإدمن',
      status: 'completed',
      encrypted: false,
      description: 'نسخة احتياطية من إعدادات النظام فقط'
    },
    {
      id: 'backup-4',
      name: 'نسخة_المستخدمين_2024-12-18',
      type: 'users',
      size: '5.7 MB',
      createdAt: '2024-12-18T09:15:00',
      createdBy: 'فاطمة المشرفة',
      status: 'failed',
      encrypted: true,
      description: 'نسخة احتياطية من بيانات المستخدمين والأدوار'
    }
  ]);

  // Mock backup schedules data
  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([
    {
      id: 'schedule-1',
      name: 'نسخة احتياطية يومية',
      type: 'incremental',
      frequency: 'daily',
      time: '02:00',
      enabled: true,
      lastRun: '2024-12-21T02:00:00',
      nextRun: '2024-12-22T02:00:00',
      retentionDays: 7
    },
    {
      id: 'schedule-2',
      name: 'نسخة احتياطية أسبوعية كاملة',
      type: 'full',
      frequency: 'weekly',
      time: '01:00',
      enabled: true,
      lastRun: '2024-12-15T01:00:00',
      nextRun: '2024-12-22T01:00:00',
      retentionDays: 30
    },
    {
      id: 'schedule-3',
      name: 'نسخة احتياطية شهرية للأرشيف',
      type: 'full',
      frequency: 'monthly',
      time: '00:00',
      enabled: false,
      nextRun: '2025-01-01T00:00:00',
      retentionDays: 365
    }
  ]);

  const [createBackupForm, setCreateBackupForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental' | 'settings' | 'users',
    description: '',
    encrypted: true,
    includeFiles: true
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    retentionDays: 30,
    enabled: true
  });

  const tabs = [
    { id: 'backups', name: 'النسخ الاحتياطية', icon: Database },
    { id: 'schedules', name: 'الجدولة التلقائية', icon: Calendar },
    { id: 'restore', name: 'استعادة البيانات', icon: RefreshCw },
    { id: 'settings', name: 'إعدادات النسخ', icon: Settings }
  ];

  const backupTypes = [
    { value: 'full', label: 'نسخة كاملة', description: 'جميع البيانات والإعدادات' },
    { value: 'incremental', label: 'نسخة تزايدية', description: 'التغييرات منذ آخر نسخة' },
    { value: 'settings', label: 'الإعدادات فقط', description: 'إعدادات النظام والتكوين' },
    { value: 'users', label: 'المستخدمين فقط', description: 'بيانات المستخدمين والأدوار' }
  ];

  const frequencies = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'monthly', label: 'شهرياً' }
  ];

  const handleCreateBackup = async () => {
    if (!createBackupForm.name.trim()) {
      setNotification({ message: 'اسم النسخة الاحتياطية مطلوب', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // محاكاة عملية إنشاء النسخة الاحتياطية
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newBackup: BackupFile = {
        id: `backup-${Date.now()}`,
        name: createBackupForm.name,
        type: createBackupForm.type,
        size: `${Math.floor(Math.random() * 50) + 10}.${Math.floor(Math.random() * 9)} MB`,
        createdAt: new Date().toISOString(),
        createdBy: 'أحمد الإدمن',
        status: 'completed',
        encrypted: createBackupForm.encrypted,
        description: createBackupForm.description
      };

      setBackupFiles(prev => [newBackup, ...prev]);
      setNotification({ message: 'تم إنشاء النسخة الاحتياطية بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      
      setShowModal(false);
      setCreateBackupForm({
        name: '',
        type: 'full',
        description: '',
        encrypted: true,
        includeFiles: true
      });
      
      logInfo(`تم إنشاء نسخة احتياطية: ${newBackup.name}`, 'BackupManagementPage');
    } catch (error) {
      setNotification({ message: 'حدث خطأ في إنشاء النسخة الاحتياطية', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      logError(error as Error, 'BackupManagementPage');
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const handleDeleteBackup = (backup: BackupFile) => {
    if (confirm(`هل أنت متأكد من حذف النسخة الاحتياطية "${backup.name}"؟`)) {
      setBackupFiles(prev => prev.filter(b => b.id !== backup.id));
      setNotification({ message: 'تم حذف النسخة الاحتياطية بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف نسخة احتياطية: ${backup.name}`, 'BackupManagementPage');
    }
  };

  const handleDownloadBackup = (backup: BackupFile) => {
    // محاكاة تحميل النسخة الاحتياطية
    const backupData = {
      metadata: {
        name: backup.name,
        type: backup.type,
        createdAt: backup.createdAt,
        encrypted: backup.encrypted
      },
      data: {
        beneficiaries: 'بيانات المستفيدين...',
        organizations: 'بيانات المؤسسات...',
        packages: 'بيانات الطرود...',
        settings: 'إعدادات النظام...'
      }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${backup.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تحميل النسخة الاحتياطية بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestoreBackup = (backup: BackupFile) => {
    if (confirm(`هل أنت متأكد من استعادة النسخة الاحتياطية "${backup.name}"؟\n\nتحذير: سيتم استبدال البيانات الحالية!`)) {
      setNotification({ message: 'تم بدء عملية الاستعادة - سيتم إشعارك عند الانتهاء', type: 'warning' });
      setTimeout(() => {
        setNotification({ message: 'تم استعادة البيانات بنجاح', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }, 3000);
      logInfo(`تم استعادة نسخة احتياطية: ${backup.name}`, 'BackupManagementPage');
    }
  };

  const handleCreateSchedule = () => {
    if (!scheduleForm.name.trim()) {
      setNotification({ message: 'اسم الجدولة مطلوب', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const newSchedule: BackupSchedule = {
      id: `schedule-${Date.now()}`,
      name: scheduleForm.name,
      type: scheduleForm.type,
      frequency: scheduleForm.frequency,
      time: scheduleForm.time,
      enabled: scheduleForm.enabled,
      nextRun: calculateNextRun(scheduleForm.frequency, scheduleForm.time),
      retentionDays: scheduleForm.retentionDays
    };

    setBackupSchedules(prev => [newSchedule, ...prev]);
    setNotification({ message: 'تم إنشاء جدولة النسخ الاحتياطي بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    
    setShowModal(false);
    setScheduleForm({
      name: '',
      type: 'full',
      frequency: 'daily',
      time: '02:00',
      retentionDays: 30,
      enabled: true
    });
    
    logInfo(`تم إنشاء جدولة نسخ احتياطي: ${newSchedule.name}`, 'BackupManagementPage');
  };

  const calculateNextRun = (frequency: string, time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()));
    } else if (frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1, 1);
    }
    
    return nextRun.toISOString();
  };

  const toggleSchedule = (scheduleId: string) => {
    setBackupSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
    
    const schedule = backupSchedules.find(s => s.id === scheduleId);
    setNotification({ 
      message: `تم ${schedule?.enabled ? 'إيقاف' : 'تفعيل'} الجدولة بنجاح`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in_progress': return 'قيد التنفيذ';
      case 'failed': return 'فشلت';
      default: return 'غير محدد';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'incremental': return 'bg-green-100 text-green-800';
      case 'settings': return 'bg-purple-100 text-purple-800';
      case 'users': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full': return 'كاملة';
      case 'incremental': return 'تزايدية';
      case 'settings': return 'إعدادات';
      case 'users': return 'مستخدمين';
      default: return 'غير محدد';
    }
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

  const filteredBackups = backupFiles.filter(backup =>
    backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    backup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            variant="primary" 
            icon={Plus} 
            iconPosition="right"
            onClick={() => {
              setModalType('create');
              setShowModal(true);
            }}
          >
            إنشاء نسخة احتياطية
          </Button>
          <Button 
            variant="secondary" 
            icon={Calendar} 
            iconPosition="right"
            onClick={() => {
              setModalType('schedule');
              setShowModal(true);
            }}
          >
            إضافة جدولة
          </Button>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="secondary" icon={Upload} iconPosition="right">
            استيراد نسخة
          </Button>
          <Button variant="secondary" icon={Settings} iconPosition="right">
            إعدادات متقدمة
          </Button>
        </div>
      </div>

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

      {/* Backup Progress */}
      {isCreatingBackup && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="animate-spin">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-blue-800">جاري إنشاء النسخة الاحتياطية...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${backupProgress}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-blue-700 text-sm">{backupProgress}%</div>
        </Card>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في النسخ الاحتياطية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-xl mb-2">
                  <Database className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-blue-600">إجمالي النسخ</p>
                <p className="text-2xl font-bold text-blue-900">{backupFiles.length}</p>
              </div>
            </Card>

            <Card className="bg-green-50">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-xl mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-green-600">مكتملة</p>
                <p className="text-2xl font-bold text-green-900">
                  {backupFiles.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </Card>

            <Card className="bg-orange-50">
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-xl mb-2">
                  <Shield className="w-6 h-6 text-orange-600 mx-auto" />
                </div>
                <p className="text-sm text-orange-600">مشفرة</p>
                <p className="text-2xl font-bold text-orange-900">
                  {backupFiles.filter(b => b.encrypted).length}
                </p>
              </div>
            </Card>

            <Card className="bg-purple-50">
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-xl mb-2">
                  <HardDrive className="w-6 h-6 text-purple-600 mx-auto" />
                </div>
                <p className="text-sm text-purple-600">الحجم الإجمالي</p>
                <p className="text-2xl font-bold text-purple-900">65.8 MB</p>
              </div>
            </Card>
          </div>

          {/* Backups List */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">النسخ الاحتياطية ({filteredBackups.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النسخة الاحتياطية
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحجم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
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
                  {filteredBackups.length > 0 ? (
                    filteredBackups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg ml-4">
                              <Database className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <span className="text-sm font-medium text-gray-900">{backup.name}</span>
                                {backup.encrypted && (
                                  <Lock className="w-4 h-4 text-green-600" title="مشفرة" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{backup.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              backup.type === 'full' ? 'info' :
                              backup.type === 'incremental' ? 'success' :
                              backup.type === 'settings' ? 'warning' : 'neutral'
                            }
                            size="sm"
                          >
                            {getTypeText(backup.type)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{new Date(backup.createdAt).toLocaleDateString('ar-SA')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(backup.createdAt).toLocaleTimeString('ar-SA')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              backup.status === 'completed' ? 'success' :
                              backup.status === 'in_progress' ? 'warning' : 'error'
                            }
                            size="sm"
                          >
                            {getStatusText(backup.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 space-x-reverse">
                            <button 
                              onClick={() => handleDownloadBackup(backup)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                              title="تحميل"
                              disabled={backup.status !== 'completed'}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRestoreBackup(backup)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                              title="استعادة"
                              disabled={backup.status !== 'completed'}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedItem(backup);
                                setModalType('view');
                                setShowModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBackup(backup)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" 
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">لا توجد نسخ احتياطية</p>
                          <p className="text-sm mt-2">ابدأ بإنشاء نسخة احتياطية جديدة</p>
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

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {backupSchedules.map((schedule) => (
              <Card key={schedule.id} className={schedule.enabled ? 'border-green-300' : 'border-gray-200'}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      schedule.enabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Calendar className={`w-4 h-4 ${schedule.enabled ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                      <Badge 
                        variant={schedule.enabled ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {schedule.enabled ? 'مفعل' : 'معطل'}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      schedule.enabled 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {schedule.enabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">النوع:</span>
                    <Badge variant="info" size="sm">
                      {getTypeText(schedule.type)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التكرار:</span>
                    <span className="font-medium text-gray-900">
                      {frequencies.find(f => f.value === schedule.frequency)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الوقت:</span>
                    <span className="font-medium text-gray-900">{schedule.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التشغيل التالي:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(schedule.nextRun).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  {schedule.lastRun && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر تشغيل:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(schedule.lastRun).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">استعادة البيانات</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">استعادة من ملف نسخة احتياطية</h4>
              <p className="text-gray-600 mb-4">اسحب ملف النسخة الاحتياطية هنا أو اضغط للاختيار</p>
              <input
                type="file"
                accept=".json,.zip,.sql"
                className="hidden"
                id="restore-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNotification({ message: `تم اختيار الملف: ${file.name}. سيتم تطوير وظيفة الاستعادة لاحقاً`, type: 'warning' });
                    setTimeout(() => setNotification(null), 5000);
                  }
                }}
              />
              <label
                htmlFor="restore-upload"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center"
              >
                <Upload className="w-4 h-4 ml-2" />
                اختيار ملف
              </label>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
              <div className="flex items-start space-x-3 space-x-reverse">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-2">تحذير مهم</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• استعادة البيانات ستستبدل جميع البيانات الحالية</li>
                    <li>• تأكد من إنشاء نسخة احتياطية من البيانات الحالية أولاً</li>
                    <li>• قد تستغرق عملية الاستعادة عدة دقائق</li>
                    <li>• سيتم إعادة تشغيل النظام بعد الاستعادة</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Backups for Restore */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">النسخ الاحتياطية المتاحة للاستعادة</h3>
            <div className="space-y-3">
              {backupFiles.filter(b => b.status === 'completed').slice(0, 5).map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Database className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{backup.name}</p>
                      <p className="text-sm text-gray-600">
                        {backup.size} • {new Date(backup.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleRestoreBackup(backup)}
                  >
                    استعادة
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">إعدادات النسخ الاحتياطي</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">الإعدادات العامة</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">التشفير التلقائي</p>
                      <p className="text-sm text-gray-600">تشفير جميع النسخ الاحتياطية تلقائياً</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">ضغط الملفات</p>
                      <p className="text-sm text-gray-600">ضغط النسخ الاحتياطية لتوفير المساحة</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">التحقق من التكامل</p>
                      <p className="text-sm text-gray-600">التحقق من سلامة النسخ الاحتياطية</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">إعدادات التخزين</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مدة الاحتفاظ الافتراضية (أيام)
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأقصى لحجم النسخة (MB)
                    </label>
                    <input
                      type="number"
                      defaultValue={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مجلد التخزين
                    </label>
                    <input
                      type="text"
                      defaultValue="/backups"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="primary" icon={Save} iconPosition="right">
                حفظ الإعدادات
              </Button>
            </div>
          </Card>

          {/* Storage Usage */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6">استخدام التخزين</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">المساحة المستخدمة</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">65.8 MB</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '13%' }}></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">13% من 500 MB</p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Archive className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">النسخ المضغوطة</span>
                </div>
                <p className="text-2xl font-bold text-green-900">3</p>
                <p className="text-xs text-green-700">توفير 45% من المساحة</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">النسخ المشفرة</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">3</p>
                <p className="text-xs text-orange-700">من أصل 4 نسخ</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Other tabs placeholder */}
      {activeTab === 'restore' && (
        <Card className="p-8">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">استعادة البيانات</h3>
            <p className="text-gray-600 mb-6">هذا القسم قيد التطوير - سيتم إضافة واجهة الاستعادة المتقدمة</p>
            <Button variant="primary">
              تطوير واجهة الاستعادة
            </Button>
          </div>
        </Card>
      )}

      {/* Modal for Create/Schedule/View */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'create' ? 'إنشاء نسخة احتياطية جديدة' :
            modalType === 'schedule' ? 'إضافة جدولة جديدة' :
            modalType === 'view' ? 'تفاصيل النسخة الاحتياطية' :
            'استعادة البيانات'
          }
          size="md"
        >
          <div className="p-6">
            {/* Create Backup Form */}
            {modalType === 'create' && (
              <div className="space-y-4">
                <Input
                  label="اسم النسخة الاحتياطية *"
                  type="text"
                  value={createBackupForm.name}
                  onChange={(e) => setCreateBackupForm({...createBackupForm, name: e.target.value})}
                  placeholder="مثال: نسخة_احتياطية_كاملة_2024"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع النسخة الاحتياطية *</label>
                  <select
                    value={createBackupForm.type}
                    onChange={(e) => setCreateBackupForm({...createBackupForm, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {backupTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="الوصف"
                  type="textarea"
                  value={createBackupForm.description}
                  onChange={(e) => setCreateBackupForm({...createBackupForm, description: e.target.value})}
                  placeholder="وصف مختصر للنسخة الاحتياطية..."
                  rows={3}
                />

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={createBackupForm.encrypted}
                      onChange={(e) => setCreateBackupForm({...createBackupForm, encrypted: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">تشفير النسخة الاحتياطية</label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={createBackupForm.includeFiles}
                      onChange={(e) => setCreateBackupForm({...createBackupForm, includeFiles: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">تضمين الملفات المرفقة</label>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                    loading={isCreatingBackup}
                  >
                    إنشاء النسخة الاحتياطية
                  </Button>
                </div>
              </div>
            )}

            {/* Schedule Form */}
            {modalType === 'schedule' && (
              <div className="space-y-4">
                <Input
                  label="اسم الجدولة *"
                  type="text"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({...scheduleForm, name: e.target.value})}
                  placeholder="مثال: نسخة احتياطية يومية"
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع النسخة</label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="full">نسخة كاملة</option>
                      <option value="incremental">نسخة تزايدية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التكرار</label>
                    <select
                      value={scheduleForm.frequency}
                      onChange={(e) => setScheduleForm({...scheduleForm, frequency: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {frequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="وقت التنفيذ"
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  />

                  <Input
                    label="مدة الاحتفاظ (أيام)"
                    type="number"
                    value={scheduleForm.retentionDays}
                    onChange={(e) => setScheduleForm({...scheduleForm, retentionDays: parseInt(e.target.value) || 30})}
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={scheduleForm.enabled}
                    onChange={(e) => setScheduleForm({...scheduleForm, enabled: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">تفعيل الجدولة فور الإنشاء</label>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleCreateSchedule}>
                    إنشاء الجدولة
                  </Button>
                </div>
              </div>
            )}

            {/* View Backup Details */}
            {modalType === 'view' && selectedItem && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">تفاصيل النسخة الاحتياطية</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-medium text-gray-900">{selectedItem.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">النوع:</span>
                        <Badge variant="info" size="sm">
                          {getTypeText(selectedItem.type)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحجم:</span>
                        <span className="font-medium text-gray-900">{selectedItem.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">مشفرة:</span>
                        <span className={`font-medium ${selectedItem.encrypted ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedItem.encrypted ? 'نعم' : 'لا'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الإنشاء:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedItem.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">المنشئ:</span>
                        <span className="font-medium text-gray-900">{selectedItem.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحالة:</span>
                        <Badge 
                          variant={
                            selectedItem.status === 'completed' ? 'success' :
                            selectedItem.status === 'in_progress' ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {getStatusText(selectedItem.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedItem.description && (
                    <div className="mt-4">
                      <span className="text-gray-600 text-sm">الوصف:</span>
                      <p className="text-gray-900 mt-1">{selectedItem.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => handleDownloadBackup(selectedItem)}
                    disabled={selectedItem.status !== 'completed'}
                  >
                    تحميل النسخة
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Database className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات النسخ الاحتياطي</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>قم بإنشاء نسخ احتياطية منتظمة لحماية البيانات</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>استخدم التشفير لحماية البيانات الحساسة</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>اختبر عملية الاستعادة بانتظام</span>
                </li>
              </ul>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>احتفظ بنسخ في مواقع متعددة</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>راقب مساحة التخزين المتاحة</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>احذف النسخ القديمة غير المطلوبة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}