import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, AlertCircle, CheckCircle, Clock, Phone, MapPin, User, CreditCard, Upload, Camera } from 'lucide-react';
import { dataUpdateService } from '../../services/dataUpdateService';
import { Button, Input, Card } from '../ui';
import type { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type DataUpdate = Database['public']['Tables']['beneficiary_data_updates']['Row'];

interface MyDataTabProps {
  beneficiary: Beneficiary;
  onUpdate?: () => void;
}

export default function MyDataTab({ beneficiary, onUpdate }: MyDataTabProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [updateRequests, setUpdateRequests] = useState<DataUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadUpdateRequests();
  }, [beneficiary.id]);

  const loadUpdateRequests = async () => {
    try {
      const requests = await dataUpdateService.getUpdateRequests(beneficiary.id);
      setUpdateRequests(requests);
    } catch (err: any) {
      console.error('Error loading update requests:', err);
    }
  };

  const handleEditClick = (fieldName: string, currentValue: any) => {
    setEditingField(fieldName);
    setEditValue(currentValue || '');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setError('');
  };

  const handleSubmitUpdate = async (fieldName: string) => {
    const oldValue = (beneficiary as any)[fieldName] || '';

    if (editValue === oldValue) {
      setError('لم يتم إجراء أي تغيير');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await dataUpdateService.submitDataUpdateRequest({
        beneficiaryId: beneficiary.id,
        updateType: 'update',
        fieldName,
        oldValue: String(oldValue),
        newValue: editValue
      });

      setSuccess('تم إرسال طلب التحديث بنجاح');
      setEditingField(null);
      setEditValue('');
      await loadUpdateRequests();
      if (onUpdate) onUpdate();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      pending: {
        label: 'قيد المراجعة',
        color: 'bg-yellow-100 text-yellow-700',
        icon: Clock
      },
      approved: {
        label: 'تمت الموافقة',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle
      },
      rejected: {
        label: 'مرفوض',
        color: 'bg-red-100 text-red-700',
        icon: X
      }
    };

    const { label, color, icon: Icon } = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: any,
    icon?: any,
    type: 'text' | 'textarea' = 'text',
    disabled: boolean = false
  ) => {
    const Icon = icon;
    const isEditing = editingField === fieldName;
    const isLocked = fieldName === 'phone' && beneficiary.phone_locked;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {isLocked && (
            <span className="text-xs text-orange-600">(مقفل)</span>
          )}
        </label>

        {isEditing ? (
          <div className="space-y-2">
            {type === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="border-blue-300 focus:ring-blue-500"
              />
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmitUpdate(fieldName)}
                disabled={isLoading}
                size="sm"
              >
                <Save className="w-4 h-4 ml-1" />
                إرسال للمراجعة
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
              >
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-gray-900 p-2 bg-gray-50 rounded">
              {value || 'غير محدد'}
            </p>
            {!disabled && !isLocked && (
              <Button
                onClick={() => handleEditClick(fieldName, value)}
                variant="outline"
                size="sm"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">البيانات الأساسية</h3>

        {renderEditableField('name', 'الاسم', beneficiary.name, User, 'text', true)}
        {renderEditableField('full_name', 'الاسم الكامل', beneficiary.full_name, User, 'text', true)}
        {renderEditableField('national_id', 'رقم الهوية', beneficiary.national_id, CreditCard, 'text', true)}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الجنس
          </label>
          <p className="text-gray-900 p-2 bg-gray-50 rounded">
            {beneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <AlertCircle className="w-4 h-4 inline ml-1" />
            البيانات الأساسية (الاسم، رقم الهوية، الجنس) لا يمكن تعديلها. تواصل مع الإدارة في حالة وجود خطأ.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">بيانات الاتصال</h3>

        {renderEditableField('phone', 'رقم الهاتف', beneficiary.phone, Phone)}
        {renderEditableField('whatsapp_number', 'رقم الواتساب', beneficiary.whatsapp_number, Phone)}
        {renderEditableField('whatsapp_family_member', 'صاحب رقم الواتساب', beneficiary.whatsapp_family_member, User)}
        {renderEditableField('address', 'العنوان', beneficiary.address, MapPin, 'textarea')}

        {beneficiary.phone_locked && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              <AlertCircle className="w-4 h-4 inline ml-1" />
              رقم الهاتف مقفل ولا يمكن تعديله. هذا لضمان أمان حسابك.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الصور والمستندات</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصورة الشخصية
            </label>
            {beneficiary.personal_photo_url && !imagePreview ? (
              <div className="relative">
                <img
                  src={beneficiary.personal_photo_url}
                  alt="الصورة الشخصية"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            ) : imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="معاينة"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-blue-300"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <label className="mt-3 block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>تحديث الصورة الشخصية</span>
              </div>
            </label>

            {selectedImage && (
              <Button
                onClick={async () => {
                  setSuccess('تم رفع الصورة بنجاح. جاري المراجعة...');
                  setImagePreview(null);
                  setSelectedImage(null);
                  setTimeout(() => setSuccess(''), 3000);
                }}
                className="mt-2"
                size="sm"
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ الصورة
              </Button>
            )}
          </div>
        </div>
      </Card>

      {updateRequests.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            طلبات التحديث ({updateRequests.length})
          </h3>

          <div className="space-y-3">
            {updateRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {dataUpdateService.getFieldArabicName(request.field_name)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      من: <span className="font-mono">{request.old_value}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      إلى: <span className="font-mono">{request.new_value}</span>
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>سبب الرفض:</strong> {request.rejection_reason}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  تاريخ الطلب: {new Date(request.requested_at).toLocaleString('ar-EG')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <p className="font-semibold mb-1">ملاحظات مهمة:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>جميع طلبات التحديث تخضع للمراجعة من قبل الإدارة</li>
              <li>سيتم إشعارك بالنتيجة عبر الإشعارات</li>
              <li>بعض الحقول مثل الاسم ورقم الهوية لا يمكن تعديلها</li>
              <li>رقم الهاتف يُقفل تلقائياً بعد أول إدخال</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
