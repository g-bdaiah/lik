import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface BeneficiaryAuthData {
  id: string;
  beneficiary_id: string;
  national_id: string;
  password_hash: string;
  is_first_login: boolean;
  last_login_at: string | null;
  login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

interface OTPData {
  id: string;
  beneficiary_id: string;
  otp_code: string;
  purpose: 'registration' | 'login' | 'password_reset' | 'data_update';
  is_verified: boolean;
  expires_at: string;
  created_at: string;
}

interface SystemFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  settings: any;
  updated_by: string;
  updated_at: string;
}

export const beneficiaryAuthService = {
  async searchByNationalId(nationalId: string): Promise<Beneficiary | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('national_id', nationalId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createBeneficiary(beneficiaryData: any): Promise<Beneficiary> {
    if (!supabase) throw new Error('Supabase not initialized');

    const existingBeneficiary = await this.searchByNationalId(beneficiaryData.national_id);
    if (existingBeneficiary) {
      throw new Error('رقم الهوية موجود مسبقاً في النظام');
    }

    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiaryData)
      .select()
      .single();

    if (error) throw error;
    return data as Beneficiary;
  },

  async getAuthByNationalId(nationalId: string): Promise<BeneficiaryAuthData | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiary_auth')
      .select('*')
      .eq('national_id', nationalId)
      .maybeSingle();

    if (error) throw error;
    return data as BeneficiaryAuthData | null;
  },

  async createAuth(beneficiaryId: string, nationalId: string, passwordHash: string): Promise<BeneficiaryAuthData> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiary_auth')
      .insert({
        beneficiary_id: beneficiaryId,
        national_id: nationalId,
        password_hash: passwordHash,
        is_first_login: true
      })
      .select()
      .single();

    if (error) throw error;
    return data as BeneficiaryAuthData;
  },

  async verifyPassword(nationalId: string, passwordHash: string): Promise<{ success: boolean; auth?: BeneficiaryAuthData; message?: string }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const auth = await this.getAuthByNationalId(nationalId);

    if (!auth) {
      return { success: false, message: 'رقم الهوية غير موجود' };
    }

    if (auth.locked_until && new Date(auth.locked_until) > new Date()) {
      return { success: false, message: 'الحساب مقفل مؤقتاً. يرجى المحاولة لاحقاً' };
    }

    if (auth.password_hash === passwordHash) {
      await supabase
        .from('beneficiary_auth')
        .update({
          last_login_at: new Date().toISOString(),
          login_attempts: 0,
          locked_until: null
        })
        .eq('id', auth.id);

      return { success: true, auth };
    } else {
      const newAttempts = auth.login_attempts + 1;
      const locked = newAttempts >= 5;

      await supabase
        .from('beneficiary_auth')
        .update({
          login_attempts: newAttempts,
          locked_until: locked ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
        })
        .eq('id', auth.id);

      return {
        success: false,
        message: locked
          ? 'تم قفل الحساب لمدة 30 دقيقة بسبب المحاولات المتكررة الفاشلة'
          : `كلمة المرور غير صحيحة. المحاولات المتبقية: ${5 - newAttempts}`
      };
    }
  },

  async updatePassword(authId: string, newPasswordHash: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiary_auth')
      .update({
        password_hash: newPasswordHash,
        is_first_login: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', authId);

    if (error) throw error;
  },

  async createTemporaryPassword(authId: string, tempPasswordHash: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('beneficiary_password_resets')
      .insert({
        beneficiary_auth_id: authId,
        temporary_password_hash: tempPasswordHash,
        expires_at: expiresAt
      });

    if (error) throw error;
  },

  async verifyTemporaryPassword(authId: string, tempPasswordHash: string): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiary_password_resets')
      .select('*')
      .eq('beneficiary_auth_id', authId)
      .eq('temporary_password_hash', tempPasswordHash)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await supabase
        .from('beneficiary_password_resets')
        .update({ is_used: true })
        .eq('id', data.id);
      return true;
    }

    return false;
  },

  async generateOTP(beneficiaryId: string, purpose: OTPData['purpose']): Promise<string> {
    if (!supabase) throw new Error('Supabase not initialized');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('beneficiary_otp')
      .insert({
        beneficiary_id: beneficiaryId,
        otp_code: otpCode,
        purpose: purpose,
        expires_at: expiresAt
      });

    if (error) throw error;
    return otpCode;
  },

  async verifyOTP(beneficiaryId: string, otpCode: string, purpose: OTPData['purpose']): Promise<boolean> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiary_otp')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .eq('otp_code', otpCode)
      .eq('purpose', purpose)
      .eq('is_verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await supabase
        .from('beneficiary_otp')
        .update({ is_verified: true })
        .eq('id', data.id);
      return true;
    }

    return false;
  },

  async getSystemFeature(featureKey: string): Promise<SystemFeature | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('system_features')
      .select('*')
      .eq('feature_key', featureKey)
      .maybeSingle();

    if (error) throw error;
    return data as SystemFeature | null;
  },

  async getAllSystemFeatures(): Promise<SystemFeature[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('system_features')
      .select('*')
      .order('feature_name');

    if (error) throw error;
    return (data || []) as SystemFeature[];
  },

  async updateSystemFeature(featureKey: string, isEnabled: boolean, settings?: any, updatedBy?: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const updates: any = {
      is_enabled: isEnabled,
      updated_at: new Date().toISOString()
    };

    if (settings) updates.settings = settings;
    if (updatedBy) updates.updated_by = updatedBy;

    const { error } = await supabase
      .from('system_features')
      .update(updates)
      .eq('feature_key', featureKey);

    if (error) throw error;
  },

  async updateBeneficiaryPortalAccess(beneficiaryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .update({ last_portal_access: new Date().toISOString() })
      .eq('id', beneficiaryId);

    if (error) throw error;
  },

  async logActivity(
    action: string,
    userName: string,
    role: string,
    type: 'create' | 'verify' | 'approve' | 'update' | 'deliver' | 'review',
    beneficiaryId?: string,
    details?: string,
    source: 'admin' | 'beneficiary' | 'system' | 'public' = 'beneficiary'
  ): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('activity_log')
      .insert({
        action,
        user_name: userName,
        role,
        type,
        beneficiary_id: beneficiaryId,
        details,
        source
      });

    if (error) throw error;
  },

  hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },

  validateNationalId(nationalId: string): boolean {
    const cleaned = nationalId.replace(/\s/g, '');
    return /^\d{9}$/.test(cleaned);
  },

  validatePIN(pin: string): boolean {
    return /^\d{6}$/.test(pin);
  },

  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(?:\+970|0)?5[0-9]{8}$/.test(cleaned);
  },

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

  async publicSearch(nationalId: string): Promise<{
    found: boolean;
    beneficiary?: {
      name: string;
      national_id: string;
      status: string;
    };
    packages?: Array<{
      id: string;
      name: string;
      status: string;
      scheduled_delivery_date: string | null;
      tracking_number: string | null;
    }>;
    message?: string;
  }> {
    if (!supabase) throw new Error('Supabase not initialized');

    const beneficiary = await this.searchByNationalId(nationalId);

    if (!beneficiary) {
      return {
        found: false,
        message: 'رقم الهوية غير موجود في قاعدة البيانات'
      };
    }

    const { data: packages } = await supabase
      .from('packages')
      .select('id, name, status, scheduled_delivery_date, tracking_number')
      .eq('beneficiary_id', beneficiary.id)
      .order('created_at', { ascending: false });

    await this.logActivity(
      `بحث عام عن مستفيد برقم هوية: ${nationalId}`,
      'نظام عام',
      'public',
      'review',
      beneficiary.id,
      'بحث عام من الصفحة الرئيسية',
      'public'
    );

    return {
      found: true,
      beneficiary: {
        name: beneficiary.name,
        national_id: beneficiary.national_id,
        status: beneficiary.status
      },
      packages: packages || []
    };
  }
};
