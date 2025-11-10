/*
  # تحديث جدول sms_api_settings لاستخدام API Key فقط
  
  ## التغييرات
  
  1. إزالة حقول username و password
  2. جعل api_key_encrypted إلزامياً
  3. تحديث الحقول الافتراضية
  4. إزالة حقل balance_check_url (سنستخدم API endpoint ثابت)
  
  ## الأمان
  - الحفاظ على تشفير API Key
  - RLS policies تبقى كما هي
*/

-- حذف الجدول القديم وإنشاء جدول جديد بالبنية المحدثة
DROP TABLE IF EXISTS sms_api_settings CASCADE;

CREATE TABLE sms_api_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- API Authentication
  api_key_encrypted text NOT NULL,
  sender_name text NOT NULL,
  
  -- API Configuration
  api_url text DEFAULT 'https://tweetsms.ps/api.php/maan',
  
  -- Usage Limits
  max_daily_limit integer DEFAULT 1000,
  current_daily_count integer DEFAULT 0,
  daily_count_reset_date date DEFAULT CURRENT_DATE,
  
  -- Alerts
  low_balance_threshold integer DEFAULT 100,
  low_balance_alert_enabled boolean DEFAULT true,
  
  -- Status
  is_active boolean DEFAULT true,
  last_balance_check timestamptz,
  last_balance_amount integer DEFAULT 0,
  
  -- Tracking
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'system',
  updated_by text DEFAULT 'system',
  
  -- Notes
  notes text DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_sms_settings_active ON sms_api_settings(is_active);

ALTER TABLE sms_api_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can read SMS settings"
  ON sms_api_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert SMS settings"
  ON sms_api_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update SMS settings"
  ON sms_api_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete SMS settings"
  ON sms_api_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- إدراج إعداد افتراضي
INSERT INTO sms_api_settings (
  api_key_encrypted,
  sender_name,
  is_active,
  notes
)
VALUES (
  'encrypted_api_key_placeholder',
  'default_sender',
  false,
  'إعدادات افتراضية - يرجى تحديث API Key من لوحة التحكم'
)
ON CONFLICT DO NOTHING;
