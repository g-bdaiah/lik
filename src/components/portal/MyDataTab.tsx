import React, { useState, useEffect } from 'react';
import { Edit2, Phone, MapPin, User, CreditCard, Briefcase, Users, AlertCircle } from 'lucide-react';
import { dataUpdateService } from '../../services/dataUpdateService';
import { Button, Input, Card } from '../ui';
import type { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type DataUpdate = Database['public']['Tables']['beneficiary_data_updates']['Row'];

interface MyDataTabProps {
  beneficiary: Beneficiary;
  onUpdate?: () => void;
}

interface MyDataTabWithEditProps {
  beneficiary: Beneficiary;
  onEdit: () => void;
}

export default function MyDataTab({ beneficiary, onEdit }: MyDataTabWithEditProps) {



  const renderField = (
    label: string,
    value: any,
    icon?: any
  ) => {
    const Icon = icon;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </label>
        <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
          {value || 'غير محدد'}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">بياناتي الشخصية</h3>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit2 className="w-4 h-4 ml-2" />
            تحديث البيانات
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {renderField('الاسم', beneficiary.name, User)}
          {renderField('الاسم الكامل', beneficiary.full_name, User)}
          {renderField('رقم الهوية', beneficiary.national_id, CreditCard)}

          {renderField('الجنس', beneficiary.gender === 'male' ? 'ذكر' : 'أنثى', User)}
          {renderField('رقم الهاتف', beneficiary.phone, Phone)}
          {renderField('رقم الواتساب', beneficiary.whatsapp_number, Phone)}
          {renderField('العنوان', beneficiary.address, MapPin)}
          {renderField('المهنة', beneficiary.profession, Briefcase)}
          {renderField('عدد أفراد الأسرة', beneficiary.members_count, Users)}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <AlertCircle className="w-4 h-4 inline ml-1" />
            لتحديث بياناتك، اضغط على زر "تحديث البيانات" في الأعلى. جميع التحديثات تخضع للمراجعة من قبل الإدارة.
          </p>
        </div>
      </Card>
    </div>
  );
}
