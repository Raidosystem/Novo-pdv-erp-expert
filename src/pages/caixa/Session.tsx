
import { useState } from 'react';
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Plus,
  Printer,
  History,
  Calculator,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  AlertTriangle,
  X,
  Eye,
  Calendar,
  User,
  Lock,
  Check,
} from 'lucide-react';
import { KPICard, Card, CardHeader, Table, StatusChip, Button, Input, Modal } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

// ========== TYPES ==========

interface CashSession {
  id: string;
  operator: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  sales: number;
  withdrawals: number;
  deposits: number;
  status: 'open' | 'closed' | 'pending_close';
  salesByPayment: {
    dinheiro: number;
    cartao_credito: number;
    cartao_debito: number;
    pix: number;
  };
}

interface Movement {
  id: string;
  type: 'sale' | 'withdrawal' | 'deposit' | 'adjustment';
  description: string;
  value: number;
  time: string;
  date: string;
  operator: string;
  paymentMethod?: string;
  observation?: string;
  authorization?: string;
}

interface HistoricalSession {
  id: string;
  operator: string;
  openedAt: string;
  closedAt: string;
  openingBalance: number;
  closingBalance: number;
  difference: number;
  status: 'ok' | 'shortage' | 'surplus';
  totalSales: number;
}

// ========== MOCK DATA ==========

const currentSession: CashSession = {
  id: '1',
  operator: 'João Silva',
  openedAt: '2024-01-15 08:30',
  openingBalance: 500.00,
  sales: 2450.00,
  withdrawals: 200.00,
  deposits: 100.00,
  status: 'open',
  salesByPayment: {
    dinheiro: 850.00,
    cartao_credito: 920.00,
    cartao_debito: 430.00,
    pix: 250.00,
  },
};

const movements: Movement[] = [
  { id: '1', type: 'sale', description: 'Venda #0047', value: 125.50, time: '10:45', date: '2024-01-15', operator: 'João Silva', paymentMethod: 'pix' },
  { id: '2', type: 'sale', description: 'Venda #0046', value: 89.90, time: '10:30', date: '2024-01-15', operator: 'João Silva', paymentMethod: 'cartao_debito' },
  { id: '3', type: 'withdrawal', description: 'Sangria', value: -200.00, time: '10:00', date: '2024-01-15', operator: 'João Silva', observation: 'Retirada para pagamento de fornecedor', authorization: 'Gerente Carlos' },
  { id: '4', type: 'sale', description: 'Venda #0045', value: 234.00, time: '09:45', date: '2024-01-15', operator: 'João Silva', paymentMethod: 'dinheiro' },
  { id: '5', type: 'deposit', description: 'Suprimento', value: 100.00, time: '09:00', date: '2024-01-15', operator: 'Gerente', observation: 'Troco adicional' },
  { id: '6', type: 'sale', description: 'Venda #0044', value: 456.00, time: '08:45', date: '2024-01-15', operator: 'João Silva', paymentMethod: 'cartao_credito' },
  { id: '7', type: 'sale', description: 'Venda #0043', value: 178.00, time: '08:35', date: '2024-01-15', operator: 'João Silva', paymentMethod: 'dinheiro' },
  { id: '8', type: 'adjustment', description: 'Ajuste de troco', value: -5.00, time: '08:32', date: '2024-01-15', operator: 'João Silva', observation: 'Diferença encontrada na conferência' },
];

