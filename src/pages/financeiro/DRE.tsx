
import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  Card,
  Button,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
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
interface DRECategoria {
  id: string;
  nome: string;
  valor: number;
  percentual: number;
  cor: string;
  subcategorias?: DRECategoria[];
  expandido?: boolean;
}

interface DREData {
  receitaBruta: number;
  deducoes: {
    descontos: number;
    devolucoes: number;
    impostosSobreVenda: number;
    total: number;
  };
  receitaLiquida: number;
  custos: {
    cmv: number; // Custo Mercadoria Vendida
    total: number;
  };
  lucroBruto: number;
  despesasOperacionais: {
    administrativas: DRECategoria[];
    vendas: DRECategoria[];
    financeiras: DRECategoria[];
    total: number;
  };
  resultadoOperacional: number;
  outrasReceitas: number;
  outrasDespesas: number;
  resultadoAntesIR: number;
  impostoRenda: number;
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

// Dados mockados
const mockDREData: DREData = {
  receitaBruta: 150000.00,
  deducoes: {
    descontos: 5000.00,
    devolucoes: 2000.00,
    impostosSobreVenda: 12750.00, // 8.5% (Simples)
    total: 19750.00,
  },
  receitaLiquida: 130250.00,
  custos: {
    cmv: 75000.00,
    total: 75000.00,
  },
  lucroBruto: 55250.00,
  despesasOperacionais: {
    administrativas: [
      { id: '1', nome: 'Aluguel', valor: 3500.00, percentual: 2.69, cor: '#8B5CF6' },
      { id: '2', nome: 'Energia', valor: 850.00, percentual: 0.65, cor: '#EC4899' },
      { id: '3', nome: 'Água', valor: 150.00, percentual: 0.12, cor: '#06B6D4' },
      { id: '4', nome: 'Internet/Telefone', valor: 350.00, percentual: 0.27, cor: '#F59E0B' },
      { id: '5', nome: 'Manutenção', valor: 500.00, percentual: 0.38, cor: '#6B7280' },
    ],
    vendas: [
      { id: '6', nome: 'Salários Vendedores', valor: 8000.00, percentual: 6.14, cor: '#3B82F6' },
      { id: '7', nome: 'Comissões', valor: 4500.00, percentual: 3.46, cor: '#22C55E' },
      { id: '8', nome: 'Marketing', valor: 2000.00, percentual: 1.54, cor: '#EF4444' },
    ],
    financeiras: [
      { id: '9', nome: 'Taxas Cartão', valor: 3000.00, percentual: 2.30, cor: '#F97316' },
      { id: '10', nome: 'Juros', valor: 500.00, percentual: 0.38, cor: '#DC2626' },
    ],
    total: 23350.00,
  },
  resultadoOperacional: 31900.00,
  outrasReceitas: 500.00,
  outrasDespesas: 200.00,
  resultadoAntesIR: 32200.00,
  impostoRenda: 0, // Simples Nacional já incluso
  lucroLiquido: 32200.00,
  margemBruta: 42.42,
  margemLiquida: 24.72,
};

const evolucaoMensal = [
  { mes: 'Jul', receita: 120000, despesas: 95000, lucro: 25000 },
  { mes: 'Ago', receita: 135000, despesas: 100000, lucro: 35000 },
  { mes: 'Set', receita: 128000, despesas: 98000, lucro: 30000 },
  { mes: 'Out', receita: 142000, despesas: 105000, lucro: 37000 },
  { mes: 'Nov', receita: 155000, despesas: 115000, lucro: 40000 },
  { mes: 'Dez', receita: 150000, despesas: 117800, lucro: 32200 },
];

export function DREPage() {
  const [periodo, setPeriodo] = useState('mes');
  const [activeTab, setActiveTab] = useState('dre');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['administrativas', 'vendas', 'financeiras']);

  const data = mockDREData;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const despesasPieData = [
    ...data.despesasOperacionais.administrativas,
    ...data.despesasOperacionais.vendas,
    ...data.despesasOperacionais.financeiras,
  ].map(d => ({
    name: d.nome,
    value: d.valor,
    color: d.cor,
  }));

