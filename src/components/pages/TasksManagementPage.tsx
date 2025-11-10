import React, { useState } from 'react';
import { Clock, Truck, Users, MapPin, CheckCircle, AlertTriangle, Calendar, Search, Filter, Plus, Eye, Edit, Phone, RefreshCw, Download, Star, Package, User, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { 
  mockTasks, 
  mockBeneficiaries, 
  mockPackages, 
  mockCouriers,
  type Task, 
  type Beneficiary, 
  type Package as PackageType, 
  type Courier 
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal } from '../ui';

export default function TasksManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'assign' | 'update' | 'view' | 'reschedule'>('assign');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { logInfo, logError } = useErrorLogger();

  // استخدام البيانات الوهمية مباشرة
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const beneficiaries = mockBeneficiaries;
  const packages = mockPackages;
  const couriers = mockCouriers;

  // Form states for modals
  const [assignForm, setAssignForm] = useState({
    courierId: '',
    scheduledAt: '',
    notes: ''
  });

  const [updateForm, setUpdateForm] = useState({
    status: '',
    courierNotes: '',
    deliveryProofImageUrl: '',
    failureReason: ''
  });

  const regions = ['شمال غزة', 'مدينة غزة', 'الوسط', 'خان يونس', 'رفح'];

  // فلترة المهام
  const filteredTasks = tasks.filter(task => {
    const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
    const packageInfo = packages.find(p => p.id === task.packageId);
    const courier = task.courierId ? couriers.find(c => c.id === task.courierId) : null;

    // فلترة البحث
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesBeneficiary = beneficiary?.name.toLowerCase().includes(searchLower) || 
                                beneficiary?.nationalId.includes(searchTerm) ||
                                beneficiary?.phone.includes(searchTerm);
      const matchesPackage = packageInfo?.name.toLowerCase().includes(searchLower);
      const matchesCourier = courier?.name.toLowerCase().includes(searchLower);
      
      if (!matchesBeneficiary && !matchesPackage && !matchesCourier) {
        return false;
      }
    }

    // فلترة الحالة
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // فلترة المندوب
    if (courierFilter !== 'all') {
      if (courierFilter === 'unassigned' && task.courierId) {
        return false;
      }
      if (courierFilter !== 'unassigned' && task.courierId !== courierFilter) {
        return false;
      }
    }

    // فلترة المنطقة
    if (regionFilter !== 'all' && beneficiary) {
      if (!beneficiary.detailedAddress.governorate.includes(regionFilter)) {
        return false;
      }
    }

    return true;
  });

  // إحصائيات
  const statistics = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    delivered: tasks.filter(t => t.status === 'delivered').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    unassigned: tasks.filter(t => !t.courierId).length
  };

  const handleAssignCourier = (task: Task) => {
    setSelectedTask(task);
    setModalType('assign');
    setAssignForm({
      courierId: task.courierId || '',
      scheduledAt: task.scheduledAt || '',
      notes: task.notes || ''
    });
    setShowModal(true);
  };

  const handleUpdateStatus = (task: Task) => {
    setSelectedTask(task);
    setModalType('update');
    setUpdateForm({
      status: task.status,
      courierNotes: task.courierNotes || '',
      deliveryProofImageUrl: task.deliveryProofImageUrl || '',
      failureReason: task.failureReason || ''
    });
    setShowModal(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setModalType('view');
    setShowModal(true);
  };

  const handleRescheduleTask = (task: Task) => {
    setSelectedTask(task);
    setModalType('reschedule');
    setAssignForm({
      courierId: task.courierId || '',
      scheduledAt: task.scheduledAt || '',
      notes: task.notes || ''
    });
    setShowModal(true);
  };

  const executeAssignCourier = async () => {
    if (!selectedTask || !assignForm.courierId) {
      setNotification({ message: 'يرجى اختيار المندوب', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // محاكاة تحديث المهمة
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? {
              ...task,
              courierId: assignForm.courierId,
              status: 'assigned' as Task['status'],
              scheduledAt: assignForm.scheduledAt || new Date().toISOString(),
              notes: assignForm.notes
            }
          : task
      );

      setTasks(updatedTasks);
      
      const courier = couriers.find(c => c.id === assignForm.courierId);
      setNotification({
        message: `تم تعيين المندوب ${courier?.name} للمهمة بنجاح`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      
      setShowModal(false);
      setSelectedTask(null);
      logInfo(`تم تعيين مندوب للمهمة: ${selectedTask.id}`, 'TasksManagementPage');
    } catch (error) {
      logError(error as Error, 'TasksManagementPage');
      setNotification({ message: 'حدث خطأ في تعيين المندوب', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const executeUpdateStatus = async () => {
    if (!selectedTask || !updateForm.status) {
      setNotification({ message: 'يرجى اختيار الحالة الجديدة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // محاكاة تحديث حالة المهمة
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? {
              ...task,
              status: updateForm.status as Task['status'],
              courierNotes: updateForm.courierNotes,
              deliveryProofImageUrl: updateForm.deliveryProofImageUrl,
              failureReason: updateForm.failureReason,
              deliveredAt: updateForm.status === 'delivered' ? new Date().toISOString() : task.deliveredAt
            }
          : task
      );

      setTasks(updatedTasks);
      
      setNotification({
        message: `تم تحديث حالة المهمة إلى "${getStatusText(updateForm.status as Task['status'])}" بنجاح`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      
      setShowModal(false);
      setSelectedTask(null);
      logInfo(`تم تحديث حالة المهمة: ${selectedTask.id}`, 'TasksManagementPage');
    } catch (error) {
      logError(error as Error, 'TasksManagementPage');
      setNotification({ message: 'حدث خطأ في تحديث حالة المهمة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const executeReschedule = async () => {
    if (!selectedTask || !assignForm.scheduledAt) {
      setNotification({ message: 'يرجى تحديد موعد جديد', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // محاكاة إعادة جدولة المهمة
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? {
              ...task,
              status: 'rescheduled' as Task['status'],
              scheduledAt: assignForm.scheduledAt,
              notes: assignForm.notes
            }
          : task
      );

      setTasks(updatedTasks);
      
      setNotification({
        message: 'تم إعادة جدولة المهمة بنجاح',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      
      setShowModal(false);
      setSelectedTask(null);
      logInfo(`تم إعادة جدولة المهمة: ${selectedTask.id}`, 'TasksManagementPage');
    } catch (error) {
      logError(error as Error, 'TasksManagementPage');
      setNotification({ message: 'حدث خطأ في إعادة جدولة المهمة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'assigned': return 'معين';
      case 'in_progress': return 'قيد التنفيذ';
      case 'delivered': return 'تم التسليم';
      case 'failed': return 'فشل';
      case 'rescheduled': return 'معاد جدولته';
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
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const handleExportTasks = () => {
    const exportData = {
      date: new Date().toISOString(),
      totalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      statistics,
      tasks: filteredTasks.map(task => {
        const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
        const packageInfo = packages.find(p => p.id === task.packageId);
        const courier = task.courierId ? couriers.find(c => c.id === task.courierId) : null;
        
        return {
          id: task.id,
          beneficiary: beneficiary?.name,
          package: packageInfo?.name,
          courier: courier?.name || 'غير معين',
          status: getStatusText(task.status),
          createdAt: task.createdAt,
          scheduledAt: task.scheduledAt,
          deliveredAt: task.deliveredAt
        };
      })
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المهام_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setNotification({ message: 'تم تصدير تقرير المهام بنجاح', type: 'success' });
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
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="success" icon={Download} iconPosition="right" onClick={handleExportTasks}>
            تصدير المهام
          </Button>
          <Button variant="primary" icon={RefreshCw} iconPosition="right">
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            type="text"
            icon={Search}
            iconPosition="right"
            placeholder="البحث في المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حالة المهمة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="assigned">معين</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="delivered">تم التسليم</option>
              <option value="failed">فشل</option>
              <option value="rescheduled">معاد جدولته</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المندوب</label>
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المندوبين</option>
              <option value="unassigned">غير معين</option>
              {couriers.map(courier => (
                <option key={courier.id} value={courier.id}>{courier.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المناطق</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-xl mb-2">
              <Activity className="w-6 h-6 text-gray-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">إجمالي المهام</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <Clock className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">في الانتظار</p>
            <p className="text-2xl font-bold text-blue-900">{statistics.pending}</p>
          </div>
        </Card>

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <Truck className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">قيد التنفيذ</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.inProgress}</p>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-xl mb-2">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-600">تم التسليم</p>
            <p className="text-2xl font-bold text-green-900">{statistics.delivered}</p>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-xl mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
            </div>
            <p className="text-sm text-red-600">فشل</p>
            <p className="text-2xl font-bold text-red-900">{statistics.failed}</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Users className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">غير معين</p>
            <p className="text-2xl font-bold text-purple-900">{statistics.unassigned}</p>
          </div>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المهام ({filteredTasks.length})</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهمة
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
                  الموعد المحدد
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
                  const packageInfo = packages.find(p => p.id === task.packageId);
                  const courier = task.courierId ? couriers.find(c => c.id === task.courierId) : null;

                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg ml-4">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {packageInfo?.name || 'طرد غير محدد'}
                            </div>
                            <div className="text-sm text-gray-500">#{task.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {beneficiary?.name || 'غير محدد'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {beneficiary?.detailedAddress?.district || 'غير محدد'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {courier ? (
                          <div className="flex items-center">
                            <div className="bg-green-100 p-1 rounded-lg ml-2">
                              <Truck className="w-3 h-3 text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{courier.name}</div>
                              <div className="text-sm text-gray-500">{courier.phone}</div>
                            </div>
                          </div>
                        ) : (
                          <Badge variant="warning" size="sm">
                            غير معين
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={
                            task.status === 'delivered' ? 'success' :
                            task.status === 'failed' ? 'error' :
                            task.status === 'in_progress' ? 'warning' :
                            'info'
                          }
                          size="sm"
                        >
                          {getStatusText(task.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            onClick={() => handleViewTask(task)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(task)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                            title="تحديث الحالة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!task.courierId && (
                            <button 
                              onClick={() => handleAssignCourier(task)}
                              className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                              title="تعيين مندوب"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleRescheduleTask(task)}
                            className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                            title="إعادة جدولة"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {searchTerm || statusFilter !== 'all' || courierFilter !== 'all' || regionFilter !== 'all' 
                          ? 'لا توجد مهام مطابقة للفلاتر' 
                          : 'لا توجد مهام'}
                      </p>
                      <p className="text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' || courierFilter !== 'all' || regionFilter !== 'all'
                          ? 'جرب تعديل الفلاتر أو مصطلح البحث'
                          : 'لم يتم إنشاء أي مهام بعد'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء المندوبين</h3>
          <div className="space-y-4">
            {couriers.slice(0, 5).map((courier) => {
              const courierTasks = tasks.filter(t => t.courierId === courier.id);
              const completedTasks = courierTasks.filter(t => t.status === 'delivered').length;
              const successRate = courierTasks.length > 0 ? (completedTasks / courierTasks.length * 100) : 0;

              return (
                <div key={courier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Truck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{courier.name}</p>
                      <p className="text-sm text-gray-600">{courierTasks.length} مهمة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 space-x-reverse mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">{courier.rating}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">{successRate.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الأداء</h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-700">معدل النجاح</span>
                <span className="text-2xl font-bold text-green-900">
                  {tasks.length > 0 ? ((statistics.delivered / tasks.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">متوسط وقت التسليم</span>
                <span className="text-2xl font-bold text-blue-900">2.3 ساعة</span>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-orange-700">المهام المعلقة</span>
                <span className="text-2xl font-bold text-orange-900">{statistics.pending + statistics.assigned}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for Task Operations */}
      {showModal && selectedTask && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'assign' ? 'تعيين مندوب للمهمة' :
            modalType === 'update' ? 'تحديث حالة المهمة' :
            modalType === 'reschedule' ? 'إعادة جدولة المهمة' :
            'تفاصيل المهمة'
          }
          size="md"
        >
          <div className="p-6">
            {/* Task Info */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">معلومات المهمة</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">المستفيد:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {beneficiaries.find(b => b.id === selectedTask.beneficiaryId)?.name || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الطرد:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {packages.find(p => p.id === selectedTask.packageId)?.name || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الحالة الحالية:</span>
                  <Badge 
                    variant={
                      selectedTask.status === 'delivered' ? 'success' :
                      selectedTask.status === 'failed' ? 'error' :
                      selectedTask.status === 'in_progress' ? 'warning' :
                      'info'
                    }
                    size="sm"
                    className="mr-2"
                  >
                    {getStatusText(selectedTask.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {new Date(selectedTask.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>

            {/* Assign Courier Form */}
            {modalType === 'assign' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختيار المندوب</label>
                  <select
                    value={assignForm.courierId}
                    onChange={(e) => setAssignForm({...assignForm, courierId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر المندوب</option>
                    {couriers.filter(c => c.status === 'active').map(courier => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name} - تقييم: {courier.rating}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">موعد التسليم المحدد</label>
                  <input
                    type="datetime-local"
                    value={assignForm.scheduledAt}
                    onChange={(e) => setAssignForm({...assignForm, scheduledAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات للمندوب</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                    placeholder="تعليمات خاصة للمندوب..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={executeAssignCourier}>
                    تعيين المندوب
                  </Button>
                </div>
              </div>
            )}

            {/* Update Status Form */}
            {modalType === 'update' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر الحالة</option>
                    <option value="assigned">معين</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="failed">فشل</option>
                    <option value="rescheduled">معاد جدولته</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات المندوب</label>
                  <textarea
                    value={updateForm.courierNotes}
                    onChange={(e) => setUpdateForm({...updateForm, courierNotes: e.target.value})}
                    placeholder="ملاحظات من المندوب حول المهمة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {updateForm.status === 'failed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">سبب الفشل</label>
                    <textarea
                      value={updateForm.failureReason}
                      onChange={(e) => setUpdateForm({...updateForm, failureReason: e.target.value})}
                      placeholder="اذكر سبب فشل التسليم..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={executeUpdateStatus}>
                    تحديث الحالة
                  </Button>
                </div>
              </div>
            )}

            {/* Reschedule Form */}
            {modalType === 'reschedule' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموعد الجديد</label>
                  <input
                    type="datetime-local"
                    value={assignForm.scheduledAt}
                    onChange={(e) => setAssignForm({...assignForm, scheduledAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سبب إعادة الجدولة</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                    placeholder="اذكر سبب إعادة الجدولة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="warning" onClick={executeReschedule}>
                    إعادة الجدولة
                  </Button>
                </div>
              </div>
            )}

            {/* View Task Details */}
            {modalType === 'view' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h5 className="font-medium text-blue-800 mb-2">معلومات المستفيد</h5>
                    <div className="space-y-1 text-sm">
                      {(() => {
                        const beneficiary = beneficiaries.find(b => b.id === selectedTask.beneficiaryId);
                        return beneficiary ? (
                          <>
                            <p><span className="text-blue-700">الاسم:</span> <span className="font-medium">{beneficiary.name}</span></p>
                            <p><span className="text-blue-700">الهاتف:</span> <span className="font-medium">{beneficiary.phone}</span></p>
                            <p><span className="text-blue-700">العنوان:</span> <span className="font-medium">{beneficiary.detailedAddress.district}</span></p>
                          </>
                        ) : <p className="text-gray-500">معلومات غير متاحة</p>;
                      })()}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl">
                    <h5 className="font-medium text-green-800 mb-2">معلومات الطرد</h5>
                    <div className="space-y-1 text-sm">
                      {(() => {
                        const packageInfo = packages.find(p => p.id === selectedTask.packageId);
                        return packageInfo ? (
                          <>
                            <p><span className="text-green-700">اسم الطرد:</span> <span className="font-medium">{packageInfo.name}</span></p>
                            <p><span className="text-green-700">النوع:</span> <span className="font-medium">{packageInfo.type}</span></p>
                            <p><span className="text-green-700">القيمة:</span> <span className="font-medium">{packageInfo.value} ₪</span></p>
                          </>
                        ) : <p className="text-gray-500">معلومات غير متاحة</p>;
                      })()}
                    </div>
                  </div>
                </div>

                {selectedTask.courierNotes && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2">ملاحظات المندوب</h5>
                    <p className="text-sm text-yellow-700">{selectedTask.courierNotes}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}