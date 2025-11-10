import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    label: string;
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  className?: string;
}

const StatCard = React.memo(function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = ''
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  return (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          
          {trend && (
            <p className={`text-sm mt-1 flex items-center ${trendColorClasses[trend.direction]}`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 ml-1" />
              ) : (
                <TrendingDown className="w-4 h-4 ml-1" />
              )}
              {trend.value} {trend.label}
            </p>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});

export default StatCard;