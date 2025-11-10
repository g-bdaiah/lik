import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Info, XCircle, Building2, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, Button } from '../ui';
import { accountStatusService, VerificationStatus, QualificationStatus } from '../../services/accountStatusService';
import type { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface AccountStatusCardProps {
  beneficiary: Beneficiary;
  onUpdateData?: () => void;
}

export default function AccountStatusCard({ beneficiary, onUpdateData }: AccountStatusCardProps) {
  const [suggestedOrgs, setSuggestedOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestedOrganizations();
  }, [beneficiary.id]);

  const loadSuggestedOrganizations = async () => {
    try {
      setIsLoading(true);
      const status = await accountStatusService.getAccountStatus(beneficiary.id);
      if (status) {
        setSuggestedOrgs(status.suggestedOrganizations);
      }
    } catch (error) {
      console.error('Error loading suggested organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationConfig = (status: string) => {
    const configs = {
      verified: {
        icon: CheckCircle,
        color: 'bg-green-50 border-green-200 text-green-700',
        iconColor: 'text-green-600',
        label: 'حسابك موثق',
        description: 'تم التحقق من حسابك بنجاح ويمكنك الآن التقديم للحصول على المساعدات'
      },
      under_review: {
        icon: Clock,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        iconColor: 'text-yellow-600',
        label: 'قيد المراجعة',
        description: 'حسابك قيد المراجعة من قبل الإدارة. سيتم إشعارك بالنتيجة قريباً'
      },
      rejected: {
        icon: AlertCircle,
        color: 'bg-red-50 border-red-200 text-red-700',
        iconColor: 'text-red-600',
        label: 'يحتاج تحديث',
        description: 'تم رفض التحقق من حسابك. يرجى تحديث بياناتك'
      }
    };
    return configs[status as keyof typeof configs] || configs.under_review;
  };

  const getQualificationConfig = (status: string) => {
    const configs = {
      qualified: {
        icon: CheckCircle,
        color: 'bg-green-50 border-green-200 text-green-700',
        iconColor: 'text-green-600',
        label: 'مؤهل للمساعدات',
        description: 'أنت مؤهل للحصول على المساعدات! يمكنك التقديم للمؤسسات المقترحة'
      },
      needs_update: {
        icon: Info,
        color: 'bg-blue-50 border-blue-200 text-blue-700',
        iconColor: 'text-blue-600',
        label: 'يحتاج تحديث البيانات',
        description: 'يرجى تحديث بياناتك لتحديد مدى أهليتك للحصول على المساعدات'
      },
      unqualified: {
        icon: XCircle,
        color: 'bg-gray-50 border-gray-200 text-gray-700',
        iconColor: 'text-gray-600',
        label: 'غير مؤهل حالياً',
        description: 'للأسف، لا تنطبق عليك معايير الأهلية حالياً'
      }
    };
    return configs[status as keyof typeof configs] || configs.needs_update;
  };

  const verificationStatus = beneficiary.verification_status || 'under_review';
  const qualificationStatus = beneficiary.qualification_status || 'needs_update';

  const verificationConfig = getVerificationConfig(verificationStatus);
  const qualificationConfig = getQualificationConfig(qualificationStatus);

  const VerificationIcon = verificationConfig.icon;
  const QualificationIcon = qualificationConfig.icon;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`border-2 ${verificationConfig.color}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${verificationConfig.color}`}>
              <VerificationIcon className={`w-6 h-6 ${verificationConfig.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">حالة التوثيق</h3>
              <p className="text-base font-semibold mb-2">{verificationConfig.label}</p>
              <p className="text-sm opacity-90">{verificationConfig.description}</p>
              {beneficiary.verification_notes && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                  <p className="text-sm font-medium">ملاحظات:</p>
                  <p className="text-sm mt-1">{beneficiary.verification_notes}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className={`border-2 ${qualificationConfig.color}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${qualificationConfig.color}`}>
              <QualificationIcon className={`w-6 h-6 ${qualificationConfig.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">حالة الأهلية</h3>
              <p className="text-base font-semibold mb-2">{qualificationConfig.label}</p>
              <p className="text-sm opacity-90">{qualificationConfig.description}</p>
              {beneficiary.qualification_notes && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                  <p className="text-sm font-medium">ملاحظات:</p>
                  <p className="text-sm mt-1">{beneficiary.qualification_notes}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {(verificationStatus === 'rejected' || qualificationStatus === 'needs_update') && onUpdateData && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">يحتاج تحديث البيانات</h3>
                <p className="text-sm text-blue-800">
                  لتحسين فرصك في الحصول على المساعدات، يرجى تحديث بياناتك الشخصية
                </p>
              </div>
            </div>
            <Button onClick={onUpdateData} className="flex-shrink-0">
              تحديث البيانات
            </Button>
          </div>
        </Card>
      )}

      {suggestedOrgs.length > 0 && (
        <Card>
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            المؤسسات المقترحة لك ({suggestedOrgs.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            هذه المؤسسات مناسبة لموقعك واحتياجاتك. يمكنك التواصل معها للتقديم
          </p>
          <div className="space-y-3">
            {suggestedOrgs.map((org) => (
              <div
                key={org.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{org.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{org.type}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {org.location}
                      </span>
                      {org.phone && (
                        <span dir="ltr">
                          {org.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {suggestedOrgs.length === 0 && !isLoading && (
        <Card className="bg-gray-50">
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              لا توجد مؤسسات مقترحة حالياً. سيتم إشعارك عند توفر مؤسسات مناسبة
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
