import { Activity, ShoppingCart, Grid3X3, List, Sun, Moon, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const TopBar = () => {
  const navigate = useNavigate();
  const { isDarkMode, setDarkMode, isDense, setDense } = useSettingsStore();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Formatar hora atual
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn(
      'border-b px-6 py-4 flex items-center justify-between',
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
    )}>
      {/* Status do Caixa */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-500" />
          <div>
            <div className={cn(
              'text-sm font-semibold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              Caixa 01 - Aberto
            </div>
            <div className="text-xs text-gray-500">
              {user?.nome || user?.email?.split('@')[0] || 'Usuário'} • {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Density Toggle */}
        <button
          onClick={() => setDense(!isDense)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isDense
              ? 'bg-orange-500 text-white'
              : isDarkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {isDense ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!isDarkMode)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isDarkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
              {user?.nome?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              {user?.nome || user?.email?.split('@')[0] || 'Usuário'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)} 
              />
              <div className={cn(
                'absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border z-50 py-2',
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              )}>
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className={cn('text-sm font-medium', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/configuracoes'); setShowUserMenu(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors',
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>

        {/* Nova Venda */}
        <Button onClick={() => navigate('/pdv/nova-venda')}>
          <ShoppingCart className="w-4 h-4" />
          Nova Venda
        </Button>
      </div>
    </div>
  );
};
