// Mock Database - سيتم استبدالها بقاعدة بيانات حقيقية لاحقاً
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'organization' | 'family';
  organizationId?: string;
  familyId?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  beneficiariesCount: number;
  packagesCount: number;
  completionRate: number;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  packagesAvailable: number;
  templatesCount: number;
  isPopular: boolean;
}

export interface Family {
  id: string;
  name: string;
  headOfFamily: string;
  headOfFamilyId: string; // ID of the beneficiary who is head of family
  familyMembers: string[]; // Array of all family member IDs
  totalChildren: number;
  totalMedicalCases: number;
  averageAge: number;
  phone: string;
  membersCount: number;
  packagesDistributed: number;
  completionRate: number;
  location: string;
  createdAt: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  detailedAddress: {
    governorate: string;
    city: string;
    district: string;
    street: string;
    additionalInfo: string;
  };
  location: { lat: number; lng: number };
  organizationId?: string;
  familyId?: string;
  relationToFamily?: string;
  // Family hierarchy fields
  isHeadOfFamily: boolean;
  spouseId?: string | null;
  childrenIds: string[];
  parentId?: string | null; // For children, points to head of family
  medicalConditions: string[];
  profession: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  economicLevel: 'very_poor' | 'poor' | 'moderate' | 'good';
  membersCount: number;
  additionalDocuments: { name: string; url: string; type: string; }[];
  identityStatus: 'verified' | 'pending' | 'rejected';
  identityImageUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  eligibilityStatus: 'eligible' | 'under_review' | 'rejected';
  lastReceived: string;
  totalPackages: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PackageTemplate {
  id: string;
  name: string;
  type: 'food' | 'medical' | 'clothing' | 'hygiene' | 'emergency';
  organization_id: string;
  description: string;
  contents: PackageItem[];
  status: 'active' | 'draft' | 'inactive';
  createdAt: string;
  usageCount: number;
  totalWeight: number;
  estimatedCost: number;
}

export interface PackageItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  notes?: string;
}

