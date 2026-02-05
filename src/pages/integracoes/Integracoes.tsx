
import { useState } from 'react';
import { 
  Plug, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button, Card, StatusChip, Modal, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'pagamentos' | 'fiscal' | 'delivery' | 'marketplace' | 'contabilidade';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

const integrations: Integration[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Receba pagamentos por cartão, PIX e boleto',
    icon: '💳',
    category: 'pagamentos',
    status: 'connected',
    lastSync: new Date('2024-01-16T10:30:00'),
  },
  {
    id: 'pagseguro',
    name: 'PagSeguro',
    description: 'Maquininhas e pagamentos online',
    icon: '💰',
    category: 'pagamentos',
    status: 'disconnected',
  },
  {
    id: 'stone',
    name: 'Stone',
    description: 'Maquininhas de cartão Stone',
    icon: '💎',
    category: 'pagamentos',
    status: 'disconnected',
  },
  {
    id: 'nfe',
    name: 'Nota Fiscal (NF-e)',
    description: 'Emissão de notas fiscais eletrônicas',
    icon: '📄',
    category: 'fiscal',
    status: 'connected',
    lastSync: new Date('2024-01-16T14:00:00'),
  },
  {
    id: 'nfce',
    name: 'Cupom Fiscal (NFC-e)',
    description: 'Emissão de cupons fiscais',
    icon: '🧾',
    category: 'fiscal',
    status: 'connected',
    lastSync: new Date('2024-01-16T14:00:00'),
  },
  {
    id: 'sat',
    name: 'SAT (SP)',
    description: 'Sistema Autenticador e Transmissor',
    icon: '📟',
    category: 'fiscal',
    status: 'error',
  },
  {
    id: 'ifood',
    name: 'iFood',
    description: 'Integração com pedidos do iFood',
    icon: '🍔',
    category: 'delivery',
    status: 'disconnected',
  },
  {
    id: 'rappi',
    name: 'Rappi',
    description: 'Receba pedidos da Rappi',
    icon: '🛵',
    category: 'delivery',
    status: 'disconnected',
  },
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    description: 'Sincronize produtos e vendas',
    icon: '🛒',
    category: 'marketplace',
    status: 'disconnected',
  },
  {
    id: 'shopee',
    name: 'Shopee',
    description: 'Integração com a Shopee',
    icon: '🧡',
    category: 'marketplace',
    status: 'disconnected',
  },
  {
    id: 'contaazul',
    name: 'Conta Azul',
    description: 'Envie vendas para contabilidade',
    icon: '💙',
    category: 'contabilidade',
    status: 'connected',
    lastSync: new Date('2024-01-15T18:00:00'),
  },
  {
    id: 'omie',
    name: 'Omie',
    description: 'ERP e gestão empresarial',
    icon: '📊',
    category: 'contabilidade',
    status: 'disconnected',
  },
];

const categories = [
  { id: 'todas', label: 'Todas' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'fiscal', label: 'Fiscal' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'contabilidade', label: 'Contabilidade' },
];

export const Integracoes = () => {
  const [activeCategory, setActiveCategory] = useState('todas');
  const [configModal, setConfigModal] = useState<Integration | null>(null);

  const filteredIntegrations =
    activeCategory === 'todas'
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const errorCount = integrations.filter((i) => i.status === 'error').length;

  const handleConnect = (integration: Integration) => {
    setConfigModal(integration);
  };

  const handleDisconnect = (integration: Integration) => {
    console.log('Disconnect', integration.id);
  };

  const getStatusInfo = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return { icon: CheckCircle2, label: 'Conectado', variant: 'success' as const };
      case 'error':
        return { icon: AlertTriangle, label: 'Erro', variant: 'danger' as const };
      default:
        return { icon: XCircle, label: 'Desconectado', variant: 'neutral' as const };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrações
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Conecte suas ferramentas favoritas ao FastPOS
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Plug className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {integrations.length}
              </p>
              <p className="text-sm text-gray-500">Total Disponíveis</p>
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
                {connectedCount}
              </p>
              <p className="text-sm text-gray-500">Conectadas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {errorCount}
              </p>
              <p className="text-sm text-gray-500">Com Erro</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => {
          const statusInfo = getStatusInfo(integration.status);

          return (
            <Card
              key={integration.id}
              className={cn(
                'p-6 transition-colors',
                integration.status === 'error' && 'border-red-300 dark:border-red-700'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {integration.name}
                    </h3>
                    <StatusChip
                      label={statusInfo.label}
                      variant={statusInfo.variant}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {integration.description}
              </p>

              {integration.lastSync && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  Última sincronização:{' '}
                  {integration.lastSync.toLocaleString('pt-BR')}
                </p>
              )}

              <div className="flex gap-2">
                {integration.status === 'connected' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setConfigModal(integration)}
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Sync', integration.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </>
                ) : integration.status === 'error' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfigModal(integration)}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Corrigir
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConnect(integration)}
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Config Modal */}
      <Modal
        open={!!configModal}
        onOpenChange={(open) => !open && setConfigModal(null)}
        title={`Configurar ${configModal?.name || ''}`}
        size="md"
      >
        {configModal && (
          <div className="space-y-4">
            {configModal.status === 'disconnected' ? (
              <>
                <p className="text-gray-500 dark:text-gray-400">
                  Para conectar com {configModal.name}, preencha as credenciais abaixo:
                </p>
                <Input label="Client ID / API Key" placeholder="Sua chave de API" />
                <Input
                  label="Secret Key"
                  type="password"
                  placeholder="Sua chave secreta"
                />
                <div className="flex items-center gap-2 pt-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <a
                    href="#"
                    className="text-sm text-primary-500 hover:underline"
                  >
                    Como obter minhas credenciais?
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Integração ativa</span>
                  </div>
                </div>
                <Input label="Client ID" value="xxxxxxxx-xxxx-xxxx" readOnly />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      handleDisconnect(configModal);
                      setConfigModal(null);
                    }}
                  >
                    Desconectar Integração
                  </Button>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="ghost" onClick={() => setConfigModal(null)}>
                Cancelar
              </Button>
              <Button onClick={() => setConfigModal(null)}>
                {configModal.status === 'disconnected' ? 'Conectar' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Integracoes;
