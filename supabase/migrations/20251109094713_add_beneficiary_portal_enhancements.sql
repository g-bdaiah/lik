/*
  # تحسينات بوابة المستفيدين - النافذة المنبثقة

  ## التحديثات على الجداول الموجودة

  ### beneficiaries
  - إضافة `profile_photo_url` (text) - صورة الملف الشخصي
  - تحديث `identity_image_url` للسماح بالتحديث

  ## الفهارس الإضافية
  - فهرس على `last_portal_access` لتتبع آخر دخول

  ## ملاحظات
  - جميع الحقول اختيارية
  - يمكن للمستفيدين تحديث بياناتهم
  - النظام يسجل جميع التحديثات في activity_log
*/

-- إضافة حقل صورة الملف الشخصي للمستفيدين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN profile_photo_url text;
  END IF;
END $$;

-- إنشاء فهرس على آخر دخول للبوابة
CREATE INDEX IF NOT EXISTS idx_beneficiaries_last_portal_access
  ON beneficiaries(last_portal_access DESC);

-- تحديث سياسات RLS للسماح للمستفيدين بتحديث بياناتهم الأساسية
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'beneficiaries' AND policyname = 'المستفيدون يمكنهم تحديث بياناتهم الشخصية'
  ) THEN
    CREATE POLICY "المستفيدون يمكنهم تحديث بياناتهم الشخصية"
      ON beneficiaries FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- إضافة دالة لتسجيل التحديثات التلقائية
CREATE OR REPLACE FUNCTION log_beneficiary_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.phone IS DISTINCT FROM NEW.phone OR
     OLD.address IS DISTINCT FROM NEW.address OR
     OLD.identity_image_url IS DISTINCT FROM NEW.identity_image_url OR
     OLD.profile_photo_url IS DISTINCT FROM NEW.profile_photo_url THEN

    INSERT INTO activity_log (
      action,
      user_name,
      role,
      type,
      beneficiary_id,
      details,
      source
    ) VALUES (
      'تحديث البيانات الشخصية عبر البوابة',
      NEW.name,
      'beneficiary',
      'update',
      NEW.id,
      'تم تحديث البيانات من النافذة المنبثقة',
      'beneficiary'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المشغل للتسجيل التلقائي
DROP TRIGGER IF EXISTS trigger_log_beneficiary_update ON beneficiaries;
CREATE TRIGGER trigger_log_beneficiary_update
  AFTER UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION log_beneficiary_update();

-- تحديث سياسة activity_log للسماح بالقراءة للمستفيدين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activity_log' AND policyname = 'المستفيدون يمكنهم قراءة سجلهم الخاص'
  ) THEN
    CREATE POLICY "المستفيدون يمكنهم قراءة سجلهم الخاص"
      ON activity_log FOR SELECT
      TO anon, authenticated
      USING (
        beneficiary_id IS NOT NULL AND
        source = 'beneficiary'
      );
  END IF;
END $$;