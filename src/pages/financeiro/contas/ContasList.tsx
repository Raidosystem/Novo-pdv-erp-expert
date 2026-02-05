
import { useState } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  Select,
  StatusChip,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  Table,
} from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

// Tipos
interface Conta {
  id: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  categoria: string;
  categoria_cor: string;
  pessoa_nome: string | null;
  pessoa_tipo: 'cliente' | 'fornecedor' | null;
  documento_numero: string | null;
  valor_original: number;
  valor_pago: number;
  valor_restante: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'parcial' | 'vencido' | 'cancelado';
  recorrente: boolean;
  observacao: string | null;
}

// Dados mockados
const mockContas: Conta[] = [
  {
    id: '1',
    tipo: 'receber',
    descricao: 'Venda #1234',
    categoria: 'Vendas',
    categoria_cor: '#22C55E',
    pessoa_nome: 'João Silva',
    pessoa_tipo: 'cliente',
    documento_numero: 'NF-1234',
    valor_original: 1500.00,
    valor_pago: 0,
    valor_restante: 1500.00,
    data_emissao: '2024-01-10',
    data_vencimento: '2024-01-20',
    data_pagamento: null,
    status: 'pendente',
    recorrente: false,
    observacao: null,
  },
  {
    id: '2',
    tipo: 'receber',
    descricao: 'Venda #1235',
    categoria: 'Vendas',
    categoria_cor: '#22C55E',
    pessoa_nome: 'Maria Santos',
    pessoa_tipo: 'cliente',
    documento_numero: 'NF-1235',
    valor_original: 2300.00,
    valor_pago: 2300.00,
    valor_restante: 0,
    data_emissao: '2024-01-08',
    data_vencimento: '2024-01-15',
    data_pagamento: '2024-01-14',
    status: 'pago',
    recorrente: false,
    observacao: null,
  },
  {
    id: '3',
    tipo: 'receber',
    descricao: 'Venda #1220 - Parcela 2/3',
    categoria: 'Vendas',
    categoria_cor: '#22C55E',
    pessoa_nome: 'Pedro Oliveira',
    pessoa_tipo: 'cliente',
    documento_numero: 'NF-1220',
    valor_original: 800.00,
    valor_pago: 0,
    valor_restante: 800.00,
    data_emissao: '2024-01-01',
    data_vencimento: '2024-01-05',
    data_pagamento: null,
    status: 'vencido',
    recorrente: false,
    observacao: 'Cliente prometeu pagar esta semana',
  },
  {
    id: '4',
    tipo: 'pagar',
    descricao: 'Fornecedor ABC - Mercadorias',
    categoria: 'Fornecedores',
    categoria_cor: '#EF4444',
    pessoa_nome: 'Distribuidora ABC',
    pessoa_tipo: 'fornecedor',
    documento_numero: 'NF-5678',
    valor_original: 5000.00,
    valor_pago: 2500.00,
    valor_restante: 2500.00,
    data_emissao: '2024-01-05',
    data_vencimento: '2024-01-25',
    data_pagamento: null,
    status: 'parcial',
    recorrente: false,
    observacao: 'Pagamento em 2x',
  },
  {
    id: '5',
    tipo: 'pagar',
    descricao: 'Aluguel Janeiro/2024',
    categoria: 'Aluguel',
    categoria_cor: '#8B5CF6',
    pessoa_nome: 'Imobiliária XYZ',
    pessoa_tipo: 'fornecedor',
    documento_numero: 'BOL-001',
    valor_original: 3500.00,
    valor_pago: 3500.00,
    valor_restante: 0,
    data_emissao: '2024-01-01',
    data_vencimento: '2024-01-10',
    data_pagamento: '2024-01-09',
    status: 'pago',
    recorrente: true,
    observacao: null,
  },
  {
    id: '6',
    tipo: 'pagar',
    descricao: 'Conta de Energia',
    categoria: 'Utilidades',
    categoria_cor: '#EC4899',
    pessoa_nome: 'CPFL Energia',
    pessoa_tipo: 'fornecedor',
    documento_numero: null,
    valor_original: 850.00,
    valor_pago: 0,
    valor_restante: 850.00,
    data_emissao: '2024-01-12',
    data_vencimento: '2024-01-22',
    data_pagamento: null,
    status: 'pendente',
    recorrente: true,
    observacao: null,
  },
];