export interface Request {
  id: string;
  beneficiaryId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

export interface Document {
  id: string;
  beneficiaryId: string;
  type: 'national_id' | 'family_card' | 'address_proof' | 'income_certificate' | 'medical_report' | 'other';
  name: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: string;
  verifiedDate?: string;
  rejectedDate?: string;
  verifiedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  fileUrl: string;
  notes: string;
}

export interface Package {
  id: string;
  name: string;
  type: string;
  description: string;
  value: number;
  funder: string;
  organizationId?: string;
  familyId?: string;
  beneficiaryId?: string;
  status: 'pending' | 'assigned' | 'in_delivery' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
  expiryDate?: string;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'busy' | 'offline';
  rating: number;
  completedTasks: number;
  currentLocation?: { lat: number; lng: number };
  isHumanitarianApproved: boolean;
}

export interface Task {
  id: string;
  packageId: string;
  beneficiaryId: string;
  courierId?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'delivered' | 'failed' | 'rescheduled';
  createdAt: string;
  scheduledAt?: string;
  deliveredAt?: string;
  deliveryLocation?: { lat: number; lng: number };
  notes?: string;
  courierNotes?: string;
  deliveryProofImageUrl?: string;
  digitalSignatureImageUrl?: string;
  estimatedArrivalTime?: string;
  remainingDistance?: number;
  photoUrl?: string;
  failureReason?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  type: 'create' | 'verify' | 'approve' | 'update' | 'deliver' | 'review';
  beneficiaryId?: string;
  details?: string;
}

export interface Alert {
  id: string;
  type: 'delayed' | 'failed' | 'expired' | 'urgent';
  title: string;
  description: string;
  relatedId: string;
  relatedType: 'package' | 'beneficiary' | 'task';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'delete' | 'approve' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  associatedId: string | null; // معرف المؤسسة أو العائلة المرتبطة
  associatedType: 'organization' | 'family' | null; // نوع الكيان المرتبط
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

// Define UUIDs for main entities first to link them
const org1Id = uuidv4();
const org2Id = uuidv4();
const org3Id = uuidv4();
const crsOrgId = uuidv4(); // معرف مؤسسة CRS

const family1Id = uuidv4();
const family2Id = uuidv4();
const family3Id = uuidv4();

const instUnrwaId = uuidv4();
const instWfpId = uuidv4();
const instRedCrescentId = uuidv4();
const instWhoId = uuidv4();
const instUnicefId = uuidv4();

const perm1Id = uuidv4();
const perm2Id = uuidv4(); // تعديل جميع البيانات
const perm3Id = uuidv4(); // حذف البيانات
const perm4Id = uuidv4(); // إدارة المستخدمين
const perm5Id = uuidv4(); // إدارة الأدوار
const perm6Id = uuidv4(); // عرض التقارير
const perm7Id = uuidv4(); // عرض المستفيدين
const perm8Id = uuidv4(); // إدارة المستفيدين
const perm9Id = uuidv4(); // عرض الطلبات
const perm10Id = uuidv4(); // موافقة الطلبات
const perm11Id = uuidv4(); // رفض الطلبات
const perm12Id = uuidv4(); // عرض التسليمات
const perm13Id = uuidv4(); // تحديث حالة التسليم

const roleAdminId = uuidv4();
const roleOrgSupervisorId = uuidv4();
const roleCourierId = uuidv4();
const roleReviewerId = uuidv4();
const roleFamilySupervisorId = uuidv4(); // دور مشرف العائلة

const userAdminId = uuidv4();
const userSupervisorId = uuidv4();
const userCourierId = uuidv4();

const beneficiary1Id = uuidv4();
const beneficiary2Id = uuidv4();
const beneficiary3Id = uuidv4();
const beneficiary4Id = uuidv4();
const beneficiary5Id = uuidv4();
const beneficiary6Id = uuidv4();
const beneficiary7Id = uuidv4();

const package1Id = uuidv4();
const package2Id = uuidv4();
const package3Id = uuidv4();

const courier1Id = uuidv4();
const courier2Id = uuidv4();
const courier3Id = uuidv4();

const task1Id = uuidv4();
const task2Id = uuidv4();
const task3Id = uuidv4();

const alert1Id = uuidv4();
const alert2Id = uuidv4();
const alert3Id = uuidv4();

const activity1Id = uuidv4();
const activity2Id = uuidv4();
const activity3Id = uuidv4();
const activity4Id = uuidv4();
const activity5Id = uuidv4();

// Mock Data
export const mockOrganizations: Organization[] = [
  {
    id: org1Id,
    name: 'جمعية الهلال الأحمر الفلسطيني - غزة',
    type: 'طعام - ملابس',
    location: 'خان يونس - الكتيبة',
    contactPerson: 'أحمد أبو سالم',
    phone: '0501234567',
    email: 'info@redcrescent-gaza.org',
    beneficiariesCount: 342,
    packagesCount: 87,
    completionRate: 92,
    status: 'active',
    createdAt: '2024-01-15',
    packagesAvailable: 189,
    templatesCount: 6,
    isPopular: true
  },
  {
    id: org2Id,
    name: 'مؤسسة أطباء بلا حدود - غزة',
    type: 'أدوية - معدات طبية',
    location: 'غزة - الشجاعية',
    contactPerson: 'د. فاطمة الغزاوي',
    phone: '0559876543',
    email: 'gaza@msf.org',
    beneficiariesCount: 156,
    packagesCount: 23,
    completionRate: 75,
    status: 'pending',
    createdAt: '2024-02-01',
    packagesAvailable: 95,
    templatesCount: 4,
    isPopular: true
  },
  {
    id: org3Id,
    name: 'جمعية الإغاثة الإسلامية - فلسطين',
    type: 'مواد غذائية',
    location: 'خان يونس - بني سهيلا',
    contactPerson: 'خالد أبو يوسف',
    phone: '0567891234',
    email: 'palestine@islamic-relief.org',
    beneficiariesCount: 89,
    packagesCount: 45,
    completionRate: 88,
    status: 'active',
    createdAt: '2024-01-20',
    packagesAvailable: 156,
    templatesCount: 7,
    isPopular: false
  },
  {
    id: instUnrwaId,
    name: 'الأونروا',
    type: 'منظمة دولية',
    location: 'غزة - مكتب رئيسي',
    contactPerson: 'د. أحمد المدير',
    phone: '+970591111111',
    email: 'gaza@unrwa.org',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-01',
    packagesAvailable: 1021,
    templatesCount: 8,
    isPopular: true
  },
  {
    id: instWfpId,
    name: 'برنامج الغذاء العالمي',
    type: 'منظمة دولية',
    location: 'غزة - مكتب إقليمي',
    contactPerson: 'سارة المنسقة',
    phone: '+970592222222',
    email: 'gaza@wfp.org',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-05',
    packagesAvailable: 234,
    templatesCount: 5,
    isPopular: true
  },
  {
    id: instRedCrescentId,
    name: 'الهلال الأحمر الفلسطيني',
    type: 'منظمة محلية',
    location: 'غزة - المقر الرئيسي',
    contactPerson: 'محمد المدير',
    phone: '+970593333333',
    email: 'info@palestinianredcrescent.org',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-10',
    packagesAvailable: 189,
    templatesCount: 6,
    isPopular: true
  },
  {
    id: instWhoId,
    name: 'منظمة الصحة العالمية',
    type: 'منظمة دولية',
    location: 'غزة - مكتب صحي',
    contactPerson: 'د. فاطمة الطبيبة',
    phone: '+970594444444',
    email: 'gaza@who.int',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-15',
    packagesAvailable: 95,
    templatesCount: 4,
    isPopular: true
  },
  {
    id: instUnicefId,
    name: 'اليونيسف',
    type: 'منظمة دولية',
    location: 'غزة - مكتب الأطفال',
    contactPerson: 'نور المنسقة',
    phone: '+970595555555',
    email: 'gaza@unicef.org',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-20',
    packagesAvailable: 156,
    templatesCount: 7,
    isPopular: false
  },
  {
    id: uuidv4(),
    name: 'CRS',
    type: 'منظمة دولية',
    location: 'غزة - مكتب رئيسي',
    contactPerson: 'جون سميث',
    phone: '+970591234567',
    email: 'info@crs.org',
    beneficiariesCount: 0,
    packagesCount: 0,
    completionRate: 0,
    status: 'active',
    createdAt: '2024-01-25',
    packagesAvailable: 500,
    templatesCount: 3,
    isPopular: true
  },
  {
    id: crsOrgId,
    name: 'CRS - الخدمات الكاثوليكية للإغاثة',
    type: 'منظمة دولية',
    location: 'غزة - مكتب رئيسي',
    contactPerson: 'جون سميث',
    phone: '+970591234567',
    email: 'info@crs-gaza.org',
    beneficiariesCount: 45,
    packagesCount: 12,
    completionRate: 87,
    status: 'active',
    createdAt: '2024-01-25',
    packagesAvailable: 500,
    templatesCount: 3,
    isPopular: true
  }
];

// Mock Package Templates Data
export const mockPackageTemplates: PackageTemplate[] = [
  {
    id: uuidv4(),
    name: 'طرد رمضان كريم 2024',
    type: 'food',
    organization_id: instUnrwaId,
    description: 'طرد غذائي شامل لشهر رمضان المبارك',
    contents: [
      { id: uuidv4(), name: 'أرز بسمتي', quantity: 5, unit: 'كيلو', weight: 5 },
      { id: uuidv4(), name: 'زيت زيتون', quantity: 1, unit: 'لتر', weight: 1 },
      { id: uuidv4(), name: 'سكر أبيض', quantity: 2, unit: 'كيلو', weight: 2 },
      { id: uuidv4(), name: 'طحين', quantity: 3, unit: 'كيلو', weight: 3 },
      { id: uuidv4(), name: 'عدس أحمر', quantity: 1, unit: 'كيلو', weight: 1 },
      { id: uuidv4(), name: 'تونة معلبة', quantity: 6, unit: 'علبة', weight: 1.2 },
      { id: uuidv4(), name: 'معجون طماطم', quantity: 3, unit: 'علبة', weight: 0.6 },
      { id: uuidv4(), name: 'حليب مجفف', quantity: 2, unit: 'علبة', weight: 0.8 }
    ],
    status: 'active',
    createdAt: '2024-01-10',
    usageCount: 247,
    totalWeight: 14.6,
    estimatedCost: 50
  },
  {
    id: uuidv4(),
    name: 'طرد الشتاء الدافئ',
    type: 'clothing',
    organization_id: instRedCrescentId,
    description: 'طرد ملابس شتوية للعائلات',
    contents: [
      { id: uuidv4(), name: 'بطانية صوف', quantity: 2, unit: 'قطعة', weight: 3 },
      { id: uuidv4(), name: 'جاكيت شتوي للكبار', quantity: 2, unit: 'قطعة', weight: 1.5 },
      { id: uuidv4(), name: 'جاكيت شتوي للأطفال', quantity: 3, unit: 'قطعة', weight: 0.8 },
      { id: uuidv4(), name: 'جوارب صوفية', quantity: 6, unit: 'زوج', weight: 0.3 },
      { id: uuidv4(), name: 'قبعة صوفية', quantity: 4, unit: 'قطعة', weight: 0.2 },
      { id: uuidv4(), name: 'قفازات', quantity: 4, unit: 'زوج', weight: 0.1 }
    ],
    status: 'active',
    createdAt: '2024-01-08',
    usageCount: 156,
    totalWeight: 5.9,
    estimatedCost: 75
  },
  {
    id: uuidv4(),
    name: 'طرد الإسعافات الأولية',
    type: 'medical',
    organization_id: instWhoId,
    description: 'طرد طبي للإسعافات الأولية',
    contents: [
      { id: uuidv4(), name: 'ضمادات طبية', quantity: 10, unit: 'قطعة', weight: 0.5 },
      { id: uuidv4(), name: 'مطهر جروح', quantity: 2, unit: 'زجاجة', weight: 0.4 },
      { id: uuidv4(), name: 'مسكنات', quantity: 2, unit: 'علبة', weight: 0.2 },
      { id: uuidv4(), name: 'خافض حرارة', quantity: 1, unit: 'علبة', weight: 0.1 },
      { id: uuidv4(), name: 'شاش طبي', quantity: 5, unit: 'لفة', weight: 0.3 }
    ],
    status: 'draft',
    createdAt: '2024-01-12',
    usageCount: 0,
    totalWeight: 1.5,
    estimatedCost: 30
  }
];

export const mockFamilies: Family[] = [
  {
    id: family1Id,
    name: 'عائلة آل أبو عامر',
    headOfFamily: 'محمد أبو عامر',
    headOfFamilyId: beneficiary1Id,
    familyMembers: [beneficiary1Id, beneficiary2Id, beneficiary3Id, beneficiary4Id],
    totalChildren: 2, // خالد وسارة
    totalMedicalCases: 3, // محمد (ضغط + سكري)، فاطمة (أنيميا)، سارة (ربو)
    averageAge: 32, // متوسط عمر الأسرة
    phone: '0591234567',
    membersCount: 4, // الأب + الأم + ابنين
    packagesDistributed: 45,
    completionRate: 93,
    location: 'خان يونس - الكتيبة',
    createdAt: '2024-01-10'
  },
  {
    id: family2Id,
    name: 'عائلة آل النجار',
    headOfFamily: 'أحمد النجار',
    headOfFamilyId: beneficiary5Id,
    familyMembers: [beneficiary5Id, beneficiary6Id],
    totalChildren: 0, // لا يوجد أطفال بعد
    totalMedicalCases: 1, // أحمد (إعاقة حركية)
    averageAge: 35, // متوسط عمر الأسرة
    phone: '0592345678',
    membersCount: 2, // الزوج + الزوجة
    packagesDistributed: 11,
    completionRate: 85,
    location: 'خان يونس - القرارة',
    createdAt: '2024-02-05'
  },
  {
    id: family3Id,
    name: 'عائلة آل البرغوثي',
    headOfFamily: 'يوسف البرغوثي',
    headOfFamilyId: beneficiary7Id,
    familyMembers: [beneficiary7Id],
    totalChildren: 0, // أعزب
    totalMedicalCases: 0, // لا توجد حالات مرضية
    averageAge: 32, // عمر يوسف
    phone: '0593456789',
    membersCount: 1, // يوسف فقط
    packagesDistributed: 1,
    completionRate: 100,
    location: 'خان يونس - الفخاري',
    createdAt: '2024-01-25'
  }
];

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: beneficiary1Id,
    name: 'محمد خالد أبو عامر',
    fullName: 'محمد خالد عبدالله أبو عامر',
    nationalId: '900123456',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    phone: '0591234567',
    address: 'خان يونس - الكتيبة - شارع الشهداء',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'خان يونس',
      district: 'الكتيبة',
      street: 'شارع الشهداء',
      additionalInfo: 'بجانب مسجد الكتيبة الكبير'
    },
    location: { lat: 31.3469, lng: 34.3029 },
    organizationId: org1Id,
    profession: 'عامل بناء',
    maritalStatus: 'married',
    economicLevel: 'poor',
    membersCount: 6,
    isHeadOfFamily: true,
    spouseId: beneficiary2Id, // فاطمة أحمد الفرا كزوجة
    childrenIds: [beneficiary3Id, beneficiary4Id], // خالد وسارة كأبناء غير متزوجين
    parentId: null,
    medicalConditions: ['ضغط الدم', 'السكري'],
    additionalDocuments: [
      { name: 'إثبات سكن', url: 'https://example.com/residence1.pdf', type: 'residence_proof' },
      { name: 'شهادة دخل', url: 'https://example.com/income1.pdf', type: 'income_certificate' }
    ],
    identityStatus: 'verified',
    identityImageUrl: 'https://example.com/id1.jpg',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-20',
    totalPackages: 5,
    notes: 'مستفيد منتظم، يحتاج مساعدة شهرية',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary2Id,
    name: 'فاطمة أحمد أبو عامر', // تغيير اللقب لتعكس الزواج
    fullName: 'فاطمة أحمد محمد أبو عامر',
    nationalId: '900234567',
    dateOfBirth: '1978-07-22',
    gender: 'female',
    phone: '0592345678',
    address: 'خان يونس - الكتيبة - شارع الشهداء', // نفس عنوان الزوج
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'خان يونس',
      district: 'الكتيبة',
      street: 'شارع الشهداء',
      additionalInfo: 'بجانب مسجد الكتيبة الكبير'
    },
    location: { lat: 31.3200, lng: 34.3500 },
    organizationId: org1Id,
    isHeadOfFamily: false,
    spouseId: beneficiary1Id, // محمد خالد أبو عامر كزوج
    childrenIds: [],
    parentId: null,
    medicalConditions: ['أنيميا'],
    profession: 'ربة منزل',
    maritalStatus: 'married', // تغيير من أرملة إلى متزوجة
    economicLevel: 'poor',
    membersCount: 0, // الزوجة لا تعول أحداً بشكل مستقل
    additionalDocuments: [
      { name: 'عقد زواج', url: 'https://example.com/marriage_cert2.pdf', type: 'marriage_certificate' },
      { name: 'إثبات سكن', url: 'https://example.com/residence2.pdf', type: 'residence_proof' }
    ],
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-17',
    totalPackages: 3,
    notes: 'زوجة رب الأسرة محمد أبو عامر',
    createdAt: '2024-02-01',
    updatedAt: '2024-12-17',
    createdBy: 'org_admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary3Id,
    name: 'خالد محمد أبو عامر', // ابن محمد أبو عامر
    fullName: 'خالد محمد عبدالله أبو عامر',
    nationalId: '900345678',
    dateOfBirth: '2005-11-10', // عمر 19 سنة - غير متزوج
    gender: 'male',
    phone: '0593456789',
    address: 'خان يونس - الكتيبة - شارع الشهداء', // نفس عنوان الأسرة
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'خان يونس',
      district: 'الكتيبة',
      street: 'شارع الشهداء',
      additionalInfo: 'بجانب مسجد الكتيبة الكبير'
    },
    location: { lat: 31.3469, lng: 34.3029 },
    familyId: family1Id,
    relationToFamily: 'ابن',
    isHeadOfFamily: false,
    spouseId: null,
    childrenIds: [],
    parentId: beneficiary1Id, // محمد أبو عامر كوالد
    medicalConditions: [],
    profession: 'طالب جامعي',
    maritalStatus: 'single',
    economicLevel: 'poor',
    membersCount: 0, // الابن لا يعول أحداً
    additionalDocuments: [
      { name: 'شهادة طالب', url: 'https://example.com/student_cert3.pdf', type: 'student_certificate' }
    ],
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-21',
    totalPackages: 2,
    notes: 'ابن محمد أبو عامر - طالب جامعي',
    createdAt: '2024-01-10',
    updatedAt: '2024-12-21',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary4Id,
    name: 'سارة محمد أبو عامر', // ابنة محمد أبو عامر
    fullName: 'سارة محمد عبدالله أبو عامر',
    nationalId: '900456789',
    dateOfBirth: '2008-05-18', // عمر 16 سنة - غير متزوجة
    gender: 'female',
    phone: '0594567890',
    address: 'خان يونس - الكتيبة - شارع الشهداء', // نفس عنوان الأسرة
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'خان يونس',
      district: 'الكتيبة',
      street: 'شارع الشهداء',
      additionalInfo: 'بجانب مسجد الكتيبة الكبير'
    },
    location: { lat: 31.3469, lng: 34.3029 },
    familyId: family1Id,
    relationToFamily: 'ابنة',
    isHeadOfFamily: false,
    spouseId: null,
    childrenIds: [],
    parentId: beneficiary1Id, // محمد أبو عامر كوالد
    medicalConditions: ['ربو'],
    profession: 'طالبة ثانوية',
    maritalStatus: 'single',
    economicLevel: 'poor',
    membersCount: 0, // الابنة لا تعول أحداً
    additionalDocuments: [
      { name: 'شهادة طالبة', url: 'https://example.com/student_cert4.pdf', type: 'student_certificate' }
    ],
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-18',
    totalPackages: 1,
    notes: 'ابنة محمد أبو عامر - طالبة ثانوية',
    createdAt: '2024-01-12',
    updatedAt: '2024-12-18',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: beneficiary5Id,
    name: 'أحمد عبدالله النجار',
    fullName: 'أحمد عبدالله سليم النجار',
    nationalId: '900567890',
    dateOfBirth: '1982-09-30',
    gender: 'male',
    phone: '0595678901',
    address: 'خان يونس - القرارة - شارع فلسطين',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'القرارة',
      district: 'القرارة الشرقية',
      street: 'شارع فلسطين',
      additionalInfo: 'بجانب مسجد القرارة الكبير'
    },
    location: { lat: 31.3000, lng: 34.3600 },
    organizationId: org2Id,
    isHeadOfFamily: true,
    spouseId: beneficiary6Id, // نورا إبراهيم الحلو كزوجة
    childrenIds: [],
    parentId: null,
    medicalConditions: ['إعاقة حركية'],
    profession: 'سائق تاكسي',
    maritalStatus: 'married',
    economicLevel: 'poor',
    membersCount: 5,
    additionalDocuments: [
      { name: 'تقرير طبي', url: 'https://example.com/medical5.pdf', type: 'medical_report' },
      { name: 'إثبات سكن', url: 'https://example.com/residence5.pdf', type: 'residence_proof' }
    ],
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-19',
    totalPackages: 8,
    notes: 'من ذوي الاحتياجات الخاصة',
    createdAt: '2024-01-08',
    updatedAt: '2024-12-19',
    createdBy: 'org_admin',
    updatedBy: 'org_admin'
  },
  {
    id: beneficiary6Id,
    name: 'نورا إبراهيم النجار', // تغيير اللقب لتعكس الزواج
    fullName: 'نورا إبراهيم عبدالرحمن النجار',
    nationalId: '900678901',
    dateOfBirth: '1988-12-05',
    gender: 'female',
    phone: '0596789012',
    address: 'خان يونس - القرارة - شارع فلسطين', // نفس عنوان الزوج
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'القرارة',
      district: 'القرارة الشرقية',
      street: 'شارع فلسطين',
      additionalInfo: 'بجانب مسجد القرارة الكبير'
    },
    location: { lat: 31.3000, lng: 34.3600 },
    organizationId: org2Id,
    isHeadOfFamily: false,
    spouseId: beneficiary5Id, // أحمد عبدالله النجار كزوج
    childrenIds: [],
    parentId: null,
    medicalConditions: [],
    profession: 'خياطة',
    maritalStatus: 'married', // تغيير من مطلقة إلى متزوجة
    economicLevel: 'poor',
    membersCount: 0, // الزوجة لا تعول أحداً بشكل مستقل
    additionalDocuments: [
      { name: 'عقد زواج', url: 'https://example.com/marriage6.pdf', type: 'marriage_certificate' }
    ],
    identityStatus: 'verified',
    status: 'active',
    eligibilityStatus: 'eligible',
    lastReceived: '2024-12-19',
    totalPackages: 3,
    notes: 'زوجة أحمد النجار - تعمل في الخياطة',
    createdAt: '2024-03-01',
    updatedAt: '2024-12-19',
    createdBy: 'org_admin',
    updatedBy: 'org_admin'
  },
  {
    id: beneficiary7Id,
    name: 'يوسف حسن البرغوثي',
    fullName: 'يوسف حسن محمد البرغوثي',
    nationalId: '900789012',
    dateOfBirth: '1992-08-12',
    gender: 'male',
    phone: '0597890123',
    address: 'خان يونس - الفخاري - شارع الأقصى',
    detailedAddress: {
      governorate: 'خان يونس',
      city: 'الفخاري',
      district: 'الفخاري الشرقية',
      street: 'شارع الأقصى',
      additionalInfo: 'منطقة الحدود الشرقية'
    },
    location: { lat: 31.2950, lng: 34.3700 },
    organizationId: org1Id,
    isHeadOfFamily: true,
    spouseId: null, // غير متزوج حالياً
    childrenIds: [],
    parentId: null,
    medicalConditions: [],
    profession: 'عاطل عن العمل',
    maritalStatus: 'single', // تغيير إلى أعزب
    economicLevel: 'very_poor',
    membersCount: 1, // يعول نفسه فقط
    additionalDocuments: [
      { name: 'إثبات سكن', url: 'https://example.com/residence7.pdf', type: 'residence_proof' },
      { name: 'شهادة عدم عمل', url: 'https://example.com/unemployment7.pdf', type: 'unemployment_certificate' }
    ],
    identityStatus: 'pending',
    status: 'pending',
    eligibilityStatus: 'under_review',
    lastReceived: '2024-11-30',
    totalPackages: 1,
    notes: 'مستفيد جديد - أعزب - تم رفع صورة الهوية للمراجعة',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
    createdBy: 'org_admin',
    updatedBy: 'org_admin'
  }
];

