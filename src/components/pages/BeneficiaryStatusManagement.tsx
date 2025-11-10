import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, XCircle, Eye, Award, AlertCircle, Save } from 'lucide-react';
import { accountStatusService } from '../../services/accountStatusService';
import { Button, Input, Card } from '../ui';
import type { Database } from '../../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

export default function BeneficiaryStatusManagement() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [qualificationFilter, setQualificationFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    verification_status: '',
    verification_notes: '',
    qualification_status: '',
    qualification_notes: '',
    suggested_organizations: [] as string[]
  });

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, verificationFilter, qualificationFilter, beneficiaries]);

  const loadBeneficiaries = async () => {
    try {
      setIsLoading(true);
      const data = await accountStatusService.getAllBeneficiariesForReview();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...beneficiaries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(term) ||
        b.national_id.toLowerCase().includes(term) ||
        b.phone.toLowerCase().includes(term)
      );
    }

    if (verificationFilter !== 'all') {
      filtered = filtered.filter(b => b.verification_status === verificationFilter);
    }

    if (qualificationFilter !== 'all') {
      filtered = filtered.filter(b => b.qualification_status === qualificationFilter);
    }

    setFilteredBeneficiaries(filtered);
  };

  const handleReview = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setReviewForm({
      verification_status: beneficiary.verification_status || 'under_review',
      verification_notes: beneficiary.verification_notes || '',
      qualification_status: beneficiary.qualification_status || 'needs_update',
      qualification_notes: beneficiary.qualification_notes || '',
      suggested_organizations: beneficiary.suggested_organizations_ids || []
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedBeneficiary) return;

    try {
      await accountStatusService.updateBeneficiaryStatus(
        selectedBeneficiary.id,
        reviewForm.verification_status as any,
        reviewForm.verification_notes,
        reviewForm.qualification_status as any,
        reviewForm.qualification_notes,
        reviewForm.suggested_organizations,
        'المسؤول'
      );

      alert('تم تحديث حالة المستفيد بنجاح');
      setIsReviewModalOpen(false);
      loadBeneficiaries();
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    }
  };

  const getStatusBadge = (status: string, type: 'verification' | 'qualification') => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      verified: { label: 'موثق', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle },
      qualified: { label: 'مؤهل', color: 'bg-green-100 text-green-700', icon: Award },
      needs_update: { label: 'يحتاج تحديث', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
      unqualified: { label: 'غير مؤهل', color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = configs[status] || configs[type === 'verification' ? 'under_review' : 'needs_update'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة حالات التوثيق والأهلية</h1>
          <p className="text-gray-600 mt-1">مراجعة وتحديث حالات المستفيدين</p>
        </div>
        <div className="text-sm text-gray-600">
          إجمالي المستفيدين: <span className="font-bold text-gray-900">{beneficiaries.length}</span>
        </div>
      </div>

      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو رقم الهوية أو الهاتف..."
                className="pr-10"
              />
            </div>
          </div>

          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل حالات التوثيق</option>
              <option value="verified">موثق</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div>
            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">كل حالات الأهلية</option>
              <option value="qualified">مؤهل</option>
              <option value="needs_update">يحتاج تحديث</option>
              <option value="unqualified">غير مؤهل</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          عرض {filteredBeneficiaries.length} من {beneficiaries.length}
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredBeneficiaries.map((beneficiary) => (
          <Card key={beneficiary.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{beneficiary.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>رقم الهوية: <span className="font-mono">{beneficiary.national_id}</span></p>
                      <p>الهاتف: {beneficiary.phone}</p>
                      <p>العنوان: {beneficiary.address}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">حالة التوثيق</p>
                      {getStatusBadge(beneficiary.verification_status || 'under_review', 'verification')}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">حالة الأهلية</p>
                      {getStatusBadge(beneficiary.qualification_status || 'needs_update', 'qualification')}
                    </div>
                  </div>
                </div>

                {(beneficiary.verification_notes || beneficiary.qualification_notes) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {beneficiary.verification_notes && (
                      <p className="text-sm text-gray-600">
                        <strong>ملاحظات التوثيق:</strong> {beneficiary.verification_notes}
                      </p>
                    )}
                    {beneficiary.qualification_notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>ملاحظات الأهلية:</strong> {beneficiary.qualification_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleReview(beneficiary)}
                variant="outline"
                size="sm"
              >
                <Eye className="w-4 h-4 ml-2" />
                مراجعة
              </Button>
            </div>
          </Card>
        ))}

        {filteredBeneficiaries.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">لا توجد نتائج مطابقة للبحث</p>
            </div>
          </Card>
        )}
      </div>

      {isReviewModalOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">مراجعة حالة المستفيد</h2>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">معلومات المستفيد</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-medium text-gray-900 mr-2">{selectedBeneficiary.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">رقم الهوية:</span>
                      <span className="font-medium text-gray-900 mr-2">{selectedBeneficiary.national_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium text-gray-900 mr-2">{selectedBeneficiary.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الجنس:</span>
                      <span className="font-medium text-gray-900 mr-2">
                        {selectedBeneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedBeneficiary.identity_image_url && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">صورة الهوية</h3>
                    <img
                      src={selectedBeneficiary.identity_image_url}
                      alt="صورة الهوية"
                      className="w-full max-w-md rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">حالة التوثيق</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحالة
                      </label>
                      <select
                        value={reviewForm.verification_status}
                        onChange={(e) => setReviewForm({ ...reviewForm, verification_status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="verified">موثق</option>
                        <option value="under_review">قيد المراجعة</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات التوثيق
                      </label>
                      <textarea
                        value={reviewForm.verification_notes}
                        onChange={(e) => setReviewForm({ ...reviewForm, verification_notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="أدخل ملاحظات حول حالة التوثيق..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">حالة الأهلية</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحالة
                      </label>
                      <select
                        value={reviewForm.qualification_status}
                        onChange={(e) => setReviewForm({ ...reviewForm, qualification_status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="qualified">مؤهل</option>
                        <option value="needs_update">يحتاج تحديث</option>
                        <option value="unqualified">غير مؤهل</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات الأهلية
                      </label>
                      <textarea
                        value={reviewForm.qualification_notes}
                        onChange={(e) => setReviewForm({ ...reviewForm, qualification_notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="أدخل ملاحظات حول حالة الأهلية..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveReview} className="flex-1">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                  <Button
                    onClick={() => setIsReviewModalOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
