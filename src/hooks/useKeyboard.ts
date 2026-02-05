import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboard = (customShortcuts?: KeyboardShortcuts) => {
  const navigate = useNavigate();

  const defaultShortcuts: KeyboardShortcuts = {
    F2: () => {
      // Focar no campo de busca
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
    F4: () => {
      // Finalizar venda - dispatch custom event
      window.dispatchEvent(new CustomEvent('pdv:finalize'));
    },
    F6: () => {
      // Aplicar desconto
      window.dispatchEvent(new CustomEvent('pdv:discount'));
    },
    F7: () => {
      // Selecionar cliente
      window.dispatchEvent(new CustomEvent('pdv:select-client'));
    },
    F12: () => {
      // Limpar carrinho
      window.dispatchEvent(new CustomEvent('pdv:clear'));
    },
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const shortcuts = { ...defaultShortcuts, ...customShortcuts };
    
    // Verifica se está em um input
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Meta/Ctrl shortcuts
    if (event.metaKey || event.ctrlKey) {
      if (event.key === 'k') {
        event.preventDefault();
        // Command bar handled in CommandBar component
        return;
      }
    }

    // Function keys - funcionam mesmo em inputs
    if (event.key.startsWith('F') && shortcuts[event.key]) {
      event.preventDefault();
      shortcuts[event.key]();
      return;
    }

    // Escape
    if (event.key === 'Escape') {
      if (shortcuts['Escape']) {
        shortcuts['Escape']();
      }
      return;
    }

    // Navigation shortcuts (G + key) - não funciona em inputs
    if (!isInput && event.key === 'g') {
      const handleNextKey = (e: KeyboardEvent) => {
        const navMap: Record<string, string> = {
          d: '/',
          p: '/pdv',
          e: '/estoque',
          c: '/clientes',
        };
        if (navMap[e.key]) {
          navigate(navMap[e.key]);
        }
        window.removeEventListener('keydown', handleNextKey);
      };
      window.addEventListener('keydown', handleNextKey, { once: true });
      setTimeout(() => {
        window.removeEventListener('keydown', handleNextKey);
      }, 1000);
    }
  }, [navigate, customShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
