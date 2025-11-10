import React, { useState } from 'react';
import { User, MapPin, Heart, Briefcase, Edit, Save, X, Phone, Calendar } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { Database } from '../../types/database';
import { updateBeneficiaryData } from '../../services/beneficiarySearchService';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface BeneficiaryDataTabProps {
  beneficiary: Beneficiary;
  onUpdate?: () => void;
}

export default function BeneficiaryDataTab({ beneficiary, onUpdate }: BeneficiaryDataTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    phone: beneficiary.phone,
    address: beneficiary.address,
    profession: beneficiary.profession,
    notes: beneficiary.notes || ''
  });

  const getMaritalStatusText = (status: string) => {
    switch (status) {
      case 'single': return 'أعزب';
      case 'married': return 'متزوج';
      case 'divorced': return 'مطلق';
      case 'widowed': return 'أرمل';
      default: return 'غير محدد';
    }
  };

  const getEconomicLevelText = (level: string) => {
    switch (level) {
      case 'very_poor': return 'فقير جداً';
      case 'poor': return 'فقير';
      case 'moderate': return 'متوسط';
      case 'good': return 'ميسور';
      default: return 'غير محدد';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateBeneficiaryData(beneficiary.id, editedData);
      if (result.success) {
        setIsEditing(false);
        if (onUpdate) onUpdate();
        alert('تم تحديث البيانات بنجاح');
      } else {
        alert(result.error || 'فشل تحديث البيانات');
      }
    } catch (error) {
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      phone: beneficiary.phone,
      address: beneficiary.address,
      profession: beneficiary.profession,
      notes: beneficiary.notes || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">بيانات المستفيد الكاملة</h3>
        {!isEditing ? (
          <Button
            variant="primary"
            icon={Edit}
            iconPosition="right"
            onClick={() => setIsEditing(true)}
          >
            تعديل البيانات
          </Button>
        ) : (
          <div className="flex space-x-3 space-x-reverse">
            <Button
              variant="secondary"
              icon={X}
              iconPosition="right"
              onClick={handleCancel}
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button
              variant="success"
              icon={Save}
              iconPosition="right"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 ml-2 text-blue-600" />
          المعلومات الشخصية
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">الاسم الكامل:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {beneficiary.full_name}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">رقم الهوية الوطنية:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {beneficiary.national_id}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">تاريخ الميلاد:</label>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 ml-2 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">
                {new Date(beneficiary.date_of_birth).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">الجنس:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {beneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">رقم الهاتف:</label>
            {isEditing ? (
              <Input
                type="tel"
                icon={Phone}
                iconPosition="right"
                value={editedData.phone}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                placeholder="رقم الهاتف"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 ml-2 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">{beneficiary.phone}</p>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">المهنة:</label>
            {isEditing ? (
              <Input
                type="text"
                icon={Briefcase}
                iconPosition="right"
                value={editedData.profession}
                onChange={(e) => setEditedData({ ...editedData, profession: e.target.value })}
                placeholder="المهنة"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Briefcase className="w-4 h-4 ml-2 text-gray-500" />
                <p className="text-sm font-medium text-gray-900">{beneficiary.profession}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 ml-2 text-green-600" />
          معلومات العنوان
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">العنوان المختصر:</label>
            {isEditing ? (
              <Input
                type="text"
                icon={MapPin}
                iconPosition="right"
                value={editedData.address}
                onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                placeholder="العنوان المختصر"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                {beneficiary.address}
              </p>
            )}
          </div>
          {beneficiary.detailed_address && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">المحافظة:</label>
                <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {beneficiary.detailed_address.governorate || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">المدينة:</label>
                <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {beneficiary.detailed_address.city || 'غير محدد'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">الحي:</label>
                <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {beneficiary.detailed_address.district || 'غير محدد'}
                </p>
              </div>
              {beneficiary.detailed_address.street && (
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">الشارع:</label>
                  <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {beneficiary.detailed_address.street}
                  </p>
                </div>
              )}
            </div>
          )}
          {beneficiary.detailed_address?.additionalInfo && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">معلومات إضافية:</label>
              <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                {beneficiary.detailed_address.additionalInfo}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Heart className="w-5 h-5 ml-2 text-purple-600" />
          المعلومات الاجتماعية والاقتصادية
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">الحالة الاجتماعية:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {getMaritalStatusText(beneficiary.marital_status)}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">المستوى الاقتصادي:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {getEconomicLevelText(beneficiary.economic_level)}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">عدد أفراد الأسرة:</label>
            <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
              {beneficiary.members_count} فرد
            </p>
          </div>
          {beneficiary.relation_to_family && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">صلة القرابة:</label>
              <p className="text-sm font-medium text-gray-900 p-3 bg-gray-50 rounded-lg">
                {beneficiary.relation_to_family}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h4 className="text-lg font-bold text-gray-900 mb-4">ملاحظات إضافية</h4>
        {isEditing ? (
          <textarea
            value={editedData.notes}
            onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
            placeholder="أضف ملاحظات حول المستفيد..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              {beneficiary.notes || 'لا توجد ملاحظات'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
