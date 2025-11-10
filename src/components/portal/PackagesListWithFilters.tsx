import React, { useState } from 'react';
import { Package, CheckCircle, Clock, Truck, Calendar, Filter, Search } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import type { Database } from '../../types/database';

type PackageType = Database['public']['Tables']['packages']['Row'];

interface PackagesListWithFiltersProps {
  packages: PackageType[];
}

type FilterType = 'all' | 'delivered' | 'in_delivery' | 'pending' | 'future';

export default function PackagesListWithFilters({ packages }: PackagesListWithFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusConfig = (status: string, scheduledDate?: string | null) => {
    const now = new Date();
    const scheduled = scheduledDate ? new Date(scheduledDate) : null;
    const isFuture = scheduled && scheduled > now;

    if (status === 'delivered') {
      return {
        label: 'تم التسليم',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    } else if (status === 'in_delivery') {
      return {
        label: 'قيد التوصيل',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Truck,
        iconColor: 'text-orange-600'
      };
    } else if (isFuture) {
      return {
        label: 'طرد قادم',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Calendar,
        iconColor: 'text-blue-600'
      };
    } else {
      return {
        label: 'قيد الانتظار',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: Clock,
        iconColor: 'text-gray-600'
      };
    }
  };

  const getFilteredPackages = () => {
    let filtered = packages;

    if (activeFilter === 'delivered') {
      filtered = packages.filter(p => p.status === 'delivered');
    } else if (activeFilter === 'in_delivery') {
      filtered = packages.filter(p => p.status === 'in_delivery' || p.status === 'assigned');
    } else if (activeFilter === 'pending') {
      filtered = packages.filter(p => p.status === 'pending' && !isFuturePackage(p));
    } else if (activeFilter === 'future') {
      filtered = packages.filter(p => isFuturePackage(p));
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const isFuturePackage = (pkg: PackageType) => {
    if (!pkg.scheduled_delivery_date) return false;
    const scheduled = new Date(pkg.scheduled_delivery_date);
    return scheduled > new Date();
  };

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'all') return packages.length;
    if (filter === 'delivered') return packages.filter(p => p.status === 'delivered').length;
    if (filter === 'in_delivery') return packages.filter(p => p.status === 'in_delivery' || p.status === 'assigned').length;
    if (filter === 'pending') return packages.filter(p => p.status === 'pending' && !isFuturePackage(p)).length;
    if (filter === 'future') return packages.filter(p => isFuturePackage(p)).length;
    return 0;
  };

  const filteredPackages = getFilteredPackages();

  const filters: Array<{id: FilterType; label: string; color: string}> = [
    { id: 'all', label: 'الكل', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'delivered', label: 'المستلمة', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'in_delivery', label: 'قيد التوصيل', color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'future', label: 'القادمة', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'pending', label: 'قيد الانتظار', color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن طرد (الاسم، الوصف، رقم التتبع)"
              className="pr-10"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const count = getFilterCount(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? `${filter.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      {filteredPackages.length === 0 ? (
        <Card className="bg-gray-50">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد طرود
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'لم يتم العثور على نتائج تطابق بحثك'
                : activeFilter === 'all'
                ? 'لا توجد طرود مسجلة حالياً'
                : 'لا توجد طرود في هذه الفئة'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPackages.map((pkg) => {
            const statusConfig = getStatusConfig(pkg.status, pkg.scheduled_delivery_date);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.color}`}>
                        <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                        {pkg.tracking_number && (
                          <p className="text-xs text-gray-500 font-mono" dir="ltr">
                            {pkg.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {pkg.type && (
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {pkg.type}
                        </span>
                      )}
                      {pkg.scheduled_delivery_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          التسليم المتوقع: {new Date(pkg.scheduled_delivery_date).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      {pkg.delivered_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          تم التسليم: {new Date(pkg.delivered_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    {pkg.value && (
                      <span className="text-sm font-semibold text-gray-900">
                        ${pkg.value}
                      </span>
                    )}
                  </div>
                </div>

                {pkg.funder && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">الممول:</span> {pkg.funder}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
