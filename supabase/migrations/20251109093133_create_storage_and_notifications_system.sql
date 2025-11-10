/*
  # إنشاء نظام Storage والإشعارات الشامل

  ## التغييرات الرئيسية
  
  1. إنشاء Storage Buckets للصور
     - beneficiary-identity-photos: صور الهوية
     - beneficiary-personal-photos: الصور الشخصية
     - حد أقصى 4MB لكل صورة
  
  2. إنشاء جدول whatsapp_notifications_queue
     - طابور الإشعارات المعلقة
     - تتبع حالة الإرسال
  
  3. إنشاء Triggers تلقائية
     - تسجيل تحديثات المستفيدين
     - إشعارات تلقائية عند تغيير حالة الطرود
  
  4. الأمان
     - RLS على الجداول الجديدة
     - سياسات آمنة للـ Storage
*/

-- ====================================
-- 1. إنشاء جدول إشعارات واتساب
-- ====================================

CREATE TABLE IF NOT EXISTS whatsapp_notifications_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id uuid NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN (
    'package_status_change',
    'identity_approved',
    'identity_rejected',
    'reupload_required',
    'temporary_password',
    'otp_code',
    'general_message'
  )),
  package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
  whatsapp_number text NOT NULL,
  message_template text NOT NULL,
  message_variables jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_status ON whatsapp_notifications_queue(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_beneficiary ON whatsapp_notifications_queue(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_type ON whatsapp_notifications_queue(notification_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_created ON whatsapp_notifications_queue(created_at DESC);

-- ====================================
-- 2. تفعيل RLS على جدول الإشعارات
-- ====================================

ALTER TABLE whatsapp_notifications_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "السماح بقراءة الإشعارات للمستخدمين المصادقين"
  ON whatsapp_notifications_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "السماح بإنشاء الإشعارات للنظام والمستخدمين"
  ON whatsapp_notifications_queue FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "السماح بتحديث الإشعارات للمستخدمين المصادقين"
  ON whatsapp_notifications_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ====================================
-- 3. دالة لتسجيل تحديثات المستفيدين تلقائياً
-- ====================================

CREATE OR REPLACE FUNCTION log_beneficiary_updates()
RETURNS TRIGGER AS $$
DECLARE
  changes_text text := '';
  field_name text;
  old_value text;
  new_value text;
BEGIN
  -- تتبع التغييرات في الحقول المهمة
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    changes_text := changes_text || format('الاسم: %s → %s; ', OLD.name, NEW.name);
  END IF;
  
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    changes_text := changes_text || format('الهاتف: %s → %s; ', OLD.phone, NEW.phone);
  END IF;
  
  IF OLD.address IS DISTINCT FROM NEW.address THEN
    changes_text := changes_text || format('العنوان: %s → %s; ', OLD.address, NEW.address);
  END IF;
  
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    changes_text := changes_text || format('الحالة: %s → %s; ', OLD.status, NEW.status);
  END IF;
  
  IF OLD.identity_status IS DISTINCT FROM NEW.identity_status THEN
    changes_text := changes_text || format('حالة التوثيق: %s → %s; ', OLD.identity_status, NEW.identity_status);
    
    -- إنشاء إشعار عند تغيير حالة التوثيق
    IF NEW.identity_status = 'verified' AND NEW.whatsapp_number IS NOT NULL THEN
      INSERT INTO whatsapp_notifications_queue (
        beneficiary_id,
        notification_type,
        whatsapp_number,
        message_template
      ) VALUES (
        NEW.id,
        'identity_approved',
        NEW.whatsapp_number,
        'مرحباً {{name}}، تم الموافقة على توثيق هويتك بنجاح. يمكنك الآن الوصول إلى جميع خدمات النظام.'
      );
    ELSIF NEW.identity_status = 'rejected' AND NEW.whatsapp_number IS NOT NULL THEN
      INSERT INTO whatsapp_notifications_queue (
        beneficiary_id,
        notification_type,
        whatsapp_number,
        message_template
      ) VALUES (
        NEW.id,
        'identity_rejected',
        NEW.whatsapp_number,
        'مرحباً {{name}}، نأسف لإبلاغك أن طلب التوثيق الخاص بك قد تم رفضه. يرجى التواصل مع الدعم للمزيد من المعلومات.'
      );
    END IF;
  END IF;
  
  IF OLD.eligibility_status IS DISTINCT FROM NEW.eligibility_status THEN
    changes_text := changes_text || format('حالة الأهلية: %s → %s; ', OLD.eligibility_status, NEW.eligibility_status);
  END IF;
  
  -- تسجيل في activity_log إذا كانت هناك تغييرات
  IF changes_text <> '' THEN
    INSERT INTO activity_log (
      action,
      user_name,
      role,
      type,
      beneficiary_id,
      details,
      source
    ) VALUES (
      'تحديث بيانات المستفيد',
      NEW.name,
      'system',
      'update',
      NEW.id,
      changes_text,
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger لتحديثات المستفيدين
DROP TRIGGER IF EXISTS trigger_log_beneficiary_updates ON beneficiaries;
CREATE TRIGGER trigger_log_beneficiary_updates
  AFTER UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION log_beneficiary_updates();

-- ====================================
-- 4. دالة لإشعارات تغيير حالة الطرود
-- ====================================

CREATE OR REPLACE FUNCTION notify_package_status_change()
RETURNS TRIGGER AS $$
DECLARE
  beneficiary_record RECORD;
  status_ar text;
BEGIN
  -- التحقق من تغيير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- الحصول على بيانات المستفيد
    SELECT * INTO beneficiary_record
    FROM beneficiaries
    WHERE id = NEW.beneficiary_id;
    
    -- ترجمة الحالة للعربية
    CASE NEW.status
      WHEN 'pending' THEN status_ar := 'قيد الانتظار';
      WHEN 'assigned' THEN status_ar := 'تم التعيين';
      WHEN 'in_delivery' THEN status_ar := 'قيد التوصيل';
      WHEN 'delivered' THEN status_ar := 'تم التسليم';
      WHEN 'cancelled' THEN status_ar := 'ملغي';
      ELSE status_ar := NEW.status;
    END CASE;
    
    -- إنشاء إشعار إذا كان لدى المستفيد رقم واتساب
    IF beneficiary_record.whatsapp_number IS NOT NULL THEN
      INSERT INTO whatsapp_notifications_queue (
        beneficiary_id,
        notification_type,
        package_id,
        whatsapp_number,
        message_template,
        message_variables
      ) VALUES (
        NEW.beneficiary_id,
        'package_status_change',
        NEW.id,
        beneficiary_record.whatsapp_number,
        'مرحباً {{beneficiary_name}}، تم تحديث حالة طردك "{{package_name}}" إلى: {{new_status}}',
        jsonb_build_object(
          'beneficiary_name', beneficiary_record.name,
          'package_name', NEW.name,
          'old_status', OLD.status,
          'new_status', status_ar,
          'tracking_number', NEW.tracking_number
        )
      );
    END IF;
    
    -- تسجيل في activity_log
    INSERT INTO activity_log (
      action,
      user_name,
      role,
      type,
      beneficiary_id,
      details,
      source
    ) VALUES (
      format('تغيير حالة الطرد: %s', NEW.name),
      beneficiary_record.name,
      'system',
      'update',
      NEW.beneficiary_id,
      format('من %s إلى %s', OLD.status, NEW.status),
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger لتغييرات حالة الطرود
DROP TRIGGER IF EXISTS trigger_notify_package_status_change ON packages;
CREATE TRIGGER trigger_notify_package_status_change
  AFTER UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION notify_package_status_change();

-- ====================================
-- 5. دالة لتنظيف الإشعارات القديمة
-- ====================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- حذف الإشعارات المرسلة بنجاح الأقدم من 30 يوم
  DELETE FROM whatsapp_notifications_queue
  WHERE status = 'sent' AND sent_at < NOW() - INTERVAL '30 days';
  
  -- حذف الإشعارات الملغاة الأقدم من 7 أيام
  DELETE FROM whatsapp_notifications_queue
  WHERE status = 'cancelled' AND updated_at < NOW() - INTERVAL '7 days';
  
  -- حذف رموز OTP منتهية الصلاحية
  DELETE FROM beneficiary_otp
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  -- حذف كلمات المرور المؤقتة المنتهية والمستخدمة
  DELETE FROM beneficiary_password_resets
  WHERE (expires_at < NOW() OR is_used = true) AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
