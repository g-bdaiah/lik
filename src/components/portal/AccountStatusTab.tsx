import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Info, Building2, ArrowRight } from 'lucide-react';
import { accountStatusService } from '../../services/accountStatusService';
import { Button, Card } from '../ui';
import type { Database } from '../../types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];

interface AccountStatusTabProps {
  beneficiaryId: string;
}

export default function AccountStatusTab({ beneficiaryId }: AccountStatusTabProps) {
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccountStatus();
  }, [beneficiaryId]);

  const loadAccountStatus = async () => {
    try {
      setIsLoading(true);
      const status = await accountStatusService.getAccountStatus(beneficiaryId);
      setAccountStatus(status);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل حالة الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!accountStatus) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const verificationConfig = accountStatusService.getVerificationStatusConfig(accountStatus.verificationStatus);
  const qualificationConfig = accountStatusService.getQualificationStatusConfig(accountStatus.qualificationStatus);

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${verificationConfig.color}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${verificationConfig.color}`}>
            {verificationConfig.icon === 'CheckCircle' && <CheckCircle className="w-7 h-7" />}
            {verificationConfig.icon === 'Clock' && <Clock className="w-7 h-7" />}
            {verificationConfig.icon === 'AlertCircle' && <AlertCircle className="w-7 h-7" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">حالة التوثيق</h3>
            <p className="text-2xl font-bold mb-2">{verificationConfig.label}</p>
            <p className="text-gray-700 mb-3">{verificationConfig.description}</p>
            {accountStatus.verificationNotes && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">ملاحظات:</p>
                <p className="text-sm text-gray-700">{accountStatus.verificationNotes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className={`border-2 ${qualificationConfig.color}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${qualificationConfig.color}`}>
            {qualificationConfig.icon === 'CheckCircle' && <CheckCircle className="w-7 h-7" />}
            {qualificationConfig.icon === 'Info' && <Info className="w-7 h-7" />}
            {qualificationConfig.icon === 'XCircle' && <AlertCircle className="w-7 h-7" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">حالة الأهلية</h3>
            <p className="text-2xl font-bold mb-2">{qualificationConfig.label}</p>
            <p className="text-gray-700 mb-3">{qualificationConfig.description}</p>
            {accountStatus.qualificationNotes && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">ملاحظات:</p>
                <p className="text-sm text-gray-700">{accountStatus.qualificationNotes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {accountStatus.suggestedOrganizations && accountStatus.suggestedOrganizations.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              المؤسسات المقترحة ({accountStatus.suggestedOrganizations.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              هذه المؤسسات تتطابق مع معايير أهليتك. يمكنك التقديم للحصول على مساعدات منها.
            </p>
          </div>
          <div className="space-y-3">
            {accountStatus.suggestedOrganizations.map((org: Organization) => (
              <div
                key={org.id}
                className="bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{org.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{org.type}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📍 {org.location}</span>
                      <span>📞 {org.phone}</span>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0">
                    تقديم
                    <ArrowRight className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {accountStatus.verificationStatus === 'verified' && accountStatus.qualificationStatus === 'qualified' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 mb-1">حسابك جاهز!</p>
              <p className="text-sm text-green-800">
                تم التحقق من حسابك وأنت مؤهل للحصول على المساعدات. يمكنك الآن التقديم للمؤسسات المقترحة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
