import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
  className?: string;
}

export const KPICard = ({ title, value, icon: Icon, trend, description, className }: KPICardProps) => {
  return (
    <div className={cn(
      'rounded-2xl p-6 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-orange-500/10">
          <Icon className="w-6 h-6 text-orange-500" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            trend.direction === 'up'
              ? 'bg-green-500/10 text-green-600'
              : 'bg-red-500/10 text-red-600'
          )}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </div>
      {description && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {description}
        </div>
      )}
    </div>
  );
};
