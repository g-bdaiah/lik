import { supabase } from '../lib/supabaseClient';

export interface Service {
  id: string;
  service_key: string;
  service_name: string;
  service_name_en: string;
  description?: string;
  category: string;
  is_enabled: boolean;
  is_critical: boolean;
  icon: string;
  color: string;
  enabled_at?: string;
  disabled_at?: string;
  enabled_by?: string;
  disabled_by?: string;
  enabled_by_name?: string;
  disabled_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceActivityLog {
  id: string;
  service_id: string;
  service_key: string;
  action: 'enabled' | 'disabled';
  performed_by?: string;
  performed_by_name?: string;
  reason?: string;
  created_at: string;
}

export interface ServiceStatusResponse {
  success: boolean;
  enabled: boolean;
  message?: string;
}

export interface ToggleServiceResponse {
  success: boolean;
  message: string;
}

export const servicesManagementService = {
  async isServiceEnabled(serviceKey: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('get_service_status', {
        p_service_key: serviceKey,
      });

      if (error) {
        console.error('Error checking service status:', error);
        return false;
      }

      return data?.enabled === true;
    } catch (error) {
      console.error('Exception checking service status:', error);
      return false;
    }
  },

  async getServiceStatus(serviceKey: string): Promise<ServiceStatusResponse> {
    if (!supabase) {
      return { success: false, enabled: false, message: 'Supabase not initialized' };
    }

    try {
      const { data, error } = await supabase.rpc('get_service_status', {
        p_service_key: serviceKey,
      });

      if (error) {
        return { success: false, enabled: false, message: error.message };
      }

      return {
        success: true,
        enabled: data?.enabled === true,
        message: data?.message,
      };
    } catch (error) {
      return {
        success: false,
        enabled: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async toggleService(
    serviceKey: string,
    enabled: boolean,
    reason?: string
  ): Promise<ToggleServiceResponse> {
    if (!supabase) {
      return { success: false, message: 'Supabase not initialized' };
    }

    try {
      const { data, error } = await supabase.rpc('toggle_service', {
        p_service_key: serviceKey,
        p_enabled: enabled,
        p_reason: reason || null,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: data?.success === true,
        message: data?.message || (enabled ? 'Service enabled successfully' : 'Service disabled successfully'),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getAllServices(): Promise<Service[]> {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase
      .from('services_management')
      .select(`
        *,
        enabled_by_user:system_users!services_management_enabled_by_fkey(full_name),
        disabled_by_user:system_users!services_management_disabled_by_fkey(full_name)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return (data || []).map((service: any) => ({
      ...service,
      enabled_by_name: service.enabled_by_user?.full_name,
      disabled_by_name: service.disabled_by_user?.full_name,
    }));
  },

  async getServiceActivityLog(
    serviceKey?: string,
    limit: number = 50
  ): Promise<ServiceActivityLog[]> {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    let query = supabase
      .from('services_activity_log')
      .select(`
        *,
        performer:system_users(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (serviceKey) {
      query = query.eq('service_key', serviceKey);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activity log: ${error.message}`);
    }

    return (data || []).map((log: any) => ({
      ...log,
      performed_by_name: log.performer?.full_name,
    }));
  },

  async getServiceStatistics(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    critical: number;
    byCategory: Record<string, { total: number; enabled: number }>;
  }> {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data: services, error } = await supabase
      .from('services_management')
      .select('category, is_enabled, is_critical');

    if (error) {
      throw new Error(`Failed to fetch service statistics: ${error.message}`);
    }

    const stats = {
      total: services?.length || 0,
      enabled: services?.filter((s) => s.is_enabled).length || 0,
      disabled: services?.filter((s) => !s.is_enabled).length || 0,
      critical: services?.filter((s) => s.is_critical).length || 0,
      byCategory: {} as Record<string, { total: number; enabled: number }>,
    };

    services?.forEach((service) => {
      if (!stats.byCategory[service.category]) {
        stats.byCategory[service.category] = { total: 0, enabled: 0 };
      }
      stats.byCategory[service.category].total++;
      if (service.is_enabled) {
        stats.byCategory[service.category].enabled++;
      }
    });

    return stats;
  },
};
