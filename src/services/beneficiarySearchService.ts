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
  error?: string;
}

export const searchBeneficiaryByNationalId = async (nationalId: string): Promise<BeneficiarySearchResult> => {
  try {
    const { data: beneficiary, error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('national_id', nationalId)
      .maybeSingle();

    if (beneficiaryError) {
      console.error('Error fetching beneficiary:', beneficiaryError);
      return {
        beneficiary: null,
        packages: [],
        totalPackages: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        inDeliveryPackages: 0,
        error: 'حدث خطأ أثناء البحث عن المستفيد'
      };
    }

    if (!beneficiary) {
      return {
        beneficiary: null,
        packages: [],
        totalPackages: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        inDeliveryPackages: 0,
        error: 'لم يتم العثور على مستفيد بهذا الرقم'
      };
    }

    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .eq('beneficiary_id', beneficiary.id)
      .order('created_at', { ascending: false });

    if (packagesError) {
      console.error('Error fetching packages:', packagesError);
    }

    const packagesList = packages || [];
    const deliveredPackages = packagesList.filter(p => p.status === 'delivered').length;
    const pendingPackages = packagesList.filter(p => p.status === 'pending').length;
    const inDeliveryPackages = packagesList.filter(p => p.status === 'in_delivery').length;

    return {
      beneficiary,
      packages: packagesList,
      totalPackages: packagesList.length,
      deliveredPackages,
      pendingPackages,
      inDeliveryPackages
    };
  } catch (error) {
    console.error('Unexpected error in searchBeneficiaryByNationalId:', error);
    return {
      beneficiary: null,
      packages: [],
      totalPackages: 0,
      deliveredPackages: 0,
      pendingPackages: 0,
      inDeliveryPackages: 0,
      error: 'حدث خطأ غير متوقع'
    };
  }
};

export const getBeneficiaryPackageHistory = async (beneficiaryId: string): Promise<Package[]> => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false });

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

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateBeneficiaryData:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
};
