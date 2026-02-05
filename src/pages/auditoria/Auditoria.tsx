
import { useState } from 'react';
import { 
  History, 
  User, 
  Eye,
  Clock,
  FileText,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  LogIn,
  LogOut,
  Download,
  XCircle
} from 'lucide-react';
import { 
  Card, 
  Table, 
  Button, 
  SearchBar, 
  FiltersPanel, 
  Modal,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

interface AuditLog {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  acao: 'criar' | 'editar' | 'excluir' | 'aprovar' | 'login' | 'logout' | 'exportar' | 'cancelar';
  modulo: string;
  entidade: string;
  entidadeId: string;
  dadosAnteriores?: Record<string, unknown>;
  dadosNovos?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    usuarioId: '1',
    usuarioNome: 'Admin',
    acao: 'criar',
    modulo: 'produtos',
    entidade: 'produtos',
    entidadeId: 'p1',
    dadosNovos: { nome: 'Coca-Cola 2L', preco: 12.90 },
    ip: '192.168.1.100',
    createdAt: new Date('2024-01-16T14:30:00'),
  },
  {
    id: '2',
    usuarioId: '2',
    usuarioNome: 'João Vendedor',
    acao: 'criar',
    modulo: 'pdv',
    entidade: 'vendas',
    entidadeId: 'v123',
    dadosNovos: { numero: 123, total: 156.80, itens: 5 },
    ip: '192.168.1.101',
    createdAt: new Date('2024-01-16T14:25:00'),
  },
  {
    id: '3',
    usuarioId: '1',
    usuarioNome: 'Admin',
    acao: 'editar',
    modulo: 'produtos',
    entidade: 'produtos',
    entidadeId: 'p2',
    dadosAnteriores: { preco: 8.50 },
    dadosNovos: { preco: 9.90 },
    ip: '192.168.1.100',
    createdAt: new Date('2024-01-16T14:20:00'),
  },
  {
    id: '4',
    usuarioId: '3',
    usuarioNome: 'Maria Caixa',
    acao: 'criar',
    modulo: 'caixa',
    entidade: 'caixa_sessoes',
    entidadeId: 'c1',
    dadosNovos: { valorAbertura: 200.00 },
    ip: '192.168.1.102',
    createdAt: new Date('2024-01-16T08:00:00'),
  },
  {
    id: '5',
    usuarioId: '1',
    usuarioNome: 'Admin',
    acao: 'cancelar',
    modulo: 'pdv',
    entidade: 'vendas',
    entidadeId: 'v120',
    dadosAnteriores: { numero: 120, total: 45.90, status: 'finalizada' },
    dadosNovos: { status: 'cancelada', motivo: 'Erro no pedido' },
    ip: '192.168.1.100',
    createdAt: new Date('2024-01-16T13:15:00'),
  },
  {
    id: '6',
    usuarioId: '2',
    usuarioNome: 'João Vendedor',
    acao: 'login',
    modulo: 'auth',
    entidade: 'usuarios',
    entidadeId: '2',
    ip: '192.168.1.101',
    createdAt: new Date('2024-01-16T08:05:00'),
  },
  {
    id: '7',
    usuarioId: '1',
    usuarioNome: 'Admin',
    acao: 'excluir',
    modulo: 'clientes',
    entidade: 'clientes',
    entidadeId: 'c5',
    dadosAnteriores: { nome: 'Cliente Teste', documento: '000.000.000-00' },
    ip: '192.168.1.100',
    createdAt: new Date('2024-01-16T11:30:00'),
  },
  {
    id: '8',
    usuarioId: '1',
    usuarioNome: 'Admin',
    acao: 'exportar',
    modulo: 'relatorios',
    entidade: 'vendas',
    entidadeId: 'export-001',
    dadosNovos: { tipo: 'excel', periodo: 'Janeiro 2024' },
    ip: '192.168.1.100',
    createdAt: new Date('2024-01-16T15:00:00'),
  },
];

