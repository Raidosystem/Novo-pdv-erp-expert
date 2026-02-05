import {
  Box,
  Package,
  AlertTriangle,
  TrendingDown,
  Search,
} from 'lucide-react';
import { KPICard, Card, Table, StatusChip, Input, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useState } from 'react';

interface StockItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  cost: number;
  status: 'ok' | 'low' | 'critical' | 'excess';
}

const mockStockItems: StockItem[] = [
  { id: '1', name: 'Coca-Cola 2L', category: 'Bebidas', stock: 45, minStock: 20, maxStock: 100, cost: 8.50, status: 'ok' },
  { id: '2', name: 'Pão Francês (kg)', category: 'Padaria', stock: 5, minStock: 20, maxStock: 80, cost: 10.00, status: 'critical' },
  { id: '3', name: 'Leite Integral 1L', category: 'Laticínios', stock: 8, minStock: 15, maxStock: 60, cost: 4.20, status: 'low' },
  { id: '4', name: 'Arroz 5kg', category: 'Mercearia', stock: 120, minStock: 30, maxStock: 100, cost: 20.00, status: 'excess' },
  { id: '5', name: 'Feijão 1kg', category: 'Mercearia', stock: 80, minStock: 25, maxStock: 100, cost: 5.50, status: 'ok' },
  { id: '6', name: 'Óleo de Soja 900ml', category: 'Mercearia', stock: 12, minStock: 20, maxStock: 50, cost: 6.00, status: 'low' },
];

export const StockOverview = () => {
  const { isDarkMode, isDense } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'low' | 'ok' | 'excess'>('all');

  const filteredItems = mockStockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalValue = mockStockItems.reduce((sum, item) => sum + item.stock * item.cost, 0);
  const criticalCount = mockStockItems.filter((i) => i.status === 'critical').length;
  const lowCount = mockStockItems.filter((i) => i.status === 'low').length;

  const columns = [
    {
      key: 'name',
      header: 'Produto',
      render: (item: StockItem) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          )}>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {item.name}
            </div>
            <div className="text-sm text-gray-500">{item.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Estoque Atual',
      render: (item: StockItem) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-bold text-lg',
            item.status === 'critical' ? 'text-red-500' :
            item.status === 'low' ? 'text-yellow-500' :
            item.status === 'excess' ? 'text-blue-500' :
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            {item.stock}
          </span>
          <span className="text-sm text-gray-500">un</span>
        </div>
      ),
    },
    {
      key: 'range',
      header: 'Mín / Máx',
      render: (item: StockItem) => (
        <span className="text-sm text-gray-500">
          {item.minStock} / {item.maxStock}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Valor em Estoque',
      render: (item: StockItem) => (
        <span className="font-medium">
          {formatCurrency(item.stock * item.cost)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StockItem) => (
        <StatusChip
          label={
            item.status === 'critical' ? 'Crítico' :
            item.status === 'low' ? 'Baixo' :
            item.status === 'excess' ? 'Excesso' : 'OK'
          }
          variant={
            item.status === 'critical' ? 'danger' :
            item.status === 'low' ? 'warning' :
            item.status === 'excess' ? 'info' : 'success'
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Estoque
          </h1>
          <p className="text-gray-500 mt-1">
            Visão geral do estoque
          </p>
        </div>
        <Button>
          <Box className="w-4 h-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Valor Total em Estoque"
          value={formatCurrency(totalValue)}
          icon={Box}
          trend={{ value: 5.2, direction: 'up' }}
        />
        <KPICard
          title="Total de Produtos"
          value={mockStockItems.length.toString()}
          icon={Package}
        />
        <KPICard
          title="Produtos Críticos"
          value={criticalCount.toString()}
          icon={AlertTriangle}
          trend={{ value: criticalCount, direction: 'down' }}
        />
        <KPICard
          title="Estoque Baixo"
          value={lowCount.toString()}
          icon={TrendingDown}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'critical', label: 'Crítico' },
              { id: 'low', label: 'Baixo' },
              { id: 'ok', label: 'OK' },
              { id: 'excess', label: 'Excesso' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filter === f.id
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredItems}
        dense={isDense}
      />
    </div>
  );
};
