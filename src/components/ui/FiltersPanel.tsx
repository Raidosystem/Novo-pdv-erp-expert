
import { ReactNode, useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'range';
  options?: FilterOption[];
}

interface FiltersPanelProps {
  filters: FilterGroup[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  onClear?: () => void;
  onApply?: () => void;
  className?: string;
  sticky?: boolean;
  collapsible?: boolean;
  children?: ReactNode;
}

export const FiltersPanel = ({
  filters,
  values,
  onChange,
  onClear,
  onApply,
  className,
  sticky = true,
  collapsible = true,
  children,
}: FiltersPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeFiltersCount = Object.values(values).filter(
    (v) => v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        sticky && 'sticky top-0 z-10',
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options && (
                  <select
                    value={values[filter.id] || ''}
                    onChange={(e) => onChange(filter.id, e.target.value)}
                    className={cn(
                      'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    )}
                  >
                    <option value="">Todos</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={values[filter.id] || ''}
                    onChange={(e) => onChange(filter.id, e.target.value)}
                    className={cn(
                      'w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    )}
                  />
                )}
              </div>
            ))}
            {children}
          </div>
          {onApply && (
            <div className="flex justify-end mt-4">
              <Button onClick={onApply}>Aplicar Filtros</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
