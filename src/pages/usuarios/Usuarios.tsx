import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Shield,
  Key,
  Mail,
  Phone,
  Building2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';

// Tipos
interface Role {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  permissoes: Permission[];
  is_admin: boolean;
  created_at: string;
}

interface Permission {
  id: string;
  modulo: string;
  acao: string;
  descricao: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  avatar?: string;
  role: Role;
  filial_id?: string;
  filial_nome?: string;
  ativo: boolean;
  ultimo_acesso?: string;
  created_at: string;
  senha_temporaria?: boolean;
}

// Dados mockados
const mockRoles: Role[] = [
  {
    id: '1',
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema',
    cor: 'red',
    is_admin: true,
    permissoes: [],
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Gerente',
    descricao: 'Gerencia equipe e relatórios',
    cor: 'blue',
    is_admin: false,
    permissoes: [],
    created_at: '2024-01-01',
  },
  {
    id: '3',
    nome: 'Operador de Caixa',
    descricao: 'Acesso ao PDV e caixa',
    cor: 'green',
    is_admin: false,
    permissoes: [],
    created_at: '2024-01-01',
  },
  {
    id: '4',
    nome: 'Estoquista',
    descricao: 'Controle de estoque',
    cor: 'yellow',
    is_admin: false,
    permissoes: [],
    created_at: '2024-01-01',
  },
  {
    id: '5',
    nome: 'Financeiro',
    descricao: 'Contas a pagar e receber',
    cor: 'purple',
    is_admin: false,
    permissoes: [],
    created_at: '2024-01-01',
  },
];

const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'Admin Sistema',
    email: 'admin@fastpos.com',
    telefone: '(11) 99999-0001',
    cpf: '123.456.789-00',
    role: mockRoles[0],
    filial_nome: 'Matriz',
    ativo: true,
    ultimo_acesso: '2024-01-15T10:30:00',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    nome: 'Carlos Gerente',
    email: 'carlos@fastpos.com',
    telefone: '(11) 99999-0002',
    role: mockRoles[1],
    filial_nome: 'Matriz',
    ativo: true,
    ultimo_acesso: '2024-01-15T09:15:00',
    created_at: '2024-01-05',
  },
  {
    id: '3',
    nome: 'Ana Operadora',
    email: 'ana@fastpos.com',
    telefone: '(11) 99999-0003',
    role: mockRoles[2],
    filial_nome: 'Filial Centro',
    ativo: true,
    ultimo_acesso: '2024-01-15T08:00:00',
    created_at: '2024-01-10',
  },
  {
    id: '4',
    nome: 'Pedro Estoque',
    email: 'pedro@fastpos.com',
    role: mockRoles[3],
    filial_nome: 'Matriz',
    ativo: true,
    ultimo_acesso: '2024-01-14T16:45:00',
    created_at: '2024-01-08',
  },
  {
    id: '5',
    nome: 'Maria Financeiro',
    email: 'maria@fastpos.com',
    telefone: '(11) 99999-0005',
    role: mockRoles[4],
    filial_nome: 'Matriz',
    ativo: false,
    created_at: '2024-01-03',
    senha_temporaria: true,
  },
];