const acaoConfig = {
  criar: { icon: Plus, label: 'Criação', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
  editar: { icon: Pencil, label: 'Edição', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  excluir: { icon: Trash2, label: 'Exclusão', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
  aprovar: { icon: CheckCircle, label: 'Aprovação', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  login: { icon: LogIn, label: 'Login', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  logout: { icon: LogOut, label: 'Logout', color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
  exportar: { icon: Download, label: 'Exportação', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
  cancelar: { icon: XCircle, label: 'Cancelamento', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
};

const moduloLabels: Record<string, string> = {
  produtos: 'Produtos',
  pdv: 'PDV/Vendas',
  caixa: 'Caixa',
  clientes: 'Clientes',
  estoque: 'Estoque',
  financeiro: 'Financeiro',
  relatorios: 'Relatórios',
  auth: 'Autenticação',
  configuracoes: 'Configurações',
  usuarios: 'Usuários',
};

export const AuditoriaPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const filters = [
    {
      id: 'modulo',
      label: 'Módulo',
      type: 'select' as const,
      options: Object.entries(moduloLabels).map(([value, label]) => ({ value, label })),
    },
    {
      id: 'acao',
      label: 'Ação',
      type: 'select' as const,
      options: Object.entries(acaoConfig).map(([value, config]) => ({ value, label: config.label })),
    },
    {
      id: 'data',
      label: 'Data',
      type: 'date' as const,
    },
  ];

  const filteredLogs = mockAuditLogs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const match =
        log.usuarioNome.toLowerCase().includes(query) ||
        log.modulo.toLowerCase().includes(query) ||
        log.entidade.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (activeTab !== 'todos') {
      if (activeTab === 'alteracoes' && !['criar', 'editar', 'excluir'].includes(log.acao)) {
        return false;
      }
      if (activeTab === 'acessos' && !['login', 'logout'].includes(log.acao)) {
        return false;
      }
      if (activeTab === 'criticos' && !['excluir', 'cancelar', 'aprovar'].includes(log.acao)) {
        return false;
      }
    }

    if (filterValues.modulo && log.modulo !== filterValues.modulo) return false;
    if (filterValues.acao && log.acao !== filterValues.acao) return false;

    return true;
  });

  const columns = [
    {
      key: 'data',
      header: 'Data/Hora',
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-900 dark:text-white">
              {log.createdAt.toLocaleDateString('pt-BR')}
            </div>
            <div className="text-xs text-gray-500">
              {log.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuário',
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="text-gray-900 dark:text-white font-medium">{log.usuarioNome}</div>
            {log.ip && <div className="text-xs text-gray-500">IP: {log.ip}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'acao',
      header: 'Ação',
      render: (log: AuditLog) => {
        const config = acaoConfig[log.acao];
        const Icon = config.icon;
        return (
          <div className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-full', config.color)}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        );
      },
    },
    {
      key: 'modulo',
      header: 'Módulo',
      render: (log: AuditLog) => (
        <span className="text-gray-700 dark:text-gray-300">
          {moduloLabels[log.modulo] || log.modulo}
        </span>
      ),
    },
    {
      key: 'entidade',
      header: 'Entidade',
      render: (log: AuditLog) => (
        <div>
          <div className="text-gray-900 dark:text-white">{log.entidade}</div>
          <div className="text-xs text-gray-500 font-mono">#{log.entidadeId.slice(0, 8)}</div>
        </div>
      ),
    },
    {
      key: 'detalhes',
      header: '',
      render: (log: AuditLog) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const formatDiff = (dados: Record<string, unknown> | undefined) => {
    if (!dados) return null;
    return Object.entries(dados).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-gray-500 text-sm">{key}</span>
        <span className="text-gray-900 dark:text-white text-sm font-medium">
          {typeof value === 'number' && key.includes('preco')
            ? formatCurrency(value)
            : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-7 h-7 text-primary-500" />
            Auditoria
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Trilha de auditoria - quem fez o quê e quando
          </p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4" />
          Exportar Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockAuditLogs.length}
              </p>
              <p className="text-sm text-gray-500">Total Hoje</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockAuditLogs.filter((l) => l.acao === 'criar').length}
              </p>
              <p className="text-sm text-gray-500">Criações</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockAuditLogs.filter((l) => l.acao === 'editar').length}
              </p>
              <p className="text-sm text-gray-500">Edições</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockAuditLogs.filter((l) => ['excluir', 'cancelar'].includes(l.acao)).length}
              </p>
              <p className="text-sm text-gray-500">Exclusões</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="alteracoes">Alterações</TabsTrigger>
                <TabsTrigger value="acessos">Acessos</TabsTrigger>
                <TabsTrigger value="criticos">Críticos</TabsTrigger>
              </TabsList>
            </Tabs>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por usuário, módulo..."
              className="w-full lg:w-80"
            />
          </div>
        </div>

        <FiltersPanel
          filters={filters}
          values={filterValues}
          onChange={(id, value) => setFilterValues({ ...filterValues, [id]: value })}
          onClear={() => setFilterValues({})}
          sticky={false}
          collapsible={true}
        />

        <Table
          columns={columns}
          data={filteredLogs}
          onRowClick={setSelectedLog}
        />
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        title="Detalhes da Ação"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Info básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Usuário</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedLog.usuarioNome}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Data/Hora</label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLog.createdAt.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Ação</label>
                <div className={cn(
                  'inline-flex items-center gap-2 px-2.5 py-1 rounded-full mt-1',
                  acaoConfig[selectedLog.acao].color
                )}>
                  {(() => {
                    const Icon = acaoConfig[selectedLog.acao].icon;
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                  <span className="text-xs font-medium">{acaoConfig[selectedLog.acao].label}</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Módulo</label>
                <p className="text-gray-900 dark:text-white">
                  {moduloLabels[selectedLog.modulo] || selectedLog.modulo}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Entidade</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.entidade}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">ID</label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedLog.entidadeId}</p>
              </div>
              {selectedLog.ip && (
                <div>
                  <label className="text-sm text-gray-500">Endereço IP</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedLog.ip}</p>
                </div>
              )}
            </div>

            {/* Dados Anteriores vs Novos */}
            {(selectedLog.dadosAnteriores || selectedLog.dadosNovos) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Alterações</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.dadosAnteriores && (
                    <div>
                      <h5 className="text-sm font-medium text-red-600 mb-2">Antes</h5>
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4">
                        {formatDiff(selectedLog.dadosAnteriores)}
                      </div>
                    </div>
                  )}
                  {selectedLog.dadosNovos && (
                    <div>
                      <h5 className="text-sm font-medium text-green-600 mb-2">Depois</h5>
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
                        {formatDiff(selectedLog.dadosNovos)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditoriaPage;
