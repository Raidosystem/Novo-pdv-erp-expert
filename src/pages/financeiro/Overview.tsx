import { useState, useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Calendar, Plus, Search, Loader2 } from 'lucide-react';
import { KPICard, Card, Table, StatusChip, Button, Input } from '@/components/ui';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useContas, useContasVencidas } from '@/hooks/useSupabase';
import type { ContaFinanceira } from '@/services';

export const FinancialOverview = () => {
  const { isDarkMode, isDense } = useSettingsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pagar' | 'receber'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'pago' | 'vencido'>('all');

  // Hooks para dados reais
  const { data: contas, loading } = useContas({});
  const { data: contasVencidas } = useContasVencidas();

  const filteredTransactions = useMemo(() => {
    if (!contas) return [];
    return contas.filter((c: ContaFinanceira) => {
      const matchesSearch = c.descricao?.toLowerCase().includes(search.toLowerCase()) ||
        (c.fornecedor && typeof c.fornecedor === 'object' && c.fornecedor.nome?.toLowerCase().includes(search.toLowerCase()));
      const matchesType = filter === 'all' || c.tipo === filter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contas, search, filter, statusFilter]);

  const totalReceivable = useMemo(() => {
    if (!contas) return 0;
    return contas
      .filter((c) => c.tipo === 'receber' && c.status !== 'pago')
      .reduce((sum, c) => sum + (c.valor || 0), 0);
  }, [contas]);

  const totalPayable = useMemo(() => {
    if (!contas) return 0;
    return contas
      .filter((c) => c.tipo === 'pagar' && c.status !== 'pago')
      .reduce((sum, c) => sum + (c.valor || 0), 0);
  }, [contas]);

  const overdueCount = contasVencidas?.length || 0;

  const columns = [
    {
      key: 'descricao',
      header: 'Descrição',
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            c.tipo === 'receber' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          )}>
            {c.tipo === 'receber' ? (
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div>
            <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {c.descricao}
            </div>
            <div className="text-sm text-gray-500">{c.fornecedor || c.cliente || '-'}</div>
          </div>
        </div>
      ),
    },
    { 
      key: 'categoria', 
      header: 'Categoria',
      render: (c: any) => c.categoria?.nome || '-'
    },
    {
      key: 'data_vencimento',
      header: 'Vencimento',
      render: (c: any) => (
        <span className={cn(
          c.status === 'vencido' && 'text-red-500 font-medium'
        )}>
          {c.data_vencimento ? formatDate(c.data_vencimento) : '-'}
        </span>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (c: any) => (
        <span className={cn(
          'font-bold',
          c.tipo === 'receber' ? 'text-green-500' : 'text-red-500'
        )}>
          {c.tipo === 'receber' ? '+' : '-'}{formatCurrency(c.valor || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: any) => (
        <StatusChip
          label={
            c.status === 'pago' ? 'Pago' :
            c.status === 'vencido' ? 'Vencido' : 'Pendente'
          }
          variant={
            c.status === 'pago' ? 'success' :
            c.status === 'vencido' ? 'danger' : 'warning'
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
            Financeiro
          </h1>
          <p className="text-gray-500 mt-1">
            Contas a pagar e receber
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="A Receber"
          value={formatCurrency(totalReceivable)}
          icon={ArrowUpCircle}
          trend={{ value: 8.5, direction: 'up' }}
        />
        <KPICard
          title="A Pagar"
          value={formatCurrency(totalPayable)}
          icon={ArrowDownCircle}
          trend={{ value: 3.2, direction: 'down' }}
        />
        <KPICard
          title="Saldo Projetado"
          value={formatCurrency(totalReceivable - totalPayable)}
          icon={DollarSign}
        />
        <KPICard
          title="Títulos Vencidos"
          value={overdueCount.toString()}
          icon={Calendar}
          trend={{ value: overdueCount, direction: 'down' }}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Buscar por descrição ou contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'receber', label: 'A Receber' },
              { id: 'pagar', label: 'A Pagar' },
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
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Todos Status' },
              { id: 'pendente', label: 'Pendente' },
              { id: 'pago', label: 'Pago' },
              { id: 'vencido', label: 'Vencido' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as typeof statusFilter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === f.id
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <Table columns={columns} data={filteredTransactions} dense={isDense} />
      )}
    </div>
  );
};
