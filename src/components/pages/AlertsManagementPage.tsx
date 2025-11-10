import React, { useState } from 'react';
import { Bell, Search, Filter, Plus, Eye, Trash2, CheckCircle, AlertTriangle, Clock, Users, Package, Download, RefreshCw, X, Star, TrendingUp, Activity, Shield, MessageSquare } from 'lucide-react';
import { useAlerts } from '../../context/AlertsContext';
import { mockBeneficiaries, mockPackages, mockTasks, type Alert } from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';

export default function AlertsManagementPage() {
  const { alerts, unreadAlerts, criticalAlerts, markAsRead, removeAlert, clearAllAlerts, addAlert } = useAlerts();
  const { logInfo, logError } = useErrorLogger();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'view' | 'bulk-action'>('add');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form state for adding new alerts
  const [newAlertForm, setNewAlertForm] = useState({
    type: 'delayed' as Alert['type'],
    title: '',
    description: '',
    relatedId: '',
    relatedType: 'package' as Alert['relatedType'],
    priority: 'medium' as Alert['priority']
  });

  // فلترة التنبيهات
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && alert.isRead) ||
                         (statusFilter === 'unread' && !alert.isRead);
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  // إحصائيات
  const statistics = {
    total: alerts.length,
    unread: unreadAlerts.length,
    critical: criticalAlerts.length,
    high: alerts.filter(a => a.priority === 'high' && !a.isRead).length,
    medium: alerts.filter(a => a.priority === 'medium' && !a.isRead).length,
    low: alerts.filter(a => a.priority === 'low' && !a.isRead).length
  };

  const handleMarkAsRead = (alertId: string) => {
    markAsRead(alertId);
    setNotification({ message: 'تم وضع علامة كمقروء', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    logInfo(`تم وضع علامة كمقروء للتنبيه: ${alertId}`, 'AlertsManagementPage');
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
      removeAlert(alertId);
      setNotification({ message: 'تم حذف التنبيه بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف التنبيه: ${alertId}`, 'AlertsManagementPage');
    }
  };

  const handleClearAllAlerts = () => {
    if (confirm('هل أنت متأكد من حذف جميع التنبيهات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      clearAllAlerts();
      setNotification({ message: 'تم حذف جميع التنبيهات', type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
      logInfo('تم حذف جميع التنبيهات', 'AlertsManagementPage');
    }
  };

  const handleAddAlert = () => {
    if (!newAlertForm.title.trim() || !newAlertForm.description.trim()) {
      setNotification({ message: 'يرجى إدخال العنوان والوصف', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    addAlert({
      type: newAlertForm.type,
      title: newAlertForm.title,
      description: newAlertForm.description,
      relatedId: newAlertForm.relatedId || 'system',
      relatedType: newAlertForm.relatedType,
      priority: newAlertForm.priority,
      isRead: false
    });

    setNotification({ message: 'تم إضافة التنبيه بنجاح', type: 'success' });
    setTimeout(() => setNotification(null), 3000);
    
    // إعادة تعيين النموذج
    setNewAlertForm({
      type: 'delayed',
      title: '',
      description: '',
      relatedId: '',
      relatedType: 'package',
      priority: 'medium'
    });
    
    setShowModal(false);
    logInfo(`تم إضافة تنبيه جديد: ${newAlertForm.title}`, 'AlertsManagementPage');
  };

  const handleBulkAction = (action: 'mark-read' | 'delete') => {
    if (selectedAlerts.length === 0) {
      setNotification({ message: 'يرجى اختيار تنبيهات أولاً', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (action === 'mark-read') {
      selectedAlerts.forEach(alertId => markAsRead(alertId));
      setNotification({ message: `تم وضع علامة كمقروء لـ ${selectedAlerts.length} تنبيه`, type: 'success' });
    } else if (action === 'delete') {
      if (confirm(`هل أنت متأكد من حذف ${selectedAlerts.length} تنبيه؟`)) {
        selectedAlerts.forEach(alertId => removeAlert(alertId));
        setNotification({ message: `تم حذف ${selectedAlerts.length} تنبيه`, type: 'success' });
      }
    }
    
    setTimeout(() => setNotification(null), 3000);
    setSelectedAlerts([]);
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delayed': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'urgent': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'حرجة';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'delayed': return 'متأخر';
      case 'failed': return 'فشل';
      case 'expired': return 'منتهي الصلاحية';
      case 'urgent': return 'عاجل';
      default: return 'عام';
    }
  };

  const getRelatedInfo = (alert: Alert) => {
    if (alert.relatedType === 'package') {
      const packageInfo = mockPackages.find(p => p.id === alert.relatedId);
      return packageInfo ? `طرد: ${packageInfo.name}` : 'طرد غير محدد';
    } else if (alert.relatedType === 'beneficiary') {
      const beneficiary = mockBeneficiaries.find(b => b.id === alert.relatedId);
      return beneficiary ? `مستفيد: ${beneficiary.name}` : 'مستفيد غير محدد';
    } else if (alert.relatedType === 'task') {
      const task = mockTasks.find(t => t.id === alert.relatedId);
      return task ? `مهمة: ${task.id}` : 'مهمة غير محددة';
    }
    return 'غير محدد';
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

  const handleExportAlerts = () => {
    const exportData = {
      date: new Date().toISOString(),
      totalAlerts: alerts.length,
      filteredAlerts: filteredAlerts.length,
      statistics,
      alerts: filteredAlerts.map(alert => ({
        id: alert.id,
        type: getTypeText(alert.type),
        title: alert.title,
        description: alert.description,
        priority: getPriorityText(alert.priority),
        isRead: alert.isRead ? 'مقروء' : 'غير مقروء',
        relatedInfo: getRelatedInfo(alert),
        createdAt: alert.createdAt
      }))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_التنبيهات_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تصدير تقرير التنبيهات بنجاح', type: 'success' });
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

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button 
            variant="success" 
            icon={Download} 
            iconPosition="right"
            onClick={handleExportAlerts}
          >
            تصدير التنبيهات
          </Button>
          <Button 
            variant="primary" 
            icon={Plus} 
            iconPosition="right"
            onClick={() => {
              setModalType('add');
              setShowModal(true);
            }}
          >
            إضافة تنبيه جديد
          </Button>
          <Button 
            variant="danger" 
            icon={Trash2} 
            iconPosition="right"
            onClick={handleClearAllAlerts}
            disabled={alerts.length === 0}
          >
            حذف جميع التنبيهات
          </Button>
        </div>
        
        {selectedAlerts.length > 0 && (
          <div className="flex space-x-2 space-x-reverse">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleBulkAction('mark-read')}
            >
              وضع علامة كمقروء ({selectedAlerts.length})
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              حذف المحدد ({selectedAlerts.length})
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            type="text"
            icon={Search}
            iconPosition="right"
            placeholder="البحث في التنبيهات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع التنبيه</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="delayed">متأخر</option>
              <option value="failed">فشل</option>
              <option value="expired">منتهي الصلاحية</option>
              <option value="urgent">عاجل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأولويات</option>
              <option value="critical">حرجة</option>
              <option value="high">عالية</option>
              <option value="medium">متوسطة</option>
              <option value="low">منخفضة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="unread">غير مقروء</option>
              <option value="read">مقروء</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <Bell className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">إجمالي التنبيهات</p>
            <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
          </div>
        </Card>

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">غير مقروء</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.unread}</p>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-xl mb-2">
              <Shield className="w-6 h-6 text-red-600 mx-auto" />
            </div>
            <p className="text-sm text-red-600">حرجة</p>
            <p className="text-2xl font-bold text-red-900">{statistics.critical}</p>
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="text-center">
            <div className="bg-yellow-100 p-3 rounded-xl mb-2">
              <TrendingUp className="w-6 h-6 text-yellow-600 mx-auto" />
            </div>
            <p className="text-sm text-yellow-600">عالية الأولوية</p>
            <p className="text-2xl font-bold text-yellow-900">{statistics.high}</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Activity className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">متوسطة الأولوية</p>
            <p className="text-2xl font-bold text-purple-900">{statistics.medium}</p>
          </div>
        </Card>

        <Card className="bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-xl mb-2">
              <Clock className="w-6 h-6 text-gray-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">منخفضة الأولوية</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.low}</p>
          </div>
        </Card>
      </div>

      {/* Critical Alerts Section */}
      {criticalAlerts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <Shield className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-bold text-red-800">تنبيهات حرجة تحتاج إجراء فوري</h3>
          </div>
          <div className="space-y-3">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className="bg-white border-red-200" padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-red-100 p-2 rounded-lg">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{getRelatedInfo(alert)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="danger" size="sm" onClick={() => handleMarkAsRead(alert.id)}>
                      اتخاذ إجراء
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => {
                      setSelectedAlert(alert);
                      setModalType('view');
                      setShowModal(true);
                    }}>
                      عرض
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <h3 className="text-lg font-semibold text-gray-900">
                قائمة التنبيهات ({filteredAlerts.length})
              </h3>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اختيار
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التنبيه
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأولوية
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مرتبط بـ
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
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
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className={`hover:bg-gray-50 transition-colors ${!alert.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className={`p-2 rounded-lg ${getTypeColor(alert.type)}`}>
                          {getTypeIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <p className={`text-sm font-medium ${!alert.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                              {alert.title}
                            </p>
                            {!alert.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        alert.type === 'failed' ? 'error' :
                        alert.type === 'delayed' ? 'warning' :
                        alert.type === 'urgent' ? 'error' : 'info'
                      } size="sm">
                        {getTypeText(alert.type)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        alert.priority === 'critical' ? 'error' :
                        alert.priority === 'high' ? 'warning' :
                        alert.priority === 'medium' ? 'info' : 'neutral'
                      } size="sm">
                        {getPriorityText(alert.priority)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRelatedInfo(alert)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(alert.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={alert.isRead ? 'success' : 'warning'} size="sm">
                        {alert.isRead ? 'مقروء' : 'غير مقروء'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalType('view');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!alert.isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                            title="وضع علامة كمقروء"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteAlert(alert.id)}
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' 
                          ? 'لا توجد تنبيهات مطابقة للفلاتر' 
                          : 'لا توجد تنبيهات'}
                      </p>
                      <p className="text-sm mt-2">
                        {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                          ? 'جرب تعديل الفلاتر أو مصطلح البحث'
                          : 'لم يتم إنشاء أي تنبيهات بعد'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alert Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاهات التنبيهات</h3>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-red-700">تنبيهات حرجة هذا الأسبوع</span>
                <span className="text-2xl font-bold text-red-900">{statistics.critical}</span>
              </div>
              <div className="text-xs text-red-600 mt-1">+2 من الأسبوع الماضي</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-orange-700">تنبيهات متأخرة</span>
                <span className="text-2xl font-bold text-orange-900">
                  {alerts.filter(a => a.type === 'delayed').length}
                </span>
              </div>
              <div className="text-xs text-orange-600 mt-1">-1 من الأسبوع الماضي</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">معدل الاستجابة</span>
                <span className="text-2xl font-bold text-blue-900">87%</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">+5% من الشهر الماضي</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إعدادات التنبيهات التلقائية</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">تنبيهات الطرود المتأخرة</p>
                <p className="text-sm text-gray-600">تلقائي عند تأخر الطرد أكثر من 24 ساعة</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-green-600">مفعل</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">تنبيهات فشل التسليم</p>
                <p className="text-sm text-gray-600">تلقائي عند فشل محاولة التسليم</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-green-600">مفعل</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">تنبيهات انتهاء الصلاحية</p>
                <p className="text-sm text-gray-600">تلقائي قبل 3 أيام من انتهاء الصلاحية</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-green-600">مفعل</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for Add/View Alert */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add' ? 'إضافة تنبيه جديد' :
            modalType === 'view' ? 'تفاصيل التنبيه' :
            'إجراء جماعي'
          }
          size="md"
        >
          <div className="p-6">
            {/* Add Alert Form */}
            {modalType === 'add' && (
              <div className="space-y-4">
                <Input
                  label="عنوان التنبيه *"
                  type="text"
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm({...newAlertForm, title: e.target.value})}
                  placeholder="أدخل عنوان التنبيه..."
                  required
                />

                <Input
                  label="وصف التنبيه *"
                  type="textarea"
                  value={newAlertForm.description}
                  onChange={(e) => setNewAlertForm({...newAlertForm, description: e.target.value})}
                  placeholder="أدخل وصف مفصل للتنبيه..."
                  rows={3}
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع التنبيه</label>
                    <select
                      value={newAlertForm.type}
                      onChange={(e) => setNewAlertForm({...newAlertForm, type: e.target.value as Alert['type']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="delayed">متأخر</option>
                      <option value="failed">فشل</option>
                      <option value="expired">منتهي الصلاحية</option>
                      <option value="urgent">عاجل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                    <select
                      value={newAlertForm.priority}
                      onChange={(e) => setNewAlertForm({...newAlertForm, priority: e.target.value as Alert['priority']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="critical">حرجة</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مرتبط بـ</label>
                    <select
                      value={newAlertForm.relatedType}
                      onChange={(e) => setNewAlertForm({...newAlertForm, relatedType: e.target.value as Alert['relatedType']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="package">طرد</option>
                      <option value="beneficiary">مستفيد</option>
                      <option value="task">مهمة</option>
                    </select>
                  </div>

                  <Input
                    label="معرف العنصر المرتبط"
                    type="text"
                    value={newAlertForm.relatedId}
                    onChange={(e) => setNewAlertForm({...newAlertForm, relatedId: e.target.value})}
                    placeholder="اختياري - معرف الطرد أو المستفيد..."
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleAddAlert}>
                    إضافة التنبيه
                  </Button>
                </div>
              </div>
            )}

            {/* View Alert Details */}
            {modalType === 'view' && selectedAlert && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(selectedAlert.type)}`}>
                      {getTypeIcon(selectedAlert.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">{selectedAlert.title}</h4>
                      <div className="flex items-center space-x-2 space-x-reverse mt-2">
                        <Badge variant={
                          selectedAlert.type === 'failed' ? 'error' :
                          selectedAlert.type === 'delayed' ? 'warning' :
                          selectedAlert.type === 'urgent' ? 'error' : 'info'
                        } size="sm">
                          {getTypeText(selectedAlert.type)}
                        </Badge>
                        <Badge variant={
                          selectedAlert.priority === 'critical' ? 'error' :
                          selectedAlert.priority === 'high' ? 'warning' :
                          selectedAlert.priority === 'medium' ? 'info' : 'neutral'
                        } size="sm">
                          {getPriorityText(selectedAlert.priority)}
                        </Badge>
                        <Badge variant={selectedAlert.isRead ? 'success' : 'warning'} size="sm">
                          {selectedAlert.isRead ? 'مقروء' : 'غير مقروء'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">الوصف:</span>
                      <p className="text-gray-900 mt-1">{selectedAlert.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">مرتبط بـ:</span>
                        <p className="text-gray-900">{getRelatedInfo(selectedAlert)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">تاريخ الإنشاء:</span>
                        <p className="text-gray-900">{new Date(selectedAlert.createdAt).toLocaleString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  {!selectedAlert.isRead && (
                    <Button 
                      variant="success" 
                      onClick={() => {
                        handleMarkAsRead(selectedAlert.id);
                        setShowModal(false);
                      }}
                    >
                      وضع علامة كمقروء
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      handleDeleteAlert(selectedAlert.id);
                      setShowModal(false);
                    }}
                  >
                    حذف التنبيه
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
          <Bell className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات إدارة التنبيهات</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>التنبيهات الحرجة تحتاج إجراء فوري ويجب عدم تجاهلها</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يمكن تحديد عدة تنبيهات لتنفيذ إجراءات جماعية عليها</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>التنبيهات التلقائية يتم إنشاؤها بناءً على أحداث النظام</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يمكن إضافة تنبيهات يدوية للمتابعة الخاصة</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}