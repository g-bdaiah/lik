import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type DataUpdate = Database['public']['Tables']['beneficiary_data_updates']['Row'];

export interface UpdateRequest {
  beneficiaryId: string;
  updateType: string;
  changes: Record<string, any>;
}

export interface SingleFieldUpdateRequest {
  beneficiaryId: string;
  updateType: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export const dataUpdateService = {
  async submitDataUpdateRequest(request: UpdateRequest): Promise<string> {
    if (!supabase) throw new Error('Supabase not initialized');

    for (const fieldName of Object.keys(request.changes)) {
      const canUpdate = await this.canUpdateField(request.beneficiaryId, fieldName);
      if (!canUpdate.allowed) {
        throw new Error(canUpdate.reason || `غير مسموح بتحديث حقل ${this.getFieldArabicName(fieldName)}`);
      }
    }

    const { data, error } = await supabase
      .from('beneficiary_data_updates')
      .insert({
        beneficiary_id: request.beneficiaryId,
        update_type: request.updateType,
        changes: request.changes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    const fieldsList = Object.keys(request.changes).map(f => this.getFieldArabicName(f)).join('، ');

    await this.createNotification(
      request.beneficiaryId,
      'general',
      'طلب تحديث البيانات',
      `تم إرسال طلب تحديث البيانات التالية: ${fieldsList}. سيتم مراجعته من قبل الإدارة قريباً.`
    );

    return data.id;
  },

  async getUpdateRequests(beneficiaryId?: string, status?: string): Promise<DataUpdate[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase
      .from('beneficiary_data_updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (beneficiaryId) {
      query = query.eq('beneficiary_id', beneficiaryId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as DataUpdate[];
  },

  async getPendingRequestsCount(): Promise<number> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { count, error } = await supabase
      .from('beneficiary_data_updates')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  },

  async approveDataUpdate(updateId: string, reviewedBy: string, notes?: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: update, error: fetchError } = await supabase
      .from('beneficiary_data_updates')
      .select('*')
      .eq('id', updateId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!update) throw new Error('طلب التحديث غير موجود');

    const { error: updateStatusError } = await supabase
      .from('beneficiary_data_updates')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        notes: notes
      })
      .eq('id', updateId);

    if (updateStatusError) throw updateStatusError;

    const updateData: any = {
      ...update.changes,
      updated_at: new Date().toISOString(),
      updated_by: reviewedBy
    };

    const { error: applyError } = await supabase
      .from('beneficiaries')
      .update(updateData)
      .eq('id', update.beneficiary_id);

    if (applyError) throw applyError;

    const fieldsList = Object.keys(update.changes).map(f => this.getFieldArabicName(f)).join('، ');

    await this.createNotification(
      update.beneficiary_id,
      'data_update_response',
      'تمت الموافقة على تحديث البيانات',
      `تمت الموافقة على طلب تحديث البيانات التالية: ${fieldsList}.`
    );
  },

  async rejectDataUpdate(updateId: string, reviewedBy: string, reason: string, notes?: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: update, error: fetchError } = await supabase
      .from('beneficiary_data_updates')
      .select('*')
      .eq('id', updateId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!update) throw new Error('طلب التحديث غير موجود');

    const { error } = await supabase
      .from('beneficiary_data_updates')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        rejection_reason: reason,
        notes: notes
      })
      .eq('id', updateId);

    if (error) throw error;

    const fieldsList = Object.keys(update.changes).map(f => this.getFieldArabicName(f)).join('، ');

    await this.createNotification(
      update.beneficiary_id,
      'data_update_response',
      'تم رفض تحديث البيانات',
      `تم رفض طلب تحديث البيانات التالية: ${fieldsList}. السبب: ${reason}`
    );
  },

  async canUpdateField(beneficiaryId: string, fieldName: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (!supabase) throw new Error('Supabase not initialized');

    if (fieldName === 'name' || fieldName === 'national_id') {
      return {
        allowed: false,
        reason: 'غير مسموح بتعديل الاسم أو رقم الهوية'
      };
    }

    if (fieldName === 'phone') {
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('phone_locked')
        .eq('id', beneficiaryId)
        .maybeSingle();

      if (beneficiary?.phone_locked) {
        return {
          allowed: false,
          reason: 'رقم الهاتف مقفل ولا يمكن تعديله'
        };
      }
    }

    return { allowed: true };
  },

  async lockPhoneNumber(beneficiaryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .update({
        phone_locked: true,
        phone_locked_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) throw error;
  },

  getFieldArabicName(fieldName: string): string {
    const fieldNames: Record<string, string> = {
      phone: 'رقم الهاتف',
      address: 'العنوان',
      detailed_address: 'العنوان التفصيلي',
      location: 'الموقع الجغرافي',
      profession: 'المهنة',
      marital_status: 'الحالة الاجتماعية',
      economic_level: 'المستوى الاقتصادي',
      members_count: 'عدد أفراد الأسرة',
      medical_conditions: 'الحالة الصحية',
      whatsapp_number: 'رقم الواتساب',
      whatsapp_family_member: 'صاحب رقم الواتساب',
      personal_photo_url: 'الصورة الشخصية',
      identity_image_url: 'صورة الهوية'
    };
    return fieldNames[fieldName] || fieldName;
  },

  async createNotification(
    beneficiaryId: string,
    type: string,
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
        message
      });

    if (error) console.error('Error creating notification:', error);
  }
};
