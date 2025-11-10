import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Clock, CheckCircle, AlertCircle, RefreshCw, Copy, Filter, Search } from 'lucide-react';
import { whatsappService, type WhatsAppNotification } from '../../services/whatsappService';
import { Button, Card, Badge } from '../ui';

export default function WhatsAppNotificationsPage() {
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0, failed: 0 });

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await whatsappService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await whatsappService.getNotificationStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleMarkAsSent = async (id: string) => {
    try {
      await whatsappService.markAsSent(id);
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error('Error marking as sent:', error);
    }
  };

  const handleCancelNotification = async (id: string) => {
    try {
      await whatsappService.cancelNotification(id);
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  const handleOpenWhatsApp = (notification: WhatsAppNotification) => {
    const message = whatsappService.interpolateTemplate(
      notification.message_template,
      notification.message_variables
    );
    whatsappService.openWhatsApp(notification.whatsapp_number, message);
  };

  const handleCopyMessage = async (notification: WhatsAppNotification) => {
    const message = whatsappService.interpolateTemplate(
      notification.message_template,
      notification.message_variables
    );
    try {
      await whatsappService.copyToClipboard(message);
      alert('تم نسخ الرسالة');
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(n => n.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.notification_type === typeFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.whatsapp_number.includes(search) ||
        n.message_template.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">معلق</Badge>;
      case 'sent':
        return <Badge variant="success">تم الإرسال</Badge>;
      case 'failed':
        return <Badge variant="danger">فشل</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">ملغي</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      package_status_change: 'تحديث حالة الطرد',
      identity_approved: 'موافقة على التوثيق',
      identity_rejected: 'رفض التوثيق',
      reupload_required: 'إعادة رفع مطلوبة',
      temporary_password: 'كلمة مرور مؤقتة',
      otp_code: 'رمز OTP',
      general_message: 'رسالة عامة',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-green-600" />
          إشعارات واتساب
        </h1>
        <p className="text-gray-600">
          إدارة إشعارات واتساب المرسلة للمستفيدين
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإشعارات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">معلقة</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">تم الإرسال</p>
              <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">فشل</p>
              <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline ml-1" />
              تصفية حسب الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">الكل</option>
              <option value="pending">معلق</option>
              <option value="sent">تم الإرسال</option>
              <option value="failed">فشل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline ml-1" />
              تصفية حسب النوع
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">الكل</option>
              <option value="package_status_change">تحديث حالة الطرد</option>
              <option value="identity_approved">موافقة على التوثيق</option>
              <option value="identity_rejected">رفض التوثيق</option>
              <option value="temporary_password">كلمة مرور مؤقتة</option>
              <option value="otp_code">رمز OTP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline ml-1" />
              بحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث في الرقم أو الرسالة..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button
          onClick={loadNotifications}
          variant="secondary"
          className="w-full md:w-auto"
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </Card>

      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">لا توجد إشعارات</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(notification.status)}
                    <span className="text-sm text-gray-600">
                      {getTypeLabel(notification.notification_type)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">رقم واتساب:</span>{' '}
                    {notification.whatsapp_number}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {whatsappService.interpolateTemplate(
                      notification.message_template,
                      notification.message_variables
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString('ar-EG')}
                  {notification.sent_at && (
                    <span className="mr-3">
                      تم الإرسال: {new Date(notification.sent_at).toLocaleString('ar-EG')}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyMessage(notification)}
                  >
                    <Copy className="w-4 h-4 ml-1" />
                    نسخ
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenWhatsApp(notification)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 ml-1" />
                    فتح واتساب
                  </Button>

                  {notification.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkAsSent(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4 ml-1" />
                        تم الإرسال
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelNotification(notification.id)}
                      >
                        <X className="w-4 h-4 ml-1" />
                        إلغاء
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {notification.error_message && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 inline ml-1" />
                  {notification.error_message}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
