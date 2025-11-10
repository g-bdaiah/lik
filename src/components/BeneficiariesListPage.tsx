```diff
--- a/src/components/BeneficiariesListPage.tsx
+++ b/src/components/BeneficiariesListPage.tsx
@@ -1,6 +1,6 @@
 import React, { useState } from 'react';
-import { Users, Search, Filter, Plus, Eye, Edit, Phone, MessageSquare, CheckCircle, Clock, AlertTriangle, Shield, UserCheck, Download, Star, UserPlus } from 'lucide-react';
-import { type Beneficiary, type SystemUser } from '../../data/mockData';
+import { Users, Search, Filter, Plus, Eye, Edit, Phone, MessageSquare, CheckCircle, Clock, AlertTriangle, Star, UserCheck, Download, UserPlus } from 'lucide-react';
+import { type Beneficiary } from '../../data/mockData';
 import { useBeneficiaries } from '../../hooks/useBeneficiaries';
 import { useAuth } from '../../context/AuthContext';
 import BeneficiaryProfileModal from '../BeneficiaryProfileModal';
@@ -160,7 +160,7 @@
                         <div className="flex items-center">
                           <div className="bg-blue-100 p-2 rounded-lg ml-4">
                             <Users className="w-4 h-4 text-blue-600" />
                           </div>
                           <div>
                             <div className="flex items-center space-x-2 space-x-reverse">
                               <span className="text-sm font-medium text-gray-900">{beneficiary.name}</span>
-                              {beneficiary.identityStatus === 'verified' && (
-                                <Shield className="w-4 h-4 text-green-600" title="موثق" />
+                              {beneficiary.identityStatus === 'verified' && ( // Changed from Shield to Star
+                                <Star className="w-4 h-4 text-green-600" title="موثق" />
                               )}
                             </div>
                             <div className="text-sm text-gray-500">
```