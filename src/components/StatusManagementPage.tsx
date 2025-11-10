```diff
--- a/src/components/StatusManagementPage.tsx
+++ b/src/components/StatusManagementPage.tsx
@@ -1,6 +1,6 @@
 import React, { useState } from 'react';
-import { UserCheck, CheckCircle, Clock, AlertTriangle, Users, Shield, Camera, FileText, Upload, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';
-import { mockBeneficiaries, type Beneficiary } from '../../data/mockData';
+import { UserCheck, CheckCircle, Clock, AlertTriangle, Users, Star, Camera, FileText, Upload, RefreshCw, Search, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';
+import { mockBeneficiaries, type Beneficiary } from '../../data/mockData'; // Changed Shield to Star
 import BeneficiaryProfileModal from '../BeneficiaryProfileModal';
 import { Button, Card, Input, Badge, ConfirmationModal } from '../ui';
 import { useBeneficiaries } from '../../hooks/useBeneficiaries';
@@ -309,7 +309,7 @@
             <div className="bg-gray-100 p-3 rounded-xl">
               <UserCheck className="w-8 h-8 text-gray-600" />
             </div>
-            <span className="text-3xl font-bold text-gray-600">
+            <span className="text-3xl font-bold text-gray-600"> {/* Changed from Shield to UserCheck */}
               {filteredBeneficiaries.filter(b => b.status === 'suspended').length}
             </span>
           </div>
@@ -470,7 +470,7 @@
           
           {filteredBeneficiaries.filter(b => b.identityStatus === 'pending').length === 0 && (
             <div className="text-center py-8 text-gray-500">
-              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
+              <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" /> {/* Changed from Shield to Star */}
               <p>لا توجد حسابات تحتاج توثيق حالياً</p>
               <p className="text-sm">جميع المستفيدين تم التحقق من هويتهم</p>
             </div>
```