const historicalSessions: HistoricalSession[] = [
  { id: '1', operator: 'João Silva', openedAt: '2024-01-14 08:30', closedAt: '2024-01-14 18:00', openingBalance: 500, closingBalance: 2850, difference: 0, status: 'ok', totalSales: 2350 },
  { id: '2', operator: 'Maria Santos', openedAt: '2024-01-13 08:30', closedAt: '2024-01-13 18:00', openingBalance: 500, closingBalance: 3100, difference: -15, status: 'shortage', totalSales: 2600 },
  { id: '3', operator: 'João Silva', openedAt: '2024-01-12 08:30', closedAt: '2024-01-12 18:00', openingBalance: 500, closingBalance: 2200, difference: 5, status: 'surplus', totalSales: 1700 },
  { id: '4', operator: 'Carlos Oliveira', openedAt: '2024-01-11 08:30', closedAt: '2024-01-11 18:00', openingBalance: 500, closingBalance: 2750, difference: 0, status: 'ok', totalSales: 2250 },
  { id: '5', operator: 'Ana Costa', openedAt: '2024-01-10 08:30', closedAt: '2024-01-10 18:00', openingBalance: 500, closingBalance: 1980, difference: 0, status: 'ok', totalSales: 1480 },
];

export const CashSession = () => {
  const { isDarkMode, isDense } = useSettingsStore();
  const [filter, setFilter] = useState<'all' | 'sale' | 'withdrawal' | 'deposit' | 'adjustment'>('all');
  
  // Modais
  const [showSangriaModal, setShowSangriaModal] = useState(false);
  const [showSuprimentoModal, setShowSuprimentoModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMovementDetail, setShowMovementDetail] = useState<Movement | null>(null);
  const [showConferencia, setShowConferencia] = useState(false);
  
  // Form states
  const [sangriaForm, setSangriaForm] = useState({ valor: '', motivo: '', autorizacao: '' });
  const [suprimentoForm, setSuprimentoForm] = useState({ valor: '', motivo: '' });
  const [conferencia, setConferencia] = useState({
    notas_100: 0,
    notas_50: 0,
    notas_20: 0,
    notas_10: 0,
    notas_5: 0,
    notas_2: 0,
    moedas_1: 0,
    moedas_050: 0,
    moedas_025: 0,
    moedas_010: 0,
    moedas_005: 0,
  });

  const currentBalance =
    currentSession.openingBalance +
    currentSession.sales -
    currentSession.withdrawals +
    currentSession.deposits;

  const expectedCashBalance = currentSession.openingBalance + 
    currentSession.salesByPayment.dinheiro - 
    currentSession.withdrawals + 
    currentSession.deposits;

  const totalConferencia = 
    conferencia.notas_100 * 100 +
    conferencia.notas_50 * 50 +
    conferencia.notas_20 * 20 +
    conferencia.notas_10 * 10 +
    conferencia.notas_5 * 5 +
    conferencia.notas_2 * 2 +
    conferencia.moedas_1 * 1 +
    conferencia.moedas_050 * 0.50 +
    conferencia.moedas_025 * 0.25 +
    conferencia.moedas_010 * 0.10 +
    conferencia.moedas_005 * 0.05;

  const diferencaConferencia = totalConferencia - expectedCashBalance;

  const filteredMovements = movements.filter(
    (m) => filter === 'all' || m.type === filter
  );

  const handleSangria = () => {
    console.log('Sangria:', sangriaForm);
    setSangriaForm({ valor: '', motivo: '', autorizacao: '' });
    setShowSangriaModal(false);
  };

  const handleSuprimento = () => {
    console.log('Suprimento:', suprimentoForm);
    setSuprimentoForm({ valor: '', motivo: '' });
    setShowSuprimentoModal(false);
  };

  const handleCloseSession = () => {
    console.log('Fechando caixa com conferência:', totalConferencia);
    setShowCloseModal(false);
  };

  const getPaymentIcon = (method?: string) => {
    switch (method) {
      case 'dinheiro': return <Banknote className="w-4 h-4 text-green-500" />;
      case 'cartao_credito': return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'cartao_debito': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'pix': return <QrCode className="w-4 h-4 text-teal-500" />;
      default: return null;
    }
  };

  const columns = [
    {
      key: 'description',
      header: 'Descrição',
      render: (movement: Movement) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            movement.type === 'sale' ? 'bg-green-100 dark:bg-green-900/30' :
            movement.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/30' :
            movement.type === 'adjustment' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          )}>
            {movement.type === 'sale' ? (
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
            ) : movement.type === 'withdrawal' ? (
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            ) : movement.type === 'adjustment' ? (
              <Calculator className="w-5 h-5 text-yellow-500" />
            ) : (
              <DollarSign className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div>
            <div className={cn('font-medium flex items-center gap-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {movement.description}
              {movement.paymentMethod && getPaymentIcon(movement.paymentMethod)}
            </div>
            <div className="text-sm text-gray-500">{movement.operator}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Hora',
      render: (movement: Movement) => (
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          {movement.time}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (movement: Movement) => (
        <StatusChip
          label={
            movement.type === 'sale' ? 'Venda' :
            movement.type === 'withdrawal' ? 'Sangria' : 
            movement.type === 'adjustment' ? 'Ajuste' : 'Suprimento'
          }
          variant={
            movement.type === 'sale' ? 'success' :
            movement.type === 'withdrawal' ? 'danger' : 
            movement.type === 'adjustment' ? 'warning' : 'info'
          }
        />
      ),
    },
    {
      key: 'value',
      header: 'Valor',
      render: (movement: Movement) => (
        <span className={cn(
          'font-bold',
          movement.value >= 0 ? 'text-green-500' : 'text-red-500'
        )}>
          {movement.value >= 0 ? '+' : ''}{formatCurrency(movement.value)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (movement: Movement) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowMovementDetail(movement)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const historyColumns = [
    {
      key: 'date',
      header: 'Data',
      render: (session: HistoricalSession) => (
        <div>
          <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
            {session.openedAt.split(' ')[0]}
          </div>
          <div className="text-xs text-gray-500">
            {session.openedAt.split(' ')[1]} - {session.closedAt.split(' ')[1]}
          </div>
        </div>
      ),
    },
    {
      key: 'operator',
      header: 'Operador',
      render: (session: HistoricalSession) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{session.operator}</span>
        </div>
      ),
    },
    {
      key: 'totalSales',
      header: 'Vendas',
      render: (session: HistoricalSession) => (
        <span className="text-green-500 font-medium">{formatCurrency(session.totalSales)}</span>
      ),
    },
    {
      key: 'difference',
      header: 'Diferença',
      render: (session: HistoricalSession) => (
        <div className="flex items-center gap-2">
          {session.status === 'ok' ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : session.status === 'shortage' ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          <span className={cn(
            'font-medium',
            session.status === 'ok' ? 'text-green-500' : 
            session.status === 'shortage' ? 'text-red-500' : 'text-yellow-500'
          )}>
            {session.difference === 0 ? 'OK' : formatCurrency(session.difference)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (session: HistoricalSession) => (
        <StatusChip
          label={session.status === 'ok' ? 'Conferido' : session.status === 'shortage' ? 'Falta' : 'Sobra'}
          variant={session.status === 'ok' ? 'success' : session.status === 'shortage' ? 'danger' : 'warning'}
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
            Caixa
          </h1>
          <p className="text-gray-500 mt-1">
            Sessão atual: {currentSession.operator} • Abertura: {currentSession.openedAt}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowHistoryModal(true)}>
            <History className="w-4 h-4" />
            Histórico
          </Button>
          <Button variant="secondary" onClick={() => setShowSangriaModal(true)}>
            <ArrowDownCircle className="w-4 h-4" />
            Sangria
          </Button>
          <Button variant="secondary" onClick={() => setShowSuprimentoModal(true)}>
            <ArrowUpCircle className="w-4 h-4" />
            Suprimento
          </Button>
          <Button variant="danger" onClick={() => setShowCloseModal(true)}>
            <Lock className="w-4 h-4" />
            Fechar Caixa
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Saldo Atual"
          value={formatCurrency(currentBalance)}
          icon={DollarSign}
        />
        <KPICard
          title="Dinheiro em Caixa"
          value={formatCurrency(expectedCashBalance)}
          icon={Banknote}
        />
        <KPICard
          title="Total Vendas"
          value={formatCurrency(currentSession.sales)}
          icon={ArrowUpCircle}
          trend={{ value: 12.5, direction: 'up' }}
        />
        <KPICard
          title="Sangrias"
          value={formatCurrency(currentSession.withdrawals)}
          icon={ArrowDownCircle}
        />
        <KPICard
          title="Suprimentos"
          value={formatCurrency(currentSession.deposits)}
          icon={Plus}
        />
      </div>

      {/* Vendas por Forma de Pagamento */}
      <Card>
        <CardHeader title="Vendas por Forma de Pagamento" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn(
            'p-4 rounded-xl border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-5 h-5 text-green-500" />
              <span className="text-gray-500">Dinheiro</span>
            </div>
            <div className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {formatCurrency(currentSession.salesByPayment.dinheiro)}
            </div>
          </div>
          <div className={cn(
            'p-4 rounded-xl border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-purple-500" />
              <span className="text-gray-500">Crédito</span>
            </div>
            <div className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {formatCurrency(currentSession.salesByPayment.cartao_credito)}
            </div>
          </div>
          <div className={cn(
            'p-4 rounded-xl border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-gray-500">Débito</span>
            </div>
            <div className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {formatCurrency(currentSession.salesByPayment.cartao_debito)}
            </div>
          </div>
          <div className={cn(
            'p-4 rounded-xl border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-teal-500" />
              <span className="text-gray-500">PIX</span>
            </div>
            <div className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {formatCurrency(currentSession.salesByPayment.pix)}
            </div>
          </div>
        </div>
      </Card>

      {/* Session Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <CardHeader title="Movimentações" subtitle="Hoje" />
            <Button variant="ghost" size="sm">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
          
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'sale', label: 'Vendas' },
              { id: 'withdrawal', label: 'Sangrias' },
              { id: 'deposit', label: 'Suprimentos' },
              { id: 'adjustment', label: 'Ajustes' },
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

          <Table columns={columns} data={filteredMovements} dense={isDense} />
        </Card>

        {/* Session Summary */}
        <Card>
          <CardHeader title="Resumo da Sessão" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Abertura</span>
              <span className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {currentSession.openedAt}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Valor Inicial</span>
              <span className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(currentSession.openingBalance)}
              </span>
            </div>
            <div className={cn('border-t pt-4', isDarkMode ? 'border-gray-800' : 'border-gray-200')}>
              <div className="flex items-center justify-between text-green-500">
                <span>+ Vendas (Dinheiro)</span>
                <span className="font-medium">{formatCurrency(currentSession.salesByPayment.dinheiro)}</span>
              </div>
              <div className="flex items-center justify-between text-red-500 mt-2">
                <span>- Sangrias</span>
                <span className="font-medium">{formatCurrency(currentSession.withdrawals)}</span>
              </div>
              <div className="flex items-center justify-between text-blue-500 mt-2">
                <span>+ Suprimentos</span>
                <span className="font-medium">{formatCurrency(currentSession.deposits)}</span>
              </div>
            </div>
            <div className={cn('border-t pt-4', isDarkMode ? 'border-gray-800' : 'border-gray-200')}>
              <div className="flex items-center justify-between">
                <span className={cn('text-lg font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  Dinheiro Esperado
                </span>
                <span className="text-2xl font-bold text-orange-500">
                  {formatCurrency(expectedCashBalance)}
                </span>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => setShowConferencia(true)}
            >
              <Calculator className="w-4 h-4" />
              Conferir Caixa
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal Sangria */}
      <Modal
        open={showSangriaModal}
        onOpenChange={() => setShowSangriaModal(false)}
        title="Registrar Sangria"
      >
        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-lg flex items-center gap-3',
            isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
          )}>
            <ArrowDownCircle className="w-6 h-6 text-red-500" />
            <div>
              <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Retirada de Valores
              </p>
              <p className="text-sm text-gray-500">
                Dinheiro em caixa: {formatCurrency(expectedCashBalance)}
              </p>
            </div>
          </div>

          <Input
            label="Valor da Sangria"
            type="number"
            placeholder="0,00"
            value={sangriaForm.valor}
            onChange={(e) => setSangriaForm({ ...sangriaForm, valor: e.target.value })}
          />

          <Input
            label="Motivo"
            placeholder="Ex: Pagamento de fornecedor"
            value={sangriaForm.motivo}
            onChange={(e) => setSangriaForm({ ...sangriaForm, motivo: e.target.value })}
          />

          <Input
            label="Autorização (Gerente)"
            placeholder="Nome do gerente que autorizou"
            value={sangriaForm.autorizacao}
            onChange={(e) => setSangriaForm({ ...sangriaForm, autorizacao: e.target.value })}
          />

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowSangriaModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleSangria}>
              <ArrowDownCircle className="w-4 h-4" />
              Confirmar Sangria
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Suprimento */}
      <Modal
        open={showSuprimentoModal}
        onOpenChange={() => setShowSuprimentoModal(false)}
        title="Registrar Suprimento"
      >
        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-lg flex items-center gap-3',
            isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          )}>
            <ArrowUpCircle className="w-6 h-6 text-blue-500" />
            <div>
              <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Entrada de Valores
              </p>
              <p className="text-sm text-gray-500">
                Dinheiro atual em caixa: {formatCurrency(expectedCashBalance)}
              </p>
            </div>
          </div>

          <Input
            label="Valor do Suprimento"
            type="number"
            placeholder="0,00"
            value={suprimentoForm.valor}
            onChange={(e) => setSuprimentoForm({ ...suprimentoForm, valor: e.target.value })}
          />

          <Input
            label="Motivo"
            placeholder="Ex: Troco adicional"
            value={suprimentoForm.motivo}
            onChange={(e) => setSuprimentoForm({ ...suprimentoForm, motivo: e.target.value })}
          />

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowSuprimentoModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" className="flex-1" onClick={handleSuprimento}>
              <ArrowUpCircle className="w-4 h-4" />
              Confirmar Suprimento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Conferência */}
      <Modal
        open={showConferencia}
        onOpenChange={() => setShowConferencia(false)}
        title="Conferência de Caixa"
        size="lg"
      >
        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-lg',
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          )}>
            <p className="text-gray-500 mb-2">Valor esperado em dinheiro:</p>
            <p className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {formatCurrency(expectedCashBalance)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className={cn('font-medium mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Notas
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'notas_100', label: 'R$ 100', mult: 100 },
                  { key: 'notas_50', label: 'R$ 50', mult: 50 },
                  { key: 'notas_20', label: 'R$ 20', mult: 20 },
                  { key: 'notas_10', label: 'R$ 10', mult: 10 },
                  { key: 'notas_5', label: 'R$ 5', mult: 5 },
                  { key: 'notas_2', label: 'R$ 2', mult: 2 },
                ].map((nota) => (
                  <div key={nota.key} className="flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-500">{nota.label}</span>
                    <Input
                      type="number"
                      min="0"
                      value={conferencia[nota.key as keyof typeof conferencia]}
                      onChange={(e) => setConferencia({ 
                        ...conferencia, 
                        [nota.key]: parseInt(e.target.value) || 0 
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">
                      = {formatCurrency(conferencia[nota.key as keyof typeof conferencia] * nota.mult)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className={cn('font-medium mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Moedas
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'moedas_1', label: 'R$ 1,00', value: 1 },
                  { key: 'moedas_050', label: 'R$ 0,50', value: 0.50 },
                  { key: 'moedas_025', label: 'R$ 0,25', value: 0.25 },
                  { key: 'moedas_010', label: 'R$ 0,10', value: 0.10 },
                  { key: 'moedas_005', label: 'R$ 0,05', value: 0.05 },
                ].map((moeda) => (
                  <div key={moeda.key} className="flex items-center gap-2">
                    <span className="w-16 text-sm text-gray-500">{moeda.label}</span>
                    <Input
                      type="number"
                      min="0"
                      value={conferencia[moeda.key as keyof typeof conferencia]}
                      onChange={(e) => setConferencia({ 
                        ...conferencia, 
                        [moeda.key]: parseInt(e.target.value) || 0 
                      })}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">
                      = {formatCurrency(conferencia[moeda.key as keyof typeof conferencia] * moeda.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-lg border-2',
            diferencaConferencia === 0 
              ? 'border-green-500 bg-green-500/10' 
              : diferencaConferencia < 0 
              ? 'border-red-500 bg-red-500/10'
              : 'border-yellow-500 bg-yellow-500/10'
          )}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Contado</p>
                <p className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {formatCurrency(totalConferencia)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Diferença</p>
                <p className={cn(
                  'text-xl font-bold',
                  diferencaConferencia === 0 ? 'text-green-500' : 
                  diferencaConferencia < 0 ? 'text-red-500' : 'text-yellow-500'
                )}>
                  {diferencaConferencia === 0 ? 'OK' : formatCurrency(diferencaConferencia)}
                </p>
              </div>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={() => setShowConferencia(false)}>
            Fechar
          </Button>
        </div>
      </Modal>

      {/* Modal Fechar Caixa */}
      <Modal
        open={showCloseModal}
        onOpenChange={() => setShowCloseModal(false)}
        title="Fechar Caixa"
        size="lg"
      >
        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-lg flex items-center gap-3',
            isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
          )}>
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <div>
              <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Atenção: Esta ação não pode ser desfeita
              </p>
              <p className="text-sm text-gray-500">
                Verifique os valores antes de confirmar o fechamento
              </p>
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-lg space-y-3',
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          )}>
            <div className="flex justify-between">
              <span className="text-gray-500">Abertura</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{currentSession.openedAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor Inicial</span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatCurrency(currentSession.openingBalance)}</span>
            </div>
            <div className={cn('border-t pt-3', isDarkMode ? 'border-gray-700' : 'border-gray-300')}>
              <div className="flex justify-between text-green-500">
                <span>+ Vendas (Total)</span>
                <span>{formatCurrency(currentSession.sales)}</span>
              </div>
              <div className="flex justify-between text-red-500 mt-1">
                <span>- Sangrias</span>
                <span>{formatCurrency(currentSession.withdrawals)}</span>
              </div>
              <div className="flex justify-between text-blue-500 mt-1">
                <span>+ Suprimentos</span>
                <span>{formatCurrency(currentSession.deposits)}</span>
              </div>
            </div>
            <div className={cn('border-t pt-3', isDarkMode ? 'border-gray-700' : 'border-gray-300')}>
              <div className="flex justify-between font-bold">
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Saldo Final</span>
                <span className="text-orange-500 text-xl">{formatCurrency(currentBalance)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Dinheiro Esperado</span>
                <span className="text-green-500 font-medium">{formatCurrency(expectedCashBalance)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              'p-3 rounded-lg text-center',
              isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
            )}>
              <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Crédito</p>
              <p className="font-bold text-purple-500">{formatCurrency(currentSession.salesByPayment.cartao_credito)}</p>
            </div>
            <div className={cn(
              'p-3 rounded-lg text-center',
              isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
            )}>
              <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Débito</p>
              <p className="font-bold text-blue-500">{formatCurrency(currentSession.salesByPayment.cartao_debito)}</p>
            </div>
            <div className={cn(
              'p-3 rounded-lg text-center',
              isDarkMode ? 'bg-teal-900/20' : 'bg-teal-50'
            )}>
              <QrCode className="w-6 h-6 text-teal-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">PIX</p>
              <p className="font-bold text-teal-500">{formatCurrency(currentSession.salesByPayment.pix)}</p>
            </div>
            <div className={cn(
              'p-3 rounded-lg text-center',
              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
            )}>
              <Banknote className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Dinheiro</p>
              <p className="font-bold text-green-500">{formatCurrency(currentSession.salesByPayment.dinheiro)}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCloseModal(false)}>
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button variant="ghost" className="flex-1">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleCloseSession}>
              <Lock className="w-4 h-4" />
              Fechar Caixa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Histórico */}
      <Modal
        open={showHistoryModal}
        onOpenChange={() => setShowHistoryModal(false)}
        title="Histórico de Sessões"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Buscar por operador..." className="flex-1" />
            <Button variant="secondary">
              <Calendar className="w-4 h-4" />
              Filtrar Data
            </Button>
          </div>

          <Table columns={historyColumns} data={historicalSessions} />

          <div className={cn(
            'p-4 rounded-lg flex items-center justify-between',
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          )}>
            <div>
              <p className="text-gray-500">Total de Vendas (5 dias)</p>
              <p className={cn('text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(historicalSessions.reduce((sum, s) => sum + s.totalSales, 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Diferenças Acumuladas</p>
              <p className={cn(
                'text-xl font-bold',
                historicalSessions.reduce((sum, s) => sum + s.difference, 0) === 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              )}>
                {formatCurrency(historicalSessions.reduce((sum, s) => sum + s.difference, 0))}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Detalhe Movimento */}
      <Modal
        open={!!showMovementDetail}
        onOpenChange={() => setShowMovementDetail(null)}
        title="Detalhes da Movimentação"
      >
        {showMovementDetail && (
          <div className="space-y-4">
            <div className={cn(
              'p-4 rounded-lg',
              showMovementDetail.type === 'sale' ? 'bg-green-500/10' :
              showMovementDetail.type === 'withdrawal' ? 'bg-red-500/10' :
              showMovementDetail.type === 'adjustment' ? 'bg-yellow-500/10' :
              'bg-blue-500/10'
            )}>
              <div className="flex items-center gap-3">
                {showMovementDetail.type === 'sale' ? (
                  <ArrowUpCircle className="w-8 h-8 text-green-500" />
                ) : showMovementDetail.type === 'withdrawal' ? (
                  <ArrowDownCircle className="w-8 h-8 text-red-500" />
                ) : showMovementDetail.type === 'adjustment' ? (
                  <Calculator className="w-8 h-8 text-yellow-500" />
                ) : (
                  <DollarSign className="w-8 h-8 text-blue-500" />
                )}
                <div>
                  <p className={cn('text-lg font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {showMovementDetail.description}
                  </p>
                  <StatusChip
                    label={
                      showMovementDetail.type === 'sale' ? 'Venda' :
                      showMovementDetail.type === 'withdrawal' ? 'Sangria' : 
                      showMovementDetail.type === 'adjustment' ? 'Ajuste' : 'Suprimento'
                    }
                    variant={
                      showMovementDetail.type === 'sale' ? 'success' :
                      showMovementDetail.type === 'withdrawal' ? 'danger' : 
                      showMovementDetail.type === 'adjustment' ? 'warning' : 'info'
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Valor</span>
                <span className={cn(
                  'font-bold text-lg',
                  showMovementDetail.value >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {showMovementDetail.value >= 0 ? '+' : ''}{formatCurrency(showMovementDetail.value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data/Hora</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {showMovementDetail.date} às {showMovementDetail.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Operador</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {showMovementDetail.operator}
                </span>
              </div>
              {showMovementDetail.paymentMethod && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Forma de Pagamento</span>
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(showMovementDetail.paymentMethod)}
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {showMovementDetail.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                       showMovementDetail.paymentMethod === 'cartao_credito' ? 'Cartão de Crédito' :
                       showMovementDetail.paymentMethod === 'cartao_debito' ? 'Cartão de Débito' : 'PIX'}
                    </span>
                  </div>
                </div>
              )}
              {showMovementDetail.observation && (
                <div className={cn(
                  'p-3 rounded-lg',
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                )}>
                  <p className="text-sm text-gray-500 mb-1">Observação</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {showMovementDetail.observation}
                  </p>
                </div>
              )}
              {showMovementDetail.authorization && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Autorizado por</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {showMovementDetail.authorization}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowMovementDetail(null)}>
                Fechar
              </Button>
              <Button variant="ghost" className="flex-1">
                <Receipt className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