export const mockPackages: Package[] = [
  {
    id: package1Id,
    name: 'طرد مواد غذائية أساسية',
    type: 'مواد غذائية',
    description: 'أرز، سكر، زيت، معلبات، تمر',
    value: 50,
    funder: 'الأونروا',
    organizationId: org1Id,
    beneficiaryId: beneficiary1Id,
    status: 'delivered',
    createdAt: '2024-12-20',
    deliveredAt: '2024-12-20',
    expiryDate: '2024-12-30'
  },
  {
    id: package2Id,
    name: 'طرد ملابس شتوية',
    type: 'ملابس',
    description: 'معاطف، بطانيات، ملابس داخلية',
    value: 75,
    funder: 'الهلال الأحمر الفلسطيني',
    organizationId: org1Id,
    beneficiaryId: beneficiary2Id,
    status: 'in_delivery',
    createdAt: '2024-12-19'
  },
  {
    id: package3Id,
    name: 'طرد أدوية أساسية',
    type: 'أدوية',
    description: 'مسكنات، أدوية ضغط، فيتامينات',
    value: 30,
    funder: 'منظمة الصحة العالمية',
    organizationId: org2Id,
    beneficiaryId: beneficiary3Id,
    status: 'pending',
    createdAt: '2024-12-18',
    expiryDate: '2025-06-18'
  }
];

