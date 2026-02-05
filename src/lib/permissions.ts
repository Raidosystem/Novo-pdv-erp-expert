// ============================================
// SISTEMA DE PERMISSÕES (RBAC)
// ============================================

// Definição de todas as permissões do sistema
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',
  
  // PDV
  PDV_VIEW: 'pdv:view',
  PDV_SELL: 'pdv:sell',
  PDV_DISCOUNT: 'pdv:discount',
  PDV_CANCEL_ITEM: 'pdv:cancel_item',
  PDV_CANCEL_SALE: 'pdv:cancel_sale',
  
  // Caixa
  CAIXA_VIEW: 'caixa:view',
  CAIXA_OPEN: 'caixa:open',
  CAIXA_CLOSE: 'caixa:close',
  CAIXA_SANGRIA: 'caixa:sangria',
  CAIXA_SUPRIMENTO: 'caixa:suprimento',
  
  // Produtos
  PRODUTOS_VIEW: 'produtos:view',
  PRODUTOS_CREATE: 'produtos:create',
  PRODUTOS_EDIT: 'produtos:edit',
  PRODUTOS_DELETE: 'produtos:delete',
  PRODUTOS_PRICE: 'produtos:price',
  
  // Estoque
  ESTOQUE_VIEW: 'estoque:view',
  ESTOQUE_ADJUST: 'estoque:adjust',
  ESTOQUE_TRANSFER: 'estoque:transfer',
  ESTOQUE_INVENTORY: 'estoque:inventory',
  
  // Clientes
  CLIENTES_VIEW: 'clientes:view',
  CLIENTES_CREATE: 'clientes:create',
  CLIENTES_EDIT: 'clientes:edit',
  CLIENTES_DELETE: 'clientes:delete',
  CLIENTES_CREDIT: 'clientes:credit',
  
  // Financeiro
  FINANCEIRO_VIEW: 'financeiro:view',
  FINANCEIRO_CONTAS: 'financeiro:contas',
  FINANCEIRO_DRE: 'financeiro:dre',
  FINANCEIRO_CONCILIACAO: 'financeiro:conciliacao',
  FINANCEIRO_PAY: 'financeiro:pay',
  FINANCEIRO_RECEIVE: 'financeiro:receive',
  
  // Relatórios
  RELATORIOS_VIEW: 'relatorios:view',
  RELATORIOS_VENDAS: 'relatorios:vendas',
  RELATORIOS_FINANCEIRO: 'relatorios:financeiro',
  RELATORIOS_ESTOQUE: 'relatorios:estoque',
  RELATORIOS_EXPORT: 'relatorios:export',
  
  // Ordens de Serviço
  OS_VIEW: 'os:view',
  OS_CREATE: 'os:create',
  OS_EDIT: 'os:edit',
  OS_DELETE: 'os:delete',
  
  // Integrações
  INTEGRACOES_VIEW: 'integracoes:view',
  INTEGRACOES_MANAGE: 'integracoes:manage',
  
  // Usuários
  USUARIOS_VIEW: 'usuarios:view',
  USUARIOS_CREATE: 'usuarios:create',
  USUARIOS_EDIT: 'usuarios:edit',
  USUARIOS_DELETE: 'usuarios:delete',
  USUARIOS_PERMISSIONS: 'usuarios:permissions',
  
  // Auditoria
  AUDITORIA_VIEW: 'auditoria:view',
  AUDITORIA_EXPORT: 'auditoria:export',
  
  // Configurações
  CONFIG_VIEW: 'config:view',
  CONFIG_EMPRESA: 'config:empresa',
  CONFIG_SISTEMA: 'config:sistema',
  CONFIG_FISCAL: 'config:fiscal',
  
  // Admin
  ADMIN_FULL: '*',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Perfis pré-definidos
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['*'],
  
  gerente: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PDV_VIEW,
    PERMISSIONS.PDV_SELL,
    PERMISSIONS.PDV_DISCOUNT,
    PERMISSIONS.PDV_CANCEL_ITEM,
    PERMISSIONS.PDV_CANCEL_SALE,
    PERMISSIONS.CAIXA_VIEW,
    PERMISSIONS.CAIXA_OPEN,
    PERMISSIONS.CAIXA_CLOSE,
    PERMISSIONS.CAIXA_SANGRIA,
    PERMISSIONS.CAIXA_SUPRIMENTO,
    PERMISSIONS.PRODUTOS_VIEW,
    PERMISSIONS.PRODUTOS_CREATE,
    PERMISSIONS.PRODUTOS_EDIT,
    PERMISSIONS.PRODUTOS_PRICE,
    PERMISSIONS.ESTOQUE_VIEW,
    PERMISSIONS.ESTOQUE_ADJUST,
    PERMISSIONS.CLIENTES_VIEW,
    PERMISSIONS.CLIENTES_CREATE,
    PERMISSIONS.CLIENTES_EDIT,
    PERMISSIONS.CLIENTES_CREDIT,
    PERMISSIONS.FINANCEIRO_VIEW,
    PERMISSIONS.FINANCEIRO_CONTAS,
    PERMISSIONS.RELATORIOS_VIEW,
    PERMISSIONS.RELATORIOS_VENDAS,
    PERMISSIONS.RELATORIOS_FINANCEIRO,
    PERMISSIONS.RELATORIOS_EXPORT,
    PERMISSIONS.OS_VIEW,
    PERMISSIONS.OS_CREATE,
    PERMISSIONS.OS_EDIT,
    PERMISSIONS.USUARIOS_VIEW,
    PERMISSIONS.CONFIG_VIEW,
  ],
  
  vendedor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PDV_VIEW,
    PERMISSIONS.PDV_SELL,
    PERMISSIONS.CAIXA_VIEW,
    PERMISSIONS.PRODUTOS_VIEW,
    PERMISSIONS.CLIENTES_VIEW,
    PERMISSIONS.CLIENTES_CREATE,
    PERMISSIONS.OS_VIEW,
    PERMISSIONS.OS_CREATE,
  ],
  
  caixa: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PDV_VIEW,
    PERMISSIONS.PDV_SELL,
    PERMISSIONS.CAIXA_VIEW,
    PERMISSIONS.CAIXA_OPEN,
    PERMISSIONS.CAIXA_CLOSE,
    PERMISSIONS.PRODUTOS_VIEW,
    PERMISSIONS.CLIENTES_VIEW,
  ],
  
  estoquista: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUTOS_VIEW,
    PERMISSIONS.ESTOQUE_VIEW,
    PERMISSIONS.ESTOQUE_ADJUST,
    PERMISSIONS.ESTOQUE_TRANSFER,
    PERMISSIONS.ESTOQUE_INVENTORY,
  ],
  
  financeiro: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.FINANCEIRO_VIEW,
    PERMISSIONS.FINANCEIRO_CONTAS,
    PERMISSIONS.FINANCEIRO_DRE,
    PERMISSIONS.FINANCEIRO_CONCILIACAO,
    PERMISSIONS.FINANCEIRO_PAY,
    PERMISSIONS.FINANCEIRO_RECEIVE,
    PERMISSIONS.RELATORIOS_VIEW,
    PERMISSIONS.RELATORIOS_FINANCEIRO,
    PERMISSIONS.RELATORIOS_EXPORT,
    PERMISSIONS.CLIENTES_VIEW,
    PERMISSIONS.CLIENTES_CREDIT,
  ],
};

