import { Outlet } from 'react-router-dom';
import { Zap, Activity, Clock, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { useKeyboard } from '@/hooks/useKeyboard';

export const PDVLayout = () => {
  const { isDarkMode, setDarkMode } = useSettingsStore();
  
  // Atalhos de teclado do PDV
  useKeyboard();

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300',
      isDarkMode ? 'bg-gray-950 dark' : 'bg-gray-50'
    )}>
      {/* Header Minimalista */}
      <div className={cn(
        'border-b px-6 py-3 flex items-center justify-between',
        isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              'font-bold text-xl',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              FastPOS
            </span>
          </div>

          {/* Divider */}
          <div className={cn(
            'w-px h-8',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
          )} />

          {/* Status */}
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-500" />
            <div>
              <div className={cn(
                'text-sm font-semibold',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}>
                Caixa 01 - Aberto
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Operador: João Silva
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!isDarkMode)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Button variant="ghost" onClick={() => window.history.back()}>
            Voltar ao Sistema
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Fast Actions Dock */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 border-t p-4',
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { key: 'F2', label: 'Buscar' },
              { key: 'F4', label: 'Finalizar' },
              { key: 'F6', label: 'Desconto' },
              { key: 'F7', label: 'Cliente' },
              { key: 'ESC', label: 'Cancelar' },
            ].map((shortcut) => (
              <div
                key={shortcut.key}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded',
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                )}
              >
                <kbd className={cn(
                  'px-1.5 py-0.5 text-xs font-semibold rounded',
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                )}>
                  {shortcut.key}
                </kbd>
                <span className="text-xs text-gray-500">{shortcut.label}</span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            v1.0.0 | FastPOS ERP
          </div>
        </div>
      </div>
    </div>
  );
};
