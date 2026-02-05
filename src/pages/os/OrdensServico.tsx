
import { useState } from 'react';
import { 
  Plus, 
  MoreVertical,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Table, 
  StatusChip, 
  SearchBar, 
  FiltersPanel,
  EmptyState,
  Modal,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface OrdemServico {
  id: string;
  numero: string;
  cliente: {
    nome: string;
    telefone: string;
  };
  equipamento: string;
  defeito: string;
  status: 'aguardando' | 'em_andamento' | 'aguardando_peca' | 'concluida' | 'entregue' | 'cancelada';
  tecnico: string;
  dataEntrada: Date;
  dataPrevista: Date;
  valor: number;
  observacoes?: string;
}

const mockOS: OrdemServico[] = [
  {
    id: '1',
    numero: 'OS-0001',
    cliente: { nome: 'João Silva', telefone: '(11) 99999-0001' },
    equipamento: 'iPhone 13 Pro',
    defeito: 'Tela quebrada',
    status: 'em_andamento',
    tecnico: 'Carlos',
    dataEntrada: new Date('2024-01-15'),
    dataPrevista: new Date('2024-01-17'),
    valor: 450.00,
  },
  {
    id: '2',
    numero: 'OS-0002',
    cliente: { nome: 'Maria Oliveira', telefone: '(11) 99999-0002' },
    equipamento: 'Samsung Galaxy S23',
    defeito: 'Bateria viciada',
    status: 'aguardando_peca',
    tecnico: 'Pedro',
    dataEntrada: new Date('2024-01-14'),
    dataPrevista: new Date('2024-01-20'),
    valor: 180.00,
  },
  {
    id: '3',
    numero: 'OS-0003',
    cliente: { nome: 'Pedro Santos', telefone: '(11) 99999-0003' },
    equipamento: 'MacBook Pro M1',
    defeito: 'Teclado não funciona',
    status: 'concluida',
    tecnico: 'Carlos',
    dataEntrada: new Date('2024-01-10'),
    dataPrevista: new Date('2024-01-12'),
    valor: 850.00,
  },
  {
    id: '4',
    numero: 'OS-0004',
    cliente: { nome: 'Ana Costa', telefone: '(11) 99999-0004' },
    equipamento: 'Notebook Dell Inspiron',
    defeito: 'Não liga',
    status: 'aguardando',
    tecnico: '',
    dataEntrada: new Date('2024-01-16'),
    dataPrevista: new Date('2024-01-18'),
    valor: 0,
  },
];

const statusConfig = {
  aguardando: { label: 'Aguardando', variant: 'warning' as const },
  em_andamento: { label: 'Em Andamento', variant: 'info' as const },
  aguardando_peca: { label: 'Aguardando Peça', variant: 'warning' as const },
  concluida: { label: 'Concluída', variant: 'success' as const },
  entregue: { label: 'Entregue', variant: 'success' as const },
  cancelada: { label: 'Cancelada', variant: 'danger' as const },
};

export const OrdensServico = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todas');
  const [showNovaOS, setShowNovaOS] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const filters = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Aguardando', value: 'aguardando' },
        { label: 'Em Andamento', value: 'em_andamento' },
        { label: 'Aguardando Peça', value: 'aguardando_peca' },
        { label: 'Concluída', value: 'concluida' },
        { label: 'Entregue', value: 'entregue' },
      ],
    },
    {
      id: 'tecnico',
      label: 'Técnico',
      type: 'select' as const,
      options: [
        { label: 'Carlos', value: 'carlos' },
        { label: 'Pedro', value: 'pedro' },
      ],
    },
    {
      id: 'dataEntrada',
      label: 'Data de Entrada',
      type: 'date' as const,
    },
  ];

  const filteredOS = mockOS.filter((os) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const match =
        os.numero.toLowerCase().includes(query) ||
        os.cliente.nome.toLowerCase().includes(query) ||
        os.equipamento.toLowerCase().includes(query);
      if (!match) return false;
    }

    if (activeTab !== 'todas') {
      if (activeTab === 'pendentes' && !['aguardando', 'em_andamento', 'aguardando_peca'].includes(os.status)) {
        return false;
      }
      if (activeTab === 'concluidas' && !['concluida', 'entregue'].includes(os.status)) {
        return false;
      }
    }

    return true;
  });

  const stats = {
    aguardando: mockOS.filter((os) => os.status === 'aguardando').length,
    emAndamento: mockOS.filter((os) => os.status === 'em_andamento').length,
    aguardandoPeca: mockOS.filter((os) => os.status === 'aguardando_peca').length,
    concluidas: mockOS.filter((os) => os.status === 'concluida').length,
  };

  const columns = [
    { 
      key: 'numero', 
      header: 'Nº OS', 
      sortable: true,
      render: (os: OrdemServico) => (
        <span className="font-medium text-gray-900 dark:text-white">{os.numero}</span>
      ),
    },
    { 
      key: 'cliente', 
      header: 'Cliente', 
      sortable: true,
      render: (os: OrdemServico) => (
        <div>
          <div className="text-gray-900 dark:text-white">{os.cliente.nome}</div>
          <div className="text-sm text-gray-500">{os.cliente.telefone}</div>
        </div>
      ),
    },
    { key: 'equipamento', header: 'Equipamento', sortable: true },
    { key: 'defeito', header: 'Defeito' },
    { 
      key: 'tecnico', 
      header: 'Técnico', 
      sortable: true,
      render: (os: OrdemServico) => os.tecnico || '-',
    },
    { 
      key: 'status', 
      header: 'Status', 
      sortable: true,
      render: (os: OrdemServico) => (
        <StatusChip
          label={statusConfig[os.status].label}
          variant={statusConfig[os.status].variant}
        />
      ),
    },
    { 
      key: 'dataPrevista', 
      header: 'Previsão', 
      sortable: true,
      render: (os: OrdemServico) => os.dataPrevista.toLocaleDateString('pt-BR'),
    },
    { 
      key: 'valor', 
      header: 'Valor', 
      sortable: true,
      render: (os: OrdemServico) => (
        <span className="font-medium">{os.valor > 0 ? formatCurrency(os.valor) : '-'}</span>
      ),
    },
    { 
      key: 'acoes', 
      header: '',
      render: () => (
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ordens de Serviço
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie os serviços e assistências técnicas
          </p>
        </div>
        <Button onClick={() => setShowNovaOS(true)}>
          <Plus className="w-4 h-4" />
          Nova OS
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.aguardando}
              </p>
              <p className="text-sm text-gray-500">Aguardando</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.emAndamento}
              </p>
              <p className="text-sm text-gray-500">Em Andamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.aguardandoPeca}
              </p>
              <p className="text-sm text-gray-500">Aguardando Peça</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.concluidas}
              </p>
              <p className="text-sm text-gray-500">Concluídas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar OS, cliente, equipamento..."
                className="w-full lg:w-80"
              />
            </div>
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

        {filteredOS.length > 0 ? (
          <Table
            columns={columns}
            data={filteredOS}
            onRowClick={(os) => console.log('Open OS', os.id)}
          />
        ) : (
          <EmptyState
            icon={Wrench}
            title="Nenhuma OS encontrada"
            description="Não há ordens de serviço com os filtros aplicados"
            action={{
              label: 'Nova OS',
              onClick: () => setShowNovaOS(true),
            }}
          />
        )}
      </Card>

      {/* Modal Nova OS */}
      <Modal
        open={showNovaOS}
        onOpenChange={setShowNovaOS}
        title="Nova Ordem de Serviço"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome do Cliente" placeholder="Nome completo" />
            <Input label="Telefone" placeholder="(00) 00000-0000" />
          </div>
          <Input label="Equipamento" placeholder="Ex: iPhone 13 Pro" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Defeito Relatado
            </label>
            <textarea
              placeholder="Descreva o problema..."
              className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data Prevista" type="date" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Técnico Responsável
              </label>
              <select className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">Selecione...</option>
                <option value="carlos">Carlos</option>
                <option value="pedro">Pedro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              placeholder="Observações adicionais..."
              className="w-full h-20 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowNovaOS(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowNovaOS(false)}>
              Criar OS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdensServico;
