import React from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Database, Wifi, WifiOff } from 'lucide-react';

interface SupabaseConnectionStatusProps {
  showDetails?: boolean;
}

export default function SupabaseConnectionStatus({ showDetails = false }: SupabaseConnectionStatusProps) {
  // Supabase معطل - النظام يعمل بالبيانات الوهمية
  const isConnected = false;
  const isLoading = false;
  const error = 'Supabase معطل - النظام يعمل بالبيانات الوهمية';

  return (
    <div className={`flex items-center space-x-3 space-x-reverse text-blue-600 ${showDetails ? 'bg-blue-50 p-3 rounded-lg border border-blue-200' : ''}`}>
      <Database className="w-4 h-4" />
      <div className="flex-1">
        <span className="text-sm font-medium">النظام يعمل بالبيانات الوهمية</span>
        {showDetails && (
          <p className="text-xs text-blue-500 mt-1">Supabase معطل - جميع البيانات وهمية للتطوير</p>
        )}
      </div>
    </div>
  );
}