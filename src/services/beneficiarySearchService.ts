import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/database';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type Package = Database['public']['Tables']['packages']['Row'];

interface BeneficiarySearchResult {
  beneficiary: Beneficiary | null;
  packages: Package[];
  totalPackages: number;
  deliveredPackages: number;
  pendingPackages: number;
  inDeliveryPackages: number;
  assignedPackages?: number;
  failedPackages?: number;
  error?: string;
}

interface SearchCache {
  [key: string]: {
    data: BeneficiarySearchResult;
    timestamp: number;
  };
}

const searchCache: SearchCache = {};
const CACHE_DURATION = 5 * 60 * 1000;

export const searchBeneficiaryByNationalId = async (
  nationalId: string,
  options: { limit?: number; offset?: number; useCache?: boolean } = {}
): Promise<BeneficiarySearchResult> => {
  const { limit = 50, offset = 0, useCache = true } = options;
  const cacheKey = `${nationalId}_${limit}_${offset}`;

  if (useCache && searchCache[cacheKey]) {
    const cached = searchCache[cacheKey];
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;

    if (!isExpired) {
      console.log('Returning cached search result for:', nationalId);
      return cached.data;
    } else {
      delete searchCache[cacheKey];
    }
  }

  try {
    const { data, error } = await supabase.rpc('search_beneficiary_with_packages', {
      p_national_id: nationalId,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('Error calling search_beneficiary_with_packages:', error);
      return {
        beneficiary: null,
        packages: [],
        totalPackages: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        inDeliveryPackages: 0,
        assignedPackages: 0,
        failedPackages: 0,
        error: 'حدث خطأ أثناء البحث عن المستفيد'
      };
    }

    if (!data) {
      return {
        beneficiary: null,
        packages: [],
        totalPackages: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        inDeliveryPackages: 0,
        assignedPackages: 0,
        failedPackages: 0,
        error: 'حدث خطأ في معالجة البيانات'
      };
    }

    if (data.error) {
      return {
        beneficiary: null,
        packages: [],
        totalPackages: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        inDeliveryPackages: 0,
        assignedPackages: 0,
        failedPackages: 0,
        error: data.error
      };
    }

    const result: BeneficiarySearchResult = {
      beneficiary: data.beneficiary,
      packages: data.packages || [],
      totalPackages: data.stats?.total || 0,
      deliveredPackages: data.stats?.delivered || 0,
      pendingPackages: data.stats?.pending || 0,
      inDeliveryPackages: data.stats?.in_delivery || 0,
      assignedPackages: data.stats?.assigned || 0,
      failedPackages: data.stats?.failed || 0
    };

    if (useCache && result.beneficiary) {
      searchCache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };
    }

    return result;
  } catch (error) {
    console.error('Unexpected error in searchBeneficiaryByNationalId:', error);
    return {
      beneficiary: null,
      packages: [],
      totalPackages: 0,
      deliveredPackages: 0,
      pendingPackages: 0,
      inDeliveryPackages: 0,
      assignedPackages: 0,
      failedPackages: 0,
      error: 'حدث خطأ غير متوقع'
    };
  }
};

export const getBeneficiaryPackageHistory = async (
  beneficiaryId: string,
  limit?: number,
  offset?: number
): Promise<Package[]> => {
  try {
    let query = supabase
      .from('packages')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching package history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getBeneficiaryPackageHistory:', error);
    return [];
  }
};

export const updateBeneficiaryData = async (
  beneficiaryId: string,
  updates: Partial<Beneficiary>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('beneficiaries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', beneficiaryId);

    if (error) {
      console.error('Error updating beneficiary:', error);
      return { success: false, error: 'فشل تحديث بيانات المستفيد' };
    }

    clearSearchCache();

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateBeneficiaryData:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
};

export const clearSearchCache = () => {
  Object.keys(searchCache).forEach(key => delete searchCache[key]);
  console.log('Search cache cleared');
};

export const quickSearchBeneficiary = async (nationalId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('quick_search_beneficiary', {
      p_national_id: nationalId
    });

    if (error) {
      console.error('Error calling quick_search_beneficiary:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in quickSearchBeneficiary:', error);
    return null;
  }
};
