
import { useState } from 'react';
import {
  Building2,
  Upload,
  Download,
  Check,
  X,
  Link,
  Unlink,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  Button,
  Input,
  Modal,
  StatusChip,
  Table,
  KPICard,
} from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

// ========== TYPES ==========

interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'corrente' | 'poupanca';
  saldo_sistema: number;
  saldo_extrato: number;
  ultima_conciliacao: string;
}

interface TransacaoExtrato {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'credito' | 'debito';
  documento?: string;
  status: 'pendente' | 'conciliado' | 'divergente' | 'ignorado';
  lancamento_id?: string;
  lancamento_descricao?: string;
}

interface LancamentoSistema {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  status: 'pendente' | 'conciliado';
  transacao_id?: string;
}

// ========== MOCK DATA ==========

const contasBancarias: ContaBancaria[] = [
  {
    id: '1',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '12345-6',
    tipo: 'corrente',
    saldo_sistema: 45678.90,
    saldo_extrato: 45123.45,
    ultima_conciliacao: '2024-01-14',
  },
  {
    id: '2',
    banco: 'Itaú',
    agencia: '0001',
    conta: '98765-4',
    tipo: 'corrente',
    saldo_sistema: 12340.00,
    saldo_extrato: 12340.00,
    ultima_conciliacao: '2024-01-15',
  },
];

const transacoesExtrato: TransacaoExtrato[] = [
  { id: '1', data: '2024-01-15', descricao: 'PIX RECEBIDO - CLIENTE ABC', valor: 1250.00, tipo: 'credito', status: 'conciliado', lancamento_id: 'L1', lancamento_descricao: 'Venda #0045' },
  { id: '2', data: '2024-01-15', descricao: 'TED RECEBIDO - FORNECEDOR XYZ', valor: 3500.00, tipo: 'credito', status: 'pendente' },
  { id: '3', data: '2024-01-14', descricao: 'PAGTO BOLETO - LUZ', valor: -456.78, tipo: 'debito', documento: '123456', status: 'conciliado', lancamento_id: 'L2', lancamento_descricao: 'Conta de Luz Jan/24' },
  { id: '4', data: '2024-01-14', descricao: 'TARIFA BANCÁRIA', valor: -35.00, tipo: 'debito', status: 'pendente' },
  { id: '5', data: '2024-01-13', descricao: 'PIX ENVIADO - FORNECEDOR', valor: -2300.00, tipo: 'debito', status: 'divergente' },
  { id: '6', data: '2024-01-13', descricao: 'DEPOSITO DINHEIRO', valor: 500.00, tipo: 'credito', status: 'pendente' },
  { id: '7', data: '2024-01-12', descricao: 'CARTAO CREDITO - TAXA', valor: -89.90, tipo: 'debito', status: 'ignorado' },
  { id: '8', data: '2024-01-12', descricao: 'VENDAS CARTAO D+1', valor: 4567.00, tipo: 'credito', status: 'conciliado', lancamento_id: 'L3', lancamento_descricao: 'Vendas Cartão 11/01' },
];

const lancamentosSistema: LancamentoSistema[] = [
  { id: 'L1', data: '2024-01-15', descricao: 'Venda #0045', valor: 1250.00, tipo: 'receita', categoria: 'Vendas', status: 'conciliado', transacao_id: '1' },
  { id: 'L2', data: '2024-01-14', descricao: 'Conta de Luz Jan/24', valor: 456.78, tipo: 'despesa', categoria: 'Utilidades', status: 'conciliado', transacao_id: '3' },
  { id: 'L3', data: '2024-01-12', descricao: 'Vendas Cartão 11/01', valor: 4567.00, tipo: 'receita', categoria: 'Vendas', status: 'conciliado', transacao_id: '8' },
  { id: 'L4', data: '2024-01-15', descricao: 'Venda #0046', valor: 890.00, tipo: 'receita', categoria: 'Vendas', status: 'pendente' },
  { id: 'L5', data: '2024-01-14', descricao: 'Pagamento Fornecedor ABC', valor: 2300.00, tipo: 'despesa', categoria: 'Fornecedores', status: 'pendente' },
  { id: 'L6', data: '2024-01-13', descricao: 'Aluguel Janeiro', valor: 3500.00, tipo: 'despesa', categoria: 'Aluguel', status: 'pendente' },
];

// ========== COMPONENT ==========