const mockPermissions: Permission[] = [
  // Dashboard
  { id: '1', modulo: 'dashboard', acao: 'visualizar', descricao: 'Ver dashboard' },
  { id: '2', modulo: 'dashboard', acao: 'exportar', descricao: 'Exportar relatórios do dashboard' },
  // PDV
  { id: '3', modulo: 'pdv', acao: 'vender', descricao: 'Realizar vendas' },
  { id: '4', modulo: 'pdv', acao: 'desconto', descricao: 'Aplicar descontos' },
  { id: '5', modulo: 'pdv', acao: 'cancelar', descricao: 'Cancelar vendas' },
  { id: '6', modulo: 'pdv', acao: 'devolucao', descricao: 'Realizar devoluções' },
  // Caixa
  { id: '7', modulo: 'caixa', acao: 'abrir', descricao: 'Abrir caixa' },
  { id: '8', modulo: 'caixa', acao: 'fechar', descricao: 'Fechar caixa' },
  { id: '9', modulo: 'caixa', acao: 'sangria', descricao: 'Realizar sangria' },
  { id: '10', modulo: 'caixa', acao: 'suprimento', descricao: 'Realizar suprimento' },
  // Produtos
  { id: '11', modulo: 'produtos', acao: 'visualizar', descricao: 'Ver produtos' },
  { id: '12', modulo: 'produtos', acao: 'criar', descricao: 'Criar produtos' },
  { id: '13', modulo: 'produtos', acao: 'editar', descricao: 'Editar produtos' },
  { id: '14', modulo: 'produtos', acao: 'excluir', descricao: 'Excluir produtos' },
  { id: '15', modulo: 'produtos', acao: 'preco', descricao: 'Alterar preços' },
  // Estoque
  { id: '16', modulo: 'estoque', acao: 'visualizar', descricao: 'Ver estoque' },
  { id: '17', modulo: 'estoque', acao: 'ajustar', descricao: 'Ajustar estoque' },
  { id: '18', modulo: 'estoque', acao: 'transferir', descricao: 'Transferir entre filiais' },
  { id: '19', modulo: 'estoque', acao: 'inventario', descricao: 'Realizar inventário' },
  // Clientes
  { id: '20', modulo: 'clientes', acao: 'visualizar', descricao: 'Ver clientes' },
  { id: '21', modulo: 'clientes', acao: 'criar', descricao: 'Cadastrar clientes' },
  { id: '22', modulo: 'clientes', acao: 'editar', descricao: 'Editar clientes' },
  { id: '23', modulo: 'clientes', acao: 'credito', descricao: 'Definir limite de crédito' },
  // Financeiro
  { id: '24', modulo: 'financeiro', acao: 'pagar', descricao: 'Contas a pagar' },
  { id: '25', modulo: 'financeiro', acao: 'receber', descricao: 'Contas a receber' },
  { id: '26', modulo: 'financeiro', acao: 'conciliar', descricao: 'Conciliação bancária' },
  { id: '27', modulo: 'financeiro', acao: 'dre', descricao: 'Ver DRE' },
  // Relatórios
  { id: '28', modulo: 'relatorios', acao: 'vendas', descricao: 'Relatório de vendas' },
  { id: '29', modulo: 'relatorios', acao: 'estoque', descricao: 'Relatório de estoque' },
  { id: '30', modulo: 'relatorios', acao: 'financeiro', descricao: 'Relatório financeiro' },
  // Configurações
  { id: '31', modulo: 'config', acao: 'empresa', descricao: 'Configurar empresa' },
  { id: '32', modulo: 'config', acao: 'usuarios', descricao: 'Gerenciar usuários' },
  { id: '33', modulo: 'config', acao: 'integracoes', descricao: 'Configurar integrações' },
  // Auditoria
  { id: '34', modulo: 'auditoria', acao: 'visualizar', descricao: 'Ver logs de auditoria' },
];

// Agrupar permissões por módulo
const groupedPermissions = mockPermissions.reduce((acc, perm) => {
  if (!acc[perm.modulo]) {
    acc[perm.modulo] = [];
  }
  acc[perm.modulo].push(perm);
  return acc;
}, {} as Record<string, Permission[]>);

const moduloLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  pdv: 'PDV',
  caixa: 'Caixa',
  produtos: 'Produtos',
  estoque: 'Estoque',
  clientes: 'Clientes',
  financeiro: 'Financeiro',
  relatorios: 'Relatórios',
  config: 'Configurações',
  auditoria: 'Auditoria',
};

