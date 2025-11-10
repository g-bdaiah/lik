import React, { useState, useMemo } from 'react';
import { Package, Calendar, CheckCircle, Clock, Truck, Eye, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Badge, Button, Input } from '../ui';
import { Database } from '../../types/database';

type PackageType = Database['public']['Tables']['packages']['Row'];

interface PackagesTabProps {
  packages: PackageType[];
}

const ITEMS_PER_PAGE = 20;

export default function PackagesTab({ packages }: PackagesTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'تم التسليم', variant: 'success' as const, icon: CheckCircle };
      case 'in_delivery':
        return { label: 'قيد التوصيل', variant: 'warning' as const, icon: Truck };
      case 'pending':
        return { label: 'في الانتظار', variant: 'info' as const, icon: Clock };
      case 'assigned':
        return { label: 'تم التعيين', variant: 'info' as const, icon: Package };
      case 'failed':
        return { label: 'فشل التسليم', variant: 'error' as const, icon: Package };
      default:
        return { label: 'غير محدد', variant: 'default' as const, icon: Package };
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesStatus = filterStatus === 'all' || pkg.status === filterStatus;
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [packages, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deliveredPackages = packages.filter(p => p.status === 'delivered');
  const inDeliveryPackages = packages.filter(p => p.status === 'in_delivery');
  const pendingPackages = packages.filter(p => p.status === 'pending' || p.status === 'assigned');

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="bg-green-100 p-3 rounded-xl mb-3 mx-auto w-fit">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{deliveredPackages.length}</p>
          <p className="text-sm text-gray-600 mt-1">الطرود المستلمة</p>
        </Card>

        <Card className="text-center">
          <div className="bg-orange-100 p-3 rounded-xl mb-3 mx-auto w-fit">
            <Truck className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{inDeliveryPackages.length}</p>
          <p className="text-sm text-gray-600 mt-1">قيد التوصيل</p>
        </Card>

        <Card className="text-center">
          <div className="bg-blue-100 p-3 rounded-xl mb-3 mx-auto w-fit">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{pendingPackages.length}</p>
          <p className="text-sm text-gray-600 mt-1">في الانتظار</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              سجل الطرود ({filteredPackages.length})
            </h3>
            {filteredPackages.length > ITEMS_PER_PAGE && (
              <p className="text-sm text-gray-600 mt-1">
                عرض {startIndex + 1} - {Math.min(endIndex, filteredPackages.length)} من {filteredPackages.length}
              </p>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث في الطرود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="delivered">تم التسليم</option>
              <option value="in_delivery">قيد التوصيل</option>
              <option value="pending">في الانتظار</option>
              <option value="assigned">تم التعيين</option>
              <option value="failed">فشل التسليم</option>
            </select>
          </div>
        </div>

        {filteredPackages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الطرد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الجهة الممولة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPackages.map((pkg) => {
                  const statusInfo = getStatusInfo(pkg.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg ml-3">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                            {pkg.tracking_number && (
                              <p className="text-xs text-gray-500">رقم التتبع: {pkg.tracking_number}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{pkg.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 ml-2 text-gray-400" />
                          {new Date(pkg.created_at).toLocaleDateString('ar-SA')}
                        </div>
                        {pkg.delivered_at && (
                          <p className="text-xs text-green-600 mt-1">
                            تم التسليم: {new Date(pkg.delivered_at).toLocaleDateString('ar-SA')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <StatusIcon className="w-4 h-4" />
                          <Badge variant={statusInfo.variant} size="sm">
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pkg.funder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          عرض
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  صفحة {currentPage} من {totalPages}
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronRight}
                    iconPosition="right"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>

                  <div className="flex items-center space-x-1 space-x-reverse">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    iconPosition="left"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">لا توجد طرود تطابق البحث</p>
          </div>
        )}
      </Card>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل الطرد</h3>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">اسم الطرد:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedPackage.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">النوع:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedPackage.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">الحالة:</label>
                  <Badge variant={getStatusInfo(selectedPackage.status).variant}>
                    {getStatusInfo(selectedPackage.status).label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">القيمة:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedPackage.value} ₪
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">الجهة الممولة:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {selectedPackage.funder}
                  </p>
                </div>
                {selectedPackage.tracking_number && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">رقم التتبع:</label>
                    <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                      {selectedPackage.tracking_number}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">الوصف:</label>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  {selectedPackage.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">تاريخ الإنشاء:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {new Date(selectedPackage.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {selectedPackage.delivered_at && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">تاريخ التسليم:</label>
                    <p className="text-sm font-medium text-green-900 p-3 bg-green-50 rounded-lg">
                      {new Date(selectedPackage.delivered_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {selectedPackage.scheduled_delivery_date && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">الموعد المتوقع للتسليم:</label>
                    <p className="text-sm font-medium text-blue-900 p-3 bg-blue-50 rounded-lg">
                      {new Date(selectedPackage.scheduled_delivery_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {selectedPackage.expiry_date && (
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">تاريخ الانتهاء:</label>
                    <p className="text-sm font-medium text-orange-900 p-3 bg-orange-50 rounded-lg">
                      {new Date(selectedPackage.expiry_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedPackage(null)}>
                إغلاق
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
