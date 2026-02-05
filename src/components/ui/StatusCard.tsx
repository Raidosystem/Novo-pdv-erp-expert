import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  status: string;
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  info: string;
  icon: LucideIcon;
  actions?: string[];
  onAction?: (action: string) => void;
  className?: string;
}

export const StatusCard = ({
  title,
  status,
  statusColor,
  info,
  icon: Icon,
  actions = [],
  onAction,
  className,
}: StatusCardProps) => {
  const colorClasses = {
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    gray: 'bg-gray-500/10 text-gray-500',
  };

  return (
    <div className={cn(
      'rounded-2xl p-6 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
            {title}
          </div>
          <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
            {status}
          </div>
          <div className="text-sm text-gray-500">
            {info}
          </div>
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[statusColor])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action}
              onClick={() => onAction?.(action)}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
