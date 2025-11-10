import { useState, useEffect, useMemo } from 'react';
import { type Organization, mockOrganizations } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';

interface UseOrganizationsOptions {
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

export const useOrganizations = (options: UseOrganizationsOptions = {}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  // جلب البيانات
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setOrganizations([...mockOrganizations]);
        logInfo(`تم تحميل ${mockOrganizations.length} مؤسسة`, 'useOrganizations');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المؤسسات';
        setError(errorMessage);
        logError(new Error(errorMessage), 'useOrganizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [logInfo, logError]);

  // فلترة البيانات
  const filteredOrganizations = useMemo(() => {
    let filtered = [...organizations];

    // فلترة البحث
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchLower) ||
        org.type.toLowerCase().includes(searchLower) ||
        org.location.toLowerCase().includes(searchLower)
      );
    }

    // فلترة الحالة
    if (options.statusFilter && options.statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === options.statusFilter);
    }

    // فلترة النوع
    if (options.typeFilter && options.typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type.includes(options.typeFilter!));
    }

    return filtered;
  }, [organizations, options.searchTerm, options.statusFilter, options.typeFilter]);

  // إحصائيات
  const statistics = useMemo(() => {
    return {
      total: organizations.length,
      active: organizations.filter(org => org.status === 'active').length,
      pending: organizations.filter(org => org.status === 'pending').length,
      suspended: organizations.filter(org => org.status === 'suspended').length,
      totalBeneficiaries: organizations.reduce((sum, org) => sum + org.beneficiariesCount, 0),
      totalPackages: organizations.reduce((sum, org) => sum + org.packagesCount, 0)
    };
  }, [organizations]);

  // وظائف CRUD (محاكاة)
  const addOrganization = async (orgData: Partial<Organization>) => {
    try {
      setLoading(true);
      
      const newOrganization: Organization = {
        id: `org-${Date.now()}`,
        name: orgData.name || '',
        type: orgData.type || '',
        location: orgData.location || '',
        contactPerson: orgData.contactPerson || '',
        phone: orgData.phone || '',
        email: orgData.email || '',
        beneficiariesCount: 0,
        packagesCount: 0,
        completionRate: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        packagesAvailable: 0,
        templatesCount: 0,
        isPopular: false
      };

      setOrganizations(prev => [newOrganization, ...prev]);
      logInfo(`تم إضافة مؤسسة جديدة: ${newOrganization.name}`, 'useOrganizations');
      return newOrganization;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المؤسسة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      setLoading(true);
      
      setOrganizations(prev => 
        prev.map(org => 
          org.id === id 
            ? { ...org, ...updates }
            : org
        )
      );
      
      logInfo(`تم تحديث المؤسسة: ${id}`, 'useOrganizations');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المؤسسة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      setLoading(true);
      
      setOrganizations(prev => prev.filter(org => org.id !== id));
      logInfo(`تم حذف المؤسسة: ${id}`, 'useOrganizations');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف المؤسسة';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useOrganizations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setOrganizations([...mockOrganizations]);
  };

  return {
    organizations: filteredOrganizations,
    allOrganizations: organizations,
    loading,
    error,
    statistics,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    refetch
  };
};

// Hook للحصول على مؤسسة واحدة
export const useOrganization = (id: string) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const found = mockOrganizations.find(org => org.id === id);
      setOrganization(found || null);
      setError(found ? null : 'المؤسسة غير موجودة');
      setLoading(false);
    }
  }, [id]);

  return { organization, loading, error };
};