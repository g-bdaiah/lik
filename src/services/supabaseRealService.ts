import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';
import { withRetry, handleApiError } from '../utils/apiHelpers';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type Family = Database['public']['Tables']['families']['Row'];
type PackageType = Database['public']['Tables']['packages']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type Courier = Database['public']['Tables']['couriers']['Row'];
type PackageTemplate = Database['public']['Tables']['package_templates']['Row'];
type Role = Database['public']['Tables']['roles']['Row'];
type SystemUser = Database['public']['Tables']['system_users']['Row'];
type Permission = Database['public']['Tables']['permissions']['Row'];

export const beneficiariesService = {
  async getAll(): Promise<Beneficiary[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    return withRetry(async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
      }
      return data || [];
    });
  },

  async getAllDetailed(): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries_detailed')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async search(searchTerm: string): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .rpc('search_beneficiaries', { search_term: searchTerm });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Beneficiary | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getByOrganization(organizationId: string): Promise<Beneficiary[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  },

  async getByFamily(familyId: string): Promise<Beneficiary[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('family_id', familyId);

    if (error) throw error;
    return data || [];
  },

  async create(beneficiary: BeneficiaryInsert): Promise<Beneficiary> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiary)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Beneficiary>): Promise<Beneficiary> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('beneficiaries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const organizationsService = {
  async getAll(): Promise<Organization[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<Organization[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Organization | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

export const familiesService = {
  async getAll(): Promise<Family[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('families')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Family | null> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

export const packagesService = {
  async getAll(): Promise<PackageType[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<PackageType[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('beneficiary_id', beneficiaryId);

    if (error) throw error;
    return data || [];
  },

  async create(packageData: any): Promise<PackageType> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const packageTemplatesService = {
  async getAll(): Promise<PackageTemplate[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('package_templates')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  async getByOrganization(organizationId: string): Promise<PackageTemplate[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('package_templates')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw error;
    return data || [];
  },

  async createWithItems(template: any, items: any[]): Promise<PackageTemplate> {
    if (!supabase) throw new Error('Supabase not initialized');

    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);

    const { data, error } = await supabase
      .from('package_templates')
      .insert({
        ...template,
        contents: items,
        total_weight: totalWeight
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const tasksService = {
  async getAll(): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('beneficiary_id', beneficiaryId);

    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: Task['status'], updates?: any): Promise<Task> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('tasks')
      .update({ status, ...updates })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const alertsService = {
  async getAll(): Promise<Alert[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUnread(): Promise<Alert[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }
};

export const activityLogService = {
  async getAll(): Promise<ActivityLog[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<ActivityLog[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

export const couriersService = {
  async getAll(): Promise<Courier[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('couriers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getAllWithPerformance(): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('courier_performance')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  async updateLocation(courierId: string, location: any): Promise<any> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('couriers')
      .update({ current_location: { lat: location.latitude, lng: location.longitude } })
      .eq('id', courierId);

    if (error) throw error;
    return { success: true };
  }
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }
};

export const systemUsersService = {
  async getAll(): Promise<SystemUser[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('system_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

export const statisticsService = {
  async getOverallStats(): Promise<any> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('system_statistics')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data || {
      total_beneficiaries: 0,
      verified_beneficiaries: 0,
      active_beneficiaries: 0,
      total_packages: 0,
      delivered_packages: 0,
      active_tasks: 0,
      critical_alerts: 0,
      active_organizations: 0,
      active_couriers: 0
    };
  },

  async getGeographicStats(): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .rpc('get_geographic_statistics');

    if (error) throw error;
    return data || [];
  },

  async generateComprehensiveReport(startDate?: string, endDate?: string): Promise<any> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .rpc('generate_comprehensive_report', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw error;
    return data;
  }
};

export const systemService = {
  async createAutomaticAlerts(): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase.rpc('create_automatic_alerts');
    if (error) throw error;
  },

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .rpc('calculate_distance', { lat1, lon1, lat2, lon2 });

    if (error) throw error;
    return data || 0;
  },

  async generateTrackingNumber(): Promise<string> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase.rpc('generate_tracking_number');

    if (error) throw error;
    return data || '';
  }
};

export const reportsService = {
  async generateReport(type: string, parameters: any = {}): Promise<any> {
    return await statisticsService.generateComprehensiveReport(
      parameters.start_date,
      parameters.end_date
    );
  }
};
