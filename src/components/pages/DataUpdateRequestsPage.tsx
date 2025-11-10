import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, User, FileText } from 'lucide-react';
import { dataUpdateService } from '../../services/dataUpdateService';
import { Button, Card } from '../ui';
import type { Database } from '../../types/database';

type DataUpdate = Database['public']['Tables']['beneficiary_data_updates']['Row'];

export default function DataUpdateRequestsPage() {
  const [updates, setUpdates] = useState<DataUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<DataUpdate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<DataUpdate | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, updates]);

  const loadUpdates = async () => {
    try {
      setIsLoading(true);
      const data = await dataUpdateService.getUpdateRequests();
      setUpdates(data);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...updates];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());

    setFilteredUpdates(filtered);
  };

  const handleApprove = async (update: DataUpdate) => {
    if (!confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) return;

    try {
      await dataUpdateService.approveDataUpdate(update.id, 'المسؤول');
      alert('تم الموافقة على الطلب بنجاح');
      loadUpdates();
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedUpdate) return;
    if (!rejectionReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      await dataUpdateService.rejectDataUpdate(selectedUpdate.id, 'المسؤول', rejectionReason);
      alert('تم رفض الطلب بنجاح');
      setIsReviewModalOpen(false);
      setRejectionReason('');
      loadUpdates();
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'تمت الموافقة', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getStatistics = () => {
    return {
      pending: updates.filter(u => u.status === 'pending').length,
      approved: updates.filter(u => u.status === 'approved').length,
      rejected: updates.filter(u => u.status === 'rejected').length
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">طلبات تحديث البيانات</h1>
        <p className="text-gray-600 mt-1">مراجعة والموافقة على طلبات تحديث بيانات المستفيدين</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{updates.length}</div>
            <div className="text-sm text-gray-600 mt-1">إجمالي الطلبات</div>
          </div>
        </Card>

        <Card className={stats.pending > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-700 mt-1">قيد المراجعة</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-sm text-gray-600 mt-1">تمت الموافقة</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-sm text-gray-600 mt-1">مرفوض</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <FileText className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">تمت الموافقة</option>
            <option value="rejected">مرفوض</option>
          </select>
          <div className="text-sm text-gray-600">
            عرض {filteredUpdates.length} من {updates.length}
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredUpdates.map((update) => (
          <Card key={update.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      طلب تحديث: {dataUpdateService.getFieldArabicName(update.field_name)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      تاريخ الطلب: {new Date(update.requested_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  {getStatusBadge(update.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">القيمة القديمة</p>
                      <p className="text-sm font-medium text-gray-900 font-mono bg-white p-2 rounded">
                        {update.old_value || 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">القيمة الجديدة</p>
                      <p className="text-sm font-medium text-blue-700 font-mono bg-blue-50 p-2 rounded border border-blue-200">
                        {update.new_value}
                      </p>
                    </div>
                  </div>
                </div>

                {update.status === 'approved' && update.reviewed_at && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 inline ml-1" />
                      تمت الموافقة بواسطة {update.reviewed_by} في {new Date(update.reviewed_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                )}

                {update.status === 'rejected' && update.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 inline ml-1" />
                      <strong>سبب الرفض:</strong> {update.rejection_reason}
                    </p>
                    {update.reviewed_at && (
                      <p className="text-xs text-red-600 mt-1">
                        تم الرفض بواسطة {update.reviewed_by} في {new Date(update.reviewed_at).toLocaleString('ar-EG')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {update.status === 'pending' && (
                <div className="flex gap-2 mr-4">
                  <Button
                    onClick={() => handleApprove(update)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-1" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedUpdate(update);
                      setIsReviewModalOpen(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filteredUpdates.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {statusFilter === 'pending'
                  ? 'لا توجد طلبات قيد المراجعة'
                  : 'لا توجد طلبات بهذه الحالة'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {isReviewModalOpen && selectedUpdate && (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  رفض طلب التحديث
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>الحقل:</strong> {dataUpdateService.getFieldArabicName(selectedUpdate.field_name)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>القيمة الجديدة:</strong> {selectedUpdate.new_value}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سبب الرفض <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={4}
                    placeholder="يرجى توضيح سبب رفض الطلب..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={!rejectionReason.trim()}
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    تأكيد الرفض
                  </Button>
                  <Button
                    onClick={() => {
                      setIsReviewModalOpen(false);
                      setRejectionReason('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
