import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

export type VerificationStatus = 'verified' | 'under_review' | 'rejected';
export type QualificationStatus = 'qualified' | 'needs_update' | 'unqualified';

interface AccountStatus {
  verificationStatus: VerificationStatus;
  qualificationStatus: QualificationStatus;
  verificationNotes: string;
  qualificationNotes: string;
  suggestedOrganizations: Organization[];
}

export const accountStatusService = {
  async getAccountStatus(beneficiaryId: string): Promise<AccountStatus | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data: beneficiary, error } = await supabase
      .from('beneficiaries')
      .select('verification_status, qualification_status, verification_notes, qualification_notes, suggested_organizations_ids')
      .eq('id', beneficiaryId)
      .maybeSingle();

    if (error) throw error;
    if (!beneficiary) return null;

    const suggestedOrgs = await this.getSuggestedOrganizations(beneficiary.suggested_organizations_ids || []);

    return {
      verificationStatus: (beneficiary.verification_status as VerificationStatus) || 'under_review',
      qualificationStatus: (beneficiary.qualification_status as QualificationStatus) || 'needs_update',
      verificationNotes: beneficiary.verification_notes || '',
      qualificationNotes: beneficiary.qualification_notes || '',
      suggestedOrganizations: suggestedOrgs
    };
  },

  async updateVerificationStatus(
    beneficiaryId: string,
    status: VerificationStatus,
    notes: string,
    updatedBy: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .update({
        verification_status: status,
        verification_notes: notes,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) throw error;

    const beneficiary = await this.getBeneficiaryById(beneficiaryId);
    if (beneficiary) {
      await this.createNotification(
        beneficiaryId,
        'verification_status_change',
        'تحديث حالة التوثيق',
        this.getVerificationStatusMessage(status, notes)
      );
    }
  },

  async updateQualificationStatus(
    beneficiaryId: string,
    status: QualificationStatus,
    notes: string,
    updatedBy: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .update({
        qualification_status: status,
        qualification_notes: notes,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) throw error;

    await this.createNotification(
      beneficiaryId,
      'qualification_status_change',
      'تحديث حالة الأهلية',
      this.getQualificationStatusMessage(status, notes)
    );
  },

  async getSuggestedOrganizations(organizationIds: string[]): Promise<Organization[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    if (!organizationIds || organizationIds.length === 0) return [];

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .in('id', organizationIds)
      .eq('status', 'active');

    if (error) throw error;
    return (data || []) as Organization[];
  },

  async updateSuggestedOrganizations(
    beneficiaryId: string,
    organizationIds: string[],
    updatedBy: string
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .update({
        suggested_organizations_ids: organizationIds,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) throw error;

    if (organizationIds.length > 0) {
      await this.createNotification(
        beneficiaryId,
        'general',
        'مؤسسات مقترحة جديدة',
        `تم اقتراح ${organizationIds.length} مؤسسة مناسبة لك. يمكنك مراجعتها من خلال حسابك.`
      );
    }
  },

  async checkDataCompleteness(beneficiaryId: string): Promise<{
    isComplete: boolean;
    missingFields: string[];
  }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', beneficiaryId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { isComplete: false, missingFields: ['جميع البيانات مفقودة'] };

    const missingFields: string[] = [];

    if (!data.name || data.name.trim() === '') missingFields.push('الاسم');
    if (!data.full_name || data.full_name.trim() === '') missingFields.push('الاسم الكامل');
    if (!data.national_id || data.national_id.trim() === '') missingFields.push('رقم الهوية');
    if (!data.date_of_birth) missingFields.push('تاريخ الميلاد');
    if (!data.phone || data.phone.trim() === '') missingFields.push('رقم الهاتف');
    if (!data.address || data.address.trim() === '') missingFields.push('العنوان');
    if (!data.profession || data.profession.trim() === '') missingFields.push('المهنة');
    if (!data.identity_image_url) missingFields.push('صورة الهوية');

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  },

  async getBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', beneficiaryId)
      .maybeSingle();

    if (error) throw error;
    return data;
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
  },

  getVerificationStatusMessage(status: VerificationStatus, notes: string): string {
    switch (status) {
      case 'verified':
        return 'تم التحقق من حسابك بنجاح! يمكنك الآن التقديم للحصول على المساعدات.';
      case 'under_review':
        return 'حسابك قيد المراجعة من قبل الإدارة. سيتم إشعارك بالنتيجة قريباً.';
      case 'rejected':
        return `تم رفض التحقق من حسابك. السبب: ${notes || 'غير محدد'}. يرجى تحديث بياناتك وإعادة المحاولة.`;
      default:
        return 'حالة غير معروفة';
    }
  },

  getQualificationStatusMessage(status: QualificationStatus, notes: string): string {
    switch (status) {
      case 'qualified':
        return 'أنت مؤهل للحصول على المساعدات! يمكنك التقديم للمؤسسات المقترحة.';
      case 'needs_update':
        return `يرجى تحديث بياناتك لتحديد مدى أهليتك. ${notes || ''}`;
      case 'unqualified':
        return `للأسف، لا تنطبق عليك معايير الأهلية حالياً. ${notes || ''}`;
      default:
        return 'حالة غير معروفة';
    }
  },

  getVerificationStatusConfig(status: VerificationStatus) {
    const configs = {
      verified: {
        label: 'موثق',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: 'CheckCircle',
        description: 'تم التحقق من حسابك بنجاح'
      },
      under_review: {
        label: 'قيد المراجعة',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: 'Clock',
        description: 'حسابك قيد المراجعة من قبل الإدارة'
      },
      rejected: {
        label: 'مرفوض',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: 'AlertCircle',
        description: 'تم رفض التحقق من حسابك'
      }
    };
    return configs[status] || configs.under_review;
  },

  getQualificationStatusConfig(status: QualificationStatus) {
    const configs = {
      qualified: {
        label: 'مؤهل',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: 'CheckCircle',
        description: 'أنت مؤهل للحصول على المساعدات'
      },
      needs_update: {
        label: 'يحتاج تحديث',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: 'Info',
        description: 'يرجى تحديث بياناتك لتحديد الأهلية'
      },
      unqualified: {
        label: 'غير مؤهل',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: 'XCircle',
        description: 'لا تنطبق معايير الأهلية حالياً'
      }
    };
    return configs[status] || configs.needs_update;
  }
};
