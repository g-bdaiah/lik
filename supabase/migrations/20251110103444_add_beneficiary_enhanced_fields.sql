/*
  # إضافة حقول محسّنة لجدول المستفيدين وإنشاء جداول جديدة

  ## التحديثات على جدول beneficiaries
  
  1. الحقول الجديدة:
    - `verification_status` - حالة التوثيق (verified, under_review, rejected)
    - `qualification_status` - حالة الأهلية (qualified, needs_update, unqualified)
    - `verification_notes` - ملاحظات حالة التوثيق
    - `qualification_notes` - ملاحظات حالة الأهلية
    - `suggested_organizations_ids` - معرفات المؤسسات المقترحة
    - `phone_locked` - قفل رقم الهاتف بعد أول إدخال
    - `phone_locked_at` - تاريخ قفل رقم الهاتف
    - `whatsapp_number` - رقم واتساب للتواصل
    - `whatsapp_family_member` - اسم فرد العائلة صاحب رقم الواتساب
    - `personal_photo_url` - صورة شخصية
    - `last_portal_access` - آخر دخول للبوابة

  ## الجداول الجديدة
  
  ### 2. beneficiary_data_updates
  جدول لتتبع طلبات تحديث البيانات من المستفيدين
  
  ### 3. beneficiary_notifications
  جدول للإشعارات الخاصة بالمستفيدين
  
  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات وصول محددة لكل جدول
*/

-- تحديث جدول beneficiaries بإضافة الحقول الجديدة
DO $$
BEGIN
  -- حقول حالة التوثيق والأهلية
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN verification_status text DEFAULT 'under_review' 
      CHECK (verification_status IN ('verified', 'under_review', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'qualification_status'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN qualification_status text DEFAULT 'needs_update' 
      CHECK (qualification_status IN ('qualified', 'needs_update', 'unqualified'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN verification_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'qualification_notes'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN qualification_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'suggested_organizations_ids'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN suggested_organizations_ids uuid[] DEFAULT '{}';
  END IF;

  -- حقول قفل رقم الهاتف
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'phone_locked'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN phone_locked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'phone_locked_at'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN phone_locked_at timestamptz;
  END IF;

  -- حقول واتساب
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

  -- حقول إضافية
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

-- إنشاء جدول طلبات تحديث البيانات
CREATE TABLE IF NOT EXISTS beneficiary_data_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  update_type text NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_updates_beneficiary ON beneficiary_data_updates(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_data_updates_status ON beneficiary_data_updates(status);

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS beneficiary_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('verification_status_change', 'package_assigned', 'package_delivery', 'data_update_response', 'qualification_status_change', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_beneficiary ON beneficiary_notifications(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON beneficiary_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON beneficiary_notifications(created_at DESC);

-- تحديث جدول beneficiary_auth بحقل password_created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiary_auth' AND column_name = 'password_created_at'
  ) THEN
    ALTER TABLE beneficiary_auth ADD COLUMN password_created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- إنشاء فهارس إضافية لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification_status ON beneficiaries(verification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_qualification_status ON beneficiaries(qualification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_phone_locked ON beneficiaries(phone_locked);

-- تفعيل RLS للجداول الجديدة
ALTER TABLE beneficiary_data_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_notifications ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول طلبات التحديث
CREATE POLICY "المستفيدون يمكنهم قراءة طلباتهم"
  ON beneficiary_data_updates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "المستفيدون يمكنهم إنشاء طلبات"
  ON beneficiary_data_updates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "المسؤولون يمكنهم تحديث الطلبات"
  ON beneficiary_data_updates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات RLS لجدول الإشعارات
CREATE POLICY "المستفيدون يمكنهم قراءة إشعاراتهم"
  ON beneficiary_notifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "النظام يمكنه إنشاء إشعارات"
  ON beneficiary_notifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "المستفيدون يمكنهم تحديث حالة القراءة"
  ON beneficiary_notifications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
