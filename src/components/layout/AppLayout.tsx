import { Outlet } from 'react-router-dom';
import { CommandBar } from './CommandBar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { useDarkMode } from '@/hooks/useDarkMode';

export const AppLayout = () => {
  const { isDarkMode, sidebarCollapsed } = useSettingsStore();
  
  // Sincroniza dark mode com a classe .dark no <html>
  useDarkMode();

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300',
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    )}>
      <CommandBar />
      <div className="flex">
        <Sidebar />
        <div className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}>
          <TopBar />
          <main className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
