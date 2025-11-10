import { supabase } from '../lib/supabaseClient';

import {
  beneficiariesService as realBeneficiariesService,
  organizationsService as realOrganizationsService,
  familiesService as realFamiliesService,
  packagesService as realPackagesService,
  packageTemplatesService as realPackageTemplatesService,
  tasksService as realTasksService,
  alertsService as realAlertsService,
  activityLogService as realActivityLogService,
  couriersService as realCouriersService,
  rolesService as realRolesService,
  systemUsersService as realSystemUsersService,
  permissionsService as realPermissionsService,
  statisticsService as realStatisticsService,
  systemService as realSystemService,
  reportsService as realReportsService
} from './supabaseRealService';

import {
  mockBeneficiaries,
  mockOrganizations,
  mockFamilies,
  mockPackages,
  mockTasks,
  mockAlerts,
  mockActivityLog,
  mockCouriers,
  mockPackageTemplates,
  mockRoles,
  mockSystemUsers,
  mockPermissions,
  calculateStats,
  type Beneficiary,
  type Organization,
  type Family,
  type Package as PackageType,
  type Task,
  type Alert,
  type ActivityLog,
  type Courier,
  type PackageTemplate,
  type Role,
  type SystemUser,
  type Permission
} from '../data/mockData';

const USE_REAL_DATABASE = !!supabase;

export const beneficiariesService = USE_REAL_DATABASE ? realBeneficiariesService : {
  async getAll(): Promise<Beneficiary[]> {
    return [...mockBeneficiaries];
  },

  async getAllDetailed(): Promise<Beneficiary[]> {
    return [...mockBeneficiaries];
  },

  async search(searchTerm: string): Promise<Beneficiary[]> {
    return mockBeneficiaries.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nationalId.includes(searchTerm) ||
      b.phone.includes(searchTerm)
    );
  },

  async getById(id: string): Promise<Beneficiary | null> {
    return mockBeneficiaries.find(b => b.id === id) || null;
  },

  async getByOrganization(organizationId: string): Promise<Beneficiary[]> {
    return mockBeneficiaries.filter(b => b.organizationId === organizationId);
  },

  async getByFamily(familyId: string): Promise<Beneficiary[]> {
    return mockBeneficiaries.filter(b => b.familyId === familyId);
  },

  async create(beneficiary: any): Promise<Beneficiary> {
    const newBeneficiary: Beneficiary = {
      id: `new-${Date.now()}`,
      name: beneficiary.name,
      fullName: beneficiary.fullName,
      nationalId: beneficiary.nationalId,
      dateOfBirth: beneficiary.dateOfBirth,
      gender: beneficiary.gender,
      phone: beneficiary.phone,
      address: beneficiary.address,
      detailedAddress: beneficiary.detailedAddress,
      location: beneficiary.location || { lat: 31.3469, lng: 34.3029 },
      organizationId: beneficiary.organizationId,
      familyId: beneficiary.familyId,
      relationToFamily: beneficiary.relationToFamily,
      isHeadOfFamily: false,
      childrenIds: [],
      medicalConditions: [],
      profession: beneficiary.profession,
      maritalStatus: beneficiary.maritalStatus,
      economicLevel: beneficiary.economicLevel,
      membersCount: beneficiary.membersCount,
      additionalDocuments: beneficiary.additionalDocuments || [],
      identityStatus: 'pending',
      identityImageUrl: beneficiary.identityImageUrl,
      status: 'active',
      eligibilityStatus: 'under_review',
      lastReceived: new Date().toISOString().split('T')[0],
      totalPackages: 0,
      notes: beneficiary.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };

    mockBeneficiaries.unshift(newBeneficiary);
    return newBeneficiary;
  },

  async update(id: string, updates: any): Promise<Beneficiary> {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('المستفيد غير موجود');
    }

    mockBeneficiaries[index] = {
      ...mockBeneficiaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return mockBeneficiaries[index];
  },

  async delete(id: string): Promise<void> {
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBeneficiaries.splice(index, 1);
    }
  }
};

