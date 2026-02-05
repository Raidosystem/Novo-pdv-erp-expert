import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  isDarkMode: boolean;
  isDense: boolean;
  sidebarCollapsed: boolean;
  
  setDarkMode: (value: boolean) => void;
  setDense: (value: boolean) => void;
  toggleSidebar: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isDense: false,
      sidebarCollapsed: false,
      
      setDarkMode: (value) => set({ isDarkMode: value }),
      setDense: (value) => set({ isDense: value }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
