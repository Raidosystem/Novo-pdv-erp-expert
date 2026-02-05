import { AlertCircle, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

export const InsightCard = ({
  type,
  title,
  message,
  action,
  onAction,
  className,
}: InsightCardProps) => {
  const config = {
    success: {
      icon: TrendingUp,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-500',
      textColor: 'text-green-800 dark:text-green-300',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800 dark:text-yellow-300',
    },
    danger: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500',
      textColor: 'text-red-800 dark:text-red-300',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800 dark:text-blue-300',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div className={cn(
      'rounded-xl p-4 border',
      bgColor,
      borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5', iconColor)} />
        <div className="flex-1">
          <div className={cn('font-semibold', textColor)}>{title}</div>
          <div className={cn('text-sm mt-1 opacity-80', textColor)}>{message}</div>
          {action && (
            <button
              onClick={onAction}
              className={cn('text-sm font-medium mt-2 hover:underline', iconColor)}
            >
              {action} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
