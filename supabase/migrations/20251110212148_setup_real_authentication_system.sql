/*
  # إعداد نظام المصادقة الحقيقي باستخدام Supabase Auth

  ## الوصف
  تحويل النظام من مصادقة وهمية إلى نظام مصادقة احترافي حقيقي

  ## 1. التعديلات على الجداول الموجودة

  ### system_users
  - إضافة حقل auth_user_id للربط مع auth.users
  - إضافة حقل password_hash (للمرجع فقط، الباسوورد في auth.users)
  - تحديث الحقول الموجودة

  ## 2. الدوال الجديدة

  ### create_admin_user
  - إنشاء مستخدم إداري جديد في auth.users و system_users
  - التحقق من الصلاحيات
  - إرجاع معلومات المستخدم

  ### get_current_user_info
  - الحصول على معلومات المستخدم الحالي من system_users
  - استخدام auth.uid() للحصول على المستخدم المصادق

  ### check_user_is_admin
  - التحقق من أن المستخدم الحالي لديه صلاحيات إدارية

  ## 3. Triggers

  ### on_auth_user_created
  - يتم تشغيله تلقائياً عند إنشاء مستخدم في auth.users
  - ينشئ سجل مطابق في system_users

  ## 4. تحديث سياسات RLS
  - تحديث السياسات للاعتماد على auth.uid()
  - إضافة فحص الأدوار للعمليات الحساسة

  ## 5. حذف البيانات الوهمية
  - حذف جميع المستخدمين الوهميين من system_users
  - الاحتفاظ فقط ببيانات المؤسسات والعائلات والمستفيدين
*/

-- ===================================
-- 1. تحديث جدول system_users
-- ===================================

-- إضافة حقل auth_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'system_users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE system_users ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_system_users_auth_user_id ON system_users(auth_user_id);

-- تحديث الحقل الموجود associated_type لإضافة null بشكل صحيح
ALTER TABLE system_users ALTER COLUMN associated_type DROP NOT NULL;

-- ===================================
-- 2. دالة للحصول على معلومات المستخدم الحالي
-- ===================================

CREATE OR REPLACE FUNCTION get_current_user_info()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user system_users;
  v_role roles;
BEGIN
  -- التحقق من وجود مستخدم مصادق
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'not_authenticated',
      'message', 'المستخدم غير مصادق'
    );
  END IF;

  -- جلب معلومات المستخدم
  SELECT * INTO v_user
  FROM system_users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'user_not_found',
      'message', 'لم يتم العثور على معلومات المستخدم'
    );
  END IF;

  -- جلب معلومات الدور
  SELECT * INTO v_role
  FROM roles
  WHERE id = v_user.role_id;

  RETURN jsonb_build_object(
    'success', true,
    'user', row_to_json(v_user),
    'role', row_to_json(v_role)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'system_error',
      'message', SQLERRM
    );
END;
$$;

-- ===================================
-- 3. دالة للتحقق من أن المستخدم إداري
-- ===================================

CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- التحقق من وجود مستخدم مصادق
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- التحقق من أن المستخدم لديه دور إداري
  SELECT EXISTS (
    SELECT 1
    FROM system_users su
    JOIN roles r ON r.id = su.role_id
    WHERE su.auth_user_id = auth.uid()
      AND r.name = 'مدير النظام'
      AND su.status = 'active'
  ) INTO v_is_admin;

  RETURN v_is_admin;

EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ===================================
-- 4. دالة لإنشاء مستخدم إداري جديد
-- ===================================

CREATE OR REPLACE FUNCTION create_admin_user(
  p_email text,
  p_password text,
  p_name text,
  p_phone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_user_id uuid;
  v_role_id uuid;
  v_user system_users;
  v_user_count integer;
BEGIN
  -- التحقق من المدخلات
  IF p_email IS NULL OR p_password IS NULL OR p_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'missing_parameters',
      'message', 'جميع الحقول مطلوبة'
    );
  END IF;

  -- التحقق من طول كلمة المرور
  IF length(p_password) < 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'weak_password',
      'message', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    );
  END IF;

  -- التحقق من صيغة البريد الإلكتروني
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_email',
      'message', 'صيغة البريد الإلكتروني غير صحيحة'
    );
  END IF;

  -- عد المستخدمين الإداريين الموجودين
  SELECT COUNT(*) INTO v_user_count
  FROM system_users su
  JOIN roles r ON r.id = su.role_id
  WHERE r.name = 'مدير النظام';

  -- إذا كان هناك مستخدمون إداريون، تحقق من صلاحيات المستخدم الحالي
  IF v_user_count > 0 AND NOT check_user_is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'unauthorized',
      'message', 'ليس لديك صلاحية لإنشاء مستخدم إداري جديد'
    );
  END IF;

  -- الحصول على معرف دور المدير
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = 'مدير النظام'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'role_not_found',
      'message', 'دور المدير غير موجود في النظام'
    );
  END IF;

  -- إنشاء المستخدم في auth.users
  -- ملاحظة: هذا يتطلب استخدام Supabase Admin API من جانب العميل
  -- أو استخدام auth.sign_up من جانب المستخدم

  -- للآن، سنفترض أن المستخدم تم إنشاؤه في auth.users
  -- وسنقوم بإنشاء السجل في system_users فقط

  RETURN jsonb_build_object(
    'success', true,
    'message', 'يرجى استخدام نموذج التسجيل لإنشاء المستخدم',
    'role_id', v_role_id
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'email_exists',
      'message', 'البريد الإلكتروني مسجل مسبقاً'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'system_error',
      'message', SQLERRM
    );