export const mockCouriers: Courier[] = [
  {
    id: courier1Id,
    name: 'محمد علي أبو عامر',
    phone: '0591234567',
    email: 'mohammed@courier.com',
    status: 'active',
    rating: 4.8,
    completedTasks: 156,
    currentLocation: { lat: 31.3469, lng: 34.3029 },
    isHumanitarianApproved: true
  },
  {
    id: courier2Id,
    name: 'أحمد خالد الفرا',
    phone: '0592345678',
    email: 'ahmed@courier.com',
    status: 'busy',
    rating: 4.6,
    completedTasks: 89,
    currentLocation: { lat: 31.3200, lng: 34.3500 },
    isHumanitarianApproved: true
  },
  {
    id: courier3Id,
    name: 'سالم محمد النجار',
    phone: '0593456789',
    email: 'salem@courier.com',
    status: 'offline',
    rating: 4.9,
    completedTasks: 234,
    currentLocation: { lat: 31.3100, lng: 34.3800 },
    isHumanitarianApproved: true
  }
];

export const mockTasks: Task[] = [
  {
    id: task1Id,
    packageId: package1Id,
    beneficiaryId: beneficiary1Id,
    courierId: courier1Id,
    status: 'delivered',
    createdAt: '2024-12-20',
    scheduledAt: '2024-12-20',
    deliveredAt: '2024-12-20',
    deliveryLocation: { lat: 31.5017, lng: 34.4668 },
    notes: 'تم التسليم بنجاح للمستفيد',
    courierNotes: 'المستفيد كان متواجداً في المنزل، تم التسليم مباشرة',
    deliveryProofImageUrl: 'https://example.com/delivery_proof1.jpg',
    digitalSignatureImageUrl: 'https://example.com/signature1.jpg'
  },
  {
    id: task2Id,
    packageId: package2Id,
    beneficiaryId: beneficiary2Id,
    courierId: courier2Id,
    status: 'in_progress',
    createdAt: '2024-12-19',
    scheduledAt: '2024-12-21',
    estimatedArrivalTime: '2024-12-21T14:30:00',
    remainingDistance: 2.5,
    notes: 'في الطريق للتسليم'
  },
  {
    id: task3Id,
    packageId: package3Id,
    beneficiaryId: beneficiary3Id,
    status: 'pending',
    createdAt: '2024-12-18',
    notes: 'في انتظار تعيين مندوب'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: alert1Id,
    type: 'delayed',
    title: 'طرود متأخرة في قطاع غزة',
    description: '23 طرد في منطقة الشجاعية لم يتم تسليمها',
    relatedId: package2Id, // Example: related to a package
    relatedType: 'package',
    priority: 'critical',
    isRead: false,
    createdAt: '2024-12-21'
  },
  {
    id: alert2Id,
    type: 'failed',
    title: 'فشل في التسليم',
    description: '5 طرود تحتاج تحديث عنوان',
    relatedId: task3Id, // Example: related to a task
    relatedType: 'task',
    priority: 'high',
    isRead: false,
    createdAt: '2024-12-20'
  },
  {
    id: alert3Id,
    type: 'expired',
    title: 'طرود قاربت على الانتهاء',
    description: '12 طرد تنتهي صلاحيتها خلال 3 أيام',
    relatedId: package1Id, // Example: related to a package
    relatedType: 'package',
    priority: 'medium',
    isRead: true,
    createdAt: '2024-12-19'
  }
];

