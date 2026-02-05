import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, hasPermission, hasAnyPermission } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Componente para proteger elementos baseado em permissões
 * 
 * Uso:
 * <PermissionGuard permission="produtos:edit">
 *   <BotãoEditar />
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={['admin:*', 'financeiro:view']} mode="any">
 *   <LinkFinanceiro />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  children,
  permission,
  permissions = [],
  mode = 'any',
  fallback = null,
  redirectTo,
}: PermissionGuardProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Se o usuário está logado, dar permissões baseadas no perfil
  // Por padrão, usuários logados têm acesso a tudo
  let userPermissions: string[] = [];
  
  if (user) {
    if (user.perfil === 'Administrador' || !user.perfil) {
      userPermissions = ['*'];
    } else {
      // TODO: Integrar com sistema de perfis do banco
      userPermissions = ['*'];
    }
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userPermissions, permission);
  } else if (permissions.length > 0) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(userPermissions, permissions)
      : permissions.every(p => hasPermission(userPermissions, p));
  } else {
    // Se nenhuma permissão for especificada, permitir acesso
    hasAccess = true;
  }

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Hook para verificar permissões
 */
export const usePermission = () => {
  const { user } = useAuth();
  
  // Se o usuário está logado, dar permissões baseadas no perfil
  // Por padrão, usuários logados têm acesso a tudo (pode ajustar depois)
  let userPermissions: string[] = [];
  
  if (user) {
    if (user.perfil === 'Administrador' || !user.perfil) {
      // Admin ou usuário sem perfil definido tem acesso total
      userPermissions = ['*'];
    } else {
      // Outros perfis - por enquanto dar acesso total também
      // TODO: Integrar com sistema de perfis do banco
      userPermissions = ['*'];
    }
  }

  return {
    can: (permission: Permission) => hasPermission(userPermissions, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userPermissions, permissions),
    canAll: (permissions: Permission[]) => permissions.every(p => hasPermission(userPermissions, p)),
    permissions: userPermissions,
    isAdmin: userPermissions.includes('*'),
  };
};
