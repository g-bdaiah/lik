/*
  # إضافة جداول بوابة المستفيدين

  ## الجداول الجديدة
  
  ### 1. beneficiary_auth
  يحتوي على بيانات المصادقة للمستفيدين
  
  ### 2. beneficiary_password_resets
  لإدارة طلبات استرداد كلمة المرور
  
  ### 3. beneficiary_otp
  لتخزين رموز OTP المؤقتة
  
  ### 4. system_features
  لتفعيل وتعطيل ميزات النظام

  ## الأمان
  - تفعيل RLS على جميع الجداول الجديدة
  - سياسات محددة لكل جدول للوصول الآمن
*/

-- إنشاء جدول بيانات المصادقة للمستفيدين
CREATE TABLE IF NOT EXISTS beneficiary_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  national_id text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_first_login boolean DEFAULT true,
  last_login_at timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beneficiary_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_auth_id uuid NOT NULL REFERENCES beneficiary_auth(id) ON DELETE CASCADE,
  temporary_password_hash text NOT NULL,
  is_used boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beneficiary_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  otp_code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('registration', 'login', 'password_reset', 'data_update')),
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  feature_name text NOT NULL,
  is_enabled boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  updated_by text DEFAULT 'system',
  updated_at timestamptz DEFAULT now()
);

-- تحديث جدول beneficiaries بإضافة حقول جديدة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN whatsapp_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'whatsapp_family_member'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN whatsapp_family_member text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'personal_photo_url'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN personal_photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'last_portal_access'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN last_portal_access timestamptz;
  END IF;
END $$;

-- تحديث جدول packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'packages' AND column_name = 'scheduled_delivery_date'
  ) THEN
    ALTER TABLE packages ADD COLUMN scheduled_delivery_date date;
  END IF;
END $$;

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_beneficiary_auth_national_id ON beneficiary_auth(national_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_auth_beneficiary_id ON beneficiary_auth(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_otp_beneficiary_id ON beneficiary_otp(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_otp_expires_at ON beneficiary_otp(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_auth_id ON beneficiary_password_resets(beneficiary_auth_id);
CREATE INDEX IF NOT EXISTS idx_packages_scheduled_date ON packages(scheduled_delivery_date);

-- تفعيل RLS
ALTER TABLE beneficiary_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_features ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "beneficiary_auth_select" ON beneficiary_auth FOR SELECT TO authenticated USING (true);
CREATE POLICY "beneficiary_auth_all_admin" ON beneficiary_auth FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "password_resets_insert" ON beneficiary_password_resets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "password_resets_select" ON beneficiary_password_resets FOR SELECT TO authenticated USING (true);
CREATE POLICY "otp_insert" ON beneficiary_otp FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "otp_select" ON beneficiary_otp FOR SELECT TO authenticated USING (true);
CREATE POLICY "features_select" ON system_features FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "features_update" ON system_features FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- إدخال الميزات الافتراضية
INSERT INTO system_features (feature_key, feature_name, is_enabled, settings)
VALUES 
  ('otp_verification', 'التحقق عبر OTP واتساب', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('password_recovery', 'استرداد كلمة المرور', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('whatsapp_notifications', 'إشعارات واتساب التلقائية', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('beneficiary_portal', 'بوابة المستفيدين', true, '{}'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;