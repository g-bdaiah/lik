import React, { useState, useEffect } from 'react';
import { Package, Building2, FileText, DollarSign, Weight, Plus, Trash2, Save, X, AlertTriangle, CheckCircle, List, Edit } from 'lucide-react';
import { type PackageTemplate, type PackageItem, mockOrganizations } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import { Button, Card, Input } from './ui';

interface PackageTemplateFormProps {
  template?: PackageTemplate | null;
  onSave: (data: Partial<PackageTemplate>) => void;
  onCancel: () => void;
  isCopy?: boolean;
}

interface FormData {
  name: string;
  type: 'food' | 'medical' | 'clothing' | 'hygiene' | 'emergency' | '';
  organization_id: string;
  description: string;
  contents: PackageItem[];
  estimatedCost: number;
  totalWeight: number;
}

export default function PackageTemplateForm({ template, onSave, onCancel, isCopy = false }: PackageTemplateFormProps) {
  const { logError, logInfo } = useErrorLogger();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    organization_id: '',
    description: '',
    contents: [],
    estimatedCost: 0,
    totalWeight: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const isEditing = !!template && !isCopy;

  useEffect(() => {
    if (template && (isEditing || isCopy)) {
      setFormData({
        name: isCopy ? `${template.name} (نسخة)` : template.name || '',
        type: template.type || '',
        organization_id: template.organization_id || '',
        description: template.description || '',
        contents: template.contents || [],
        estimatedCost: template.estimatedCost || 0,
        totalWeight: template.totalWeight || 0,
      });
    }
  }, [template, isEditing, isCopy]);

  const organizationOptions = mockOrganizations.map(org => ({
    value: org.id,
    label: org.name,
  }));

  const packageTypes = [
    { value: 'food', label: 'مواد غذائية' },
    { value: 'medical', label: 'طبية' },
    { value: 'clothing', label: 'ملابس' },
    { value: 'hygiene', label: 'نظافة' },
    { value: 'emergency', label: 'طوارئ' },
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleContentChange = (index: number, field: keyof PackageItem, value: any) => {
    const newContents = [...formData.contents];
    newContents[index] = { ...newContents[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      contents: newContents,
      totalWeight: newContents.reduce((sum, item) => sum + (item.weight || 0), 0),
    }));
  };

  const addContentItem = () => {
    setFormData(prev => ({
      ...prev,
      contents: [...prev.contents, { id: `item-${Date.now()}`, name: '', quantity: 0, unit: '', weight: 0 }],
    }));
  };

  const removeContentItem = (index: number) => {
    const newContents = formData.contents.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      contents: newContents,
      totalWeight: newContents.reduce((sum, item) => sum + (item.weight || 0), 0),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم القالب مطلوب';
    }
    if (!formData.type) {
      newErrors.type = 'نوع القالب مطلوب';
    }
    if (!formData.organization_id) {
      newErrors.organization_id = 'المؤسسة المانحة مطلوبة';
    }
    if (formData.estimatedCost <= 0) {
      newErrors.estimatedCost = 'التكلفة المقدرة يجب أن تكون أكبر من صفر';
    }
    if (formData.contents.length === 0) {
      newErrors.contents = 'يجب إضافة عناصر إلى محتويات الطرد';
    } else {
      formData.contents.forEach((item, index) => {
        if (!item.name.trim()) {
          newErrors[`contents[${index}].name`] = 'اسم العنصر مطلوب';
        }
        if (item.quantity <= 0) {
          newErrors[`contents[${index}].quantity`] = 'الكمية يجب أن تكون أكبر من صفر';
        }
        if (!item.unit.trim()) {
          newErrors[`contents[${index}].unit`] = 'الوحدة مطلوبة';
        }
        if (item.weight <= 0) {
          newErrors[`contents[${index}].weight`] = 'الوزن يجب أن يكون أكبر من صفر';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      logError(new Error('فشل في التحقق من صحة البيانات'), 'PackageTemplateForm');
      return;
    }

    setIsSubmitting(true);
    setOperationError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

      onSave(formData);
      logInfo(`تم محاكاة حفظ قالب الطرد: ${formData.name}`, 'PackageTemplateForm');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setOperationError(errorMessage);
      logError(new Error(errorMessage), 'PackageTemplateForm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-xl w-fit mx-auto mb-4">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل قالب الطرد' : isCopy ? 'نسخ قالب الطرد' : 'إضافة قالب طرد جديد'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'تحديث معلومات قالب الطرد في النظام' : isCopy ? 'إنشاء نسخة جديدة من قالب موجود' : 'إضافة قالب طرد جديد لتسهيل عمليات التوزيع'}
          </p>
        </div>

        {/* Error Display */}
        {operationError && (
          <Card className="bg-red-50 border-red-200" padding="sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">خطأ في حفظ البيانات:</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{operationError}</p>
          </Card>
        )}

        {/* General Information */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Package className="w-4 h-4 ml-2 text-blue-600" />
            معلومات القالب الأساسية
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="اسم القالب *"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="مثال: طرد رمضان كريم 2024"
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع القالب *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as FormData['type'])}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">اختر النوع</option>
                {packageTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المؤسسة المانحة *
              </label>
              <select
                value={formData.organization_id}
                onChange={(e) => handleInputChange('organization_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">اختر المؤسسة</option>
                {organizationOptions.map(org => (
                  <option key={org.value} value={org.value}>{org.label}</option>
                ))}
              </select>
              {errors.organization_id && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 ml-1" />
                  {errors.organization_id}
                </p>
              )}
            </div>

            <Input
              label="التكلفة المقدرة (₪) *"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
              placeholder="مثال: 50"
              error={errors.estimatedCost}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="الوصف"
                type="textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="وصف تفصيلي لمحتويات الطرد أو الغرض منه..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Package Contents */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <List className="w-4 h-4 ml-2 text-green-600" />
            محتويات الطرد
          </h3>

          {formData.contents.map((item, index) => (
            <div key={item.id || index} className="grid md:grid-cols-6 gap-4 mb-4 p-4 border border-gray-200 rounded-lg relative">
              <Input
                label="اسم العنصر *"
                type="text"
                value={item.name}
                onChange={(e) => handleContentChange(index, 'name', e.target.value)}
                placeholder="مثال: أرز بسمتي"
                error={errors[`contents[${index}].name`]}
                required
              />
              <Input
                label="الكمية *"
                type="number"
                value={item.quantity}
                onChange={(e) => handleContentChange(index, 'quantity', parseInt(e.target.value) || 0)}
                placeholder="مثال: 5"
                error={errors[`contents[${index}].quantity`]}
                required
              />
              <Input
                label="الوحدة *"
                type="text"
                value={item.unit}
                onChange={(e) => handleContentChange(index, 'unit', e.target.value)}
                placeholder="مثال: كيلو"
                error={errors[`contents[${index}].unit`]}
                required
              />
              <Input
                label="الوزن (كيلو) *"
                type="number"
                value={item.weight}
                onChange={(e) => handleContentChange(index, 'weight', parseFloat(e.target.value) || 0)}
                placeholder="مثال: 5"
                error={errors[`contents[${index}].weight`]}
                required
              />
              <Input
                label="ملاحظات"
                type="text"
                value={item.notes}
                onChange={(e) => handleContentChange(index, 'notes', e.target.value)}
                placeholder="ملاحظات خاصة بالعنصر"
              />
              <div className="flex items-end justify-center">
                <Button
                  type="button"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => removeContentItem(index)}
                  className="w-full"
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}

          {errors.contents && (
            <p className="text-red-600 text-sm mt-1 flex items-center mb-4">
              <AlertTriangle className="w-4 h-4 ml-1" />
              {errors.contents}
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={addContentItem}
            className="w-full"
          >
            إضافة عنصر جديد
          </Button>

          <div className="mt-6 text-right">
            <p className="text-lg font-bold text-gray-900">
              الوزن الإجمالي: {formData.totalWeight.toFixed(2)} كيلو
            </p>
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="bg-gray-50">
          <div className="flex space-x-4 space-x-reverse justify-end">
            <Button
              variant="secondary"
              icon={X}
              iconPosition="right"
              onClick={onCancel}
              disabled={loading}
            >
              إلغاء
            </Button>

            <Button
              variant="primary"
              icon={loading ? undefined : Save}
              iconPosition="right"
              type="submit"
              disabled={loading}
              loading={loading}
            >
              {isEditing ? 'حفظ التغييرات' : isCopy ? 'نسخ القالب' : 'إضافة القالب'}
            </Button>
          </div>
        </Card>

        {/* Form Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3 space-x-reverse">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-3">تعليمات مهمة</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تأكد من إدخال جميع الحقول المطلوبة.</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>يجب أن تكون التكلفة المقدرة والوزن أكبر من صفر.</span>
                </li>
                <li className="flex items-start space-x-2 space-x-reverse">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>يمكنك إضافة عدة عناصر إلى محتويات الطرد.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}