// Mock Activity Log with beneficiary connections
export const mockActivityLog: ActivityLog[] = [
  {
    id: activity1Id,
    action: 'تم تسليم طرد مواد غذائية',
    user: 'محمد علي أبو عامر',
    role: 'مندوب',
    timestamp: '2024-12-21T10:30:00',
    type: 'deliver',
    beneficiaryId: beneficiary1Id,
    details: 'تم التسليم بنجاح مع توثيق بالصورة'
  },
  {
    id: activity2Id,
    action: 'تحديث بيانات المستفيد',
    user: 'فاطمة أحمد المشرفة',
    role: 'مشرف',
    timestamp: '2024-12-20T14:15:00',
    type: 'update',
    beneficiaryId: beneficiary1Id,
    details: 'تم تحديث رقم الهاتف والعنوان'
  },
  {
    id: activity3Id,
    action: 'التحقق من الهوية',
    user: 'أحمد محمد الإدمن',
    role: 'مدير',
    timestamp: '2024-12-19T09:45:00',
    type: 'verify',
    beneficiaryId: beneficiary1Id,
    details: 'تم قبول وثائق الهوية والموافقة'
  },
  {
    id: activity4Id,
    action: 'إضافة مستفيد جديد',
    user: 'سارة المنسقة',
    role: 'منسق',
    timestamp: '2024-12-18T11:20:00',
    type: 'create',
    beneficiaryId: beneficiary2Id,
    details: 'تم تسجيل المستفيد في النظام'
  },
  {
    id: activity5Id,
    action: 'فشل في التسليم',
    user: 'خالد المندوب',
    role: 'مندوب',
    timestamp: '2024-12-17T16:30:00',
    type: 'deliver',
    beneficiaryId: beneficiary3Id,
    details: 'العنوان غير صحيح، يحتاج تحديث'
  }
];

