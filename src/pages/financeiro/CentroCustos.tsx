
import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  MoreVertical,
  PieChart,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  StatusChip,
  Table,
} from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

// Tipos
interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  responsavel?: string;
  orcamento_mensal: number;
  gasto_atual: number;
  percentual_utilizado: number;
  ativo: boolean;
}

// Dados mockados
const mockCentrosCusto: CentroCusto[] = [
  {
    id: '1',
    codigo: 'ADM',
    nome: 'Administrativo',
    responsavel: 'Maria Silva',
    orcamento_mensal: 10000,
    gasto_atual: 5350,
    percentual_utilizado: 53.5,
    ativo: true,
  },
  {
    id: '2',
    codigo: 'VND',
    nome: 'Vendas',
    responsavel: 'Carlos Santos',
    orcamento_mensal: 15000,
    gasto_atual: 14500,
    percentual_utilizado: 96.67,
    ativo: true,
  },
  {
    id: '3',
    codigo: 'MKT',
    nome: 'Marketing',
    responsavel: 'Ana Oliveira',
    orcamento_mensal: 5000,
    gasto_atual: 2000,
    percentual_utilizado: 40,
    ativo: true,
  },
  {
    id: '4',
    codigo: 'TI',
    nome: 'Tecnologia',
    responsavel: 'Pedro Tech',
    orcamento_mensal: 8000,
    gasto_atual: 3500,
    percentual_utilizado: 43.75,
    ativo: true,
  },
  {
    id: '5',
    codigo: 'LOG',
    nome: 'Logística',
    responsavel: 'João Expedição',
    orcamento_mensal: 6000,
    gasto_atual: 5800,
    percentual_utilizado: 96.67,
    ativo: true,
  },
  {
    id: '6',
    codigo: 'RH',
    nome: 'Recursos Humanos',
    responsavel: undefined,
    orcamento_mensal: 3000,
    gasto_atual: 0,
    percentual_utilizado: 0,
    ativo: false,
  },
];

const gastosPorMes = [
  { mes: 'Jul', ADM: 4800, VND: 12000, MKT: 1800, TI: 3200, LOG: 5500 },
  { mes: 'Ago', ADM: 5100, VND: 13500, MKT: 2200, TI: 3400, LOG: 5200 },
  { mes: 'Set', ADM: 5000, VND: 14000, MKT: 1500, TI: 3600, LOG: 5600 },
  { mes: 'Out', ADM: 5200, VND: 14200, MKT: 2500, TI: 3300, LOG: 5400 },
  { mes: 'Nov', ADM: 5400, VND: 14800, MKT: 1800, TI: 3500, LOG: 5700 },
  { mes: 'Dez', ADM: 5350, VND: 14500, MKT: 2000, TI: 3500, LOG: 5800 },
];

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444'];

