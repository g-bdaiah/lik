import React, { useState } from 'react';
import { UserCheck, CheckCircle, Clock, AlertTriangle, Users, Shield, Camera, FileText, Upload, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { mockBeneficiaries, type Beneficiary } from '../../data/mockData';
import BeneficiaryProfileModal from '../BeneficiaryProfileModal';
import { Button, Card, Input, Badge, ConfirmationModal } from '../ui';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useErrorLogger } from '../../utils/errorLogger';

interface StatusManagementPageProps {
  onNavigateToIndividualSend: (beneficiaryId: string) => void;
}

export default function StatusManagementPage({ onNavigateToIndividualSend }: StatusManagementPageProps) {
  const { logInfo, logError } = useErrorLogger();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [identityStatusFilter, setIdentityStatusFilter] = useState('all');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Batch actions state
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [showBatchToolbar, setShowBatchToolbar] = useState(false);
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reupload' | 'batch-approve' | 'batch-reupload';
    beneficiaryId?: string;
    beneficiaryIds?: string[];
    beneficiaryName?: string;
  } | null>(null);

  // Get unique values for filters
  const governorates = [...new Set(mockBeneficiaries.map(b => b.detailedAddress.governorate))];
  
  // Apply filters and sorting
  const getFilteredAndSortedBeneficiaries = () => {
    let filtered = [...mockBeneficiaries];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        b.nationalId.includes(searchTerm) ||
        b.phone.includes(searchTerm)
      );
    }
    
    // Apply status filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (identityStatusFilter !== 'all') {
      filtered = filtered.filter(b => b.identityStatus === identityStatusFilter);
    }
    
    if (governorateFilter !== 'all') {
      filtered = filtered.filter(b => b.detailedAddress.governorate === governorateFilter);
    }
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(b => new Date(b.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(b => new Date(b.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(b => new Date(b.createdAt) >= filterDate);
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortColumn) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'nationalId':
          aValue = a.nationalId;
          bValue = b.nationalId;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'lastReceived':
          aValue = new Date(a.lastReceived);
          bValue = new Date(b.lastReceived);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };
  
  const filteredBeneficiaries = getFilteredAndSortedBeneficiaries();
  
  // Apply pagination
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);
  
  // Update batch toolbar visibility
  React.useEffect(() => {
    setShowBatchToolbar(selectedBeneficiaries.length > 0);
  }, [selectedBeneficiaries]);
  
  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, identityStatusFilter, governorateFilter, dateFilter]);

  const handleViewBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDetailsModal(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleSelectBeneficiary = (beneficiaryId: string) => {
    setSelectedBeneficiaries(prev => 
      prev.includes(beneficiaryId) 
        ? prev.filter(id => id !== beneficiaryId)
        : [...prev, beneficiaryId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedBeneficiaries.length === paginatedBeneficiaries.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(paginatedBeneficiaries.map(b => b.id));
    }
  };
  
  const handleClearSelection = () => {
    setSelectedBeneficiaries([]);
  };
  
  // Individual actions
  const handleApproveIdentity = (beneficiaryId: string, beneficiaryName: string) => {
    setConfirmAction({
      type: 'approve',
      beneficiaryId,
      beneficiaryName
    });
    setShowConfirmModal(true);
  };
  
  const handleRequestReupload = (beneficiaryId: string, beneficiaryName: string) => {
    setConfirmAction({
      type: 'reupload',
      beneficiaryId,
      beneficiaryName
    });
    setShowConfirmModal(true);
  };
  
  // Batch actions
  const handleBatchApprove = () => {
    setConfirmAction({
      type: 'batch-approve',
      beneficiaryIds: selectedBeneficiaries
    });
    setShowConfirmModal(true);
  };
  
  const handleBatchReupload = () => {
    setConfirmAction({
      type: 'batch-reupload',
      beneficiaryIds: selectedBeneficiaries
    });
    setShowConfirmModal(true);
  };
  
  // Execute confirmed action
  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    
    try {
      switch (confirmAction.type) {
        case 'approve':
          if (confirmAction.beneficiaryId) {
            // محاكاة تحديث حالة التوثيق إلى "موثق"
            const beneficiaryIndex = mockBeneficiaries.findIndex(b => b.id === confirmAction.beneficiaryId);
            if (beneficiaryIndex !== -1) {
              mockBeneficiaries[beneficiaryIndex].identityStatus = 'verified';
              mockBeneficiaries[beneficiaryIndex].updatedAt = new Date().toISOString();
            }
            logInfo(`تم توثيق هوية المستفيد: ${confirmAction.beneficiaryName}`, 'StatusManagementPage');
          }
          break;
          
        case 'reupload':
          if (confirmAction.beneficiaryId) {
            // محاكاة طلب إعادة رفع الوثائق
            const beneficiaryIndex = mockBeneficiaries.findIndex(b => b.id === confirmAction.beneficiaryId);
            if (beneficiaryIndex !== -1) {
              mockBeneficiaries[beneficiaryIndex].identityStatus = 'pending';
              mockBeneficiaries[beneficiaryIndex].updatedAt = new Date().toISOString();
            }
            logInfo(`تم طلب إعادة رفع الوثائق من المستفيد: ${confirmAction.beneficiaryName}. سيتم إرسال إشعار له لرفع وثائق جديدة.`, 'StatusManagementPage');
          }
          break;
          
        case 'batch-approve':
          if (confirmAction.beneficiaryIds) {
            // محاكاة توثيق جماعي
            confirmAction.beneficiaryIds.forEach(id => {
              const beneficiaryIndex = mockBeneficiaries.findIndex(b => b.id === id);
              if (beneficiaryIndex !== -1) {
                mockBeneficiaries[beneficiaryIndex].identityStatus = 'verified';
                mockBeneficiaries[beneficiaryIndex].updatedAt = new Date().toISOString();
              }
            });
            logInfo(`تم توثيق ${confirmAction.beneficiaryIds.length} مستفيد بشكل جماعي`, 'StatusManagementPage');
            setSelectedBeneficiaries([]);
          }
          break;
          
        case 'batch-reupload':
          if (confirmAction.beneficiaryIds) {
            // محاكاة طلب إعادة رفع جماعي
            confirmAction.beneficiaryIds.forEach(id => {
              const beneficiaryIndex = mockBeneficiaries.findIndex(b => b.id === id);
              if (beneficiaryIndex !== -1) {
                mockBeneficiaries[beneficiaryIndex].identityStatus = 'pending';
                mockBeneficiaries[beneficiaryIndex].updatedAt = new Date().toISOString();
              }
            });
            logInfo(`تم طلب إعادة رفع الوثائق من ${confirmAction.beneficiaryIds.length} مستفيد بشكل جماعي. سيتم إرسال إشعارات لهم لرفع وثائق جديدة.`, 'StatusManagementPage');
            setSelectedBeneficiaries([]);
          }
          break;
      }
      
      // Force re-render by updating state
      setCurrentPage(currentPage);
    } catch (error) {
      logError(error as Error, 'StatusManagementPage');
    }
  };
  
  const getConfirmationMessage = () => {
    if (!confirmAction) return { title: '', message: '', confirmText: '', variant: 'primary' as const };
    
    switch (confirmAction.type) {
      case 'approve':
        return {
          title: 'تأكيد توثيق الهوية',
          message: `هل أنت متأكد من توثيق هوية المستفيد "${confirmAction.beneficiaryName}"؟ سيتم تغيير حالته إلى "موثق" ويصبح مؤهلاً لاستلام المساعدات.`,
          confirmText: 'توثيق الهوية',
          variant: 'success' as const
        };
      case 'reupload':
        return {
          title: 'طلب إعادة رفع الوثائق',
          message: `هل تريد طلب إعادة رفع الوثائق من المستفيد "${confirmAction.beneficiaryName}"؟\n\nسيتم:\n• إرسال إشعار للمستفيد عبر الرسائل النصية\n• تغيير حالة التوثيق إلى "بانتظار إعادة الرفع"\n• إرسال تعليمات واضحة حول الوثائق المطلوبة`,
          confirmText: 'إرسال طلب إعادة الرفع',
          variant: 'warning' as const
        };
      case 'batch-approve':
        return {
          title: 'تأكيد التوثيق الجماعي',
          message: `هل أنت متأكد من توثيق هوية ${confirmAction.beneficiaryIds?.length} مستفيد؟ سيتم تغيير حالتهم جميعاً إلى "موثق".`,
          confirmText: `توثيق ${confirmAction.beneficiaryIds?.length} مستفيد`,
          variant: 'success' as const
        };
      case 'batch-reupload':
        return {
          title: 'طلب إعادة رفع الوثائق (جماعي)',
          message: `هل تريد طلب إعادة رفع الوثائق من ${confirmAction.beneficiaryIds?.length} مستفيد؟\n\nسيتم:\n• إرسال إشعارات جماعية عبر الرسائل النصية\n• تغيير حالة التوثيق لجميع المحددين إلى "بانتظار إعادة الرفع"\n• إرسال تعليمات واضحة لكل مستفيد`,
          confirmText: `إرسال طلب إعادة الرفع لـ ${confirmAction.beneficiaryIds?.length} مستفيد`,
          variant: 'warning' as const
        };
      default:
        return { title: '', message: '', confirmText: '', variant: 'primary' as const };
    }
  };
  
  const confirmationData = getConfirmationMessage();

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button 
            variant="success"
            icon={RefreshCw}
            iconPosition="right"
            onClick={() => {
              // محاكاة تحديث البيانات
              setCurrentPage(1);
              setSelectedBeneficiaries([]);
              logInfo('تم تحديث حالات التوثيق', 'StatusManagementPage');
            }}
          >
            تحديث حالات التوثيق
          </Button>
          <Button 
            variant="primary"
            icon={FileText}
            iconPosition="right"
            onClick={() => {
              // محاكاة تصدير تقرير التوثيق
              const reportData = {
                date: new Date().toISOString(),
                totalBeneficiaries: filteredBeneficiaries.length,
                verified: filteredBeneficiaries.filter(b => b.identityStatus === 'verified').length,
                pending: filteredBeneficiaries.filter(b => b.identityStatus === 'pending').length,
                rejected: filteredBeneficiaries.filter(b => b.identityStatus === 'rejected').length,
                beneficiaries: filteredBeneficiaries.map(b => ({
                  name: b.name,
                  nationalId: b.nationalId,
                  identityStatus: b.identityStatus,
                  createdAt: b.createdAt,
                  updatedAt: b.updatedAt
                }))
              };
              
              const dataStr = JSON.stringify(reportData, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `تقرير_التوثيق_${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
              
              logInfo('تم تصدير تقرير التوثيق', 'StatusManagementPage');
            }}
          >
            تصدير تقرير التوثيق
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              icon={Search}
              iconPosition="right"
              placeholder="البحث (الاسم، رقم الهوية، الهاتف)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              value={identityStatusFilter}
              onChange={(e) => setIdentityStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع حالات التوثيق</option>
              <option value="verified">موثق</option>
              <option value="pending">بانتظار التوثيق</option>
              <option value="rejected">مرفوض التوثيق</option>
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="pending">معلق</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
          
          <div>
            <select
              value={governorateFilter}
              onChange={(e) => setGovernorateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المحافظات</option>
              {governorates.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>عرض {startIndex + 1}-{Math.min(endIndex, filteredBeneficiaries.length)} من {filteredBeneficiaries.length} مستفيد</span>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>عدد العناصر في الصفحة:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Batch Actions Toolbar */}
      {showBatchToolbar && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                تم تحديد {selectedBeneficiaries.length} مستفيد
              </span>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                variant="success"
                size="sm"
                onClick={handleBatchApprove}
              >
                توثيق المحدد ({selectedBeneficiaries.length})
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={handleBatchReupload}
              >
                طلب إعادة رفع ({selectedBeneficiaries.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Minus}
                onClick={handleClearSelection}
              >
                إلغاء التحديد
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Identity Verification Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'verified').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">موثقين</h3>
          <p className="text-sm text-gray-600 mb-4">تم التحقق من هويتهم</p>
          <Button
            variant="success"
            size="sm"
            className="w-full"
            onClick={() => setIdentityStatusFilter('verified')}
          >
            عرض الموثقين
          </Button>
        </Card>

        <Card hover className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-yellow-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'pending').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">بانتظار التوثيق</h3>
          <p className="text-sm text-gray-600 mb-4">يحتاجون مراجعة الوثائق</p>
          <Button
            variant="warning"
            size="sm"
            className="w-full"
            onClick={() => setIdentityStatusFilter('pending')}
          >
            مراجعة الوثائق
          </Button>
        </Card>

        <Card hover className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <span className="text-3xl font-bold text-red-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'rejected').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">مرفوض التوثيق</h3>
          <p className="text-sm text-gray-600 mb-4">يحتاجون إعادة رفع الوثائق</p>
          <Button
            variant="warning"
            size="sm"
            className="w-full"
            onClick={() => setIdentityStatusFilter('rejected')}
          >
            طلب إعادة رفع الوثائق
          </Button>
        </Card>

        <Card hover className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gray-100 p-3 rounded-xl">
              <UserCheck className="w-8 h-8 text-gray-600" />
            </div>
            <span className="text-3xl font-bold text-gray-600">
              {filteredBeneficiaries.filter(b => b.status === 'suspended').length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">حسابات موقوفة</h3>
          <p className="text-sm text-gray-600 mb-4">موقوف</p>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => setStatusFilter('suspended')}
          >
            إدارة الموقوفين
          </Button>
        </Card>
      </div>

      {/* Identity Verification Queue */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">قائمة التحقق من الهوية</h3>
        <p className="text-gray-600 mb-6">المستفيدين في انتظار التحقق من هويتهم ووثائقهم</p>
        
        {/* Sortable Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={selectedBeneficiaries.length === paginatedBeneficiaries.length && paginatedBeneficiaries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span>المستفيد</span>
                    {sortColumn === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('nationalId')}
                >
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span>رقم الهوية</span>
                    {sortColumn === 'nationalId' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المحافظة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة التوثيق
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span>تاريخ الإضافة</span>
                    {sortColumn === 'createdAt' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBeneficiaries.length > 0 ? (
                paginatedBeneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBeneficiaries.includes(beneficiary.id)}
                        onChange={() => handleSelectBeneficiary(beneficiary.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg ml-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{beneficiary.name}</div>
                          <div className="text-sm text-gray-500">{beneficiary.detailedAddress?.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {beneficiary.nationalId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {beneficiary.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {beneficiary.detailedAddress?.governorate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          beneficiary.identityStatus === 'verified' ? 'success' :
                          beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                        }
                        size="sm"
                      >
                        {beneficiary.identityStatus === 'verified' ? 'موثق' :
                         beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(beneficiary.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2 space-x-reverse">
                        {beneficiary.identityStatus === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveIdentity(beneficiary.id, beneficiary.name)}
                            >
                              توثيق
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleRequestReupload(beneficiary.id, beneficiary.name)}
                            >
                              إعادة رفع
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewBeneficiary(beneficiary)}
                        >
                          مراجعة
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد نتائج مطابقة للفلاتر المحددة</p>
                      <p className="text-sm">جرب تعديل معايير البحث أو الفلترة</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              الصفحة {currentPage} من {totalPages} ({filteredBeneficiaries.length} مستفيد إجمالي)
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              
              {/* Page numbers */}
              <div className="flex space-x-1 space-x-reverse">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Legacy verification queue - keeping for backward compatibility */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">قائمة التحقق السريع</h3>
        <p className="text-gray-600 mb-4">المستفيدين الجدد في انتظار التحقق من البيانات (عرض مبسط)</p>
        
        <div className="space-y-4">
          {filteredBeneficiaries.filter(b => b.identityStatus === 'pending').slice(0, 5).map((beneficiary) => (
            <div key={beneficiary.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <UserCheck className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{beneficiary.name}</p>
                  <p className="text-sm text-gray-600">رقم الهوية: {beneficiary.nationalId}</p>
                  <p className="text-xs text-gray-500">تم الإضافة: {new Date(beneficiary.createdAt).toLocaleDateString('en-CA')}</p>
                  <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    <Camera className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {beneficiary.identityImageUrl ? 'تم رفع صورة الهوية' : 'لم يتم رفع صورة الهوية'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleApproveIdentity(beneficiary.id, beneficiary.name)}
                >
                  توثيق الهوية
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleRequestReupload(beneficiary.id, beneficiary.name)}
                >
                  طلب إعادة رفع الوثائق
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewBeneficiary(beneficiary)}
                >
                  مراجعة الوثائق
                </Button>
              </div>
            </div>
          ))}
          
          {filteredBeneficiaries.filter(b => b.identityStatus === 'pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>لا توجد حسابات تحتاج توثيق حالياً</p>
              <p className="text-sm">جميع المستفيدين تم التحقق من هويتهم</p>
            </div>
          )}
        </div>
      </Card>

      {/* Dynamic Identity Verification Issues Summary */}
      <Card>
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">ملخص مشاكل التوثيق</h3>
            <p className="text-gray-600">تحليل ديناميكي لحالات التوثيق الحالية</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">يحتاجون إعادة رفع</h4>
            <p className="text-sm text-red-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'rejected').length} حالة تحتاج إعادة رفع الوثائق
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">بانتظار التوثيق</h4>
            <p className="text-sm text-yellow-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'pending').length} حالة تحتاج مراجعة
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">تم التوثيق</h4>
            <p className="text-sm text-blue-600">
              {filteredBeneficiaries.filter(b => b.identityStatus === 'verified').length} مستفيد موثق
            </p>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={executeConfirmedAction}
        title={confirmationData.title}
        message={confirmationData.message}
        confirmButtonText={confirmationData.confirmText}
        confirmButtonVariant={confirmationData.variant}
        type={confirmationData.variant === 'danger' ? 'danger' : 'warning'}
      />

      {/* Beneficiary Details Modal */}
      {showDetailsModal && selectedBeneficiary && (
        <BeneficiaryProfileModal
          beneficiary={selectedBeneficiary}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBeneficiary(null);
          }}
          onNavigateToIndividualSend={onNavigateToIndividualSend}
          onEditBeneficiary={(beneficiary) => {
            alert('سيتم فتح نموذج تعديل البيانات');
          }}
          onApproveIdentity={(beneficiaryId, beneficiaryName) => {
            setShowDetailsModal(false);
            handleApproveIdentity(beneficiaryId, beneficiaryName);
          }}
          onRejectIdentity={(beneficiaryId, beneficiaryName) => {
            setShowDetailsModal(false);
            handleRejectIdentity(beneficiaryId, beneficiaryName);
          }}
          onRequestReupload={(beneficiaryId, beneficiaryName) => {
            setShowDetailsModal(false);
            handleRequestReupload(beneficiaryId, beneficiaryName);
          }}
        />
      )}
    </div>
  );
}