export function Usuarios() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    role_id: '',
    filial_id: '',
    senha: '',
    confirmarSenha: '',
  });
  
  const [roleFormData, setRoleFormData] = useState({
    nome: '',
    descricao: '',
    cor: 'blue',
    is_admin: false,
    permissoes: [] as string[],
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [usuarios] = useState<Usuario[]>(mockUsuarios);
  const [roles] = useState<Role[]>(mockRoles);

  // Filtrar usuários
  const filteredUsuarios = usuarios.filter((user) => {
    const matchesSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role.id === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'ativo' && user.ativo) ||
      (statusFilter === 'inativo' && !user.ativo);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenUserModal = (user?: Usuario) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        cpf: user.cpf || '',
        role_id: user.role.id,
        filial_id: user.filial_id || '',
        senha: '',
        confirmarSenha: '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        role_id: '',
        filial_id: '',
        senha: '',
        confirmarSenha: '',
      });
    }
    setShowUserModal(true);
  };

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setRoleFormData({
        nome: role.nome,
        descricao: role.descricao,
        cor: role.cor,
        is_admin: role.is_admin,
        permissoes: role.permissoes.map((p) => p.id),
      });
    } else {
      setSelectedRole(null);
      setRoleFormData({
        nome: '',
        descricao: '',
        cor: 'blue',
        is_admin: false,
        permissoes: [],
      });
    }
    setShowRoleModal(true);
  };

  const handleOpenPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({
      ...roleFormData,
      permissoes: role.permissoes.map((p) => p.id),
    });
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setRoleFormData((prev) => ({
      ...prev,
      permissoes: prev.permissoes.includes(permissionId)
        ? prev.permissoes.filter((id) => id !== permissionId)
        : [...prev.permissoes, permissionId],
    }));
  };

  const handleSelectAllModule = (modulo: string) => {
    const modulePermissions = groupedPermissions[modulo].map((p) => p.id);
    const allSelected = modulePermissions.every((id) =>
      roleFormData.permissoes.includes(id)
    );

    if (allSelected) {
      setRoleFormData((prev) => ({
        ...prev,
        permissoes: prev.permissoes.filter((id) => !modulePermissions.includes(id)),
      }));
    } else {
      setRoleFormData((prev) => ({
        ...prev,
        permissoes: [...new Set([...prev.permissoes, ...modulePermissions])],
      }));
    }
  };

  const getRoleColor = (cor: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[cor] || colors.blue;
  };

  const formatLastAccess = (dateString?: string) => {
    if (!dateString) return 'Nunca acessou';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuários e Permissões
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie usuários, cargos e permissões de acesso
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'usuarios' ? (
            <Button onClick={() => handleOpenUserModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          ) : (
            <Button onClick={() => handleOpenRoleModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="usuarios">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="cargos">
            <Shield className="w-4 h-4 mr-2" />
            Cargos e Permissões
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Conteúdo das Tabs */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
                placeholder="Todos os cargos"
                options={[
                  { value: '', label: 'Todos os cargos' },
                  ...roles.map((r) => ({ value: r.id, label: r.nome })),
                ]}
              />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="Todos os status"
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'ativo', label: 'Ativos' },
                  { value: 'inativo', label: 'Inativos' },
                ]}
              />
            </div>
          </Card>

          {/* Lista de Usuários */}
          {filteredUsuarios.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum usuário encontrado"
              description="Ajuste os filtros ou cadastre um novo usuário"
              action={{
                label: 'Novo Usuário',
                onClick: () => handleOpenUserModal(),
              }}
            />
          ) : (
            <div className="grid gap-4">
              {filteredUsuarios.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <span className="text-lg font-semibold text-orange-600">
                          {user.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.nome}
                          </h3>
                          {user.senha_temporaria && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                              Senha temporária
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </span>
                          {user.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.telefone}
                            </span>
                          )}
                          {user.filial_nome && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {user.filial_nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Cargo */}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                          user.role.cor
                        )}`}
                      >
                        {user.role.nome}
                      </span>

                      {/* Status */}
                      <StatusChip
                        variant={user.ativo ? 'success' : 'danger'}
                        label={user.ativo ? 'Ativo' : 'Inativo'}
                      />

                      {/* Último acesso */}
                      <div className="text-sm text-gray-500 dark:text-gray-400 min-w-28">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatLastAccess(user.ultimo_acesso)}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenUserModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Redefinir senha"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Mais opções"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cargos' && (
        <div className="space-y-4">
          {/* Lista de Cargos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRoleColor(
                        role.cor
                      )}`}
                    >
                      {role.is_admin ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {role.nome}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {role.descricao}
                      </p>
                    </div>
                  </div>
                  {role.is_admin && (
                    <span title="Administrador">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {usuarios.filter((u) => u.role.id === role.id).length} usuários
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPermissionsModal(role)}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Permissões
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenRoleModal(role)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Legenda de Permissões */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Módulos do Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(moduloLabels).map(([key, label]) => (
                <div
                  key={key}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {groupedPermissions[key]?.length || 0} permissões
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Usuário */}
      <Modal
        open={showUserModal}
        onOpenChange={setShowUserModal}
        title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome completo"
              placeholder="Nome do usuário"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cargo
              </label>
              <Select
                value={formData.role_id}
                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                placeholder="Selecione o cargo"
                options={roles.map((r) => ({ value: r.id, label: r.nome }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filial
              </label>
              <Select
                value={formData.filial_id}
                onValueChange={(value) => setFormData({ ...formData, filial_id: value })}
                placeholder="Selecione a filial"
                options={[
                  { value: '1', label: 'Matriz' },
                  { value: '2', label: 'Filial Centro' },
                  { value: '3', label: 'Filial Norte' },
                ]}
              />
            </div>
          </div>

          {!selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Input
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={(e) =>
                  setFormData({ ...formData, confirmarSenha: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button>
              {selectedUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Cargo */}
      <Modal
        open={showRoleModal}
        onOpenChange={setShowRoleModal}
        title={selectedRole ? 'Editar Cargo' : 'Novo Cargo'}
      >
        <div className="space-y-4">
          <Input
            label="Nome do cargo"
            placeholder="Ex: Supervisor de Vendas"
            value={roleFormData.nome}
            onChange={(e) =>
              setRoleFormData({ ...roleFormData, nome: e.target.value })
            }
          />

          <Input
            label="Descrição"
            placeholder="Descreva as responsabilidades deste cargo"
            value={roleFormData.descricao}
            onChange={(e) =>
              setRoleFormData({ ...roleFormData, descricao: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cor do cargo
            </label>
            <div className="flex gap-2">
              {['blue', 'green', 'yellow', 'red', 'purple', 'orange'].map((cor) => (
                <button
                  key={cor}
                  onClick={() => setRoleFormData({ ...roleFormData, cor })}
                  className={`w-8 h-8 rounded-full ${
                    cor === 'blue'
                      ? 'bg-blue-500'
                      : cor === 'green'
                      ? 'bg-green-500'
                      : cor === 'yellow'
                      ? 'bg-yellow-500'
                      : cor === 'red'
                      ? 'bg-red-500'
                      : cor === 'purple'
                      ? 'bg-purple-500'
                      : 'bg-orange-500'
                  } ${
                    roleFormData.cor === cor
                      ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <input
              type="checkbox"
              id="is_admin"
              checked={roleFormData.is_admin}
              onChange={(e) =>
                setRoleFormData({ ...roleFormData, is_admin: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="is_admin" className="flex-1">
              <span className="font-medium text-red-800 dark:text-red-400">
                Administrador do Sistema
              </span>
              <p className="text-sm text-red-600 dark:text-red-500">
                Terá acesso total a todas as funcionalidades
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              Cancelar
            </Button>
            <Button>
              {selectedRole ? 'Salvar Alterações' : 'Criar Cargo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Permissões */}
      <Modal
        open={showPermissionsModal}
        onOpenChange={setShowPermissionsModal}
        title={`Permissões - ${selectedRole?.nome}`}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {selectedRole?.is_admin ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Administrador tem acesso total</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                Este cargo possui todas as permissões automaticamente
              </p>
            </div>
          ) : (
            Object.entries(groupedPermissions).map(([modulo, perms]) => (
              <div key={modulo} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleSelectAllModule(modulo)}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {moduloLabels[modulo]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {perms.filter((p) => roleFormData.permissoes.includes(p.id)).length}/{perms.length}
                    </span>
                    {perms.every((p) => roleFormData.permissoes.includes(p.id)) ? (
                      <Unlock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={roleFormData.permissoes.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {perm.descricao}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({perm.acao})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setShowPermissionsModal(false)}>
            Salvar Permissões
          </Button>
        </div>
      </Modal>

      {/* Modal Redefinir Senha */}
      <Modal
        open={showResetPasswordModal}
        onOpenChange={setShowResetPasswordModal}
        title="Redefinir Senha"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Redefinir senha de {selectedUser?.nome}</span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
              Uma nova senha temporária será enviada para o email do usuário
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              id="force_change"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="force_change" className="text-sm text-gray-700 dark:text-gray-300">
              Forçar alteração de senha no próximo login
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowResetPasswordModal(false)}>
              Enviar Nova Senha
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