// Função para verificar permissão
export const hasPermission = (
  userPermissions: Permission[] | string[],
  requiredPermission: Permission
): boolean => {
  // Se tem permissão de admin, pode tudo
  if (userPermissions.includes('*')) return true;
  
  // Verificar permissão específica
  return userPermissions.includes(requiredPermission);
};

// Função para verificar múltiplas permissões (OR)
export const hasAnyPermission = (
  userPermissions: Permission[] | string[],
  requiredPermissions: Permission[]
): boolean => {
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.some(p => userPermissions.includes(p));
};

// Função para verificar múltiplas permissões (AND)
export const hasAllPermissions = (
  userPermissions: Permission[] | string[],
  requiredPermissions: Permission[]
): boolean => {
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.every(p => userPermissions.includes(p));
};

// Mapeamento de rotas para permissões
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': [PERMISSIONS.DASHBOARD_VIEW],
  '/pdv': [PERMISSIONS.PDV_VIEW],
  '/pdv/nova-venda': [PERMISSIONS.PDV_SELL],
  '/caixa': [PERMISSIONS.CAIXA_VIEW],
  '/produtos': [PERMISSIONS.PRODUTOS_VIEW],
  '/estoque': [PERMISSIONS.ESTOQUE_VIEW],
  '/clientes': [PERMISSIONS.CLIENTES_VIEW],
  '/financeiro': [PERMISSIONS.FINANCEIRO_VIEW],
  '/financeiro/contas': [PERMISSIONS.FINANCEIRO_CONTAS],
  '/financeiro/dre': [PERMISSIONS.FINANCEIRO_DRE],
  '/financeiro/conciliacao': [PERMISSIONS.FINANCEIRO_CONCILIACAO],
  '/relatorios': [PERMISSIONS.RELATORIOS_VIEW],
  '/os': [PERMISSIONS.OS_VIEW],
  '/integracoes': [PERMISSIONS.INTEGRACOES_VIEW],
  '/usuarios': [PERMISSIONS.USUARIOS_VIEW],
  '/auditoria': [PERMISSIONS.AUDITORIA_VIEW],
  '/configuracoes': [PERMISSIONS.CONFIG_VIEW],
};

// Itens do menu com suas permissões
export const MENU_PERMISSIONS: Record<string, Permission[]> = {
  dashboard: [PERMISSIONS.DASHBOARD_VIEW],
  pdv: [PERMISSIONS.PDV_VIEW],
  caixa: [PERMISSIONS.CAIXA_VIEW],
  produtos: [PERMISSIONS.PRODUTOS_VIEW],
  estoque: [PERMISSIONS.ESTOQUE_VIEW],
  clientes: [PERMISSIONS.CLIENTES_VIEW],
  financeiro: [PERMISSIONS.FINANCEIRO_VIEW],
  relatorios: [PERMISSIONS.RELATORIOS_VIEW],
  os: [PERMISSIONS.OS_VIEW],
  integracoes: [PERMISSIONS.INTEGRACOES_VIEW],
  usuarios: [PERMISSIONS.USUARIOS_VIEW],
  auditoria: [PERMISSIONS.AUDITORIA_VIEW],
  configuracoes: [PERMISSIONS.CONFIG_VIEW],
};
