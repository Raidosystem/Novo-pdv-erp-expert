import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusChipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        primary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

interface StatusChipProps extends VariantProps<typeof statusChipVariants> {
  label: string;
  dot?: boolean;
  className?: string;
}

export const StatusChip = ({ label, variant, size, dot = true, className }: StatusChipProps) => {
  return (
    <span className={cn(statusChipVariants({ variant, size }), className)}>
      {dot && (
        <span className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'neutral' && 'bg-gray-500',
          variant === 'primary' && 'bg-orange-500',
        )} />
      )}
      {label}
    </span>
  );
};
