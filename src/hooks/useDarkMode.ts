import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Hook para sincronizar o dark mode com a classe .dark no <html>
 * Deve ser usado uma vez no componente raiz (AppLayout ou App)
 */
export const useDarkMode = () => {
  const { isDarkMode } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return isDarkMode;
};
