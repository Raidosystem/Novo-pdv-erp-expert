import {
  DollarSign,
  ArrowUpCircle,
  Calendar,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KPICard, Card, CardHeader, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useState } from 'react';

const salesByDay = [
  { day: 'Seg', vendas: 4500 },
  { day: 'Ter', vendas: 3800 },
  { day: 'Qua', vendas: 5200 },
  { day: 'Qui', vendas: 4800 },
  { day: 'Sex', vendas: 6100 },
  { day: 'Sáb', vendas: 7500 },
  { day: 'Dom', vendas: 3200 },
];

const salesByCategory = [
  { name: 'Bebidas', value: 35, color: '#f97316' },
  { name: 'Mercearia', value: 28, color: '#22c55e' },
  { name: 'Laticínios', value: 18, color: '#3b82f6' },
  { name: 'Padaria', value: 12, color: '#eab308' },
  { name: 'Outros', value: 7, color: '#6b7280' },
];

const topProducts = [
  { name: 'Coca-Cola 2L', quantity: 145, revenue: 1870.50 },
  { name: 'Pão Francês', quantity: 120, revenue: 1908.00 },
  { name: 'Leite Integral', quantity: 98, revenue: 637.00 },
  { name: 'Arroz 5kg', quantity: 45, revenue: 1300.50 },
  { name: 'Cerveja Skol', quantity: 89, revenue: 445.00 },
];

const periods = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mês' },
  { id: 'year', label: 'Este Ano' },
];

export const SalesReport = () => {
  const { isDarkMode } = useSettingsStore();
  const [period, setPeriod] = useState('week');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Relatório de Vendas
          </h1>
          <p className="text-gray-500 mt-1">
            Análise detalhada de vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">
            <Calendar className="w-4 h-4" />
            Período Personalizado
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              period === p.id
                ? 'bg-orange-500 text-white'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Vendas"
          value={formatCurrency(35100.00)}
          icon={DollarSign}
          trend={{ value: 12.5, direction: 'up' }}
        />
        <KPICard
          title="Número de Vendas"
          value="247"
          icon={FileText}
          trend={{ value: 8.2, direction: 'up' }}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(142.11)}
          icon={TrendingUp}
          trend={{ value: 3.1, direction: 'up' }}
        />
        <KPICard
          title="Lucro Bruto"
          value={formatCurrency(8775.00)}
          icon={ArrowUpCircle}
          trend={{ value: 15.4, direction: 'up' }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day */}
        <Card>
          <CardHeader title="Vendas por Dia" subtitle="Últimos 7 dias" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader title="Vendas por Categoria" />
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {salesByCategory.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-500">
                  {category.name} ({category.value}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader title="Produtos Mais Vendidos" subtitle="Top 5 do período" />
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-400'
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.quantity} unidades vendidas
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-500">
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
