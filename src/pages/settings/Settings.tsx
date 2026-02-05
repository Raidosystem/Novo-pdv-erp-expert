import { useState } from 'react';
import { Store, User, Bell, Shield, Palette, Database, Save } from 'lucide-react';
import { Card, CardHeader, Input, Button } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'company', label: 'Empresa', icon: Store },
  { id: 'user', label: 'Usuário', icon: User },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'permissions', label: 'Permissões', icon: Shield },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'backup', label: 'Backup', icon: Database },
];

export const Settings = () => {
  const { isDarkMode, setDarkMode, isDense, setDense } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn('text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
          Configurações
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card padding="sm">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'company' && (
            <Card>
              <CardHeader title="Dados da Empresa" subtitle="Informações básicas do estabelecimento" />
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Razão Social" placeholder="Nome da empresa" defaultValue="Minha Loja LTDA" />
                  <Input label="Nome Fantasia" placeholder="Nome fantasia" defaultValue="FastPOS Store" />
                  <Input label="CNPJ" placeholder="00.000.000/0000-00" defaultValue="12.345.678/0001-90" />
                  <Input label="Inscrição Estadual" placeholder="Inscrição estadual" />
                  <Input label="Telefone" placeholder="(00) 0000-0000" defaultValue="(11) 3456-7890" />
                  <Input label="Email" type="email" placeholder="email@empresa.com" defaultValue="contato@fastpos.com" />
                </div>
                <div className={cn('border-t pt-4 mt-4', isDarkMode ? 'border-gray-800' : 'border-gray-200')}>
                  <h3 className={cn('font-semibold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="CEP" placeholder="00000-000" />
                    <Input label="Rua" placeholder="Nome da rua" className="md:col-span-2" />
                    <Input label="Número" placeholder="123" />
                    <Input label="Complemento" placeholder="Sala, andar..." />
                    <Input label="Bairro" placeholder="Bairro" />
                    <Input label="Cidade" placeholder="Cidade" />
                    <Input label="Estado" placeholder="UF" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader title="Aparência" subtitle="Personalize a interface do sistema" />
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <h3 className={cn('font-semibold mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    Tema
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDarkMode(false)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        !isDarkMode
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className="w-full h-20 rounded-lg bg-gray-50 border border-gray-200 mb-3 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-lg bg-white shadow-sm" />
                      </div>
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        Claro
                      </div>
                      <div className="text-sm text-gray-500">Tema padrão</div>
                    </button>
                    <button
                      onClick={() => setDarkMode(true)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        isDarkMode
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className="w-full h-20 rounded-lg bg-gray-900 border border-gray-700 mb-3 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-800 shadow-sm" />
                      </div>
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        Escuro
                      </div>
                      <div className="text-sm text-gray-500">Para ambientes escuros</div>
                    </button>
                  </div>
                </div>

                {/* Density */}
                <div className={cn('border-t pt-6', isDarkMode ? 'border-gray-800' : 'border-gray-200')}>
                  <h3 className={cn('font-semibold mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    Densidade
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDense(false)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        !isDense
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        Confortável
                      </div>
                      <div className="text-sm text-gray-500">Mais espaçamento, melhor leitura</div>
                    </button>
                    <button
                      onClick={() => setDense(true)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        isDense
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        Compacto
                      </div>
                      <div className="text-sm text-gray-500">Mais informações na tela</div>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'user' && (
            <Card>
              <CardHeader title="Perfil do Usuário" subtitle="Suas informações pessoais" />
              <form className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    JS
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Alterar Foto
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nome" placeholder="Seu nome" defaultValue="João Silva" />
                  <Input label="Email" type="email" placeholder="seu@email.com" defaultValue="joao@fastpos.com" />
                  <Input label="Telefone" placeholder="(00) 00000-0000" defaultValue="(11) 99999-9999" />
                  <Input label="Cargo" placeholder="Seu cargo" defaultValue="Administrador" disabled />
                </div>
                <div className={cn('border-t pt-4 mt-4', isDarkMode ? 'border-gray-800' : 'border-gray-200')}>
                  <h3 className={cn('font-semibold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    Alterar Senha
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Senha Atual" type="password" placeholder="••••••••" />
                    <div />
                    <Input label="Nova Senha" type="password" placeholder="••••••••" />
                    <Input label="Confirmar Nova Senha" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {(activeTab === 'notifications' || activeTab === 'permissions' || activeTab === 'backup') && (
            <Card>
              <CardHeader 
                title={tabs.find(t => t.id === activeTab)?.label || ''} 
                subtitle="Em desenvolvimento" 
              />
              <div className="text-center py-12">
                <div className={cn(
                  'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                )}>
                  {activeTab === 'notifications' && <Bell className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'permissions' && <Shield className="w-8 h-8 text-gray-400" />}
                  {activeTab === 'backup' && <Database className="w-8 h-8 text-gray-400" />}
                </div>
                <p className="text-gray-500">Esta seção está em desenvolvimento.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
