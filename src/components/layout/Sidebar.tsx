import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Package,
  Box,
  Users,
  CreditCard,
  FileText,
  Settings,
  Store,
  Wrench,
  Plug,
  Shield,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Receipt,
  PieChart,
  Landmark,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/components/auth';
import { MENU_PERMISSIONS, Permission } from '@/lib/permissions';

interface SubNavItem {
  id: string;
  label: string;
  path: string;
  permission?: Permission;
}

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  alert?: boolean;
  subItems?: SubNavItem[];
  permission?: Permission;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard', path: '/' },
  { id: 'pdv', icon: ShoppingCart, label: 'PDV', path: '/pdv', badge: '2' },
  { id: 'caixa', icon: DollarSign, label: 'Caixa', path: '/caixa' },
  { id: 'produtos', icon: Package, label: 'Produtos', path: '/produtos' },
  { id: 'estoque', icon: Box, label: 'Estoque', path: '/estoque', alert: true },
  { id: 'clientes', icon: Users, label: 'Clientes', path: '/clientes' },
  { 
    id: 'financeiro', 
    icon: CreditCard, 
    label: 'Financeiro', 
    path: '/financeiro',
    subItems: [
      { id: 'fin-overview', label: 'Visão Geral', path: '/financeiro' },
      { id: 'fin-contas', label: 'Contas a Pagar/Receber', path: '/financeiro/contas' },
      { id: 'fin-dre', label: 'DRE', path: '/financeiro/dre' },
      { id: 'fin-centros', label: 'Centros de Custo', path: '/financeiro/centros-custo' },
      { id: 'fin-conciliacao', label: 'Conciliação Bancária', path: '/financeiro/conciliacao' },
    ]
  },
  { id: 'relatorios', icon: FileText, label: 'Relatórios', path: '/relatorios' },
  { id: 'os', icon: Wrench, label: 'Ordens de Serviço', path: '/os' },
  { id: 'integracoes', icon: Plug, label: 'Integrações', path: '/integracoes' },
  { id: 'usuarios', icon: Shield, label: 'Usuários', path: '/usuarios' },
  { id: 'auditoria', icon: ClipboardList, label: 'Auditoria', path: '/auditoria' },
];

// Ícones para subitens do financeiro
const subItemIcons: Record<string, React.ElementType> = {
  'fin-overview': CreditCard,
  'fin-contas': Receipt,
  'fin-dre': PieChart,
  'fin-centros': Landmark,
  'fin-conciliacao': Building2,
};

export const Sidebar = () => {
  const { isDarkMode, sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const { user } = useAuth();
  const { canAny, isAdmin } = usePermission();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['financeiro']);
  const location = useLocation();
  
  // Usar estado do store ao invés de local
  const isCollapsed = sidebarCollapsed;
  
  // Filtrar itens do menu por permissão
  const filteredNavItems = navItems.filter(item => {
    const requiredPermissions = MENU_PERMISSIONS[item.id];
    if (!requiredPermissions) return true;
    return isAdmin || canAny(requiredPermissions);
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.path);
    }
    return location.pathname === item.path;
  };

  return (
    <div className={cn(
      'fixed left-0 top-14 bottom-0 border-r flex flex-col transition-all',
      isCollapsed ? 'w-16' : 'w-64',
      isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
    )}>
      {/* Store Info */}
      <div className={cn(
        'p-4 border-b',
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      )}>
        <div className={cn(
          'px-3 py-2 rounded-lg flex items-center justify-between',
          isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        )}>
          <div className={isCollapsed ? 'hidden' : 'block'}>
            <div className={cn(
              'text-sm font-semibold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              {user?.nome || 'FastPOS Demo'}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email?.split('@')[0] || 'Empresa Demo'}
            </div>
          </div>
          <Store className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full border flex items-center justify-center transition-colors z-50',
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' 
            : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm'
        )}
      >
        <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              // Item com submenu
              <>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    isMenuActive(item)
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-900 hover:text-gray-300'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {expandedMenus.includes(item.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
                
                {/* Submenu */}
                {expandedMenus.includes(item.id) && !isCollapsed && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-500/30 pl-2">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItemIcons[subItem.id] || FileText;
                      return (
                        <NavLink
                          key={subItem.id}
                          to={subItem.path}
                          end={subItem.path === '/financeiro'}
                          className={({ isActive }) => cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                            isActive
                              ? isDarkMode
                                ? 'bg-orange-500/20 text-orange-400 font-medium'
                                : 'bg-orange-100 text-orange-600 font-medium'
                              : isDarkMode
                              ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Item simples
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-900 hover:text-gray-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                        {item.badge}
                      </span>
                    )}
                    {item.alert && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className={cn(
        'p-3 border-t',
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      )}>
        <NavLink
          to="/configuracoes"
          className={({ isActive }) => cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            isActive
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : isDarkMode
              ? 'text-gray-400 hover:bg-gray-900'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="flex-1 text-left font-medium">Configurações</span>}
        </NavLink>
      </div>
    </div>
  );
};
