import React, { useState, useEffect } from 'react';
import { Clock, User, CheckCircle, AlertCircle, Package, FileText, Edit, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Card } from '../ui';
import type { Database } from '../../types/database';

type ActivityLog = Database['public']['Tables']['activity_log']['Row'];

interface ActivityLogTabProps {
  beneficiaryId: string;
}

export default function ActivityLogTab({ beneficiaryId }: ActivityLogTabProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivityLog();
  }, [beneficiaryId]);

  const loadActivityLog = async () => {
    try {
      setIsLoading(true);
      if (!supabase) throw new Error('Supabase not initialized');

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities((data || []) as ActivityLog[]);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل السجل');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      create: User,
      verify: CheckCircle,
      approve: CheckCircle,
      update: Edit,
      deliver: Package,
      review: Eye
    };
    return icons[type] || FileText;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      create: 'text-blue-600 bg-blue-50',
      verify: 'text-green-600 bg-green-50',
      approve: 'text-green-600 bg-green-50',
      update: 'text-orange-600 bg-orange-50',
      deliver: 'text-purple-600 bg-purple-50',
      review: 'text-gray-600 bg-gray-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600 inline ml-2" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أنشطة</h3>
          <p className="text-gray-600">لم يتم تسجيل أي أنشطة حتى الآن</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          سجل الأنشطة ({activities.length})
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          يعرض هذا السجل جميع الأنشطة والتغييرات التي حدثت على حسابك
        </p>
      </Card>

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);

          return (
            <Card key={activity.id} className="relative">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>

                  {activity.details && (
                    <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user_name}
                    </span>
                    {activity.role && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {activity.role}
                      </span>
                    )}
                    {activity.source && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {activity.source === 'admin' ? 'إدارة' :
                         activity.source === 'beneficiary' ? 'مستفيد' :
                         activity.source === 'system' ? 'نظام' : 'عام'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">معلومة:</p>
            <p>
              يتم تسجيل جميع الأنشطة المهمة التي تحدث على حسابك لضمان الشفافية والأمان.
              يمكنك مراجعة هذا السجل في أي وقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
