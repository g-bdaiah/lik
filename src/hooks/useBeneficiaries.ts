import { useState, useEffect, useMemo } from 'react';
import { type Beneficiary, mockBeneficiaries } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';

interface UseBeneficiariesOptions {
  organizationId?: string;
  familyId?: string;
  searchTerm?: string;
  statusFilter?: string;
  identityStatusFilter?: string;
}

export const useBeneficiaries = (options: UseBeneficiariesOptions = {}) => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  // جلب البيانات
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filteredData = [...mockBeneficiaries];
        
        // فلترة حسب المؤسسة
        if (options.organizationId) {
          filteredData = filteredData.filter(b => b.organizationId === options.organizationId);
        }
        
        // فلترة حسب العائلة
        if (options.familyId) {
          filteredData = filteredData.filter(b => b.familyId === options.familyId);
        }
        
        setBeneficiaries(filteredData);
        logInfo(`تم تحميل ${filteredData.length} مستفيد`, 'useBeneficiaries');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المستفيدين';
        setError(errorMessage);
        logError(new Error(errorMessage), 'useBeneficiaries');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [options.organizationId, options.familyId, logInfo, logError]);

  // فلترة البيانات بناءً على البحث والفلاتر
  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...beneficiaries];

    // فلترة البحث
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.nationalId.includes(options.searchTerm!) ||
        b.phone.includes(options.searchTerm!)
      );
    }

    // فلترة الحالة
    if (options.statusFilter && options.statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === options.statusFilter);
    }

    // فلترة حالة الهوية
    if (options.identityStatusFilter && options.identityStatusFilter !== 'all') {
      filtered = filtered.filter(b => b.identityStatus === options.identityStatusFilter);
    }

    return filtered;
  }, [beneficiaries, options.searchTerm, options.statusFilter, options.identityStatusFilter]);

  // إحصائيات
  const statistics = useMemo(() => {
    return {
      total: beneficiaries.length,
      verified: beneficiaries.filter(b => b.identityStatus === 'verified').length,
      pending: beneficiaries.filter(b => b.identityStatus === 'pending').length,
      rejected: beneficiaries.filter(b => b.identityStatus === 'rejected').length,
      active: beneficiaries.filter(b => b.status === 'active').length,
      suspended: beneficiaries.filter(b => b.status === 'suspended').length
    };
  }, [beneficiaries]);

  // وظائف CRUD (محاكاة)
  const addBeneficiary = async (beneficiaryData: Partial<Beneficiary>) => {
    try {
      setLoading(true);
      
      // محاكاة إضافة مستفيد جديد
      const newBeneficiary: Beneficiary = {
        id: `new-${Date.now()}`,
        name: beneficiaryData.name || '',
        fullName: beneficiaryData.fullName || '',
        nationalId: beneficiaryData.nationalId || '',
        dateOfBirth: beneficiaryData.dateOfBirth || '',
        gender: beneficiaryData.gender || 'male',
        phone: beneficiaryData.phone || '',
        address: beneficiaryData.address || '',
        detailedAddress: beneficiaryData.detailedAddress || {
          governorate: '',
          city: '',
          district: '',
          street: '',
          additionalInfo: ''
        },
        location: beneficiaryData.location || { lat: 31.3469, lng: 34.3029 },
        organizationId: beneficiaryData.organizationId,
        familyId: beneficiaryData.familyId,
        relationToFamily: beneficiaryData.relationToFamily,
        profession: beneficiaryData.profession || '',
        maritalStatus: beneficiaryData.maritalStatus || 'single',
        economicLevel: beneficiaryData.economicLevel || 'poor',
        membersCount: beneficiaryData.membersCount || 1,
        additionalDocuments: beneficiaryData.additionalDocuments || [],
        identityStatus: 'pending',
        identityImageUrl: beneficiaryData.identityImageUrl,
        status: 'active',
        eligibilityStatus: 'under_review',
        lastReceived: new Date().toISOString().split('T')[0],
        totalPackages: 0,
        notes: beneficiaryData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };

      setBeneficiaries(prev => [newBeneficiary, ...prev]);
      logInfo(`تم إضافة مستفيد جديد: ${newBeneficiary.name}`, 'useBeneficiaries');
      return newBeneficiary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>) => {
    try {
      setLoading(true);
      
      setBeneficiaries(prev => 
        prev.map(b => 
          b.id === id 
            ? { ...b, ...updates, updatedAt: new Date().toISOString() }
            : b
        )
      );
      
      logInfo(`تم تحديث المستفيد: ${id}`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    try {
      setLoading(true);
      
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      logInfo(`تم حذف المستفيد: ${id}`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    // إعادة تحميل البيانات
    setBeneficiaries([...mockBeneficiaries]);
  };

  return {
    beneficiaries: filteredBeneficiaries,
    allBeneficiaries: beneficiaries,
    loading,
    error,
    statistics,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    refetch
  };
};

// Hook مخصص للحصول على مستفيد واحد
export const useBeneficiary = (id: string) => {
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const found = mockBeneficiaries.find(b => b.id === id);
      setBeneficiary(found || null);
      setError(found ? null : 'المستفيد غير موجود');
      setLoading(false);
    }
  }, [id]);

  return { beneficiary, loading, error };
};