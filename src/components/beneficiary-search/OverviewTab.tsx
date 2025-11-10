import React from 'react';
import { User, Shield, CheckCircle, Package, Calendar, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import { Card, Badge } from '../ui';
import { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

interface OverviewTabProps {
  beneficiary: Beneficiary;
  packagesStats: {
    total: number;
    delivered: number;
    pending: number;
    inDelivery: number;
  };
}

export default function OverviewTab({ beneficiary, packagesStats }: OverviewTabProps) {
  const getIdentityStatusInfo = (status: string) => {
    switch (status) {
      case 'verified':
        return { label: 'موثق', variant: 'success' as const, icon: CheckCircle };
      case 'pending':
        return { label: 'بانتظار التوثيق', variant: 'warning' as const, icon: Clock };
      case 'rejected':
        return { label: 'يحتاج تحديث', variant: 'error' as const, icon: AlertCircle };
      default:
        return { label: 'غير محدد', variant: 'default' as const, icon: AlertCircle };
    }
  };

  const getEligibilityStatusInfo = (status: string) => {
    switch (status) {
      case 'eligible':
        return { label: 'مؤهل', variant: 'success' as const, description: 'المستفيد مؤهل للحصول على المساعدات' };
      case 'under_review':
        return { label: 'تحت المراجعة', variant: 'warning' as const, description: 'جاري مراجعة أهلية المستفيد' };
      case 'rejected':
        return { label: 'غير مؤهل', variant: 'error' as const, description: 'المستفيد غير مؤهل حالياً' };
      default:
        return { label: 'غير محدد', variant: 'default' as const, description: 'لم يتم تحديد حالة الأهلية' };
    }
  };

  const identityStatus = getIdentityStatusInfo(beneficiary.identity_status);
  const eligibilityStatus = getEligibilityStatusInfo(beneficiary.eligibility_status);
  const IdentityIcon = identityStatus.icon;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="flex justify-center mb-4">
            {beneficiary.personal_photo_url ? (
              <img
                src={beneficiary.personal_photo_url}
                alt={beneficiary.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{beneficiary.name}</h3>
          <p className="text-gray-600 text-sm mb-1">رقم الهوية: {beneficiary.national_id}</p>
          <div className="flex items-center justify-center space-x-2 space-x-reverse mt-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 text-sm">{beneficiary.phone}</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <IdentityIcon className={`w-6 h-6 ${
              identityStatus.variant === 'success' ? 'text-green-600' :
              identityStatus.variant === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">حالة التوثيق</h4>
          <Badge variant={identityStatus.variant} size="lg">
            {identityStatus.label}
          </Badge>
          <p className="text-xs text-gray-600 mt-3">
            {beneficiary.identity_status === 'verified'
              ? 'تم توثيق الهوية بنجاح'
              : beneficiary.identity_status === 'pending'
              ? 'في انتظار مراجعة المستندات'
              : 'يرجى تحديث المستندات'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">حالة الأهلية</h4>
          <Badge variant={eligibilityStatus.variant} size="lg">
            {eligibilityStatus.label}
          </Badge>
          <p className="text-xs text-gray-600 mt-3">
            {eligibilityStatus.description}
          </p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 ml-2 text-blue-600" />
            الطرود الحالية
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-3 mb-2">
                <p className="text-2xl font-bold text-green-600">{packagesStats.delivered}</p>
              </div>
              <p className="text-xs text-gray-600">تم التسليم</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 rounded-lg p-3 mb-2">
                <p className="text-2xl font-bold text-orange-600">{packagesStats.inDelivery}</p>
              </div>
              <p className="text-xs text-gray-600">قيد التوصيل</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <p className="text-2xl font-bold text-blue-600">{packagesStats.pending}</p>
              </div>
              <p className="text-xs text-gray-600">في الانتظار</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              إجمالي الطرود: <span className="font-bold text-gray-900">{packagesStats.total}</span>
            </p>
          </div>
        </Card>

        <Card>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 ml-2 text-purple-600" />
            معلومات التواريخ
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">تاريخ التسجيل:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(beneficiary.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">آخر تحديث:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(beneficiary.updated_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
            {beneficiary.last_received && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">آخر استلام:</span>
                <span className="text-sm font-medium text-green-900">
                  {new Date(beneficiary.last_received).toLocaleDateString('ar-SA')}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 ml-2 text-red-600" />
          معلومات الموقع
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">العنوان المختصر:</p>
            <p className="text-sm font-medium text-gray-900">{beneficiary.address}</p>
          </div>
          {beneficiary.detailed_address && (
            <>
              <div>
                <p className="text-sm text-gray-600 mb-1">المحافظة:</p>
                <p className="text-sm font-medium text-gray-900">
                  {beneficiary.detailed_address.governorate || 'غير محدد'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">المدينة:</p>
                <p className="text-sm font-medium text-gray-900">
                  {beneficiary.detailed_address.city || 'غير محدد'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الحي:</p>
                <p className="text-sm font-medium text-gray-900">
                  {beneficiary.detailed_address.district || 'غير محدد'}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {beneficiary.notes && (
        <Card className="bg-yellow-50 border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 ml-2 text-yellow-600" />
            ملاحظات مهمة
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{beneficiary.notes}</p>
        </Card>
      )}
    </div>
  );
}
