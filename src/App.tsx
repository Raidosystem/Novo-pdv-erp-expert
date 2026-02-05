import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auth Context
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from '@/components/auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Layouts
import { AppLayout, PDVLayout, AuthLayout } from '@/components/layout';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
  </div>
);

// Auth Pages (carregamento direto - pequenas)
import { Login } from '@/pages/auth/Login';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { NotFound } from '@/pages/NotFound';

// Onboarding
import { Onboarding } from '@/pages/onboarding/Onboarding';

// Core Pages (carregamento direto - usadas frequentemente)
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { NewSale } from '@/pages/pdv/NewSale';
import { ProductsList } from '@/pages/produtos/List';
import { ClientsList } from '@/pages/clientes/List';
import { CashSession } from '@/pages/caixa/Session';

// Lazy loaded pages (menos frequentes ou pesadas)
const StockOverview = lazy(() => import('@/pages/estoque/Overview').then(m => ({ default: m.StockOverview })));
const SalesReport = lazy(() => import('@/pages/relatorios/Sales').then(m => ({ default: m.SalesReport })));
const FinancialOverview = lazy(() => import('@/pages/financeiro/Overview').then(m => ({ default: m.FinancialOverview })));
const ContasList = lazy(() => import('@/pages/financeiro/contas/ContasList').then(m => ({ default: m.ContasList })));
const DREPage = lazy(() => import('@/pages/financeiro/DRE').then(m => ({ default: m.DREPage })));
const CentroCustosPage = lazy(() => import('@/pages/financeiro/CentroCustos').then(m => ({ default: m.CentroCustosPage })));
const ConciliacaoBancariaPage = lazy(() => import('@/pages/financeiro/ConciliacaoBancaria').then(m => ({ default: m.ConciliacaoBancariaPage })));
const Settings = lazy(() => import('@/pages/settings/Settings').then(m => ({ default: m.Settings })));
const OrdensServico = lazy(() => import('@/pages/os/OrdensServico').then(m => ({ default: m.OrdensServico })));
const Integracoes = lazy(() => import('@/pages/integracoes/Integracoes').then(m => ({ default: m.Integracoes })));
const AuditoriaPage = lazy(() => import('@/pages/auditoria/Auditoria').then(m => ({ default: m.AuditoriaPage })));
const Usuarios = lazy(() => import('@/pages/usuarios/Usuarios').then(m => ({ default: m.Usuarios })));
const SupabaseTest = lazy(() => import('@/pages/admin/SupabaseTest').then(m => ({ default: m.SupabaseTest })));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create router with future flags
const router = createBrowserRouter(
  [
    // Auth Routes - Públicas
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <PublicRoute><Login /></PublicRoute> },
        { path: '/reset-password', element: <ResetPassword /> },
      ],
    },
    // Onboarding
    { path: '/onboarding', element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
    // PDV Routes - Layout otimizado
    {
      element: <PDVLayout />,
      children: [
        { path: '/pdv/nova-venda', element: <ProtectedRoute><NewSale /></ProtectedRoute> },
      ],
    },
    // App Routes - Protegidas
    {
      element: <AppLayout />,
      children: [
        { path: '/', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
        { path: '/pdv', element: <Navigate to="/pdv/nova-venda" replace /> },
        { path: '/caixa', element: <ProtectedRoute><CashSession /></ProtectedRoute> },
        { path: '/produtos', element: <ProtectedRoute><ProductsList /></ProtectedRoute> },
        { path: '/estoque', element: <ProtectedRoute><StockOverview /></ProtectedRoute> },
        { path: '/clientes', element: <ProtectedRoute><ClientsList /></ProtectedRoute> },
        { path: '/financeiro', element: <ProtectedRoute><FinancialOverview /></ProtectedRoute> },
        { path: '/financeiro/contas', element: <ProtectedRoute><ContasList /></ProtectedRoute> },
        { path: '/financeiro/dre', element: <ProtectedRoute><DREPage /></ProtectedRoute> },
        { path: '/financeiro/centros-custo', element: <ProtectedRoute><CentroCustosPage /></ProtectedRoute> },
        { path: '/financeiro/conciliacao', element: <ProtectedRoute><ConciliacaoBancariaPage /></ProtectedRoute> },
        { path: '/relatorios', element: <ProtectedRoute><SalesReport /></ProtectedRoute> },
        { path: '/relatorios/vendas', element: <ProtectedRoute><SalesReport /></ProtectedRoute> },
        { path: '/os', element: <ProtectedRoute><OrdensServico /></ProtectedRoute> },
        { path: '/integracoes', element: <ProtectedRoute><Integracoes /></ProtectedRoute> },
        { path: '/auditoria', element: <ProtectedRoute><AuditoriaPage /></ProtectedRoute> },
        { path: '/usuarios', element: <ProtectedRoute><Usuarios /></ProtectedRoute> },
        { path: '/admin/supabase-test', element: <ProtectedRoute><SupabaseTest /></ProtectedRoute> },
        { path: '/configuracoes', element: <ProtectedRoute><Settings /></ProtectedRoute> },
      ],
    },
    // 404 - Página não encontrada
    { path: '*', element: <NotFound /> },
  ]
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
