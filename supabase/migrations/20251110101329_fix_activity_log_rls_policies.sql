/*
  # إصلاح سياسات Row Level Security لجدول activity_log

  ## التغييرات
  
  1. إضافة حقل source لتمييز مصدر النشاط
     - admin: من لوحة تحكم الادمن
     - beneficiary: من بوابة المستفيدين
     - system: من النظام (triggers)
     - public: بحث عام من الصفحة الرئيسية
  
  2. تحديث سياسات RLS
     - السماح بالإدخال من anon role للأنشطة العامة
     - السماح بالقراءة حسب الصلاحيات
     - عدم السماح بالتعديل أو الحذف
  
  3. الأمان
     - حماية السجلات من التعديل
     - السماح بتسجيل أنشطة المستفيدين بشكل آمن
*/

-- إضافة حقل source إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_log' AND column_name = 'source'
  ) THEN
    ALTER TABLE activity_log ADD COLUMN source text DEFAULT 'system' 
    CHECK (source IN ('admin', 'beneficiary', 'system', 'public'));
  END IF;
END $$;

-- إنشاء index على حقل source
CREATE INDEX IF NOT EXISTS idx_activity_log_source ON activity_log(source);

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable read access for all users" ON activity_log;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON activity_log;

-- سياسة القراءة: الجميع يمكنهم القراءة (للعرض في لوحة التحكم)
CREATE POLICY "السماح بقراءة السجلات للجميع"
  ON activity_log FOR SELECT
  TO authenticated, anon
  USING (true);

-- سياسة الإدخال: السماح للمستخدمين المصادقين
CREATE POLICY "السماح بالإدخال للمستخدمين المصادقين"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة الإدخال: السماح للزوار (anon) بتسجيل الأنشطة العامة فقط
CREATE POLICY "السماح للزوار بتسجيل الأنشطة العامة"
  ON activity_log FOR INSERT
  TO anon
  WITH CHECK (source IN ('beneficiary', 'public'));

-- منع التعديل والحذف تماماً لحماية السجلات
CREATE POLICY "منع التعديل والحذف"
  ON activity_log FOR UPDATE
  USING (false);

CREATE POLICY "منع الحذف"
  ON activity_log FOR DELETE
  USING (false);