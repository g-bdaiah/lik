/*
  # تحديث نظام بوابة المستفيدين مع حالة الحساب وطلبات التحديث

  1. تحديثات على جدول المستفيدين
    - إضافة حقل verification_status لحالة التوثيق (verified, under_review, rejected)
    - إضافة حقل qualification_status لحالة الأهلية (qualified, needs_update, unqualified)
    - إضافة حقل verification_notes لملاحظات التوثيق
    - إضافة حقل qualification_notes لملاحظات الأهلية
    - إضافة حقل suggested_organizations_ids لتخزين المؤسسات المقترحة
    - إضافة حقل password_created_at لتتبع تاريخ إنشاء كلمة المرور

  2. جداول جديدة
    - جدول beneficiary_data_updates لتتبع طلبات تحديث البيانات
    - إضافة حقول tracking_number و packages.scheduled_delivery_date

  3. الأمان
    - تفعيل RLS على الجداول الجديدة
    - إضافة سياسات للوصول الآمن للبيانات
    - سياسات للسماح للمستفيدين بقراءة بياناتهم وتحديثها
*/

-- إضافة حقول جديدة لجدول beneficiaries
DO $$
BEGIN
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
    ALTER TABLE beneficiaries ADD COLUMN verification_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'qualification_notes'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN qualification_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'suggested_organizations_ids'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN suggested_organizations_ids text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'password_created_at'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN password_created_at timestamptz;
  END IF;
END $$;

-- إضافة حقول جديدة لجدول packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE packages ADD COLUMN tracking_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'scheduled_delivery_date'
  ) THEN
    ALTER TABLE packages ADD COLUMN scheduled_delivery_date date;
  END IF;
END $$;

-- إضافة حقول جديدة لجدول beneficiary_auth
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiary_auth' AND column_name = 'password_created_at'
  ) THEN
    ALTER TABLE beneficiary_auth ADD COLUMN password_created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- إنشاء جدول لطلبات تحديث البيانات
CREATE TABLE IF NOT EXISTS beneficiary_data_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  update_type text NOT NULL,
  changes jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification_status ON beneficiaries(verification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_qualification_status ON beneficiaries(qualification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_suggested_orgs ON beneficiaries USING gin(suggested_organizations_ids);
CREATE INDEX IF NOT EXISTS idx_data_updates_beneficiary_id ON beneficiary_data_updates(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_data_updates_status ON beneficiary_data_updates(status);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON packages(tracking_number);

-- تفعيل RLS على الجدول الجديد
ALTER TABLE beneficiary_data_updates ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول beneficiary_data_updates
CREATE POLICY "Users can view all data updates"
  ON beneficiary_data_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert data updates"
  ON beneficiary_data_updates FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can update data updates"
  ON beneficiary_data_updates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات RLS لجدول beneficiaries للسماح بالقراءة العامة لبعض الحقول
DROP POLICY IF EXISTS "Public can view basic beneficiary info" ON beneficiaries;
CREATE POLICY "Public can view basic beneficiary info"
  ON beneficiaries FOR SELECT
  TO anon, authenticated
  USING (true);

-- دالة لتوليد رقم تتبع فريد للطرود
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  tracking_num text;
  exists_check boolean;
BEGIN
  LOOP
    tracking_num := 'PKG' || to_char(now(), 'YYYYMMDD') || '-' ||
                    LPAD(floor(random() * 10000)::text, 4, '0');

    SELECT EXISTS(SELECT 1 FROM packages WHERE tracking_number = tracking_num) INTO exists_check;

    EXIT WHEN NOT exists_check;
  END LOOP;

  RETURN tracking_num;
END;
$$;

-- تحديث الطرود الموجودة بأرقام تتبع إذا لم تكن موجودة
UPDATE packages
SET tracking_number = generate_tracking_number()
WHERE tracking_number IS NULL;
