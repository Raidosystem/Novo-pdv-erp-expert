import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-800 animate-pulse',
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-12 w-12" variant="circular" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
    {[...Array(columns)].map((_, i) => (
      <Skeleton key={i} className="h-4 flex-1" />
    ))}
  </div>
);
