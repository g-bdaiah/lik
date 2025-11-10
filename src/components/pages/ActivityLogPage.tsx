import React from 'react';
import { CheckCircle, UserPlus, Shield, AlertTriangle, Package, Edit, Download, Activity } from 'lucide-react';

export default function ActivityLogPage() {
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 ml-2" />
            تصدير السجل
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">آخر الأنشطة</h3>
        <div className="space-y-6">
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">تم تسليم طرد مواد غذائية</p>
                <span className="text-sm text-gray-500">منذ 5 دقائق</span>
              </div>
              <p className="text-sm text-gray-600">المستفيد: أحمد محمد الغزاوي - المندوب: محمد علي</p>
              <p className="text-xs text-green-600 mt-1">تم التوثيق بالصورة والموقع</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-blue-100 p-2 rounded-full">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">إضافة مستفيد جديد</p>
                <span className="text-sm text-gray-500">منذ 15 دقيقة</span>
              </div>
              <p className="text-sm text-gray-600">المستفيد: فاطمة أحمد الشوا - بواسطة: سارة المشرفة</p>
              <p className="text-xs text-blue-600 mt-1">في انتظار التحقق من الهوية</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-purple-100 p-2 rounded-full">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">تم التحقق من هوية مستفيد</p>
                <span className="text-sm text-gray-500">منذ 30 دقيقة</span>
              </div>
              <p className="text-sm text-gray-600">المستفيد: خالد الغزاوي - بواسطة: أحمد المراجع</p>
              <p className="text-xs text-purple-600 mt-1">تم قبول الوثائق والموافقة</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-orange-100 p-2 rounded-full">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">تحديث عنوان مستفيد</p>
                <span className="text-sm text-gray-500">منذ ساعة</span>
              </div>
              <p className="text-sm text-gray-600">المستفيد: مريم أبو النجا - بواسطة: فاطمة الموظفة</p>
              <p className="text-xs text-orange-600 mt-1">يحتاج إعادة جدولة التوصيل</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">إنشاء طرد جديد</p>
                <span className="text-sm text-gray-500">منذ ساعتين</span>
              </div>
              <p className="text-sm text-gray-600">طرد ملابس شتوية - بواسطة: أحمد المشرف</p>
              <p className="text-xs text-indigo-600 mt-1">جاهز للتوزيع</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="bg-pink-100 p-2 rounded-full">
              <Edit className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">تعديل بيانات مستفيد</p>
                <span className="text-sm text-gray-500">منذ 3 ساعات</span>
              </div>
              <p className="text-sm text-gray-600">المستفيد: سالم أبو خاطر - بواسطة: نور الموظفة</p>
              <p className="text-xs text-pink-600 mt-1">تم تحديث رقم الهاتف</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">إحصائيات النشاط اليومي</h3>
            <p className="text-gray-600">ملخص أنشطة اليوم</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">طرود مسلمة</p>
                <p className="text-2xl font-bold text-green-900">23</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">مستفيدين جدد</p>
                <p className="text-2xl font-bold text-blue-900">8</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">تحققات مكتملة</p>
                <p className="text-2xl font-bold text-purple-900">12</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">تحديثات البيانات</p>
                <p className="text-2xl font-bold text-orange-900">5</p>
              </div>
              <Edit className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}