export const organizationsService = USE_REAL_DATABASE ? realOrganizationsService : {
  async getAll(): Promise<Organization[]> {
    return [...mockOrganizations];
  },

  async getActive(): Promise<Organization[]> {
    return mockOrganizations.filter(org => org.status === 'active');
  },

  async getById(id: string): Promise<Organization | null> {
    return mockOrganizations.find(org => org.id === id) || null;
  }
};

export const familiesService = USE_REAL_DATABASE ? realFamiliesService : {
  async getAll(): Promise<Family[]> {
    return [...mockFamilies];
  },

  async getById(id: string): Promise<Family | null> {
    return mockFamilies.find(f => f.id === id) || null;
  }
};

export const packagesService = USE_REAL_DATABASE ? realPackagesService : {
  async getAll(): Promise<PackageType[]> {
    return [...mockPackages];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<PackageType[]> {
    return mockPackages.filter(p => p.beneficiaryId === beneficiaryId);
  },

  async create(packageData: any): Promise<PackageType> {
    const newPackage: PackageType = {
      id: `pkg-${Date.now()}`,
      name: packageData.name,
      type: packageData.type,
      description: packageData.description,
      value: packageData.value,
      funder: packageData.funder,
      organizationId: packageData.organizationId,
      familyId: packageData.familyId,
      beneficiaryId: packageData.beneficiaryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveredAt: packageData.deliveredAt,
      expiryDate: packageData.expiryDate
    };

    mockPackages.unshift(newPackage);
    return newPackage;
  }
};

export const packageTemplatesService = USE_REAL_DATABASE ? realPackageTemplatesService : {
  async getAll(): Promise<PackageTemplate[]> {
    return [...mockPackageTemplates];
  },

  async getByOrganization(organizationId: string): Promise<PackageTemplate[]> {
    return mockPackageTemplates.filter(t => t.organization_id === organizationId);
  },

  async createWithItems(template: any, items: any[]): Promise<PackageTemplate> {
    const newTemplate: PackageTemplate = {
      id: `template-${Date.now()}`,
      name: template.name,
      type: template.type,
      organization_id: template.organization_id,
      description: template.description,
      contents: items,
      status: 'active',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      totalWeight: items.reduce((sum, item) => sum + (item.weight || 0), 0),
      estimatedCost: template.estimatedCost || 0
    };

    mockPackageTemplates.unshift(newTemplate);
    return newTemplate;
  }
};

export const tasksService = USE_REAL_DATABASE ? realTasksService : {
  async getAll(): Promise<Task[]> {
    return [...mockTasks];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Task[]> {
    return mockTasks.filter(t => t.beneficiaryId === beneficiaryId);
  },

  async updateStatus(id: string, status: Task['status'], updates?: any): Promise<Task> {
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('المهمة غير موجودة');
    }

    mockTasks[index] = {
      ...mockTasks[index],
      status,
      ...updates
    };

    return mockTasks[index];
  }
};

export const alertsService = USE_REAL_DATABASE ? realAlertsService : {
  async getAll(): Promise<Alert[]> {
    return [...mockAlerts];
  },

  async getUnread(): Promise<Alert[]> {
    return mockAlerts.filter(a => !a.isRead);
  },

  async markAsRead(id: string): Promise<void> {
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
    }
  }
};

