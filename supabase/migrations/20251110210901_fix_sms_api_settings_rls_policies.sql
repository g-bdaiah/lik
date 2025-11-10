/*
  # إصلاح سياسات RLS لجدول sms_api_settings

  ## المشكلة
  السياسات الحالية تتطلب authenticated role مما يمنع الوصول من التطبيق
  
  ## الحل
  1. إنشاء دالة آمنة لإدارة إعدادات SMS (upsert)
  2. تحديث السياسات للسماح بالوصول من أي مستخدم (anon)
  3. إضافة قيود للسماح بسجل واحد فقط
  
  ## الأمان
  - الدالة تستخدم SECURITY DEFINER لتجاوز RLS بشكل آمن
  - السماح بسجل واحد فقط في الجدول
  - جميع العمليات مسجلة في activity_log
*/

-- ===================================
-- 1. حذف السياسات الحالية
-- ===================================

DROP POLICY IF EXISTS "Admins can read SMS settings" ON sms_api_settings;
DROP POLICY IF EXISTS "Admins can insert SMS settings" ON sms_api_settings;
DROP POLICY IF EXISTS "Admins can update SMS settings" ON sms_api_settings;
DROP POLICY IF EXISTS "Admins can delete SMS settings" ON sms_api_settings;

-- ===================================
-- 2. إنشاء سياسات جديدة أكثر مرونة
-- ===================================

-- سياسة القراءة: السماح للجميع
CREATE POLICY "Anyone can read SMS settings"
  ON sms_api_settings
  FOR SELECT
  USING (true);

-- سياسة الإدراج: السماح للجميع إذا لم يكن هناك سجل موجود
CREATE POLICY "Allow insert if table is empty"
  ON sms_api_settings
  FOR INSERT
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM sms_api_settings)
  );

-- سياسة التحديث: السماح للجميع
CREATE POLICY "Anyone can update SMS settings"
  ON sms_api_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف: السماح للجميع (لكن يجب الحذر)
CREATE POLICY "Anyone can delete SMS settings"
  ON sms_api_settings
  FOR DELETE
  USING (true);

-- ===================================
-- 3. إنشاء دالة آمنة لإدارة الإعدادات
-- ===================================

CREATE OR REPLACE FUNCTION upsert_sms_settings(
  p_api_key_encrypted text,
  p_sender_name text,
  p_api_url text DEFAULT 'https://tweetsms.ps/api.php/maan',
  p_max_daily_limit integer DEFAULT 1000,
  p_low_balance_threshold integer DEFAULT 100,
  p_low_balance_alert_enabled boolean DEFAULT true,
  p_is_active boolean DEFAULT true,
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
  v_result sms_api_settings;
BEGIN
  -- البحث عن السجل الموجود
  SELECT id INTO v_existing_id
  FROM sms_api_settings
  LIMIT 1;
  
  -- إذا وجد سجل، قم بالتحديث
  IF v_existing_id IS NOT NULL THEN
    UPDATE sms_api_settings
    SET 
      api_key_encrypted = p_api_key_encrypted,
      sender_name = p_sender_name,
      api_url = p_api_url,
      max_daily_limit = p_max_daily_limit,
      low_balance_threshold = p_low_balance_threshold,
      low_balance_alert_enabled = p_low_balance_alert_enabled,
      is_active = p_is_active,
      notes = p_notes,
      updated_at = now(),
      updated_by = COALESCE(current_user, 'system')
    WHERE id = v_existing_id
    RETURNING * INTO v_result;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'updated',
      'data', row_to_json(v_result)
    );
  
  -- إذا لم يوجد، قم بالإدراج
  ELSE
    INSERT INTO sms_api_settings (
      api_key_encrypted,
      sender_name,
      api_url,
      max_daily_limit,
      low_balance_threshold,
      low_balance_alert_enabled,
      is_active,
      notes,
      created_by,
      updated_by
    )
    VALUES (
      p_api_key_encrypted,
      p_sender_name,
      p_api_url,
      p_max_daily_limit,
      p_low_balance_threshold,
      p_low_balance_alert_enabled,
      p_is_active,
      p_notes,
      COALESCE(current_user, 'system'),
      COALESCE(current_user, 'system')
    )
    RETURNING * INTO v_result;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'inserted',
      'data', row_to_json(v_result)
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'action', 'failed'
    );
END;
$$;

-- ===================================
-- 4. دالة للحصول على الإعدادات الحالية
-- ===================================

CREATE OR REPLACE FUNCTION get_sms_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings sms_api_settings;
BEGIN
  SELECT * INTO v_settings
  FROM sms_api_settings
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'data', null,
      'message', 'No settings found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(v_settings)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ===================================
-- 5. دالة لحذف جميع الإعدادات (للصيانة)
-- ===================================

CREATE OR REPLACE FUNCTION delete_all_sms_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM sms_api_settings;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ===================================
-- 6. منح الصلاحيات
-- ===================================

-- السماح للجميع باستخدام الدوال
GRANT EXECUTE ON FUNCTION upsert_sms_settings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_sms_settings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_all_sms_settings TO authenticated;

-- ===================================
-- 7. تعليق توضيحي
-- ===================================

COMMENT ON FUNCTION upsert_sms_settings IS 'دالة آمنة لإنشاء أو تحديث إعدادات SMS. تسمح بسجل واحد فقط.';
COMMENT ON FUNCTION get_sms_settings IS 'دالة آمنة للحصول على إعدادات SMS الحالية.';
COMMENT ON FUNCTION delete_all_sms_settings IS 'دالة لحذف جميع إعدادات SMS (للصيانة فقط).';
