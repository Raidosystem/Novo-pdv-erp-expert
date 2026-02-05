import { useMemo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPICard, Card, CardHeader, InsightCard, StatusChip } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { 
  useVendasDia, 
  useProdutosBaixoEstoque, 
  useVendas,
  useClientes,
  useContasAVencer,
  useResumoFinanceiro,
} from '@/hooks';

export const Dashboard = () => {
  const { isDarkMode } = useSettingsStore();
  
  // Hooks de dados reais
  const { data: vendasDia, loading: loadingVendas } = useVendasDia();
  const { data: produtosBaixoEstoque, loading: loadingEstoque } = useProdutosBaixoEstoque();
  const { data: vendasRecentes, loading: loadingRecentes } = useVendas({ status: 'finalizada' }, 1, 5);
  const { total: totalClientes } = useClientes({ ativo: true }, 1, 1);
  const { data: contasVencer } = useContasAVencer(1, 'receber');
  const { data: resumoFinanceiro } = useResumoFinanceiro();

  // Dados mockados para o gráfico (será substituído por dados reais)
  const salesData = useMemo(() => [
    { day: 'Seg', vendas: 4500 },
    { day: 'Ter', vendas: 3800 },
    { day: 'Qua', vendas: 5200 },
    { day: 'Qui', vendas: 4800 },
    { day: 'Sex', vendas: 6100 },
    { day: 'Sáb', vendas: 7500 },
    { day: 'Dom', vendas: 3200 },
  ], []);

  // Calcular alertas
  const alertasEstoque = produtosBaixoEstoque?.length || 0;
  const valorContasHoje = contasVencer?.reduce((acc, c) => acc + c.valor, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn(
          'text-3xl font-bold',
          isDarkMode ? 'text-white' : 'text-gray-900'
        )}>
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Visão geral do seu negócio hoje
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Vendas Hoje"
          value={loadingVendas ? '...' : formatCurrency(vendasDia?.total || 0)}
          icon={DollarSign}
          trend={{ value: 12.5, direction: 'up' }}
        />
        <KPICard
          title="Número de Vendas"
          value={loadingVendas ? '...' : String(vendasDia?.quantidade || 0)}
          icon={ShoppingCart}
          trend={{ value: 8.2, direction: 'up' }}
        />
        <KPICard
          title="Ticket Médio"
          value={loadingVendas ? '...' : formatCurrency(vendasDia?.ticket_medio || 0)}
          icon={TrendingUp}
          trend={{ value: 3.1, direction: 'up' }}
        />
        <KPICard
          title="Clientes Ativos"
          value={totalClientes?.toLocaleString() || '0'}
          icon={Users}
          trend={{ value: 2.4, direction: 'up' }}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Vendas da Semana" 
            subtitle="Últimos 7 dias"
            action={
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                Ver relatório <ArrowUpRight className="w-4 h-4" />
              </button>
            }
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
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

        {/* Recent Sales */}
        <Card>
          <CardHeader 
            title="Vendas Recentes"
            action={
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Ver todas
              </button>
            }
          />
          <div className="space-y-4">
            {loadingRecentes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : vendasRecentes.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma venda hoje</p>
            ) : (
              vendasRecentes.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <div className={cn(
                      'font-medium',
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      {sale.cliente?.nome || 'Cliente não identificado'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sale.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'font-semibold',
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      {formatCurrency(sale.total)}
                    </div>
                    <StatusChip
                      label={sale.status === 'finalizada' ? 'Pago' : 'Pendente'}
                      variant={sale.status === 'finalizada' ? 'success' : 'warning'}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Insights & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Center */}
        <Card>
          <CardHeader title="Central de Ações" subtitle="Recomendações do sistema" />
          <div className="space-y-3">
            {alertasEstoque > 0 && (
              <InsightCard
                type="warning"
                title="Estoque Baixo"
                message={`${alertasEstoque} produtos estão abaixo do estoque mínimo`}
                action="Ver produtos"
              />
            )}
            {valorContasHoje > 0 && (
              <InsightCard
                type="info"
                title="Contas a Receber"
                message={`${formatCurrency(valorContasHoje)} em títulos vencem hoje`}
                action="Ver detalhes"
              />
            )}
            {(resumoFinanceiro?.saldo || 0) > 0 && (
              <InsightCard
                type="success"
                title="Saldo Positivo"
                message={`Saldo do período: ${formatCurrency(resumoFinanceiro?.saldo || 0)}`}
              />
            )}
            {alertasEstoque === 0 && valorContasHoje === 0 && (
              <p className="text-center text-gray-500 py-4">Nenhum alerta no momento</p>
            )}
          </div>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader 
            title="Produtos em Baixo Estoque" 
            subtitle="Atenção necessária"
            action={
              <span className="flex items-center gap-1 text-yellow-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {alertasEstoque} alertas
              </span>
            }
          />
          <div className="space-y-4">
            {loadingEstoque ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : produtosBaixoEstoque.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Todos os produtos com estoque OK</p>
            ) : (
              produtosBaixoEstoque.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    )}>
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className={cn(
                        'font-medium',
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      )}>
                        {product.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mínimo: {product.estoque_minimo} un
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-500">
                      {product.estoque_atual}
                    </div>
                    <div className="text-xs text-gray-500">unidades</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