export const activityLogService = USE_REAL_DATABASE ? realActivityLogService : {
  async getAll(): Promise<ActivityLog[]> {
    return [...mockActivityLog];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<ActivityLog[]> {
    return mockActivityLog.filter(a => a.beneficiaryId === beneficiaryId);
  }
};

export const couriersService = USE_REAL_DATABASE ? realCouriersService : {
  async getAll(): Promise<Courier[]> {
    return [...mockCouriers];
  },

  async getAllWithPerformance(): Promise<Courier[]> {
    return [...mockCouriers];
  },

  async updateLocation(courierId: string, location: any): Promise<any> {
    const courier = mockCouriers.find(c => c.id === courierId);
    if (courier) {
      courier.currentLocation = { lat: location.latitude, lng: location.longitude };
    }
    return { success: true };
  }
};

export const rolesService = USE_REAL_DATABASE ? realRolesService : {
  async getAll(): Promise<Role[]> {
    return [...mockRoles];
  }
};

export const systemUsersService = USE_REAL_DATABASE ? realSystemUsersService : {
  async getAll(): Promise<SystemUser[]> {
    return [...mockSystemUsers];
  }
};

export const permissionsService = USE_REAL_DATABASE ? realPermissionsService : {
  async getAll(): Promise<Permission[]> {
    return [...mockPermissions];
  }
};

export const statisticsService = USE_REAL_DATABASE ? realStatisticsService : {
  async getOverallStats(): Promise<any> {
    return calculateStats();
  },

  async getGeographicStats(): Promise<any[]> {
    return [
      { area_name: 'خان يونس', total_beneficiaries: 156, delivered_packages: 89, pending_packages: 23, success_rate: 79.5 },
      { area_name: 'غزة', total_beneficiaries: 234, delivered_packages: 187, pending_packages: 34, success_rate: 84.6 },
      { area_name: 'رفح', total_beneficiaries: 98, delivered_packages: 67, pending_packages: 18, success_rate: 78.8 },
      { area_name: 'الوسطى', total_beneficiaries: 123, delivered_packages: 95, pending_packages: 15, success_rate: 86.4 },
      { area_name: 'شمال غزة', total_beneficiaries: 87, delivered_packages: 62, pending_packages: 12, success_rate: 83.8 }
    ];
  },

  async generateComprehensiveReport(startDate?: string, endDate?: string): Promise<any> {
    const stats = calculateStats();
    return {
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || new Date().toISOString().split('T')[0]
      },
      beneficiaries: {
        total: stats.totalBeneficiaries,
        verified: Math.floor(stats.totalBeneficiaries * 0.85),
        active: Math.floor(stats.totalBeneficiaries * 0.92)
      },
      packages: {
        total: stats.totalPackages,
        delivered: stats.deliveredPackages,
        pending: stats.totalPackages - stats.deliveredPackages
      },
      performance: {
        delivery_rate: stats.deliveryRate,
        average_delivery_time: 2.3
      },
      geographic_distribution: await this.getGeographicStats()
    };
  }
};

export const systemService = USE_REAL_DATABASE ? realSystemService : {
  async createAutomaticAlerts(): Promise<void> {
    return;
  },

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  async generateTrackingNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK-${date}-${random}`;
  }
};

export const inventoryService = {
  async getByDistributionCenter(centerId: string): Promise<any[]> {
    return [];
  },

  async getLowStock(): Promise<any[]> {
    return [];
  }
};

export const categoriesService = {
  async getAllBeneficiaryCategories(): Promise<any[]> {
    return [];
  }
};

export const notificationsService = {
  async send(notification: any): Promise<any> {
    return { success: true };
  },

  async getByUser(userId: string): Promise<any[]> {
    return [];
  }
};

export const feedbackService = {
  async create(feedback: any): Promise<any> {
    return { success: true };
  },

  async getByCourier(courierId: string): Promise<any[]> {
    return [];
  }
};

export const geographicService = {
  async getAllAreas(): Promise<any[]> {
    return [];
  },

  async getByType(type: string): Promise<any[]> {
    return [];
  }
};

export const distributionCentersService = {
  async getAll(): Promise<any[]> {
    return [];
  },

  async getActive(): Promise<any[]> {
    return [];
  }
};

export const settingsService = {
  async getSetting(category: string, key: string): Promise<any> {
    return null;
  },

  async updateSetting(category: string, key: string, value: string): Promise<any> {
    return { success: true };
  },

  async getByCategory(category: string): Promise<any[]> {
    return [];
  }
};

export const emergencyContactsService = {
  async getByBeneficiary(beneficiaryId: string): Promise<any[]> {
    return [];
  },

  async create(contact: any): Promise<any> {
    return { success: true };
  }
};

export const reportsService = USE_REAL_DATABASE ? realReportsService : {
  async generateReport(type: string, parameters: any = {}): Promise<any> {
    return await statisticsService.generateComprehensiveReport(
      parameters.start_date,
      parameters.end_date
    );
  }
};