// Permissions Data
export const mockPermissions: Permission[] = [
  { id: perm1Id, name: 'قراءة جميع البيانات', description: 'عرض جميع البيانات في النظام', category: 'read' },
  { id: perm2Id, name: 'تعديل جميع البيانات', description: 'تعديل أي بيانات في النظام', category: 'write' },
  { id: perm3Id, name: 'حذف البيانات', description: 'حذف البيانات من النظام', category: 'delete' },
  { id: perm4Id, name: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين', category: 'manage' },
  { id: perm5Id, name: 'إدارة الأدوار', description: 'إنشاء وتعديل الأدوار', category: 'manage' },
  { id: perm6Id, name: 'عرض التقارير', description: 'الوصول للتقارير والإحصائيات', category: 'read' },
  { id: perm7Id, name: 'عرض المستفيدين', description: 'عرض قائمة المستفيدين', category: 'read' },
  { id: perm8Id, name: 'إدارة المستفيدين', description: 'إضافة وتعديل المستفيدين', category: 'write' },
  { id: perm9Id, name: 'عرض الطلبات', description: 'عرض طلبات المساعدة', category: 'read' },
  { id: perm10Id, name: 'موافقة الطلبات', description: 'الموافقة على طلبات المساعدة', category: 'approve' },
  { id: perm11Id, name: 'رفض الطلبات', description: 'رفض طلبات المساعدة', category: 'approve' },
  { id: perm12Id, name: 'عرض التسليمات', description: 'عرض حالة التسليمات', category: 'read' },
  { id: perm13Id, name: 'تحديث حالة التسليم', description: 'تحديث حالة تسليم الطرود', category: 'write' }
];

export const mockRoles: Role[] = [
  {
    id: roleAdminId,
    name: 'مدير النظام',
    description: 'صلاحيات كاملة على جميع أجزاء النظام',
    permissions: [perm1Id, perm2Id, perm3Id, perm4Id, perm5Id, perm6Id],
    userCount: 2,
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: roleOrgSupervisorId,
    name: 'مشرف المؤسسة',
    description: 'إدارة المستفيدين والطلبات الخاصة بالمؤسسة',
    permissions: [perm7Id, perm8Id, perm9Id, perm6Id, perm12Id],
    userCount: 8,
    isActive: true,
    createdAt: '2024-01-05'
  },
  {
    id: roleCourierId,
    name: 'مندوب التوزيع',
    description: 'تحديث حالة التسليمات والتوزيع',
    permissions: [perm12Id, perm13Id, perm7Id],
    userCount: 15,
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: roleReviewerId,
    name: 'مراجع الطلبات',
    description: 'مراجعة وموافقة طلبات المساعدة',
    permissions: [perm9Id, perm10Id, perm11Id, perm7Id],
    userCount: 5,
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: roleFamilySupervisorId,
    name: 'مشرف العائلة',
    description: 'إدارة أفراد العائلة والطرود الخاصة بها',
    permissions: [perm7Id, perm8Id, perm12Id],
    userCount: 3,
    isActive: true,
    createdAt: '2024-01-20'
  }
];

export const mockSystemUsers: SystemUser[] = [
  {
    id: userAdminId,
    name: 'أحمد محمد الإدمن',
    email: 'admin@humanitarian.ps',
    phone: '0501234567',
    roleId: roleAdminId,
    associatedId: null, // الإدمن لا يرتبط بمؤسسة أو عائلة محددة
    associatedType: null,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-01'
  },
  {
    id: userSupervisorId,
    name: 'فاطمة أحمد المشرفة',
    email: 'supervisor@redcrescent-gaza.org',
    phone: '0559876543',
    roleId: roleOrgSupervisorId,
    associatedId: org1Id, // مرتبطة بجمعية الهلال الأحمر
    associatedType: 'organization',
    status: 'active',
    lastLogin: '2024-12-20',
    createdAt: '2024-01-05'
  },
  {
    id: userCourierId,
    name: 'محمد علي المندوب',
    email: 'courier@humanitarian.ps',
    phone: '0567891234',
    roleId: roleCourierId,
    associatedId: null, // المندوب لا يرتبط بمؤسسة محددة
    associatedType: null,
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-10'
  },
  // مستخدمين إضافيين للمؤسسات المختلفة
  {
    id: uuidv4(),
    name: 'د. فاطمة الغزاوي - أطباء بلا حدود',
    email: 'supervisor@msf-gaza.org',
    phone: '0559876543',
    roleId: roleOrgSupervisorId,
    associatedId: org2Id, // مرتبطة بمؤسسة أطباء بلا حدود
    associatedType: 'organization',
    status: 'active',
    lastLogin: '2024-12-20',
    createdAt: '2024-01-05'
  },
  {
    id: uuidv4(),
    name: 'خالد أبو يوسف - الإغاثة الإسلامية',
    email: 'supervisor@islamic-relief.org',
    phone: '0567891234',
    roleId: roleOrgSupervisorId,
    associatedId: org3Id, // مرتبط بجمعية الإغاثة الإسلامية
    associatedType: 'organization',
    status: 'active',
    lastLogin: '2024-12-19',
    createdAt: '2024-01-08'
  },
  {
    id: uuidv4(),
    name: 'د. أحمد المدير - الأونروا',
    email: 'supervisor@unrwa-gaza.org',
    phone: '0591111111',
    roleId: roleOrgSupervisorId,
    associatedId: instUnrwaId, // مرتبط بالأونروا
    associatedType: 'organization',
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-01'
  },
  {
    id: uuidv4(),
    name: 'جون سميث - CRS',
    email: 'supervisor@crs-gaza.org',
    phone: '0591234567',
    roleId: roleOrgSupervisorId,
    associatedId: uuidv4(), // معرف CRS (سنحتاج لإضافته)
    associatedType: 'organization',
    status: 'active',
    lastLogin: '2024-12-20',
    createdAt: '2024-01-25'
  },
  // مستخدمين للعائلات
  {
    id: uuidv4(),
    name: 'محمد أبو عامر - رب الأسرة',
    email: 'family@abuamer.ps',
    phone: '0591234567',
    roleId: uuidv4(), // دور مشرف العائلة
    associatedId: family1Id, // مرتبط بعائلة آل أبو عامر
    associatedType: 'family',
    status: 'active',
    lastLogin: '2024-12-21',
    createdAt: '2024-01-10'
  },
  {
    id: uuidv4(),
    name: 'سارة الفرا - مبادرة عائلية',
    email: 'family@alfarra.ps',
    phone: '0592345678',
    roleId: uuidv4(), // دور مشرف العائلة
    associatedId: family2Id, // مرتبط بمبادرة عائلة الفرا
    associatedType: 'family',
    status: 'active',
    lastLogin: '2024-12-20',
    createdAt: '2024-02-05'
  }
];

// Helper functions for data manipulation
export const getFamilyMembers = (familyId: string): Beneficiary[] => {
  return mockBeneficiaries.filter(b => b.familyId === familyId);
};

export const getHeadOfFamily = (familyId: string): Beneficiary | undefined => {
  return mockBeneficiaries.find(b => b.familyId === familyId && b.isHeadOfFamily);
};

export const getSpouse = (beneficiaryId: string): Beneficiary | undefined => {
  const beneficiary = mockBeneficiaries.find(b => b.id === beneficiaryId);
  if (!beneficiary?.spouseId) return undefined;
  return mockBeneficiaries.find(b => b.id === beneficiary.spouseId);
};

export const getChildren = (parentId: string): Beneficiary[] => {
  const parent = mockBeneficiaries.find(b => b.id === parentId);
  if (!parent?.childrenIds) return [];
  return mockBeneficiaries.filter(b => parent.childrenIds.includes(b.id));
};

// Legacy export for backward compatibility
export const beneficiaries = mockBeneficiaries;

export const getFamilyHierarchy = (familyId: string) => {
  const headOfFamily = getHeadOfFamily(familyId);
  if (!headOfFamily) return null;
  
  const spouse = getSpouse(headOfFamily.id);
  const children = getChildren(headOfFamily.id);
  
  // حساب عدد الأطفال (أقل من 18 سنة)
  const totalChildren = children.filter(child => {
    const birthDate = new Date(child.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < 18;
  }).length;
  
  return {
    headOfFamily,
    spouse,
    children,
    totalChildren,
    totalMembers: 1 + (spouse ? 1 : 0) + children.length,
    totalMedicalCases: [
      ...headOfFamily.medicalConditions,
      ...(spouse?.medicalConditions || []),
      ...children.flatMap(child => child.medicalConditions)
    ].length,
    medicalCases: [
      ...headOfFamily.medicalConditions.map(condition => ({ member: headOfFamily.name, condition })),
      ...(spouse?.medicalConditions.map(condition => ({ member: spouse.name, condition })) || []),
      ...children.flatMap(child => 
        child.medicalConditions.map(condition => ({ member: child.name, condition }))
      )
    ]
  };
};

export const validateFamilyMemberAddition = (
  beneficiaryData: Partial<Beneficiary>, 
  targetFamilyId: string
): { isValid: boolean; error?: string } => {
  // التحقق من حالة الزواج
  if (beneficiaryData.maritalStatus === 'married') {
    return {
      isValid: false,
      error: 'لا يمكن إضافة شخص متزوج إلى أسرة أخرى. يجب إنشاء أسرة منفصلة للأشخاص المتزوجين.'
    };
  }
  
  // التحقق من وجود رب الأسرة
  const headOfFamily = getHeadOfFamily(targetFamilyId);
  if (!headOfFamily) {
    return {
      isValid: false,
      error: 'لا يمكن العثور على رب الأسرة لهذه العائلة.'
    };
  }
  
  // التحقق من عدم تكرار رقم الهوية
  const existingBeneficiary = mockBeneficiaries.find(b => b.nationalId === beneficiaryData.nationalId);
  if (existingBeneficiary) {
    return {
      isValid: false,
      error: `رقم الهوية ${beneficiaryData.nationalId} مسجل مسبقاً باسم ${existingBeneficiary.name}.`
    };
  }
  
  return { isValid: true };
};
export const getOrganizationById = (id: string): Organization | undefined => {
  return mockOrganizations.find(org => org.id === id);
};

export const getFamilyById = (id: string): Family | undefined => {
  return mockFamilies.find(family => family.id === id);
};

export const getBeneficiariesByOrganization = (organizationId: string): Beneficiary[] => {
  return mockBeneficiaries.filter(b => b.organizationId === organizationId);
};

export const getBeneficiariesByFamily = (familyId: string): Beneficiary[] => {
  return mockBeneficiaries.filter(b => b.familyId === familyId);
};

export const getPackagesByBeneficiary = (beneficiaryId: string): Package[] => {
  return mockPackages.filter(p => p.beneficiaryId === beneficiaryId);
};

export const getTasksByStatus = (status: Task['status']): Task[] => {
  return mockTasks.filter(t => t.status === status);
};

export const getUnreadAlerts = (): Alert[] => {
  return mockAlerts.filter(a => !a.isRead);
};

export const getCriticalAlerts = (): Alert[] => {
  return mockAlerts.filter(a => a.priority === 'critical' && !a.isRead);
};

export const getTemplatesByOrganization = (organizationId: string): PackageTemplate[] => {
  return mockPackageTemplates.filter(template => template.organization_id === organizationId);
};

export const getTemplateById = (id: string): PackageTemplate | undefined => {
  return mockPackageTemplates.find(template => template.id === id);
};

// Statistics calculations
export const calculateStats = () => {
  const totalBeneficiaries = mockBeneficiaries.length;
  const totalPackages = mockPackages.length;
  const deliveredPackages = mockPackages.filter(p => p.status === 'delivered').length;
  const activeTasks = mockTasks.filter(t => ['pending', 'assigned', 'in_progress'].includes(t.status)).length;
  const criticalAlerts = getCriticalAlerts().length;
  
  return {
    totalBeneficiaries,
    totalPackages,
    deliveredPackages,
    activeTasks,
    criticalAlerts,
    deliveryRate: totalPackages > 0 ? Math.round((deliveredPackages / totalPackages) * 100) : 0
  };
};