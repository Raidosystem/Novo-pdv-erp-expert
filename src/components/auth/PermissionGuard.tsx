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

  // Buscar permissões do usuário (por enquanto, admin tem tudo)
  // TODO: Integrar com perfis reais do banco
  const userPermissions: string[] = user?.perfil === 'Administrador' ? ['*'] : [];

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
  
  // Por enquanto, admin tem tudo. Depois integrar com perfis reais.
  const userPermissions: string[] = user?.perfil === 'Administrador' ? ['*'] : [];

  return {
    can: (permission: Permission) => hasPermission(userPermissions, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userPermissions, permissions),
    canAll: (permissions: Permission[]) => permissions.every(p => hasPermission(userPermissions, p)),
    permissions: userPermissions,
    isAdmin: userPermissions.includes('*'),
  };
};
