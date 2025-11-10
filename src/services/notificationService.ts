import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Notification = Database['public']['Tables']['beneficiary_notifications']['Row'];

export type NotificationType =
  | 'verification_status_change'
  | 'package_assigned'
  | 'package_delivery'
  | 'data_update_response'
  | 'qualification_status_change'
  | 'general';

export const notificationService = {
  async createNotification(
    beneficiaryId: string,
    type: NotificationType,
    title: string,
    message: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_notifications')
      .insert({
        beneficiary_id: beneficiaryId,
        notification_type: type,
        title,
        message,
        is_read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getUnreadNotifications(beneficiaryId: string): Promise<Notification[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiary_notifications')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async getAllNotifications(beneficiaryId: string, limit?: number): Promise<Notification[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('beneficiary_notifications')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Notification[];
  },

  async getUnreadCount(beneficiaryId: string): Promise<number> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { count, error } = await supabase
      .from('beneficiary_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('beneficiary_id', beneficiaryId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(beneficiaryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_notifications')
      .update({ is_read: true })
      .eq('beneficiary_id', beneficiaryId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  async deleteAllNotifications(beneficiaryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_notifications')
      .delete()
      .eq('beneficiary_id', beneficiaryId);

    if (error) throw error;
  },

  async sendVerificationStatusNotification(
    beneficiaryId: string,
    status: 'verified' | 'under_review' | 'rejected',
    notes?: string
  ): Promise<void> {
    const messages = {
      verified: {
        title: 'تم التحقق من حسابك',
        message: 'تم التحقق من حسابك بنجاح! يمكنك الآن التقديم للحصول على المساعدات.'
      },
      under_review: {
        title: 'حسابك قيد المراجعة',
        message: 'حسابك قيد المراجعة من قبل الإدارة. سيتم إشعارك بالنتيجة قريباً.'
      },
      rejected: {
        title: 'تم رفض التحقق',
        message: `تم رفض التحقق من حسابك. ${notes ? `السبب: ${notes}` : ''} يرجى تحديث بياناتك وإعادة المحاولة.`
      }
    };

    const notification = messages[status];
    await this.createNotification(
      beneficiaryId,
      'verification_status_change',
      notification.title,
      notification.message
    );
  },

  async sendQualificationStatusNotification(
    beneficiaryId: string,
    status: 'qualified' | 'needs_update' | 'unqualified',
    notes?: string
  ): Promise<void> {
    const messages = {
      qualified: {
        title: 'أنت مؤهل للمساعدات',
        message: 'أنت مؤهل للحصول على المساعدات! يمكنك التقديم للمؤسسات المقترحة.'
      },
      needs_update: {
        title: 'يرجى تحديث بياناتك',
        message: `يرجى تحديث بياناتك لتحديد مدى أهليتك. ${notes || ''}`
      },
      unqualified: {
        title: 'غير مؤهل حالياً',
        message: `للأسف، لا تنطبق عليك معايير الأهلية حالياً. ${notes || ''}`
      }
    };

    const notification = messages[status];
    await this.createNotification(
      beneficiaryId,
      'qualification_status_change',
      notification.title,
      notification.message
    );
  },

  async sendPackageAssignedNotification(
    beneficiaryId: string,
    packageName: string,
    organizationName: string
  ): Promise<void> {
    await this.createNotification(
      beneficiaryId,
      'package_assigned',
      'طرد جديد مخصص لك',
      `تم تخصيص طرد "${packageName}" من ${organizationName} لك. يمكنك متابعة حالة الطرد من خلال حسابك.`
    );
  },

  async sendPackageDeliveryNotification(
    beneficiaryId: string,
    packageName: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      in_delivery: 'الطرد قيد التوصيل',
      delivered: 'تم تسليم الطرد',
      failed: 'فشل تسليم الطرد'
    };

    const title = statusMessages[status] || 'تحديث حالة الطرد';
    const message = status === 'delivered'
      ? `تم تسليم طرد "${packageName}" بنجاح. نأمل أن يكون في خدمتكم.`
      : `حالة طردك "${packageName}": ${statusMessages[status] || status}`;

    await this.createNotification(
      beneficiaryId,
      'package_delivery',
      title,
      message
    );
  },

  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      verification_status_change: 'CheckCircle',
      package_assigned: 'Package',
      package_delivery: 'Truck',
      data_update_response: 'FileText',
      qualification_status_change: 'Award',
      general: 'Info'
    };
    return icons[type] || 'Bell';
  },

  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      verification_status_change: 'text-green-600',
      package_assigned: 'text-blue-600',
      package_delivery: 'text-orange-600',
      data_update_response: 'text-purple-600',
      qualification_status_change: 'text-yellow-600',
      general: 'text-gray-600'
    };
    return colors[type] || 'text-gray-600';
  },

  formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