export const ConciliacaoBancariaPage = () => {
  const { isDarkMode } = useSettingsStore();
  const [contaSelecionada, setContaSelecionada] = useState<ContaBancaria>(contasBancarias[0]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoExtrato | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'conciliado' | 'divergente'>('todos');
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState({ inicio: '2024-01-01', fim: '2024-01-15' });

  // Estatísticas
  const totalConciliados = transacoesExtrato.filter(t => t.status === 'conciliado').length;
  const totalPendentes = transacoesExtrato.filter(t => t.status === 'pendente').length;
  const totalDivergentes = transacoesExtrato.filter(t => t.status === 'divergente').length;
  const diferenca = contaSelecionada.saldo_extrato - contaSelecionada.saldo_sistema;

  // Filtros
  const transacoesFiltradas = transacoesExtrato.filter(t => {
    if (filtroStatus !== 'todos' && t.status !== filtroStatus) return false;
    if (busca && !t.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const lancamentosPendentes = lancamentosSistema.filter(l => l.status === 'pendente');

  const handleConciliar = (transacao: TransacaoExtrato, lancamento: LancamentoSistema) => {
    console.log('Conciliando:', transacao.id, 'com', lancamento.id);
    setShowVincularModal(false);
    setTransacaoSelecionada(null);
  };

  const handleIgnorar = (transacaoId: string) => {
    console.log('Ignorando transação:', transacaoId);
  };

  const handleDesvincular = (transacaoId: string) => {
    console.log('Desvinculando transação:', transacaoId);
  };

  const extratoColumns = [
    {
      key: 'data',
      header: 'Data',
      render: (t: TransacaoExtrato) => (
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          {new Date(t.data).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (t: TransacaoExtrato) => (
        <div>
          <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
            {t.descricao}
          </div>
          {t.lancamento_descricao && (
            <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <Link className="w-3 h-3" />
              {t.lancamento_descricao}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (t: TransacaoExtrato) => (
        <span className={cn(
          'font-bold',
          t.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
        )}>
          {t.tipo === 'credito' ? '+' : ''}{formatCurrency(t.valor)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: TransacaoExtrato) => (
        <StatusChip
          label={
            t.status === 'conciliado' ? 'Conciliado' :
            t.status === 'pendente' ? 'Pendente' :
            t.status === 'divergente' ? 'Divergente' : 'Ignorado'
          }
          variant={
            t.status === 'conciliado' ? 'success' :
            t.status === 'pendente' ? 'warning' :
            t.status === 'divergente' ? 'danger' : 'neutral'
          }
        />
      ),
    },
    {
      key: 'acoes',
      header: '',
      render: (t: TransacaoExtrato) => (
        <div className="flex gap-1">
          {t.status === 'pendente' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setTransacaoSelecionada(t);
                  setShowVincularModal(true);
                }}
              >
                <Link className="w-4 h-4 text-blue-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleIgnorar(t.id)}
              >
                <X className="w-4 h-4 text-gray-400" />
              </Button>
            </>
          )}
          {t.status === 'conciliado' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDesvincular(t.id)}
            >
              <Unlink className="w-4 h-4 text-orange-500" />
            </Button>
          )}
          {t.status === 'divergente' && (
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 text-yellow-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const lancamentoColumns = [
    {
      key: 'data',
      header: 'Data',
      render: (l: LancamentoSistema) => (
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
          {new Date(l.data).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (l: LancamentoSistema) => (
        <div>
          <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
            {l.descricao}
          </div>
          <div className="text-xs text-gray-500">{l.categoria}</div>
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (l: LancamentoSistema) => (
        <span className={cn(
          'font-bold',
          l.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
        )}>
          {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
        </span>
      ),
    },
    {
      key: 'acao',
      header: '',
      render: (l: LancamentoSistema) => (
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => transacaoSelecionada && handleConciliar(transacaoSelecionada, l)}
        >
          <Check className="w-4 h-4" />
          Vincular
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Conciliação Bancária
          </h1>
          <p className="text-gray-500 mt-1">
            Compare o extrato bancário com os lançamentos do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4" />
            Importar OFX
          </Button>
          <Button variant="ghost">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Seleção de Conta */}
      <Card>
        <div className="flex items-center gap-4">
          <Building2 className="w-8 h-8 text-orange-500" />
          <div className="flex-1">
            <select
              value={contaSelecionada.id}
              onChange={(e) => setContaSelecionada(contasBancarias.find(c => c.id === e.target.value) || contasBancarias[0])}
              className={cn(
                'w-full max-w-md px-4 py-2 rounded-lg border font-medium',
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              )}
            >
              {contasBancarias.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.banco} - Ag: {conta.agencia} / CC: {conta.conta}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Última conciliação</p>
            <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {new Date(contaSelecionada.ultima_conciliacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Saldo Extrato"
          value={formatCurrency(contaSelecionada.saldo_extrato)}
          icon={Building2}
        />
        <KPICard
          title="Saldo Sistema"
          value={formatCurrency(contaSelecionada.saldo_sistema)}
          icon={FileText}
        />
        <KPICard
          title="Diferença"
          value={formatCurrency(Math.abs(diferenca))}
          icon={diferenca === 0 ? CheckCircle : AlertTriangle}
          trend={diferenca === 0 ? undefined : { value: 0, direction: diferenca > 0 ? 'up' : 'down' }}
        />
        <KPICard
          title="Conciliados"
          value={`${totalConciliados}/${transacoesExtrato.length}`}
          icon={Check}
        />
        <KPICard
          title="Pendentes"
          value={`${totalPendentes} / ${totalDivergentes} div.`}
          icon={Clock}
        />
      </div>

      {/* Alerta de Diferença */}
      {diferenca !== 0 && (
        <div className={cn(
          'p-4 rounded-xl border-2 flex items-center gap-4',
          diferenca > 0 
            ? 'border-yellow-500 bg-yellow-500/10' 
            : 'border-red-500 bg-red-500/10'
        )}>
          <AlertTriangle className={cn(
            'w-6 h-6',
            diferenca > 0 ? 'text-yellow-500' : 'text-red-500'
          )} />
          <div>
            <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              {diferenca > 0 ? 'Saldo no extrato maior que no sistema' : 'Saldo no sistema maior que no extrato'}
            </p>
            <p className="text-sm text-gray-500">
              Diferença de {formatCurrency(Math.abs(diferenca))} - Verifique os lançamentos pendentes
            </p>
          </div>
          <Button variant="secondary" className="ml-auto">
            <RefreshCw className="w-4 h-4" />
            Reconciliar
          </Button>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar transação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })}
              className="w-36"
            />
            <span className="text-gray-500">até</span>
            <Input
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })}
              className="w-36"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pendente', label: 'Pendentes' },
              { id: 'conciliado', label: 'Conciliados' },
              { id: 'divergente', label: 'Divergentes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltroStatus(f.id as typeof filtroStatus)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filtroStatus === f.id
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

      {/* Tabela de Extrato */}
      <Card>
        <CardHeader 
          title="Extrato Bancário" 
          subtitle={`${transacoesFiltradas.length} transações`} 
        />
        <Table columns={extratoColumns} data={transacoesFiltradas} />
      </Card>

      {/* Lançamentos Não Conciliados */}
      <Card>
        <CardHeader 
          title="Lançamentos do Sistema Não Conciliados" 
          subtitle={`${lancamentosPendentes.length} lançamentos pendentes`} 
        />
        <div className="space-y-2">
          {lancamentosPendentes.map((lancamento) => (
            <div 
              key={lancamento.id}
              className={cn(
                'p-4 rounded-xl border flex items-center justify-between',
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  lancamento.tipo === 'receita' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                )}>
                  {lancamento.tipo === 'receita' ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {lancamento.descricao}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')} • {lancamento.categoria}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  'font-bold text-lg',
                  lancamento.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                )}>
                  {lancamento.tipo === 'receita' ? '+' : '-'}{formatCurrency(lancamento.valor)}
                </span>
                <StatusChip label="Pendente" variant="warning" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal Importar OFX */}
      <Modal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        title="Importar Extrato OFX"
      >
        <div className="space-y-4">
          <div className={cn(
            'p-8 border-2 border-dashed rounded-xl text-center',
            isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'
          )}>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
              Arraste o arquivo OFX aqui
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou clique para selecionar
            </p>
            <Button variant="secondary" className="mt-4">
              Selecionar Arquivo
            </Button>
          </div>

          <div className={cn(
            'p-4 rounded-lg',
            isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          )}>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>Dica:</strong> Exporte o arquivo OFX diretamente do internet banking do seu banco.
              Formatos suportados: OFX, QFX, OFC
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowImportModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1">
              <Upload className="w-4 h-4" />
              Importar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Vincular Transação */}
      <Modal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        title="Vincular Transação"
        size="lg"
      >
        <div className="space-y-4">
          {transacaoSelecionada && (
            <div className={cn(
              'p-4 rounded-xl border',
              isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
            )}>
              <p className="text-sm text-gray-500 mb-1">Transação do Extrato</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {transacaoSelecionada.descricao}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transacaoSelecionada.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={cn(
                  'text-xl font-bold',
                  transacaoSelecionada.tipo === 'credito' ? 'text-green-500' : 'text-red-500'
                )}>
                  {transacaoSelecionada.tipo === 'credito' ? '+' : ''}{formatCurrency(transacaoSelecionada.valor)}
                </span>
              </div>
            </div>
          )}

          <div>
            <p className={cn('font-medium mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
              Selecione o lançamento correspondente:
            </p>
            <Table 
              columns={lancamentoColumns} 
              data={lancamentosPendentes.filter(l => {
                // Filtrar lançamentos que fazem sentido para vincular
                if (!transacaoSelecionada) return true;
                if (transacaoSelecionada.tipo === 'credito' && l.tipo === 'receita') return true;
                if (transacaoSelecionada.tipo === 'debito' && l.tipo === 'despesa') return true;
                return false;
              })} 
            />
          </div>

          <div className={cn(
            'p-4 rounded-lg',
            isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
          )}>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <strong>Nota:</strong> Você também pode criar um novo lançamento caso não encontre correspondência.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowVincularModal(false)}>
              Cancelar
            </Button>
            <Button variant="ghost" className="flex-1">
              <FileText className="w-4 h-4" />
              Criar Lançamento
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