const categorias = [
  { id: '1', nome: 'Vendas', tipo: 'receita', cor: '#22C55E' },
  { id: '2', nome: 'Serviços', tipo: 'receita', cor: '#3B82F6' },
  { id: '3', nome: 'Fornecedores', tipo: 'despesa', cor: '#EF4444' },
  { id: '4', nome: 'Pessoal', tipo: 'despesa', cor: '#F59E0B' },
  { id: '5', nome: 'Aluguel', tipo: 'despesa', cor: '#8B5CF6' },
  { id: '6', nome: 'Utilidades', tipo: 'despesa', cor: '#EC4899' },
];

export function ContasList() {
  const [activeTab, setActiveTab] = useState<'todas' | 'receber' | 'pagar'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('mes');
  
  const [showModal, setShowModal] = useState(false);
  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [selectedConta, setSelectedConta] = useState<Conta | null>(null);
  const [contaTipo, setContaTipo] = useState<'pagar' | 'receber'>('receber');
  
  const [formData, setFormData] = useState({
    descricao: '',
    categoria_id: '',
    pessoa_nome: '',
    documento_numero: '',
    valor_original: '',
    data_vencimento: '',
    recorrente: false,
    observacao: '',
  });
  
  const [baixaData, setBaixaData] = useState({
    valor_pago: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    observacao: '',
  });

  // Filtrar contas
  const filteredContas = mockContas.filter((conta) => {
    const matchesTab = activeTab === 'todas' || conta.tipo === activeTab;
    const matchesSearch =
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.pessoa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.documento_numero?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || conta.status === statusFilter;
    const matchesCategoria = !categoriaFilter || conta.categoria === categoriaFilter;
    return matchesTab && matchesSearch && matchesStatus && matchesCategoria;
  });

  // Calcular totais
  const totais = {
    receber: {
      total: mockContas.filter(c => c.tipo === 'receber').reduce((acc, c) => acc + c.valor_original, 0),
      pendente: mockContas.filter(c => c.tipo === 'receber' && ['pendente', 'vencido', 'parcial'].includes(c.status)).reduce((acc, c) => acc + c.valor_restante, 0),
      vencido: mockContas.filter(c => c.tipo === 'receber' && c.status === 'vencido').reduce((acc, c) => acc + c.valor_restante, 0),
    },
    pagar: {
      total: mockContas.filter(c => c.tipo === 'pagar').reduce((acc, c) => acc + c.valor_original, 0),
      pendente: mockContas.filter(c => c.tipo === 'pagar' && ['pendente', 'vencido', 'parcial'].includes(c.status)).reduce((acc, c) => acc + c.valor_restante, 0),
      vencido: mockContas.filter(c => c.tipo === 'pagar' && c.status === 'vencido').reduce((acc, c) => acc + c.valor_restante, 0),
    },
  };

  const handleOpenModal = (tipo: 'pagar' | 'receber', conta?: Conta) => {
    setContaTipo(tipo);
    if (conta) {
      setSelectedConta(conta);
      setFormData({
        descricao: conta.descricao,
        categoria_id: conta.categoria,
        pessoa_nome: conta.pessoa_nome || '',
        documento_numero: conta.documento_numero || '',
        valor_original: conta.valor_original.toString(),
        data_vencimento: conta.data_vencimento,
        recorrente: conta.recorrente,
        observacao: conta.observacao || '',
      });
    } else {
      setSelectedConta(null);
      setFormData({
        descricao: '',
        categoria_id: '',
        pessoa_nome: '',
        documento_numero: '',
        valor_original: '',
        data_vencimento: '',
        recorrente: false,
        observacao: '',
      });
    }
    setShowModal(true);
  };

  const handleOpenBaixaModal = (conta: Conta) => {
    setSelectedConta(conta);
    setBaixaData({
      valor_pago: conta.valor_restante.toString(),
      data_pagamento: new Date().toISOString().split('T')[0],
      observacao: '',
    });
    setShowBaixaModal(true);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; label: string; icon: React.ElementType }> = {
      pendente: { variant: 'warning', label: 'Pendente', icon: Clock },
      pago: { variant: 'success', label: 'Pago', icon: CheckCircle },
      parcial: { variant: 'info', label: 'Parcial', icon: DollarSign },
      vencido: { variant: 'danger', label: 'Vencido', icon: AlertTriangle },
      cancelado: { variant: 'neutral', label: 'Cancelado', icon: XCircle },
    };
    return configs[status] || configs.pendente;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns = [
    {
      key: 'tipo',
      header: '',
      className: 'w-10',
      render: (conta: Conta) => (
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          conta.tipo === 'receber' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        )}>
          {conta.tipo === 'receber' ? (
            <ArrowUpCircle className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowDownCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
      ),
    },
    {
      key: 'descricao',
      header: 'Descrição',
      render: (conta: Conta) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{conta.descricao}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {conta.pessoa_nome && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {conta.pessoa_nome}
              </span>
            )}
            {conta.documento_numero && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {conta.documento_numero}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (conta: Conta) => (
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: `${conta.categoria_cor}20`,
            color: conta.categoria_cor,
          }}
        >
          {conta.categoria}
        </span>
      ),
    },
    {
      key: 'vencimento',
      header: 'Vencimento',
      render: (conta: Conta) => {
        const days = getDaysUntilDue(conta.data_vencimento);
        const isPast = days < 0;
        const isToday = days === 0;
        const isSoon = days > 0 && days <= 3;
        
        return (
          <div>
            <p className={cn(
              'font-medium',
              isPast && 'text-red-600',
              isToday && 'text-orange-600',
              isSoon && 'text-yellow-600',
              !isPast && !isToday && !isSoon && 'text-gray-900 dark:text-white'
            )}>
              {formatDate(conta.data_vencimento)}
            </p>
            <p className={cn(
              'text-xs',
              isPast ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            )}>
              {isPast
                ? `${Math.abs(days)} dias atrás`
                : isToday
                ? 'Vence hoje!'
                : `em ${days} dias`}
            </p>
          </div>
        );
      },
    },
    {
      key: 'valor',
      header: 'Valor',
      className: 'text-right',
      render: (conta: Conta) => (
        <div className="text-right">
          <p className={cn(
            'font-semibold',
            conta.tipo === 'receber' ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(conta.valor_original)}
          </p>
          {conta.valor_pago > 0 && conta.status !== 'pago' && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pago: {formatCurrency(conta.valor_pago)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (conta: Conta) => {
        const config = getStatusConfig(conta.status);
        return (
          <div className="flex items-center gap-2">
            <StatusChip variant={config.variant} label={config.label} />
            {conta.recorrente && (
              <span title="Recorrente">
                <RefreshCw className="w-3 h-3 text-gray-400" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'acoes',
      header: '',
      className: 'w-24',
      render: (conta: Conta) => (
        <div className="flex items-center justify-end gap-1">
          {conta.status !== 'pago' && conta.status !== 'cancelado' && (
            <button
              onClick={() => handleOpenBaixaModal(conta)}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Baixar"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleOpenModal(conta.tipo, conta)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Mais"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contas a Pagar e Receber
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie suas contas, parcelas e fluxo de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="secondary" onClick={() => handleOpenModal('pagar')}>
            <ArrowDownCircle className="w-4 h-4 mr-2" />
            Conta a Pagar
          </Button>
          <Button onClick={() => handleOpenModal('receber')}>
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Conta a Receber
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">A Receber</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totais.receber.pendente)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">A Pagar</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totais.pagar.pendente)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vencido (Receber)</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totais.receber.vencido)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Previsto</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(totais.receber.pendente - totais.pagar.pendente)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs e Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'todas' | 'receber' | 'pagar')}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="receber">
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              A Receber
            </TabsTrigger>
            <TabsTrigger value="pagar">
              <ArrowDownCircle className="w-4 h-4 mr-1" />
              A Pagar
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Status"
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'pago', label: 'Pago' },
              { value: 'parcial', label: 'Parcial' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'cancelado', label: 'Cancelado' },
            ]}
          />
          <Select
            value={periodoFilter}
            onValueChange={setPeriodoFilter}
            placeholder="Período"
            options={[
              { value: 'semana', label: 'Esta semana' },
              { value: 'mes', label: 'Este mês' },
              { value: 'proximo_mes', label: 'Próximo mês' },
              { value: 'trimestre', label: 'Trimestre' },
              { value: 'todos', label: 'Todos' },
            ]}
          />
        </div>
      </div>

      {/* Tabela */}
      {filteredContas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma conta encontrada"
          description="Ajuste os filtros ou cadastre uma nova conta"
          action={{
            label: 'Nova Conta',
            onClick: () => handleOpenModal('receber'),
          }}
        />
      ) : (
        <Card>
          <Table columns={columns} data={filteredContas} />
        </Card>
      )}

      {/* Modal Nova/Editar Conta */}
      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title={`${selectedConta ? 'Editar' : 'Nova'} Conta a ${contaTipo === 'receber' ? 'Receber' : 'Pagar'}`}
      >
        <div className="space-y-4">
          <Input
            label="Descrição"
            placeholder="Ex: Venda #1234 ou Conta de luz"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <Select
                value={formData.categoria_id}
                onValueChange={(v) => setFormData({ ...formData, categoria_id: v })}
                placeholder="Selecione..."
                options={categorias
                  .filter(c => contaTipo === 'receber' ? c.tipo === 'receita' : c.tipo === 'despesa')
                  .map(c => ({ value: c.id, label: c.nome }))}
              />
            </div>
            <Input
              label={contaTipo === 'receber' ? 'Cliente' : 'Fornecedor'}
              placeholder="Nome do cliente/fornecedor"
              value={formData.pessoa_nome}
              onChange={(e) => setFormData({ ...formData, pessoa_nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor"
              type="number"
              placeholder="0,00"
              value={formData.valor_original}
              onChange={(e) => setFormData({ ...formData, valor_original: e.target.value })}
            />
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
            />
          </div>

          <Input
            label="Número do Documento"
            placeholder="NF, Boleto, etc."
            value={formData.documento_numero}
            onChange={(e) => setFormData({ ...formData, documento_numero: e.target.value })}
          />

          <Input
            label="Observação"
            placeholder="Observações adicionais..."
            value={formData.observacao}
            onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
          />

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              id="recorrente"
              checked={formData.recorrente}
              onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="recorrente" className="flex-1">
              <span className="font-medium text-gray-900 dark:text-white">
                Conta Recorrente
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Repetir automaticamente todo mês
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowModal(false)}>
              {selectedConta ? 'Salvar Alterações' : 'Criar Conta'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Baixa de Conta */}
      <Modal
        open={showBaixaModal}
        onOpenChange={setShowBaixaModal}
        title="Baixar Conta"
      >
        <div className="space-y-4">
          {selectedConta && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedConta.descricao}
              </p>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 dark:text-gray-400">Valor Original:</span>
                <span className="font-semibold">{formatCurrency(selectedConta.valor_original)}</span>
              </div>
              {selectedConta.valor_pago > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Já Pago:</span>
                  <span className="text-green-600">{formatCurrency(selectedConta.valor_pago)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <span className="font-medium text-gray-900 dark:text-white">Restante:</span>
                <span className="font-bold text-lg">{formatCurrency(selectedConta.valor_restante)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor a Baixar"
              type="number"
              value={baixaData.valor_pago}
              onChange={(e) => setBaixaData({ ...baixaData, valor_pago: e.target.value })}
            />
            <Input
              label="Data do Pagamento"
              type="date"
              value={baixaData.data_pagamento}
              onChange={(e) => setBaixaData({ ...baixaData, data_pagamento: e.target.value })}
            />
          </div>

          <Input
            label="Observação"
            placeholder="Observações sobre o pagamento..."
            value={baixaData.observacao}
            onChange={(e) => setBaixaData({ ...baixaData, observacao: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowBaixaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowBaixaModal(false)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Baixa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
