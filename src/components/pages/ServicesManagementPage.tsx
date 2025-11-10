import React, { useState, useEffect } from 'react';
import {
  Settings,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Search,
} from 'lucide-react';
import { servicesManagementService, type Service } from '../../services/servicesManagementService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';

export default function ServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toggleAction, setToggleAction] = useState<{ service: Service; enabled: boolean } | null>(null);

  const categories = [
    { key: 'all', name: 'جميع الخدمات', icon: Settings },
    { key: 'communications', name: 'الاتصالات', icon: Activity },
    { key: 'portal', name: 'البوابات', icon: User },
    { key: 'notifications', name: 'الإشعارات', icon: AlertTriangle },
    { key: 'reports', name: 'التقارير', icon: Activity },
    { key: 'operations', name: 'العمليات', icon: Settings },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await servicesManagementService.getAllServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الخدمات');
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.service_name.toLowerCase().includes(query) ||
          s.service_name_en.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleToggleRequest = (service: Service, enabled: boolean) => {
    setToggleAction({ service, enabled });
    if (service.is_critical && !enabled) {
      setShowConfirmModal(true);
    } else {
      handleToggleService(service, enabled);
    }
  };

  const handleToggleService = async (service: Service, enabled: boolean) => {
    try {
      setError('');
      setSuccessMessage('');

      const result = await servicesManagementService.toggleService(
        service.service_key,
        enabled,
        `تم ${enabled ? 'تفعيل' : 'تعطيل'} الخدمة من لوحة التحكم`
      );

      if (result.success) {
        setSuccessMessage(result.message);
        await loadServices();
      } else {
        setError(result.message || 'فشل تغيير حالة الخدمة');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تغيير حالة الخدمة');
    } finally {
      setShowConfirmModal(false);
      setToggleAction(null);
    }
  };

  const getServiceIcon = (iconName: string) => {
    const icons: any = {
      MessageSquare: '💬',
      MessageCircle: '💚',
      Users: '👥',
      Mail: '📧',
      Bell: '🔔',
      AlertTriangle: '⚠️',
      FileText: '📄',
      Download: '⬇️',
      MapPin: '📍',
      Route: '🗺️',
    };
    return icons[iconName] || '⚙️';
  };

  const stats = {
    total: services.length,
    enabled: services.filter((s) => s.is_enabled).length,
    disabled: services.filter((s) => !s.is_enabled).length,
    critical: services.filter((s) => s.is_critical).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الخدمات</h1>
          <p className="text-gray-600 mt-1">تفعيل وتعطيل الخدمات المتاحة في النظام</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الخدمات</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Settings className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الخدمات المفعلة</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.enabled}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الخدمات المعطلة</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.disabled}</p>
              </div>
              <PowerOff className="w-12 h-12 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الخدمات الحساسة</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 space-x-reverse flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: service.color + '20' }}
                  >
                    {getServiceIcon(service.icon)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h3 className="text-lg font-semibold text-gray-900">{service.service_name}</h3>
                      {service.is_critical && (
                        <Badge variant="warning">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          حساسة
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{service.service_name_en}</p>
                    <p className="text-sm text-gray-600 mt-2">{service.description}</p>

                    <div className="mt-4 space-y-2">
                      {service.is_enabled && service.enabled_at && (
                        <div className="flex items-center text-xs text-gray-500 space-x-1 space-x-reverse">
                          <Clock className="w-3 h-3" />
                          <span>
                            تم التفعيل: {new Date(service.enabled_at).toLocaleDateString('ar-EG')}
                          </span>
                          {service.enabled_by_name && (
                            <>
                              <span>•</span>
                              <User className="w-3 h-3" />
                              <span>{service.enabled_by_name}</span>
                            </>
                          )}
                        </div>
                      )}

                      {!service.is_enabled && service.disabled_at && (
                        <div className="flex items-center text-xs text-gray-500 space-x-1 space-x-reverse">
                          <Clock className="w-3 h-3" />
                          <span>
                            تم التعطيل: {new Date(service.disabled_at).toLocaleDateString('ar-EG')}
                          </span>
                          {service.disabled_by_name && (
                            <>
                              <span>•</span>
                              <User className="w-3 h-3" />
                              <span>{service.disabled_by_name}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRequest(service, !service.is_enabled)}
                  className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    service.is_enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      service.is_enabled ? 'translate-x-0' : 'translate-x-8'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-600">لم يتم العثور على خدمات تطابق معايير البحث</p>
          </div>
        </Card>
      )}

      {showConfirmModal && toggleAction && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setToggleAction(null);
          }}
          onConfirm={() => handleToggleService(toggleAction.service, toggleAction.enabled)}
          title="تأكيد تعطيل الخدمة الحساسة"
          message={`هل أنت متأكد من أنك تريد تعطيل خدمة "${toggleAction.service.service_name}"؟ هذه خدمة حساسة وقد يؤثر تعطيلها على عمل النظام.`}
          confirmText="نعم، قم بالتعطيل"
          cancelText="إلغاء"
          variant="warning"
        />
      )}
    </div>
  );
}
