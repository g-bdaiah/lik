import React, { useState } from 'react';
import { X, User, Phone, MapPin, Calendar, Package, Clock, Edit, FileText, Eye, Camera, Download, CheckCircle, AlertTriangle, Heart, Briefcase, Home, Users, Star, Activity, Truck, Bell, MessageSquare, Shield, Crown } from 'lucide-react';
import { type Beneficiary, mockPackages, mockTasks, mockActivityLog, beneficiaries } from '../data/mockData'; // Removed Shield, added Star
import { Button, Card, Badge, Modal } from './ui';
import { useErrorLogger } from '../utils/errorLogger';

interface BeneficiaryProfileModalProps {
  beneficiary: Beneficiary;
  onClose: () => void;
  onNavigateToIndividualSend?: (beneficiaryId: string) => void;
  onEditBeneficiary?: (beneficiary: Beneficiary) => void;
  onApproveIdentity?: (beneficiaryId: string, beneficiaryName: string) => void;
  onRequestReupload?: (beneficiaryId: string, beneficiaryName: string) => void;
}

export default function BeneficiaryProfileModal({
  beneficiary,
  onClose,
  onNavigateToIndividualSend,
  onEditBeneficiary,
  onApproveIdentity,
  onRequestReupload
}: BeneficiaryProfileModalProps) {
  const { logInfo } = useErrorLogger();
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showPackageDetailsModal, setShowPackageDetailsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Get related data
  const beneficiaryPackages = mockPackages.filter(p => p.beneficiaryId === beneficiary.id);
  const beneficiaryTasks = mockTasks.filter(t => t.beneficiaryId === beneficiary.id);
  const beneficiaryActivity = mockActivityLog.filter(a => a.beneficiaryId === beneficiary.id);

  const handleAction = (action: string) => {
    switch (action) {
      case 'view-documents':
        setShowDocumentsModal(true);
        logInfo(`عرض المستندات للمستفيد: ${beneficiary.name}`, 'BeneficiaryProfileModal');
        break;
      case 'approve-identity':
        if (onApproveIdentity) {
          onApproveIdentity(beneficiary.id, beneficiary.name);
        }
        break;
      case 'request-reupload':
        if (onRequestReupload) {
          onRequestReupload(beneficiary.id, beneficiary.name);
        }
        break;
      case 'track-courier':
        logInfo(`تتبع المندوب للمستفيد: ${beneficiary.name}`, 'BeneficiaryProfileModal');
        alert('سيتم فتح شاشة تتبع المندوب المسؤول عن هذا المستفيد');
        break;
      case 'export-activity':
        logInfo(`تصدير نشاط المستفيد: ${beneficiary.name}`, 'BeneficiaryProfileModal');
        const activityData = {
          beneficiary: beneficiary.name,
          nationalId: beneficiary.nationalId,
          activities: beneficiaryActivity,
          packages: beneficiaryPackages,
          tasks: beneficiaryTasks,
          exportDate: new Date().toISOString()
        };
        const dataStr = JSON.stringify(activityData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `نشاط_${beneficiary.name}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        break;
      case 'suspend':
        if (confirm(`هل أنت متأكد من تعليق حساب ${beneficiary.name}؟`)) {
          logInfo(`تعليق حساب المستفيد: ${beneficiary.name}`, 'BeneficiaryProfileModal');
          alert('تم تعليق الحساب بنجاح');
        }
        break;
      default:
        logInfo(`إجراء غير معروف: ${action}`, 'BeneficiaryProfileModal');
    }
  };

  const showPackageDetails = (packageId: string) => {
    const packageInfo = beneficiaryPackages.find(p => p.id === packageId);
    if (packageInfo) {
      setSelectedPackage(packageInfo);
      setShowPackageDetailsModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdentityStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{beneficiary.name}</h2>
                <p className="text-gray-600">ملف المستفيد الكامل</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center">
                <div className="bg-blue-100 p-3 rounded-xl mb-3">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">حالة التوثيق</h4>
                <Badge 
                  variant={
                    beneficiary.identityStatus === 'verified' ? 'success' :
                    beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                  }
                >
                  {beneficiary.identityStatus === 'verified' ? 'موثق' :
                   beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'يحتاج إعادة رفع'}
                </Badge>
              </Card>

              <Card className="text-center">
                <div className="bg-green-100 p-3 rounded-xl mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">حالة الأهلية</h4>
                <Badge 
                  variant={
                    beneficiary.eligibilityStatus === 'eligible' ? 'success' :
                    beneficiary.eligibilityStatus === 'under_review' ? 'warning' : 'error'
                  }
                >
                  {beneficiary.eligibilityStatus === 'eligible' ? 'مؤهل' :
                   beneficiary.eligibilityStatus === 'under_review' ? 'تحت المراجعة' : 'غير مؤهل'}
                </Badge>
              </Card>

              <Card className="text-center">
                <div className="bg-purple-100 p-3 rounded-xl mb-3">
                  <Activity className="w-6 h-6 text-purple-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">حالة الحساب</h4>
                <Badge 
                  variant={
                    beneficiary.status === 'active' ? 'success' :
                    beneficiary.status === 'pending' ? 'warning' : 'error'
                  }
                >
                  {beneficiary.status === 'active' ? 'نشط' :
                   beneficiary.status === 'pending' ? 'معلق' : 'موقوف'}
                </Badge>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 ml-2 text-blue-600" />
                    المعلومات الشخصية
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">الاسم الكامل:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.fullName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">رقم الهوية:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.nationalId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ الميلاد:</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(beneficiary.dateOfBirth).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">الجنس:</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {beneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">رقم الهاتف:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">المهنة:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.profession}</p>
                    </div>
                  </div>
                </Card>

                {/* Address Information */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 ml-2 text-green-600" />
                    معلومات العنوان
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">العنوان المختصر:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.address}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">المحافظة:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.detailedAddress.governorate}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">المدينة:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.detailedAddress.city}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">الحي:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.detailedAddress.district}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">الشارع:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.detailedAddress.street || 'غير محدد'}</p>
                      </div>
                    </div>
                    {beneficiary.detailedAddress.additionalInfo && (
                      <div>
                        <span className="text-gray-600">معلومات إضافية:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.detailedAddress.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Social and Economic Information */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 ml-2 text-purple-600" />
                    المعلومات الاجتماعية والاقتصادية
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">الحالة الاجتماعية:</span>
                      <p className="font-medium text-gray-900 mt-1">{getMaritalStatusText(beneficiary.maritalStatus)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">المستوى الاقتصادي:</span>
                      <p className="font-medium text-gray-900 mt-1">{getEconomicLevelText(beneficiary.economicLevel)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">عدد أفراد الأسرة:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.membersCount} فرد</p>
                    </div>
                    {beneficiary.relationToFamily && (
                      <div>
                        <span className="text-gray-600">صلة القرابة:</span>
                        <p className="font-medium text-gray-900 mt-1">{beneficiary.relationToFamily}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Family Hierarchy Section - Only show for head of family */}
                {beneficiary.isHeadOfFamily && (
                  <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 ml-2 text-purple-600" />
                      أفراد الأسرة
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Head of Family */}
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Crown className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-blue-800">رب الأسرة</p>
                            <p className="text-sm text-blue-700">{beneficiary.name}</p>
                            <p className="text-xs text-blue-600">رقم الهوية: {beneficiary.nationalId}</p>
                          </div>
                          <Badge variant="info" size="sm">أنا</Badge>
                        </div>
                        {beneficiary.medicalConditions.length > 0 && (
                          <div className="mt-3 bg-white p-2 rounded-lg">
                            <p className="text-xs text-blue-700 font-medium mb-1">الحالات المرضية:</p>
                            <div className="flex flex-wrap gap-1">
                              {beneficiary.medicalConditions.map((condition, index) => (
                                <Badge key={index} variant="warning" size="sm">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Spouse */}
                      {(() => {
                        const spouse = beneficiaries.find(b => b.id === beneficiary.spouseId);
                        return spouse ? (
                          <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-pink-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-pink-800">
                                  {spouse.gender === 'female' ? 'الزوجة' : 'الزوج'}
                                </p>
                                <p className="text-sm text-pink-700">{spouse.name}</p>
                                <p className="text-xs text-pink-600">رقم الهوية: {spouse.nationalId}</p>
                                <p className="text-xs text-pink-600">الهاتف: {spouse.phone}</p>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Eye}
                                onClick={() => {
                                  // يمكن إضافة وظيفة لعرض ملف الزوجة/الزوج
                                  alert(`عرض ملف ${spouse.name}`);
                                }}
                              >
                                عرض الملف
                              </Button>
                            </div>
                            {spouse.medicalConditions.length > 0 && (
                              <div className="mt-3 bg-white p-2 rounded-lg">
                                <p className="text-xs text-pink-700 font-medium mb-1">الحالات المرضية:</p>
                                <div className="flex flex-wrap gap-1">
                                  {spouse.medicalConditions.map((condition, index) => (
                                    <Badge key={index} variant="warning" size="sm">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">لا توجد زوجة مسجلة</p>
                                <p className="text-xs text-gray-500">يمكن إضافة الزوجة لاحقاً</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Children */}
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Users className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-800">الأبناء غير المتزوجين</p>
                          </div>
                          <Badge variant="success" size="sm">
                            {beneficiary.childrenIds.length} ابن/ابنة
                          </Badge>
                        </div>
                        
                        {beneficiary.childrenIds.length > 0 ? (
                          <div className="space-y-3">
                            {beneficiary.childrenIds.map(childId => {
                              const child = beneficiaries.find(b => b.id === childId);
                              if (!child) return null;
                              
                              const age = new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear();
                              
                              return (
                                <div key={childId} className="bg-white p-3 rounded-lg border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 space-x-reverse">
                                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-3 h-3 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{child.name}</p>
                                        <p className="text-xs text-gray-600">
                                          {child.gender === 'male' ? 'ابن' : 'ابنة'} • {age} سنة • {child.profession}
                                        </p>
                                        <p className="text-xs text-gray-500">رقم الهوية: {child.nationalId}</p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 space-x-reverse">
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={Eye}
                                        onClick={() => {
                                          alert(`عرض ملف ${child.name}`);
                                        }}
                                      >
                                        عرض
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {child.medicalConditions.length > 0 && (
                                    <div className="mt-2 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                      <p className="text-xs text-yellow-700 font-medium mb-1">حالات مرضية:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {child.medicalConditions.map((condition, index) => (
                                          <Badge key={index} variant="warning" size="sm">
                                            {condition}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-600">لا يوجد أبناء مسجلين</p>
                            <p className="text-xs text-gray-500">يمكن إضافة الأبناء غير المتزوجين</p>
                          </div>
                        )}
                      </div>

                      {/* Family Medical Summary */}
                      {(() => {
                        const spouse = beneficiaries.find(b => b.id === beneficiary.spouseId);
                        const children = beneficiary.childrenIds.map(id => beneficiaries.find(b => b.id === id)).filter(Boolean);
                        const allMedicalConditions = [
                          ...beneficiary.medicalConditions.map(c => ({ member: beneficiary.name, condition: c })),
                          ...(spouse?.medicalConditions.map(c => ({ member: spouse.name, condition: c })) || []),
                          ...children.flatMap(child => 
                            child.medicalConditions.map(c => ({ member: child.name, condition: c }))
                          )
                        ];
                        
                        return allMedicalConditions.length > 0 ? (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-center space-x-2 space-x-reverse mb-3">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <p className="font-semibold text-red-800">ملخص الحالات المرضية في الأسرة</p>
                            </div>
                            <div className="space-y-2">
                              {allMedicalConditions.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-red-700">{item.member}:</span>
                                  <Badge variant="error" size="sm">{item.condition}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </Card>
                )}

                {/* Show parent info if this is a child */}
                {!beneficiary.isHeadOfFamily && beneficiary.parentId && (
                  <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 ml-2 text-purple-600" />
                      معلومات الأسرة
                    </h3>
                    
                    {(() => {
                      const parent = beneficiaries.find(b => b.id === beneficiary.parentId);
                      return parent ? (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Crown className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-purple-800">رب الأسرة</p>
                              <p className="text-sm text-purple-700">{parent.name}</p>
                              <p className="text-xs text-purple-600">رقم الهوية: {parent.nationalId}</p>
                              <p className="text-xs text-purple-600">الهاتف: {parent.phone}</p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={Eye}
                              onClick={() => {
                                alert(`عرض ملف رب الأسرة: ${parent.name}`);
                              }}
                            >
                              عرض ملف الأب
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">لا يمكن العثور على بيانات رب الأسرة</p>
                        </div>
                      );
                    })()}
                  </Card>
                )}

                {/* Identity and Documents Section */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 ml-2 text-green-600" /> {/* Changed from IdCard to Star */}
                    الهوية والوثائق
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Identity Status */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 text-sm">حالة توثيق الهوية:</span>
                        <Badge 
                          variant={
                            beneficiary.identityStatus === 'verified' ? 'success' :
                            beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                          }
                        >
                          {beneficiary.identityStatus === 'verified' ? 'موثق' :
                           beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'يحتاج إعادة رفع'}
                        </Badge>
                      </div>
                      
                      {/* Identity Image */}
                      {beneficiary.identityImageUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Camera className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">تم رفع صورة الهوية</span>
                          </div>
                          
                          {/* Identity Image Preview */}
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <img 
                              src={beneficiary.identityImageUrl} 
                              alt="صورة الهوية"
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setShowFullImageModal(true)}
                            />
                            <div className="flex space-x-2 space-x-reverse mt-3">
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Eye}
                                iconPosition="right"
                                onClick={() => setShowFullImageModal(true)}
                                className="flex-1"
                              >
                                عرض الملف كامل
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Download}
                                iconPosition="right"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = beneficiary.identityImageUrl!;
                                  link.download = `هوية_${beneficiary.name}.jpg`;
                                  link.click();
                                }}
                              >
                                تحميل
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 space-x-reverse text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">لم يتم رفع صورة الهوية</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Documents */}
                    {beneficiary.additionalDocuments && beneficiary.additionalDocuments.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-blue-700 font-medium text-sm">المستندات الإضافية:</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            iconPosition="right"
                            onClick={() => handleAction('view-documents')}
                          >
                            عرض المستندات
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {beneficiary.additionalDocuments.slice(0, 3).map((doc, index) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-700">{doc.name}</span>
                            </div>
                          ))}
                          {beneficiary.additionalDocuments.length > 3 && (
                            <p className="text-xs text-blue-600">+ {beneficiary.additionalDocuments.length - 3} مستند آخر</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Package History */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 ml-2 text-green-600" />
                    سجل الطرود ({beneficiary.totalPackages})
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{beneficiaryPackages.filter(p => p.status === 'delivered').length}</p>
                        <p className="text-xs text-green-700">تم التسليم</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-lg font-bold text-orange-600">{beneficiaryPackages.filter(p => p.status === 'in_delivery').length}</p>
                        <p className="text-xs text-orange-700">قيد التوصيل</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{beneficiaryPackages.filter(p => p.status === 'pending').length}</p>
                        <p className="text-xs text-blue-700">في الانتظار</p>
                      </div>
                    </div>

                    {beneficiaryPackages.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {beneficiaryPackages.slice(0, 5).map((pkg) => (
                          <div key={pkg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{pkg.type}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(pkg.createdAt).toLocaleDateString('en-CA')}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Badge 
                                variant={
                                  pkg.status === 'delivered' ? 'success' :
                                  pkg.status === 'in_delivery' ? 'warning' : 'info'
                                }
                                size="sm"
                              >
                                {pkg.status === 'delivered' ? 'تم التسليم' :
                                 pkg.status === 'in_delivery' ? 'قيد التوصيل' : 'في الانتظار'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => showPackageDetails(pkg.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {beneficiaryPackages.length > 5 && (
                          <p className="text-center text-xs text-gray-500 py-2">
                            + {beneficiaryPackages.length - 5} طرد آخر
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">لا توجد طرود مسجلة</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* System Information */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 ml-2 text-purple-600" />
                    معلومات النظام
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">تاريخ التسجيل:</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(beneficiary.createdAt).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">آخر تحديث:</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(beneficiary.updatedAt).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">آخر استلام:</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {new Date(beneficiary.lastReceived).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">تم الإنشاء بواسطة:</span>
                      <p className="font-medium text-gray-900 mt-1">{beneficiary.createdBy}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 ml-2 text-blue-600" />
                    آخر الأنشطة
                  </h3>
                  
                  {beneficiaryActivity.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {beneficiaryActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <Activity className="w-3 h-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">بواسطة: {activity.user}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString('en-CA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">لا توجد أنشطة مسجلة</p>
                    </div>
                  )}
                </Card>

                {/* Notes */}
                {beneficiary.notes && (
                  <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 ml-2 text-yellow-600" />
                      الملاحظات
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{beneficiary.notes}</p>
                    </div>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 ml-2 text-green-500 fill-green-500" />
                    إجراءات سريعة
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {beneficiary.identityStatus === 'pending' && onApproveIdentity && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        iconPosition="right"
                        onClick={() => handleAction('approve-identity')}
                        className="w-full"
                      >
                        توثيق الهوية
                      </Button>
                    )}
                    
                    {(beneficiary.identityStatus === 'pending' || beneficiary.identityStatus === 'rejected') && onRequestReupload && (
                      <Button
                        variant="warning"
                        size="sm"
                        icon={Camera}
                        iconPosition="right"
                        onClick={() => handleAction('request-reupload')}
                        className="w-full"
                      >
                        طلب إعادة رفع
                      </Button>
                    )}
                    
                    {onEditBeneficiary && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        iconPosition="right"
                        onClick={() => onEditBeneficiary(beneficiary)}
                        className="w-full"
                      >
                        تعديل البيانات
                      </Button>
                    )}
                    
                    {onNavigateToIndividualSend && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Package}
                        iconPosition="right"
                        onClick={() => onNavigateToIndividualSend(beneficiary.id)}
                        className="w-full"
                      >
                        إرسال طرد
                      </Button>
                    )}
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Truck}
                      iconPosition="right"
                      onClick={() => handleAction('track-courier')}
                      className="w-full"
                    >
                      تتبع المندوب
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      iconPosition="right"
                      onClick={() => handleAction('export-activity')}
                      className="w-full"
                    >
                      تصدير النشاط
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Notes Section (if exists) */}
            {beneficiary.notes && (
              <Card className="bg-yellow-50 border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 ml-2 text-yellow-600" />
                  ملاحظات خاصة
                </h3>
                <p className="text-gray-700 leading-relaxed">{beneficiary.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImageModal && beneficiary.identityImageUrl && (
        <Modal
          isOpen={showFullImageModal}
          onClose={() => setShowFullImageModal(false)}
          title="عرض صورة الهوية كاملة"
          size="lg"
        >
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">صورة هوية {beneficiary.name}</h4>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    iconPosition="right"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = beneficiary.identityImageUrl!;
                      link.download = `هوية_${beneficiary.name}_${beneficiary.nationalId}.jpg`;
                      link.click();
                    }}
                  >
                    تحميل الصورة
                  </Button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img 
                  src={beneficiary.identityImageUrl} 
                  alt={`صورة هوية ${beneficiary.name}`}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">اسم المستفيد:</span>
                    <p className="text-gray-900">{beneficiary.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium">رقم الهوية:</span>
                    <p className="text-gray-900">{beneficiary.nationalId}</p>
                  </div>
                  <div>
                    <span className="font-medium">حالة التوثيق:</span>
                    <Badge 
                      variant={
                        beneficiary.identityStatus === 'verified' ? 'success' :
                        beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                      }
                      size="sm"
                      className="mt-1"
                    >
                      {beneficiary.identityStatus === 'verified' ? 'موثق' :
                       beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'يحتاج إعادة رفع'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">تاريخ الرفع:</span>
                    <p className="text-gray-900">{new Date(beneficiary.updatedAt).toLocaleDateString('en-CA')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification Actions */}
            {beneficiary.identityStatus === 'pending' && (
              <div className="flex space-x-3 space-x-reverse">
                {onApproveIdentity && (
                  <Button
                    variant="success"
                    icon={CheckCircle}
                    iconPosition="right"
                    onClick={() => {
                      handleAction('approve-identity');
                      setShowFullImageModal(false);
                    }}
                    className="flex-1"
                  >
                    توثيق الهوية
                  </Button>
                )}
                
                {onRequestReupload && (
                  <Button
                    variant="warning"
                    icon={Camera}
                    iconPosition="right"
                    onClick={() => {
                      handleAction('request-reupload');
                      setShowFullImageModal(false);
                    }}
                    className="flex-1"
                  >
                    طلب إعادة رفع
                  </Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}