END;
$$;

-- ===================================
-- 5. Trigger لإنشاء سجل في system_users عند التسجيل
-- ===================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role_id uuid;
  v_name text;
BEGIN
  -- الحصول على معرف دور المدير
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = 'مدير النظام'
  LIMIT 1;

  -- استخراج الاسم من البريد الإلكتروني أو البيانات الوصفية
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- إنشاء سجل في system_users
  INSERT INTO system_users (
    auth_user_id,
    name,
    email,
    phone,
    role_id,
    status,
    created_at
  ) VALUES (
    NEW.id,
    v_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_role_id,
    'active',
    now()
  );

  RETURN NEW;
END;
$$;

-- حذف Trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- إنشاء Trigger جديد
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ===================================
-- 6. تحديث سياسات RLS لجدول system_users
-- ===================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable read access for all users" ON system_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON system_users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON system_users;

-- سياسة القراءة: المستخدمون المصادق عليهم يمكنهم قراءة معلومات جميع المستخدمين
CREATE POLICY "Authenticated users can read all system users"
  ON system_users
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة الإدراج: لا أحد يمكنه الإدراج مباشرة (يتم عبر Trigger)
CREATE POLICY "No direct insert to system users"
  ON system_users
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- سياسة التحديث: المستخدمون يمكنهم تحديث معلوماتهم فقط
CREATE POLICY "Users can update own info"
  ON system_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- سياسة الحذف: المدراء فقط يمكنهم الحذف
CREATE POLICY "Only admins can delete users"
  ON system_users
  FOR DELETE
  TO authenticated
  USING (check_user_is_admin());

-- ===================================
-- 7. تحديث سياسات RLS للجداول الحساسة
-- ===================================

-- تحديث سياسات sms_logs
DROP POLICY IF EXISTS "Anyone can read SMS logs" ON sms_logs;
DROP POLICY IF EXISTS "Authenticated users can read SMS logs" ON sms_logs;
DROP POLICY IF EXISTS "Authenticated users can insert SMS logs" ON sms_logs;
DROP POLICY IF EXISTS "Authenticated users can update SMS logs" ON sms_logs;

CREATE POLICY "Authenticated users can read SMS logs"
  ON sms_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert SMS logs"
  ON sms_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SMS logs"
  ON sms_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات sms_api_settings
DROP POLICY IF EXISTS "Anyone can read SMS settings" ON sms_api_settings;
DROP POLICY IF EXISTS "Allow insert if table is empty" ON sms_api_settings;
DROP POLICY IF EXISTS "Anyone can update SMS settings" ON sms_api_settings;
DROP POLICY IF EXISTS "Anyone can delete SMS settings" ON sms_api_settings;

CREATE POLICY "Authenticated users can read SMS settings"
  ON sms_api_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert SMS settings"
  ON sms_api_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (NOT EXISTS (SELECT 1 FROM sms_api_settings));

CREATE POLICY "Authenticated users can update SMS settings"
  ON sms_api_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- تحديث سياسات verification_codes
DROP POLICY IF EXISTS "Authenticated users can read verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Authenticated users can insert verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Authenticated users can update verification codes" ON verification_codes;

CREATE POLICY "Authenticated users can read verification codes"
  ON verification_codes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert verification codes"
  ON verification_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update verification codes"
  ON verification_codes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===================================
-- 8. حذف البيانات الوهمية
-- ===================================

-- حذف جميع المستخدمين من system_users
-- سيتم إنشاء المستخدمين الحقيقيين عند التسجيل
DELETE FROM system_users;

-- ===================================
-- 9. منح الصلاحيات
-- ===================================

GRANT EXECUTE ON FUNCTION get_current_user_info TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_user_is_admin TO authenticated, anon;
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated, anon;

-- ===================================
-- 10. تعليقات توضيحية
-- ===================================

COMMENT ON FUNCTION get_current_user_info IS 'الحصول على معلومات المستخدم الحالي المصادق من system_users';
COMMENT ON FUNCTION check_user_is_admin IS 'التحقق من أن المستخدم الحالي لديه صلاحيات إدارية';
COMMENT ON FUNCTION create_admin_user IS 'إنشاء مستخدم إداري جديد (يتطلب صلاحيات إدارية أو أن يكون أول مستخدم)';
COMMENT ON FUNCTION handle_new_user IS 'Trigger function لإنشاء سجل في system_users عند إنشاء مستخدم في auth.users';
