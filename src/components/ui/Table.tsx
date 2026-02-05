import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  dense?: boolean;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  isLoading,
  dense = false,
  sortColumn,
  sortDirection,
  onSort,
}: TableProps<T>) {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  return (
    <div className="rounded-xl border overflow-hidden border-gray-200 dark:border-gray-800">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300',
                  dense ? 'py-2' : 'py-3',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'border-t border-gray-100 dark:border-gray-800 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 text-sm text-gray-700 dark:text-gray-300',
                      dense ? 'py-2' : 'py-3'
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as Record<string, unknown>)[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const TableSkeleton = ({ columns, rows }: { columns: number; rows: number }) => (
  <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div className="h-12 bg-gray-100 dark:bg-gray-800" />
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-4 p-4">
          {[...Array(columns)].map((_, j) => (
            <div
              key={j}
              className="h-4 bg-gray-100 dark:bg-gray-800 rounded flex-1"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);