export function CentroCustosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<CentroCusto | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'cards'>('cards');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    responsavel: '',
    orcamento_mensal: '',
    ativo: true,
  });

  // Filtrar centros de custo
  const filteredCentros = mockCentrosCusto.filter((centro) =>
    centro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totais
  const totais = {
    orcamento: mockCentrosCusto.reduce((acc, c) => acc + c.orcamento_mensal, 0),
    gasto: mockCentrosCusto.reduce((acc, c) => acc + c.gasto_atual, 0),
    disponivel: mockCentrosCusto.reduce((acc, c) => acc + (c.orcamento_mensal - c.gasto_atual), 0),
  };

  const handleOpenModal = (centro?: CentroCusto) => {
    if (centro) {
      setSelectedCentro(centro);
      setFormData({
        codigo: centro.codigo,
        nome: centro.nome,
        responsavel: centro.responsavel || '',
        orcamento_mensal: centro.orcamento_mensal.toString(),
        ativo: centro.ativo,
      });
    } else {
      setSelectedCentro(null);
      setFormData({
        codigo: '',
        nome: '',
        responsavel: '',
        orcamento_mensal: '',
        ativo: true,
      });
    }
    setShowModal(true);
  };

  const getUtilizacaoColor = (percentual: number) => {
    if (percentual >= 90) return 'bg-red-500';
    if (percentual >= 70) return 'bg-yellow-500';
    if (percentual >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getUtilizacaoStatus = (percentual: number): { variant: 'success' | 'warning' | 'danger' | 'info'; label: string } => {
    if (percentual >= 100) return { variant: 'danger', label: 'Estourado' };
    if (percentual >= 90) return { variant: 'danger', label: 'Crítico' };
    if (percentual >= 70) return { variant: 'warning', label: 'Atenção' };
    return { variant: 'success', label: 'Normal' };
  };

  const pieData = mockCentrosCusto
    .filter(c => c.ativo && c.gasto_atual > 0)
    .map((centro, index) => ({
      name: centro.nome,
      value: centro.gasto_atual,
      color: COLORS[index % COLORS.length],
    }));

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      className: 'w-24',
      render: (centro: CentroCusto) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-white">
          {centro.codigo}
        </span>
      ),
    },
    {
      key: 'nome',
      header: 'Centro de Custo',
      render: (centro: CentroCusto) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{centro.nome}</p>
          {centro.responsavel && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Resp: {centro.responsavel}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'orcamento',
      header: 'Orçamento',
      className: 'text-right',
      render: (centro: CentroCusto) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(centro.orcamento_mensal)}
        </span>
      ),
    },
    {
      key: 'gasto',
      header: 'Gasto Atual',
      className: 'text-right',
      render: (centro: CentroCusto) => (
        <span className={cn(
          'font-medium',
          centro.percentual_utilizado >= 90 ? 'text-red-600' : 'text-gray-900 dark:text-white'
        )}>
          {formatCurrency(centro.gasto_atual)}
        </span>
      ),
    },
    {
      key: 'utilizacao',
      header: 'Utilização',
      render: (centro: CentroCusto) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getUtilizacaoColor(centro.percentual_utilizado))}
              style={{ width: `${Math.min(centro.percentual_utilizado, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
            {centro.percentual_utilizado.toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (centro: CentroCusto) => {
        if (!centro.ativo) {
          return <StatusChip variant="neutral" label="Inativo" />;
        }
        const status = getUtilizacaoStatus(centro.percentual_utilizado);
        return <StatusChip variant={status.variant} label={status.label} />;
      },
    },
    {
      key: 'acoes',
      header: '',
      className: 'w-20',
      render: (centro: CentroCusto) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenModal(centro)}
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
            Centros de Custo
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie orçamentos e acompanhe gastos por departamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Centro
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orçamento Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totais.orcamento)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gasto Atual</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totais.gasto)}</p>
              <p className="text-xs text-gray-500">
                {((totais.gasto / totais.orcamento) * 100).toFixed(1)}% utilizado
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Disponível</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totais.disponivel)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar centro de custo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <PieChart className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'lista' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('lista')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Conteúdo */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards de Centros de Custo */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {filteredCentros.map((centro) => (
              <Card key={centro.id} className={cn('p-4', !centro.ativo && 'opacity-60')}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 rounded">
                        {centro.codigo}
                      </span>
                      {!centro.ativo && <StatusChip variant="neutral" label="Inativo" size="sm" />}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                      {centro.nome}
                    </h3>
                    {centro.responsavel && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {centro.responsavel}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenModal(centro)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Orçamento</span>
                    <span className="font-medium">{formatCurrency(centro.orcamento_mensal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Gasto</span>
                    <span className={cn(
                      'font-medium',
                      centro.percentual_utilizado >= 90 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                    )}>
                      {formatCurrency(centro.gasto_atual)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Utilização</span>
                    <span className={cn(
                      'text-xs font-medium',
                      centro.percentual_utilizado >= 90 ? 'text-red-600' : 
                      centro.percentual_utilizado >= 70 ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {centro.percentual_utilizado.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getUtilizacaoColor(centro.percentual_utilizado))}
                      style={{ width: `${Math.min(centro.percentual_utilizado, 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Gráfico de Pizza */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Gastos
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <Table columns={columns} data={filteredCentros} />
        </Card>
      )}

      {/* Gráfico de Evolução */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Evolução de Gastos por Centro (Últimos 6 meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gastosPorMes}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="ADM" name="Administrativo" fill="#3B82F6" stackId="a" />
            <Bar dataKey="VND" name="Vendas" fill="#22C55E" stackId="a" />
            <Bar dataKey="MKT" name="Marketing" fill="#F59E0B" stackId="a" />
            <Bar dataKey="TI" name="Tecnologia" fill="#8B5CF6" stackId="a" />
            <Bar dataKey="LOG" name="Logística" fill="#EC4899" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title={selectedCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código"
              placeholder="Ex: ADM"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              maxLength={5}
            />
            <Input
              label="Nome"
              placeholder="Ex: Administrativo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <Input
            label="Responsável"
            placeholder="Nome do responsável"
            value={formData.responsavel}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          />

          <Input
            label="Orçamento Mensal"
            type="number"
            placeholder="0,00"
            value={formData.orcamento_mensal}
            onChange={(e) => setFormData({ ...formData, orcamento_mensal: e.target.value })}
          />

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="ativo" className="text-sm text-gray-700 dark:text-gray-300">
              Centro de custo ativo
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowModal(false)}>
              {selectedCentro ? 'Salvar Alterações' : 'Criar Centro'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
