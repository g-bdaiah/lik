import React, { useState } from 'react';
import { Clock, Edit, Phone, AlertTriangle } from 'lucide-react';
import { mockBeneficiaries, type Beneficiary } from '../../data/mockData';

export default function DelayedBeneficiariesPage() {
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    alert(`سيتم فتح نموذج تعديل بيانات ${beneficiary.name}`);
  };

  const handleCall = (phone: string) => {
    if (confirm(`هل تريد الاتصال بالرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  };

  const handleReschedule = (beneficiary: Beneficiary) => {
    alert(`سيتم إعادة جدولة التوصيل لـ ${beneficiary.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
            إرسال تذكير جماعي
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            تصدير القائمة
          </button>
        </div>
      </div>

      {/* Delayed Beneficiaries */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
          <h3 className="text-lg font-semibold text-gray-900">قائمة المتأخرين (5 مستفيدين)</h3>
        </div>
        <div className="p-6 space-y-4">
          {mockBeneficiaries.slice(0, 5).map((beneficiary) => (
            <div key={beneficiary.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{beneficiary.name}</p>
                  <p className="text-sm text-gray-600">متأخر منذ 3 أيام - {beneficiary.detailedAddress.district}</p>
                  <p className="text-xs text-gray-500">آخر محاولة: {new Date(beneficiary.lastReceived).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button 
                  onClick={() => handleEditBeneficiary(beneficiary)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  تعديل البيانات
                </button>
                <button 
                  onClick={() => handleCall(beneficiary.phone)}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                >
                  اتصال
                </button>
                <button 
                  onClick={() => handleReschedule(beneficiary)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  إعادة جدولة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">ملخص التأخيرات</h3>
            <p className="text-gray-600">تحليل أسباب التأخير والحلول المقترحة</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">عناوين غير صحيحة</h4>
            <p className="text-sm text-red-600">2 حالة تحتاج تحديث العنوان</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">عدم توفر المستفيد</h4>
            <p className="text-sm text-yellow-600">2 حالة تحتاج إعادة جدولة</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">مشاكل في التوصيل</h4>
            <p className="text-sm text-blue-600">1 حالة تحتاج متابعة خاصة</p>
          </div>
        </div>
      </div>
    </div>
  );
}