import { supabase } from '../lib/supabaseClient';

export interface WhatsAppNotification {
  id: string;
  beneficiary_id: string;
  notification_type: string;
  package_id?: string;
  whatsapp_number: string;
  message_template: string;
  message_variables: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppSettings {
  support_phone: string;
  api_key?: string;
  api_url?: string;
  sender_number?: string;
  send_mode?: 'manual' | 'auto';
}

export const whatsappService = {
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    if (cleaned.startsWith('+970')) {
      return cleaned;
    } else if (cleaned.startsWith('970')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('05')) {
      return '+970' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
      return '+970' + cleaned;
    }

    return phone;
  },

  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(?:\+970|0)?5[0-9]{8}$/.test(cleaned);
  },

  generateWhatsAppLink(phone: string, message: string): string {
    const formattedPhone = this.formatPhoneNumber(phone).replace('+', '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  },

  interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  },

  templates: {
    temporaryPassword: (name: string, password: string, supportPhone: string): string => {
      return `مرحباً ${name}،\n\nتم إنشاء كلمة مرور مؤقتة لحسابك:\n\n🔑 كلمة المرور: ${password}\n\n⚠️ هذه الكلمة صالحة لمدة 24 ساعة فقط.\n\nيرجى استخدامها لتسجيل الدخول ثم قم بتغييرها إلى كلمة مرور جديدة.\n\nللدعم: ${supportPhone}`;
    },

    otpCode: (name: string, otp: string, supportPhone: string): string => {
      return `مرحباً ${name}،\n\nرمز التحقق الخاص بك هو:\n\n🔢 ${otp}\n\n⏰ صالح لمدة 5 دقائق.\n\nللدعم: ${supportPhone}`;
    },

    packageStatusChange: (name: string, packageName: string, newStatus: string): string => {
      return `مرحباً ${name}،\n\nتم تحديث حالة طردك:\n\n📦 ${packageName}\n📍 الحالة الجديدة: ${newStatus}\n\nللاستفسار يرجى التواصل معنا.`;
    },

    identityApproved: (name: string): string => {
      return `مرحباً ${name}،\n\n✅ تم الموافقة على توثيق هويتك بنجاح!\n\nيمكنك الآن الوصول إلى جميع خدمات النظام من خلال بوابة المستفيدين.\n\nنتمنى لك تجربة موفقة.`;
    },

    identityRejected: (name: string, supportPhone: string): string => {
      return `مرحباً ${name}،\n\n❌ نأسف لإبلاغك أن طلب التوثيق الخاص بك قد تم رفضه.\n\nيرجى التواصل مع الدعم للمزيد من المعلومات:\n${supportPhone}`;
    },

    reuploadRequired: (name: string, reason: string, supportPhone: string): string => {
      return `مرحباً ${name}،\n\n📸 يُرجى إعادة رفع صور الهوية.\n\nالسبب: ${reason}\n\nيمكنك إعادة الرفع من خلال بوابة المستفيدين.\n\nللدعم: ${supportPhone}`;
    },

    welcomeRegistration: (name: string, supportPhone: string): string => {
      return `مرحباً ${name}،\n\n🎉 تم استلام طلب تسجيلك بنجاح!\n\nطلبك الآن قيد المراجعة من قبل فريقنا. سنتواصل معك قريباً.\n\nللاستفسار: ${supportPhone}`;
    },
  },

  async getAllNotifications(): Promise<WhatsAppNotification[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('whatsapp_notifications_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as WhatsAppNotification[];
  },

  async getPendingNotifications(): Promise<WhatsAppNotification[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('whatsapp_notifications_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as WhatsAppNotification[];
  },

  async getNotificationsByBeneficiary(beneficiaryId: string): Promise<WhatsAppNotification[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('whatsapp_notifications_queue')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as WhatsAppNotification[];
  },

  async createNotification(
    beneficiaryId: string,
    notificationType: string,
    whatsappNumber: string,
    messageTemplate: string,
    messageVariables: Record<string, any> = {},
    packageId?: string
  ): Promise<WhatsAppNotification> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('whatsapp_notifications_queue')
      .insert({
        beneficiary_id: beneficiaryId,
        notification_type: notificationType,
        package_id: packageId,
        whatsapp_number: this.formatPhoneNumber(whatsappNumber),
        message_template: messageTemplate,
        message_variables: messageVariables,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as WhatsAppNotification;
  },

  async markAsSent(notificationId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('whatsapp_notifications_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAsFailed(notificationId: string, errorMessage: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: notification } = await supabase
      .from('whatsapp_notifications_queue')
      .select('retry_count')
      .eq('id', notificationId)
      .single();

    const { error } = await supabase
      .from('whatsapp_notifications_queue')
      .update({
        status: 'failed',
        error_message: errorMessage,
        retry_count: (notification?.retry_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async cancelNotification(notificationId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('whatsapp_notifications_queue')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async sendViaAPI(
    notification: WhatsAppNotification,
    settings: WhatsAppSettings
  ): Promise<boolean> {
    if (!settings.api_key || !settings.api_url) {
      throw new Error('WhatsApp API settings not configured');
    }

    try {
      const message = this.interpolateTemplate(
        notification.message_template,
        notification.message_variables
      );

      const response = await fetch(settings.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.api_key}`,
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(notification.whatsapp_number),
          from: settings.sender_number || settings.support_phone,
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send WhatsApp message');
      }

      await this.markAsSent(notification.id);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.markAsFailed(notification.id, errorMessage);
      return false;
    }
  },

  async getNotificationStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
  }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: all } = await supabase
      .from('whatsapp_notifications_queue')
      .select('status');

    if (!all) {
      return { total: 0, pending: 0, sent: 0, failed: 0 };
    }

    return {
      total: all.length,
      pending: all.filter(n => n.status === 'pending').length,
      sent: all.filter(n => n.status === 'sent').length,
      failed: all.filter(n => n.status === 'failed').length,
    };
  },

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  },

  openWhatsApp(phone: string, message: string): void {
    const link = this.generateWhatsAppLink(phone, message);
    window.open(link, '_blank');
  },
};
