import React, { useState } from 'react';
import { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertsContext';
import { useErrorLogger } from '../utils/errorLogger';
import { statisticsService, alertsService } from '../services/supabaseService';
import { Shield, Users, Package, Truck, Bell, BarChart3, Settings, MapPin, Calendar, FileText, AlertTriangle, CheckCircle, Clock, Plus, Search, Filter, Download, Eye, Edit, Phone, Star, UserPlus, Building2, Heart, TrendingUp, Activity, Database, MessageSquare, UserCheck, Crown, Key, Lock, ChevronRight, RefreshCw, LogOut } from 'lucide-react';
import { mockBeneficiaries, mockPackages, calculateStats, mockOrganizations, mockFamilies } from '../data/mockData';
import PermissionsManagement from './PermissionsManagement';
import { Button, Card, StatCard, Badge } from './ui';

// Import new page components
import BeneficiariesListPage from './pages/BeneficiariesListPage';
import StatusManagementPage from './pages/StatusManagementPage';
import DelayedBeneficiariesPage from './pages/DelayedBeneficiariesPage';
import ActivityLogPage from './pages/ActivityLogPage';
import PackageListPage from './pages/PackageListPage';
import BulkSendPage from './pages/BulkSendPage';
import IndividualSendPage from './pages/IndividualSendPage';
import TrackingPage from './pages/TrackingPage';
import DistributionReportsPage from './pages/DistributionReportsPage';
import OrganizationsListPage from './pages/OrganizationsListPage';
import TestSupabasePage from './pages/TestSupabasePage';
import TasksManagementPage from './pages/TasksManagementPage';
import ComprehensiveReportsPage from './pages/ComprehensiveReportsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import BackupManagementPage from './pages/BackupManagementPage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import MessagesSettingsPage from './pages/MessagesSettingsPage';
import BeneficiaryPortalSettings from './pages/BeneficiaryPortalSettings';
import BeneficiaryStatusManagement from './pages/BeneficiaryStatusManagement';
import DataUpdateRequestsPage from './pages/DataUpdateRequestsPage';
import SMSSettingsPage from './pages/SMSSettingsPage';

interface NavItem {
  id: string;
  name: string;
  icon: any;
  children?: NavItem[];
}

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({ activeTab, setActiveTab }: AdminDashboardProps) {
  const { loggedInUser, logout } = useAuth();
  const { alerts, criticalAlerts, unreadAlerts } = useAlerts();
  const { logInfo, logError } = useErrorLogger();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openMenus, setOpenMenus] = useState<string[]>(['beneficiaries', 'packages', 'organizations-families', 'distribution', 'reports-alerts', 'settings', 'development']);
  const [beneficiaryIdForIndividualSend, setBeneficiaryIdForIndividualSend] = useState<string | null>(null);

  // State for Supabase data
  const [stats, setStats] = useState<any>(calculateStats());
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    setStats(calculateStats());
    logInfo('تم تحميل البيانات بنجاح', 'AdminDashboard');
  }, [logInfo]);

  const handleNavigateToIndividualSend = (beneficiaryId: string) => {
    setBeneficiaryIdForIndividualSend(beneficiaryId);
    setActiveTab('individual-send');
  };

  // Navigation structure with hierarchical organization
  const navItems: NavItem[] = [
    {
      id: 'overview',
      name: 'نظرة عامة',
      icon: BarChart3
    },
    {
      id: 'beneficiaries',
      name: 'إدارة المستفيدين',
      icon: Users,
      children: [
        { id: 'beneficiaries-list', name: 'قائمة المستفيدين', icon: Users },
        { id: 'beneficiary-status', name: 'إدارة حالات التوثيق', icon: CheckCircle },
        { id: 'data-updates', name: 'طلبات تحديث البيانات', icon: FileText },
        { id: 'status-management', name: 'إدارة الحالات', icon: UserCheck },
        { id: 'delayed', name: 'المتأخرين', icon: Clock },
        { id: 'activity-log', name: 'سجل النشاط', icon: Activity }
      ]
    },
    {
      id: 'packages',
      name: 'إدارة الطرود',
      icon: Package,
      children: [
        { id: 'packages-list', name: 'قوالب الطرود', icon: Package },
        { id: 'bulk-send', name: 'إرسال جماعي', icon: Users },
        { id: 'individual-send', name: 'إرسال فردي', icon: UserPlus },
        { id: 'tracking', name: 'تتبع الإرسالات', icon: Truck },
        { id: 'distribution-reports', name: 'تقارير التوزيع', icon: BarChart3 }
      ]
    },
    {
      id: 'organizations-families',
      name: 'إدارة الشركاء',
      icon: Building2,
      children: [
        { id: 'organizations', name: 'إدارة المؤسسات', icon: Building2 },
        { id: 'families', name: 'إدارة العائلات', icon: Heart }
      ]
    },
    {
      id: 'distribution',
      name: 'إدارة التوزيع',
      icon: Truck,
      children: [
        { id: 'couriers', name: 'إدارة المندوبين', icon: Truck },
        { id: 'tasks', name: 'إدارة المهام', icon: Clock }
      ]
    },
    {
      id: 'reports-alerts',
      name: 'التقارير والتنبيهات',
      icon: BarChart3,
      children: [
        { id: 'reports', name: 'التقارير الشاملة', icon: BarChart3 },
        { id: 'alerts', name: 'التنبيهات', icon: Bell }
      ]
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      icon: Settings,
      children: [
        { id: 'permissions', name: 'إدارة الصلاحيات', icon: Shield },
        { id: 'beneficiary-portal', name: 'بوابة المستفيدين', icon: Users },
        { id: 'messages', name: 'إعدادات الرسائل', icon: MessageSquare },
        { id: 'sms-settings', name: 'إعدادات SMS', icon: Phone },
        { id: 'system', name: 'إعدادات النظام', icon: Settings },
        { id: 'backup', name: 'النسخ الاحتياطي', icon: Database },
        { id: 'audit', name: 'سجل المراجعة', icon: Activity }
      ]
    },
    {
      id: 'development',
      name: 'أدوات التطوير',
      icon: Settings,
      children: [
        { id: 'test-supabase', name: 'اختبار Supabase', icon: Database }
      ]
    }
  ];

  const settingsItems = [
    { id: 'permissions', name: 'إدارة الصلاحيات', icon: Shield, description: 'إدارة أدوار المستخدمين وصلاحياتهم' },
    { id: 'beneficiary-portal', name: 'بوابة المستفيدين', icon: Users, description: 'إعدادات وتفعيل بوابة المستفيدين' },
    { id: 'messages', name: 'إعدادات الرسائل', icon: MessageSquare, description: 'إدارة قوالب الرسائل والتنبيهات' },
    { id: 'sms-settings', name: 'إعدادات SMS', icon: Phone, description: 'إدارة خدمة SMS وإرسال رسائل التحقق' },
    { id: 'system', name: 'إعدادات النظام', icon: Settings, description: 'الإعدادات العامة للنظام' },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database, description: 'إدارة النسخ الاحتياطية للبيانات' },
    { id: 'audit', name: 'سجل المراجعة', icon: Activity, description: 'سجل جميع العمليات في النظام' }
  ];

  React.useEffect(() => {
    logInfo('تم تحميل لوحة التحكم الرئيسية', 'AdminDashboard');
  }, []);

  // Initialize open menus based on active tab
  React.useEffect(() => {
    const findParentMenu = (tabId: string): string | null => {
      for (const item of navItems) {
        if (item.children) {
          for (const child of item.children) {
            if (child.id === tabId) {
              return item.id;
            }
          }
        }
      }
      return null;
    };

    const parentMenu = findParentMenu(activeTab);
    if (parentMenu && !openMenus.includes(parentMenu)) {
      setOpenMenus(prev => [...prev, parentMenu]);
    }
  }, [activeTab]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuActive = (item: NavItem): boolean => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some(child => child.id === activeTab);
    }
    return false;
  };

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

  const handleCall = (phone: string) => {
    if (confirm(`هل تريد الاتصال بالرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      date: new Date().toISOString(),
      stats,
      beneficiaries: mockBeneficiaries.length,
      packages: mockPackages.length,
      alerts: unreadAlerts.length
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_النظام_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('تم تصدير تقرير النظام بنجاح');
  };

  const getPageTitle = (tabId: string) => {
    for (const item of navItems) {
      if (item.id === tabId) {
        return { name: item.name, icon: item.icon, description: '' };
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.id === tabId) {
            return { 
              name: child.name, 
              icon: child.icon, 
              description: getPageDescription(child.id)
            };
          }
        }
      }
    }
    return { name: 'غير محدد', icon: FileText, description: '' };
  };

  const getPageDescription = (tabId: string) => {
    const descriptions: { [key: string]: string } = {
      'overview': 'نظرة شاملة على النظام والأنشطة',
      'beneficiaries-list': 'إدارة جميع المستفيدين المسجلين في النظام',
      'status-management': 'تصنيف وإدارة حالات الأهلية للمستفيدين',
      'delayed': 'المستفيدين الذين لم يستلموا طرودهم في الوقت المحدد',
      'activity-log': 'سجل جميع الأنشطة والعمليات في النظام',
      'packages-list': 'إنشاء وإدارة قوالب الطرود وعمليات التوزيع',
      'bulk-send': 'إرسال طرود متعددة للمستفيدين',
      'individual-send': 'إرسال طرد لمستفيد واحد',
      'tracking': 'تتبع حالة الطرود والإرسالات',
      'distribution-reports': 'تقارير مفصلة عن عمليات التوزيع',
      'organizations': 'إدارة المؤسسات الخيرية والإنسانية',
      'families': 'إدارة العائلات والمبادرين الفرديين',
      'couriers': 'إدارة المندوبين ومتابعة أدائهم',
      'tasks': 'إدارة مهام التوزيع والمتابعة',
      'reports': 'تقارير شاملة وإحصائيات مفصلة',
      'alerts': 'التنبيهات والإشعارات المهمة',
      'permissions': 'إدارة أدوار المستخدمين وصلاحياتهم',
      'messages': 'إدارة قوالب الرسائل والتنبيهات',
      'sms-settings': 'إدارة خدمة TweetSMS API وإرسال رسائل التحقق',
      'system': 'الإعدادات العامة للنظام',
      'backup': 'إدارة النسخ الاحتياطية للبيانات',
      'audit': 'سجل جميع العمليات في النظام'
    };
    return descriptions[tabId] || '';
  };

  const renderMainContent = () => {
    const pageInfo = getPageTitle(activeTab);
    const IconComponent = pageInfo.icon;

    // Show permissions management component
    if (activeTab === 'permissions') {
      return <PermissionsManagement />;
    }

    // Beneficiaries pages
    if (activeTab === 'beneficiaries-list') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <BeneficiariesListPage 
            onNavigateToIndividualSend={handleNavigateToIndividualSend}
          />
        </div>
      );
    }

    if (activeTab === 'beneficiary-status') {
      return <BeneficiaryStatusManagement />;
    }

    if (activeTab === 'data-updates') {
      return <DataUpdateRequestsPage />;
    }

    if (activeTab === 'status-management') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <StatusManagementPage 
            onNavigateToIndividualSend={handleNavigateToIndividualSend}
          />
        </div>
      );
    }

    if (activeTab === 'delayed') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <DelayedBeneficiariesPage />
        </div>
      );
    }

    if (activeTab === 'activity-log') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <ActivityLogPage />
        </div>
      );
    }

    // Package pages
    if (activeTab === 'packages-list') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <PackageListPage 
            key={`packages-${Date.now()}`} 
          />
        </div>
      );
    }

    if (activeTab === 'bulk-send') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <BulkSendPage />
        </div>
      );
    }

    if (activeTab === 'individual-send') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <IndividualSendPage
            beneficiaryIdToPreselect={beneficiaryIdForIndividualSend}
            onBeneficiaryPreselected={() => setBeneficiaryIdForIndividualSend(null)} 
          />
        </div>
      );
    }

    if (activeTab === 'tracking') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <TrackingPage />
        </div>
      );
    }

    if (activeTab === 'distribution-reports') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <DistributionReportsPage />
        </div>
      );
    }

    if (activeTab === 'organizations') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <OrganizationsListPage 
            highlightOrganizationId={loggedInUser?.associatedType === 'organization' ? loggedInUser.associatedId : undefined}
          />
        </div>
      );
    }

    if (activeTab === 'tasks') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <TasksManagementPage />
        </div>
      );
    }

    if (activeTab === 'families') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <div className="bg-gray-100 rounded-2xl p-12 mb-6">
                <div className="text-gray-400 text-center">
                  <Heart className="w-20 h-20 mx-auto mb-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">إدارة العائلات</h3>
              <p className="text-gray-600 mb-6">هذا القسم قيد التطوير - سيتم إضافة التفاصيل الكاملة قريباً</p>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
                ابدأ التطوير
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Test Supabase page
    if (activeTab === 'test-supabase') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">اختبار الاتصال وجلب البيانات من Supabase</p>
            </div>
          </div>
          <TestSupabasePage />
        </div>
      );
    }

    // Overview Tab
    if (activeTab === 'overview') {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
                <p className="text-gray-600 mt-1">{pageInfo.description}</p>
              </div>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button 
                onClick={handleExportReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 ml-2" />
                تصدير التقرير
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                تحديث البيانات
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">تنبيهات حرجة تحتاج إجراء فوري</h3>
              </div>
              <div className="space-y-3">
                {criticalAlerts.slice(0, 3).map((alert) => (
                  <Card key={alert.id} className="bg-white border-red-200" padding="sm">
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                    <Button variant="danger" size="sm">
                      اتخاذ إجراء
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <Card className="col-span-4">
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 ml-3" />
                  <span className="text-gray-600">جاري تحميل الإحصائيات من Supabase...</span>
                </div>
              </Card>
            ) : statsError ? (
              <Card className="bg-red-50 border-red-200 col-span-4" padding="sm">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="text-red-800 font-medium">خطأ في تحميل الإحصائيات</span>
                    <p className="text-red-600 text-sm mt-1">{statsError}</p>
                  </div>
                </div>
              </Card>
            ) : stats ? (
              <>
                <StatCard
                  title="إجمالي المستفيدين"
                  value={stats?.totalBeneficiaries || 0}
                  icon={Users}
                  trend={{
                    value: `${stats?.verifiedBeneficiaries || 0} موثق`,
                    direction: 'up',
                    label: ''
                  }}
                  color="blue"
                />

                <StatCard
                  title="الطرود النشطة"
                  value={stats?.totalPackages || 0}
                  icon={Package}
                  trend={{
                    value: `${stats?.deliveredPackages || 0} تم التسليم`,
                    direction: 'up',
                    label: ''
                  }}
                  color="green"
                />

                <StatCard
                  title="المهام النشطة"
                  value={stats?.activeTasks || 0}
                  icon={Truck}
                  trend={{
                    value: `${stats?.criticalAlerts || 0} حرجة`,
                    direction: 'down',
                    label: ''
                  }}
                  color="orange"
                />

                <StatCard
                  title="نسبة التسليم"
                  value={`${stats?.deliveryRate || 0}%`}
                  icon={BarChart3}
                  trend={{
                    value: 'من إجمالي الطرود',
                    direction: 'up',
                    label: ''
                  }}
                  color="purple"
                />
              </>
            ) : (
              <Card className="bg-gray-50 col-span-4">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد إحصائيات متاحة</p>
                  <p className="text-sm mt-1">تأكد من الاتصال بـ Supabase</p>
                </div>
              </Card>
            )}
          </div>

          {/* Connection Status */}
          {/* Alerts Loading/Error States */}
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card hover onClick={() => setActiveTab('beneficiaries-list')}>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إدارة المستفيدين</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">إضافة وإدارة المستفيدين الجدد</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>إدارة المستفيدين</span>
                <ChevronRight className="w-4 h-4 mr-1" />
              </div>
            </Card>

            <Card hover onClick={() => setActiveTab('packages-list')}>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">إدارة الطرود</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">إنشاء وتوزيع الطرود</p>
              <div className="flex items-center text-green-600 text-sm font-medium">
                <span>إدارة الطرود</span>
                <ChevronRight className="w-4 h-4 mr-1" />
              </div>
            </Card>

            <Card hover onClick={() => setActiveTab('reports')}>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">التقارير والإحصائيات</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">عرض التقارير المفصلة</p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>عرض التقارير</span>
                <ChevronRight className="w-4 h-4 mr-1" />
              </div>
            </Card>
          </div>

          {/* Recent Activities and System Map */}
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
                    <p className="text-sm font-medium text-gray-900">تم تسليم 15 طرد في منطقة خان يونس</p>
                    <p className="text-xs text-gray-500 mt-1">منذ 5 دقائق</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">إضافة 8 مستفيدين جدد للنظام</p>
                    <p className="text-xs text-gray-500 mt-1">منذ 15 دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">تحديث عناوين 3 مستفيدين</p>
                    <p className="text-xs text-gray-500 mt-1">منذ 30 دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">تسجيل مؤسسة جديدة: جمعية الخير</p>
                    <p className="text-xs text-gray-500 mt-1">منذ ساعة</p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('alerts')}
                className="w-full mt-4"
              >
                عرض جميع الأنشطة
              </Button>
            </Card>

            {/* System Overview Map */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">خريطة النظام</h3>
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center relative">
                <div className="text-center z-10">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">قطاع غزة - نظرة شاملة</p>
                  <p className="text-sm text-gray-500 mt-2">{stats?.totalBeneficiaries || 0} مستفيد في 5 محافظات</p>
                </div>
                <div className="absolute top-12 left-16 w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute top-20 right-20 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute bottom-16 left-24 w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="absolute bottom-24 right-16 w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            </Card>
          </div>

          {/* Organizations and Families Overview */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">المؤسسات النشطة</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('organizations')}
                >
                  عرض الكل
                </Button>
              </div>
              <div className="space-y-4">
                {mockOrganizations.slice(0, 3).map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-sm text-gray-600">{org.beneficiariesCount} مستفيد</p>
                    </div>
                    <Badge variant={org.status === 'active' ? 'success' : 'warning'} size="sm">
                      {org.status === 'active' ? 'نشطة' : 'معلقة'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">العائلات النشطة</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('families')}
                >
                  عرض الكل
                </Button>
              </div>
              <div className="space-y-4">
                {mockFamilies.map((family) => (
                  <div key={family.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{family.name}</p>
                      <p className="text-sm text-gray-600">{family.membersCount} فرد</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">{family.completionRate}%</p>
                      <p className="text-xs text-gray-500">نسبة الإنجاز</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (activeTab === 'reports') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <ComprehensiveReportsPage />
        </div>
      );
    }

    if (activeTab === 'alerts') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <AlertsManagementPage />
        </div>
      );
    }

    if (activeTab === 'messages') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <MessagesSettingsPage />
        </div>
      );
    }

    if (activeTab === 'sms-settings') {
      return (
        <div className="space-y-6">
          <SMSSettingsPage />
        </div>
      );
    }

    // Settings Tab
    if (activeTab === 'settings') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
                <p className="text-gray-600 mt-1">{pageInfo.description}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsItems.map((item) => {
              const ItemIconComponent = item.icon;
              return (
                <Card 
                  key={item.id}
                  hover
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <ItemIconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>فتح الإعدادات</span>
                    <ChevronRight className="w-4 h-4 mr-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === 'system') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <SystemSettingsPage />
        </div>
      );
    }

    if (activeTab === 'beneficiary-portal') {
      return <BeneficiaryPortalSettings />;
    }

    if (activeTab === 'backup') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <BackupManagementPage />
        </div>
      );
    }

    // Other tabs placeholder
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="flex items-center space-x-4 space-x-reverse mb-8">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-gray-900">{pageInfo.name}</h2>
              <p className="text-gray-600 mt-1">{pageInfo.description}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-12 mb-6">
            <div className="text-gray-400 text-center">
              <IconComponent className="w-12 h-12 mx-auto mb-4" />
            </div>
          </div>
          <p className="text-gray-600 mb-6">هذا القسم قيد التطوير - سيتم إضافة التفاصيل الكاملة قريباً</p>
          <Button variant="primary">
            ابدأ التطوير
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">لوحة الإدارة</h1>
              <p className="text-sm text-gray-500">{loggedInUser?.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = isMenuActive(item);
            const isExpanded = openMenus.includes(item.id);

            return (
              <div key={item.id}>
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-lg text-base font-semibold transition-all duration-200 ${
                    index > 0 ? 'mt-4' : ''
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <IconComponent className={`w-4 h-4 ml-2 ${isActive ? 'text-blue-600' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.children && (
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Sub Menu Items */}
                {item.children && isExpanded && (
                  <div className="mt-1 mr-4 space-y-1">
                    {item.children.map((child) => {
                      const ChildIconComponent = child.icon;
                      const isChildActive = activeTab === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => setActiveTab(child.id)}
                          className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isChildActive
                              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <ChildIconComponent className={`w-4 h-4 ${isChildActive ? 'text-blue-600' : ''}`} />
                          <span>{child.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{loggedInUser?.name}</p>
                  <p className="text-xs text-gray-500">مدير النظام</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <ErrorBoundary>
            {renderMainContent()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}