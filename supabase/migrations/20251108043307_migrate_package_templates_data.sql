/*
  # ترحيل قوالب الطرود

  1. الوصف
    - ترحيل قوالب الطرود من البيانات الوهمية
    - 3 قوالب مختلفة مع محتوياتها

  2. القوالب
    - طرد رمضان كريم 2024 (طعام - الأونروا)
    - طرد الشتاء الدافئ (ملابس - الهلال الأحمر)
    - طرد الإسعافات الأولية (طبي - منظمة الصحة)

  3. التفاصيل
    - إجمالي الاستخدام: 403 مرة
    - الوزن: من 1.5 كجم إلى 14.6 كجم
    - التكلفة: من 30$ إلى 75$
*/

INSERT INTO package_templates (
  id, name, type, organization_id, description, contents,
  status, created_at, usage_count, total_weight, estimated_cost
) VALUES
-- طرد رمضان كريم 2024
(
  '40000001-0001-0001-0001-000000000001',
  'طرد رمضان كريم 2024',
  'food',
  '10000004-0004-0004-0004-000000000004',
  'طرد غذائي شامل لشهر رمضان المبارك',
  '[
    {"id": "item-001", "name": "أرز بسمتي", "quantity": 5, "unit": "كيلو", "weight": 5, "notes": ""},
    {"id": "item-002", "name": "زيت زيتون", "quantity": 1, "unit": "لتر", "weight": 1, "notes": ""},
    {"id": "item-003", "name": "سكر أبيض", "quantity": 2, "unit": "كيلو", "weight": 2, "notes": ""},
    {"id": "item-004", "name": "طحين", "quantity": 3, "unit": "كيلو", "weight": 3, "notes": ""},
    {"id": "item-005", "name": "عدس أحمر", "quantity": 1, "unit": "كيلو", "weight": 1, "notes": ""},
    {"id": "item-006", "name": "تونة معلبة", "quantity": 6, "unit": "علبة", "weight": 1.2, "notes": ""},
    {"id": "item-007", "name": "معجون طماطم", "quantity": 3, "unit": "علبة", "weight": 0.6, "notes": ""},
    {"id": "item-008", "name": "حليب مجفف", "quantity": 2, "unit": "علبة", "weight": 0.8, "notes": ""}
  ]'::jsonb,
  'active',
  '2024-01-10',
  247,
  14.6,
  50
),
-- طرد الشتاء الدافئ
(
  '40000002-0002-0002-0002-000000000002',
  'طرد الشتاء الدافئ',
  'clothing',
  '10000006-0006-0006-0006-000000000006',
  'طرد ملابس شتوية للعائلات',
  '[
    {"id": "item-011", "name": "بطانية صوف", "quantity": 2, "unit": "قطعة", "weight": 3, "notes": ""},
    {"id": "item-012", "name": "جاكيت شتوي للكبار", "quantity": 2, "unit": "قطعة", "weight": 1.5, "notes": ""},
    {"id": "item-013", "name": "جاكيت شتوي للأطفال", "quantity": 3, "unit": "قطعة", "weight": 0.8, "notes": ""},
    {"id": "item-014", "name": "جوارب صوفية", "quantity": 6, "unit": "زوج", "weight": 0.3, "notes": ""},
    {"id": "item-015", "name": "قبعة صوفية", "quantity": 4, "unit": "قطعة", "weight": 0.2, "notes": ""},
    {"id": "item-016", "name": "قفازات", "quantity": 4, "unit": "زوج", "weight": 0.1, "notes": ""}
  ]'::jsonb,
  'active',
  '2024-01-08',
  156,
  5.9,
  75
),
-- طرد الإسعافات الأولية
(
  '40000003-0003-0003-0003-000000000003',
  'طرد الإسعافات الأولية',
  'medical',
  '10000007-0007-0007-0007-000000000007',
  'طرد طبي للإسعافات الأولية',
  '[
    {"id": "item-021", "name": "ضمادات طبية", "quantity": 10, "unit": "قطعة", "weight": 0.5, "notes": ""},
    {"id": "item-022", "name": "مطهر جروح", "quantity": 2, "unit": "زجاجة", "weight": 0.4, "notes": ""},
    {"id": "item-023", "name": "مسكنات", "quantity": 2, "unit": "علبة", "weight": 0.2, "notes": ""},
    {"id": "item-024", "name": "خافض حرارة", "quantity": 1, "unit": "علبة", "weight": 0.1, "notes": ""},
    {"id": "item-025", "name": "شاش طبي", "quantity": 5, "unit": "لفة", "weight": 0.3, "notes": ""}
  ]'::jsonb,
  'draft',
  '2024-01-12',
  0,
  1.5,
  30
)
ON CONFLICT (id) DO NOTHING;
