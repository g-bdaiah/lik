import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Package, Truck, FileText, Award, Info, X, Check, Trash2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui';
import type { Database } from '../../types/database';

type Notification = Database['public']['Tables']['beneficiary_notifications']['Row'];

interface NotificationsDropdownProps {
  beneficiaryId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ beneficiaryId, isOpen, onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, beneficiaryId]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [allNotifications, count] = await Promise.all([
        notificationService.getAllNotifications(beneficiaryId, 20),
        notificationService.getUnreadCount(beneficiaryId)
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(beneficiaryId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      verification_status_change: CheckCircle,
      package_assigned: Package,
      package_delivery: Truck,
      data_update_response: FileText,
      qualification_status_change: Award,
      general: Info
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      verification_status_change: 'text-green-600 bg-green-50',
      package_assigned: 'text-blue-600 bg-blue-50',
      package_delivery: 'text-orange-600 bg-orange-50',
      data_update_response: 'text-purple-600 bg-purple-50',
      qualification_status_change: 'text-yellow-600 bg-yellow-50',
      general: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div className="absolute left-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Check className="w-4 h-4 inline ml-1" />
                تحديد الكل كمقروء
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.notification_type);
                const colorClass = getNotificationColor(notification.notification_type);

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {notificationService.formatNotificationTime(notification.created_at)}
                          </span>

                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                تحديد كمقروء
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={async () => {
                try {
                  await notificationService.deleteAllNotifications(beneficiaryId);
                  setNotifications([]);
                  setUnreadCount(0);
                } catch (error) {
                  console.error('Error deleting all notifications:', error);
                }
              }}
              className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2"
            >
              <Trash2 className="w-4 h-4 inline ml-1" />
              حذف جميع الإشعارات
            </button>
          </div>
        )}
      </div>
    </>
  );
}