  const DRELine = ({ 
    label, 
    value, 
    level = 0, 
    type = 'normal',
    percentual,
    isExpandable = false,
    isExpanded = false,
    onToggle,
  }: { 
    label: string; 
    value: number; 
    level?: number; 
    type?: 'normal' | 'subtotal' | 'total' | 'destaque';
    percentual?: number;
    isExpandable?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
  }) => {
    const isNegative = value < 0;
    const paddingLeft = level * 24;
    
    return (
      <div 
        className={cn(
          'flex items-center justify-between py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
          type === 'subtotal' && 'bg-gray-50 dark:bg-gray-800/30 font-medium',
          type === 'total' && 'bg-orange-50 dark:bg-orange-900/20 font-bold text-lg',
          type === 'destaque' && 'bg-green-50 dark:bg-green-900/20 font-semibold',
          isExpandable && 'cursor-pointer',
        )}
        style={{ paddingLeft: paddingLeft + 16 }}
        onClick={isExpandable ? onToggle : undefined}
      >
        <div className="flex items-center gap-2">
          {isExpandable && (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
          <span className={cn(
            type === 'normal' && 'text-gray-700 dark:text-gray-300',
            type === 'subtotal' && 'text-gray-900 dark:text-white',
            type === 'total' && 'text-orange-600 dark:text-orange-400',
            type === 'destaque' && 'text-green-600 dark:text-green-400',
          )}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {percentual !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
              {percentual.toFixed(2)}%
            </span>
          )}
          <span className={cn(
            'font-mono min-w-32 text-right',
            isNegative ? 'text-red-600' : type === 'destaque' ? 'text-green-600' : 'text-gray-900 dark:text-white',
          )}>
            {isNegative && '('}{formatCurrency(Math.abs(value))}{isNegative && ')'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            DRE - Demonstrativo de Resultados
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Análise de resultados e lucratividade
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={periodo}
            onValueChange={setPeriodo}
            options={[
              { value: 'mes', label: 'Este Mês' },
              { value: 'trimestre', label: 'Trimestre' },
              { value: 'semestre', label: 'Semestre' },
              { value: 'ano', label: 'Este Ano' },
            ]}
          />
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Receita Líquida</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.receitaLiquida)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">+12.5% vs mês anterior</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Lucro Bruto</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(data.lucroBruto)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Margem: {data.margemBruta.toFixed(2)}%
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Despesas Op.</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(data.despesasOperacionais.total)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600">-5.2% vs mês anterior</span>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Lucro Líquido</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(data.lucroLiquido)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Margem: {data.margemLiquida.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dre">
            <BarChart3 className="w-4 h-4 mr-2" />
            DRE Detalhado
          </TabsTrigger>
          <TabsTrigger value="graficos">
            <PieChart className="w-4 h-4 mr-2" />
            Gráficos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'dre' && (
        <Card className="overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Descrição</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-16 text-right">% RB</span>
                <span className="font-semibold text-gray-900 dark:text-white min-w-32 text-right">Valor (R$)</span>
              </div>
            </div>
          </div>

          {/* Conteúdo DRE */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* RECEITA BRUTA */}
            <DRELine 
              label="RECEITA BRUTA DE VENDAS" 
              value={data.receitaBruta} 
              type="subtotal"
              percentual={100}
            />
            
            {/* Deduções */}
            <DRELine 
              label="(-) Descontos Concedidos" 
              value={-data.deducoes.descontos}
              level={1}
              percentual={(data.deducoes.descontos / data.receitaBruta) * 100}
            />
            <DRELine 
              label="(-) Devoluções" 
              value={-data.deducoes.devolucoes}
              level={1}
              percentual={(data.deducoes.devolucoes / data.receitaBruta) * 100}
            />
            <DRELine 
              label="(-) Impostos sobre Vendas" 
              value={-data.deducoes.impostosSobreVenda}
              level={1}
              percentual={(data.deducoes.impostosSobreVenda / data.receitaBruta) * 100}
            />
            
            {/* RECEITA LÍQUIDA */}
            <DRELine 
              label="RECEITA LÍQUIDA" 
              value={data.receitaLiquida} 
              type="subtotal"
              percentual={(data.receitaLiquida / data.receitaBruta) * 100}
            />
            
            {/* CMV */}
            <DRELine 
              label="(-) Custo das Mercadorias Vendidas (CMV)" 
              value={-data.custos.cmv}
              level={1}
              percentual={(data.custos.cmv / data.receitaBruta) * 100}
            />
            
            {/* LUCRO BRUTO */}
            <DRELine 
              label="LUCRO BRUTO" 
              value={data.lucroBruto} 
              type="destaque"
              percentual={data.margemBruta}
            />
            
            {/* Despesas Administrativas */}
            <DRELine 
              label="(-) Despesas Administrativas" 
              value={-data.despesasOperacionais.administrativas.reduce((acc, d) => acc + d.valor, 0)}
              level={1}
              isExpandable
              isExpanded={expandedCategories.includes('administrativas')}
              onToggle={() => toggleCategory('administrativas')}
            />
            {expandedCategories.includes('administrativas') && data.despesasOperacionais.administrativas.map(desp => (
              <DRELine 
                key={desp.id}
                label={desp.nome} 
                value={-desp.valor}
                level={2}
                percentual={desp.percentual}
              />
            ))}
            
            {/* Despesas com Vendas */}
            <DRELine 
              label="(-) Despesas com Vendas" 
              value={-data.despesasOperacionais.vendas.reduce((acc, d) => acc + d.valor, 0)}
              level={1}
              isExpandable
              isExpanded={expandedCategories.includes('vendas')}
              onToggle={() => toggleCategory('vendas')}
            />
            {expandedCategories.includes('vendas') && data.despesasOperacionais.vendas.map(desp => (
              <DRELine 
                key={desp.id}
                label={desp.nome} 
                value={-desp.valor}
                level={2}
                percentual={desp.percentual}
              />
            ))}
            
            {/* Despesas Financeiras */}
            <DRELine 
              label="(-) Despesas Financeiras" 
              value={-data.despesasOperacionais.financeiras.reduce((acc, d) => acc + d.valor, 0)}
              level={1}
              isExpandable
              isExpanded={expandedCategories.includes('financeiras')}
              onToggle={() => toggleCategory('financeiras')}
            />
            {expandedCategories.includes('financeiras') && data.despesasOperacionais.financeiras.map(desp => (
              <DRELine 
                key={desp.id}
                label={desp.nome} 
                value={-desp.valor}
                level={2}
                percentual={desp.percentual}
              />
            ))}
            
            {/* RESULTADO OPERACIONAL */}
            <DRELine 
              label="RESULTADO OPERACIONAL" 
              value={data.resultadoOperacional} 
              type="subtotal"
              percentual={(data.resultadoOperacional / data.receitaBruta) * 100}
            />
            
            {/* Outras Receitas/Despesas */}
            <DRELine 
              label="(+) Outras Receitas" 
              value={data.outrasReceitas}
              level={1}
              percentual={(data.outrasReceitas / data.receitaBruta) * 100}
            />
            <DRELine 
              label="(-) Outras Despesas" 
              value={-data.outrasDespesas}
              level={1}
              percentual={(data.outrasDespesas / data.receitaBruta) * 100}
            />
            
            {/* LUCRO LÍQUIDO */}
            <DRELine 
              label="LUCRO LÍQUIDO DO PERÍODO" 
              value={data.lucroLiquido} 
              type="total"
              percentual={data.margemLiquida}
            />
          </div>
        </Card>
      )}

      {activeTab === 'graficos' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Evolução Mensal */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Evolução Mensal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="receita" name="Receita" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Composição das Despesas */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Composição das Despesas Operacionais
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={despesasPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {despesasPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </RePieChart>
            </ResponsiveContainer>
          </Card>

          {/* Indicadores */}
          <Card className="p-6 col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Indicadores de Performance
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{data.margemBruta.toFixed(1)}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Margem Bruta</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{data.margemLiquida.toFixed(1)}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Margem Líquida</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {((data.despesasOperacionais.total / data.receitaBruta) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Despesas/Receita</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {((data.custos.cmv / data.receitaBruta) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">CMV/Receita</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
