/*
  # تحديث جدول system_features وإضافة إعدادات WhatsApp API

  ## التغييرات
  
  1. إضافة ميزات جديدة
     - whatsapp_auto_notifications: الإشعارات التلقائية
     - whatsapp_api_integration: التكامل مع WhatsApp API
     - beneficiary_registration: تسجيل مستفيدين جدد
  
  2. تحديث settings لتشمل
     - api_key: مفتاح API
     - api_url: رابط API
     - sender_number: رقم المرسل
     - support_phone: رقم الدعم الفني
  
  3. الأمان
     - إضافة validation للإعدادات
*/

-- إضافة الميزات الجديدة إلى system_features
INSERT INTO system_features (feature_key, feature_name, is_enabled, settings, updated_by)
VALUES 
  (
    'whatsapp_auto_notifications',
    'الإشعارات التلقائية عبر واتساب (API)',
    false,
    jsonb_build_object(
      'support_phone', '+970599505699',
      'api_key', '',
      'api_url', '',
      'sender_number', '+970599505699',
      'send_mode', 'manual'
    ),
    'system'
  ),
  (
    'beneficiary_registration',
    'تسجيل مستفيدين جدد',
    true,
    jsonb_build_object(
      'require_admin_approval', true,
      'require_photo_upload', true,
      'require_identity_photo', true,
      'max_image_size_mb', 4
    ),
    'system'
  ),
  (
    'image_upload_settings',
    'إعدادات رفع الصور',
    true,
    jsonb_build_object(
      'max_size_mb', 4,
      'allowed_formats', ARRAY['jpg', 'jpeg', 'png', 'webp'],
      'min_width', 300,
      'min_height', 300,
      'max_width', 4000,
      'max_height', 4000,
      'auto_compress', true
    ),
    'system'
  )
ON CONFLICT (feature_key) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = now();

-- تحديث الميزات الموجودة لإضافة حقل support_phone
UPDATE system_features
SET settings = settings || jsonb_build_object('support_phone', '+970599505699')
WHERE feature_key IN ('otp_verification', 'password_recovery', 'whatsapp_notifications')
  AND NOT (settings ? 'support_phone');
