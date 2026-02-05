import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

export const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useSettingsStore();

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4',
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className={cn(
        'max-w-md w-full rounded-2xl shadow-xl p-8 text-center',
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      )}>
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className={cn(
            'text-[120px] font-black leading-none',
            isDarkMode ? 'text-gray-700' : 'text-gray-200'
          )}>
            404
          </div>
          <div className="relative -mt-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Search className="w-10 h-10 text-orange-500" />
            </div>
          </div>
        </div>

        <h1 className={cn(
          'text-2xl font-bold mb-2',
          isDarkMode ? 'text-white' : 'text-gray-900'
        )}>
          Página não encontrada
        </h1>
        
        <p className={cn(
          'mb-8',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors',
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Início
          </Link>
        </div>
      </div>
    </div>
  );
};
