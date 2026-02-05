import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

export const AuthLayout = () => {
  const { isDarkMode } = useSettingsStore();

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4',
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    )}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className={cn(
            'font-bold text-3xl',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}>
            FastPOS
          </span>
        </div>

        {/* Content */}
        <div className={cn(
          'rounded-2xl border p-8',
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        )}>
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 FastPOS. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
