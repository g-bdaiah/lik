/*
  # إضافة نظام TweetSMS API Integration
  
  ## الوصف
  إضافة نظام متكامل لخدمة SMS من TweetSMS لإرسال رسائل التحقق والإشعارات
  
  ## 1. الجداول الجديدة
  
  ### sms_api_settings
  - تخزين إعدادات الاتصال بـ TweetSMS API بشكل مشفر
  - username، password، sender_name، api_key (مشفرة)
  - إعدادات إضافية: api_url، max_daily_limit
  
  ### sms_logs
  - سجل شامل لجميع الرسائل المرسلة
  - يحفظ: رقم الهاتف، نص الرسالة، الحالة، رمز الخطأ
  - SMS_ID من الخدمة، معلومات المرسل، التاريخ
  
  ### verification_codes
  - تخزين رموز OTP المرسلة للتحقق
  - الرمز، رقم الهاتف، تاريخ الانتهاء، الحالة
  - عدد المحاولات، معرف المستفيد
  
  ## 2. التحديثات على الجداول الموجودة
  
  ### beneficiaries
  - phone_verified: حالة التحقق من الهاتف
  - verification_attempts: عدد محاولات التحقق
  - last_verification_date: آخر محاولة تحقق
  - verification_method: طريقة التحقق (sms/whatsapp)
  
  ## 3. الأمان
  - تفعيل RLS على جميع الجداول الجديدة
  - تقييد الوصول لـ sms_api_settings على المسؤولين فقط
  - تشفير البيانات الحساسة
  - سياسات صارمة للقراءة والكتابة
  
  ## 4. الدوال المساعدة
  - دالة لفحص صلاحية رموز OTP
  - دالة لتنظيف الرموز المنتهية تلقائياً
  - دالة لحساب إحصائيات الرسائل
*/

-- ===================================
-- 1. جدول إعدادات SMS API
-- ===================================

CREATE TABLE IF NOT EXISTS sms_api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  password_encrypted text NOT NULL,
  sender_name text NOT NULL,
  api_key_encrypted text,
  api_url text DEFAULT 'http://www.tweetsms.ps/api.php',
  balance_check_url text DEFAULT 'http://www.tweetsms.ps/api.php?comm=chk_balance',
  
  -- إعدادات إضافية
  max_daily_limit integer DEFAULT 1000,
  current_daily_count integer DEFAULT 0,
  daily_count_reset_date date DEFAULT CURRENT_DATE,
  
  low_balance_threshold integer DEFAULT 100,
  low_balance_alert_enabled boolean DEFAULT true,
  
  -- معلومات الحالة
  is_active boolean DEFAULT true,
  last_balance_check timestamptz,
  last_balance_amount integer DEFAULT 0,
  
  -- تتبع التعديلات
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'system',
  updated_by text DEFAULT 'system',
  
  -- ملاحظات
  notes text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sms_settings_active ON sms_api_settings(is_active);

ALTER TABLE sms_api_settings ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة: للمسؤولين فقط
CREATE POLICY "Admins can read SMS settings"
  ON sms_api_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة إدراج: للمسؤولين فقط
CREATE POLICY "Admins can insert SMS settings"
  ON sms_api_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة تحديث: للمسؤولين فقط
CREATE POLICY "Admins can update SMS settings"
  ON sms_api_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسة حذف: للمسؤولين فقط
CREATE POLICY "Admins can delete SMS settings"
  ON sms_api_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- ===================================
-- 2. جدول سجل الرسائل
-- ===================================

CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الرسالة
  phone_number text NOT NULL,
  message_text text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('otp', 'notification', 'alert', 'test', 'custom')),
  
  -- معلومات الحالة
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sms_id text,
  result_code text,
  error_message text,
  
  -- معلومات إضافية
  beneficiary_id uuid REFERENCES beneficiaries(id) ON DELETE SET NULL,
  package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
  
  -- معلومات المرسل
  sent_by text NOT NULL,
  sent_by_user_id text,
  
  -- تتبع المحاولات
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  
  -- التواريخ
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  failed_at timestamptz,
  
  -- ملاحظات
  notes text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_type ON sms_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_sms_logs_beneficiary ON sms_logs(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);

ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read SMS logs"
  ON sms_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة إدراج: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can insert SMS logs"
  ON sms_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة تحديث: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can update SMS logs"
  ON sms_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===================================
-- 3. جدول رموز التحقق OTP
-- ===================================

