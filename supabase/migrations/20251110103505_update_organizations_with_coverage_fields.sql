/*
  # تحديث جدول المؤسسات بحقول التغطية والفئات المستهدفة

  ## التحديثات
  
  1. الحقول الجديدة:
    - `coverage_areas` - مناطق التغطية الجغرافية (jsonb)
    - `target_categories` - الفئات المستهدفة (jsonb)
    - `current_capacity` - الطاقة الاستيعابية الحالية
    - `acceptance_criteria` - معايير القبول (jsonb)
    - `max_capacity` - الطاقة الاستيعابية القصوى
    - `monthly_distribution` - عدد التوزيعات الشهرية

  ## الغرض
  - تسهيل اقتراح المؤسسات المناسبة للمستفيدين
  - تحسين عملية التوزيع والتخطيط
*/

-- تحديث جدول organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'coverage_areas'
  ) THEN
    ALTER TABLE organizations ADD COLUMN coverage_areas jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'target_categories'
  ) THEN
    ALTER TABLE organizations ADD COLUMN target_categories jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'current_capacity'
  ) THEN
    ALTER TABLE organizations ADD COLUMN current_capacity integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'acceptance_criteria'
  ) THEN
    ALTER TABLE organizations ADD COLUMN acceptance_criteria jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'max_capacity'
  ) THEN
    ALTER TABLE organizations ADD COLUMN max_capacity integer DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'monthly_distribution'
  ) THEN
    ALTER TABLE organizations ADD COLUMN monthly_distribution integer DEFAULT 0;
  END IF;
END $$;

-- إضافة بيانات افتراضية للمؤسسات الموجودة
UPDATE organizations 
SET 
  coverage_areas = '["شمال غزة", "مدينة غزة", "الوسطى"]'::jsonb,
  target_categories = '["أسر فقيرة", "أيتام", "ذوي احتياجات خاصة"]'::jsonb,
  acceptance_criteria = '{"min_family_members": 3, "economic_levels": ["very_poor", "poor"], "requires_documents": true}'::jsonb,
  current_capacity = 50,
  max_capacity = 200,
  monthly_distribution = 150
WHERE coverage_areas IS NULL OR coverage_areas = '[]'::jsonb;
