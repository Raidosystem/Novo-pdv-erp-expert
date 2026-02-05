import { useState, useEffect } from 'react';
import { Search, X, ChevronRight, Zap, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  icon?: React.ReactNode;
}

export const CommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useSettingsStore();

  const commands: CommandItem[] = [
    { id: 'new-sale', label: 'Nova Venda', shortcut: 'F2', action: () => navigate('/pdv/nova-venda') },
    { id: 'search-product', label: 'Buscar Produto', shortcut: 'F3', action: () => navigate('/produtos') },
    { id: 'close-cash', label: 'Fechar Caixa', action: () => navigate('/caixa/fechamento') },
    { id: 'sales-report', label: 'Relatório de Vendas', action: () => navigate('/relatorios/vendas') },
    { id: 'new-client', label: 'Cadastrar Cliente', action: () => navigate('/clientes/novo') },
    { id: 'dashboard', label: 'Dashboard', shortcut: 'G+D', action: () => navigate('/') },
    { id: 'stock', label: 'Estoque', shortcut: 'G+E', action: () => navigate('/estoque') },
    { id: 'clients', label: 'Clientes', shortcut: 'G+C', action: () => navigate('/clientes') },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (command: CommandItem) => {
    command.action();
    setIsOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Top Bar */}
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 border-b',
        isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
      )}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
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
          </div>

          {/* Search Button */}
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-xl border transition-all',
              isDarkMode
                ? 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Search className="w-4 h-4" />
            <span>Buscar em tudo...</span>
            <kbd className={cn(
              'px-2 py-1 text-xs rounded',
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            )}>
              ⌘K
            </kbd>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className={cn(
              'p-2 rounded-lg relative',
              isDarkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-100'
            )}>
              <Bell className={cn('w-5 h-5', isDarkMode ? 'text-gray-400' : 'text-gray-600')} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-14" />

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-24">
          <div className={cn(
            'w-full max-w-2xl rounded-2xl shadow-2xl border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          )}>
            {/* Search Input */}
            <div className={cn(
              'p-4 border-b',
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            )}>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite para buscar produtos, clientes, vendas..."
                  className={cn(
                    'flex-1 bg-transparent outline-none',
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  )}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="p-2 max-h-96 overflow-y-auto">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => handleSelect(command)}
                  className={cn(
                    'w-full p-3 rounded-lg flex items-center justify-between transition-colors',
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  )}
                >
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {command.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {command.shortcut && (
                      <kbd className={cn(
                        'px-2 py-1 text-xs rounded',
                        isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                      )}>
                        {command.shortcut}
                      </kbd>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
              {filteredCommands.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