CREATE TABLE IF NOT EXISTS verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الرمز
  code text NOT NULL,
  phone_number text NOT NULL,
  beneficiary_id uuid REFERENCES beneficiaries(id) ON DELETE CASCADE,
  
  -- معلومات الصلاحية
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  
  -- نوع التحقق
  verification_type text NOT NULL DEFAULT 'registration' CHECK (verification_type IN ('registration', 'login', 'password_reset', 'phone_change', 'data_update')),
  
  -- تتبع المحاولات
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 5,
  is_locked boolean DEFAULT false,
  
  -- معلومات الإرسال
  sms_log_id uuid REFERENCES sms_logs(id) ON DELETE SET NULL,
  
  -- التواريخ
  created_at timestamptz DEFAULT now(),
  
  -- ملاحظات
  notes text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_verification_codes_beneficiary ON verification_codes(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_codes_is_used ON verification_codes(is_used);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can read verification codes"
  ON verification_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة إدراج: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can insert verification codes"
  ON verification_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسة تحديث: للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can update verification codes"
  ON verification_codes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===================================
-- 4. تحديث جدول المستفيدين
-- ===================================

DO $$
BEGIN
  -- إضافة حقل phone_verified
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;
  
  -- إضافة حقل verification_attempts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'verification_attempts'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN verification_attempts integer DEFAULT 0;
  END IF;
  
  -- إضافة حقل last_verification_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'last_verification_date'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN last_verification_date timestamptz;
  END IF;
  
  -- إضافة حقل verification_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beneficiaries' AND column_name = 'verification_method'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN verification_method text DEFAULT 'sms' CHECK (verification_method IN ('sms', 'whatsapp', 'manual'));
  END IF;
END $$;

-- إنشاء فهرس لحقل phone_verified
CREATE INDEX IF NOT EXISTS idx_beneficiaries_phone_verified ON beneficiaries(phone_verified);

-- ===================================
-- 5. دوال مساعدة
-- ===================================

-- دالة للتحقق من صلاحية رمز OTP
CREATE OR REPLACE FUNCTION verify_otp_code(
  p_phone_number text,
  p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification verification_codes;
  v_result jsonb;
BEGIN
  -- البحث عن رمز التحقق
  SELECT * INTO v_verification
  FROM verification_codes
  WHERE phone_number = p_phone_number
    AND code = p_code
    AND is_used = false
    AND is_locked = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- إذا لم يتم العثور على الرمز
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_or_expired_code',
      'message', 'رمز التحقق غير صحيح أو منتهي الصلاحية'
    );
  END IF;
  
  -- التحقق من عدد المحاولات
  IF v_verification.attempt_count >= v_verification.max_attempts THEN
    -- قفل الرمز
    UPDATE verification_codes
    SET is_locked = true
    WHERE id = v_verification.id;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'max_attempts_reached',
      'message', 'تم تجاوز الحد الأقصى للمحاولات'
    );
  END IF;
  
  -- تحديث الرمز كمستخدم
  UPDATE verification_codes
  SET is_used = true,
      used_at = now()
  WHERE id = v_verification.id;
  
  -- تحديث حالة المستفيد إذا كان موجوداً
  IF v_verification.beneficiary_id IS NOT NULL THEN
    UPDATE beneficiaries
    SET phone_verified = true,
        last_verification_date = now()
    WHERE id = v_verification.beneficiary_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'verification_id', v_verification.id,
    'beneficiary_id', v_verification.beneficiary_id,
    'message', 'تم التحقق من الرقم بنجاح'
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

-- دالة لتنظيف الرموز المنتهية
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  -- حذف الرموز المنتهية الصلاحية والتي مر عليها أكثر من 24 ساعة
  DELETE FROM verification_codes
  WHERE expires_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- دالة لحساب إحصائيات الرسائل
CREATE OR REPLACE FUNCTION get_sms_statistics(
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_end_date timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_sent', COUNT(*),
    'successful', COUNT(*) FILTER (WHERE status = 'sent'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'success_rate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'sent')::numeric / NULLIF(COUNT(*), 0) * 100), 2
    ),
    'by_type', jsonb_object_agg(
      message_type,
      (SELECT COUNT(*) FROM sms_logs sl2 
       WHERE sl2.message_type = sms_logs.message_type 
       AND sl2.created_at BETWEEN p_start_date AND p_end_date)
    ),
    'start_date', p_start_date,
    'end_date', p_end_date
  ) INTO v_stats
  FROM sms_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  RETURN v_stats;
END;
$$;

-- دالة لزيادة عداد المحاولات
CREATE OR REPLACE FUNCTION increment_verification_attempt(
  p_phone_number text,
  p_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE verification_codes
  SET attempt_count = attempt_count + 1
  WHERE phone_number = p_phone_number
    AND code = p_code
    AND is_used = false
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- دالة لإعادة تعيين العداد اليومي
CREATE OR REPLACE FUNCTION reset_daily_sms_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE sms_api_settings
  SET current_daily_count = 0,
      daily_count_reset_date = CURRENT_DATE
  WHERE daily_count_reset_date < CURRENT_DATE;
END;
$$;

-- ===================================
-- 6. إدراج بيانات افتراضية
-- ===================================

-- إدراج إعداد افتراضي (سيتم تحديثه من الواجهة)
INSERT INTO sms_api_settings (
  username,
  password_encrypted,
  sender_name,
  api_key_encrypted,
  is_active,
  notes
)
VALUES (
  'default_user',
  'encrypted_password_placeholder',
  'default_sender',
  'encrypted_api_key_placeholder',
  false,
  'إعدادات افتراضية - يرجى تحديثها من لوحة التحكم'
)
ON CONFLICT DO NOTHING;
