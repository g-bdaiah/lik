/*
  # إضافة جداول بوابة المستفيدين

  ## الجداول الجديدة
  
  ### 1. beneficiary_auth
  يحتوي على بيانات المصادقة للمستفيدين
  - `id` (uuid, primary key)
  - `beneficiary_id` (uuid, foreign key -> beneficiaries)
  - `national_id` (text, unique) - رقم الهوية الوطني
  - `password_hash` (text) - كلمة المرور المشفرة (bcrypt)
  - `is_first_login` (boolean) - هل هذا أول تسجيل دخول
  - `last_login_at` (timestamptz) - آخر تسجيل دخول
  - `login_attempts` (integer) - عدد محاولات تسجيل الدخول الفاشلة
  - `locked_until` (timestamptz) - مقفل حتى (حماية من brute force)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. beneficiary_password_resets
  لإدارة طلبات استرداد كلمة المرور
  - `id` (uuid, primary key)
  - `beneficiary_auth_id` (uuid, foreign key)
  - `temporary_password_hash` (text) - كلمة المرور المؤقتة
  - `is_used` (boolean) - هل تم استخدامها
  - `expires_at` (timestamptz) - تاريخ انتهاء الصلاحية
  - `created_at` (timestamptz)

  ### 3. beneficiary_otp
  لتخزين رموز OTP المؤقتة
  - `id` (uuid, primary key)
  - `beneficiary_id` (uuid, foreign key)
  - `otp_code` (text) - رمز OTP (6 أرقام)
  - `purpose` (text) - الغرض (registration, login, password_reset)
  - `is_verified` (boolean) - هل تم التحقق منه
  - `expires_at` (timestamptz) - تاريخ انتهاء الصلاحية
  - `created_at` (timestamptz)

  ### 4. system_features
  لتفعيل وتعطيل ميزات النظام
  - `id` (uuid, primary key)
  - `feature_key` (text, unique) - مفتاح الميزة
  - `feature_name` (text) - اسم الميزة
  - `is_enabled` (boolean) - هل الميزة مفعلة
  - `settings` (jsonb) - إعدادات إضافية
  - `updated_by` (text) - من قام بالتحديث
  - `updated_at` (timestamptz)

  ## التحديثات على الجداول الموجودة
  
  ### beneficiaries
  - إضافة `whatsapp_number` (text) - رقم واتساب
  - إضافة `whatsapp_family_member` (text) - رقم واتساب لفرد من العائلة
  - إضافة `personal_photo_url` (text) - صورة شخصية
  - إضافة `last_portal_access` (timestamptz) - آخر دخول للبوابة

  ### packages
  - إضافة `scheduled_delivery_date` (date) - تاريخ التسليم المجدول للطرود المستقبلية

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

-- إنشاء جدول استرداد كلمة المرور
CREATE TABLE IF NOT EXISTS beneficiary_password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_auth_id uuid NOT NULL REFERENCES beneficiary_auth(id) ON DELETE CASCADE,
  temporary_password_hash text NOT NULL,
  is_used boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول رموز OTP
CREATE TABLE IF NOT EXISTS beneficiary_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  otp_code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('registration', 'login', 'password_reset', 'data_update')),
  is_verified boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول إعدادات الميزات
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

-- تحديث جدول packages بإضافة حقل التسليم المجدول
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'packages' AND column_name = 'scheduled_delivery_date'
  ) THEN
    ALTER TABLE packages ADD COLUMN scheduled_delivery_date date;
  END IF;
END $$;

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_beneficiary_auth_national_id ON beneficiary_auth(national_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_auth_beneficiary_id ON beneficiary_auth(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_otp_beneficiary_id ON beneficiary_otp(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_otp_expires_at ON beneficiary_otp(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_auth_id ON beneficiary_password_resets(beneficiary_auth_id);
CREATE INDEX IF NOT EXISTS idx_packages_scheduled_date ON packages(scheduled_delivery_date);

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE beneficiary_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_features ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول beneficiary_auth
CREATE POLICY "المستفيدون يمكنهم قراءة بيانات المصادقة الخاصة بهم"
  ON beneficiary_auth FOR SELECT
  TO authenticated
  USING (beneficiary_id = auth.uid() OR auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')));

CREATE POLICY "المسؤولون يمكنهم إدارة بيانات المصادقة"
  ON beneficiary_auth FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')));

-- سياسات RLS لجدول beneficiary_password_resets
CREATE POLICY "السماح بإنشاء طلبات استرداد كلمة المرور"
  ON beneficiary_password_resets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "المسؤولون يمكنهم مراجعة طلبات استرداد كلمة المرور"
  ON beneficiary_password_resets FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')));

-- سياسات RLS لجدول beneficiary_otp
CREATE POLICY "السماح بإنشاء رموز OTP"
  ON beneficiary_otp FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "المسؤولون يمكنهم مراجعة رموز OTP"
  ON beneficiary_otp FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')));

-- سياسات RLS لجدول system_features
CREATE POLICY "الجميع يمكنهم قراءة الميزات المفعلة"
  ON system_features FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم تحديث الميزات"
  ON system_features FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM system_users WHERE role_id IN (SELECT id FROM roles WHERE name = 'admin')));

-- إدخال الميزات الافتراضية
INSERT INTO system_features (feature_key, feature_name, is_enabled, settings)
VALUES 
  ('otp_verification', 'التحقق عبر OTP واتساب', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('password_recovery', 'استرداد كلمة المرور', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('whatsapp_notifications', 'إشعارات واتساب التلقائية', false, '{"support_phone": "+970599505699"}'::jsonb),
  ('beneficiary_portal', 'بوابة المستفيدين', true, '{}'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;
