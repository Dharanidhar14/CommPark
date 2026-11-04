import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  loadPreference: () => Promise<void>;
}

const STORAGE_KEY = 'commpark_theme_pref';

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  setPreference: async (preference) => {
    set({ preference });
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(STORAGE_KEY, preference);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, preference);
      }
    } catch {
      // Graceful fallback if storage fails
    }
  },
  loadPreference: async () => {
    try {
      let stored: string | null = null;
      if (Platform.OS !== 'web') {
        stored = await SecureStore.getItemAsync(STORAGE_KEY);
      } else if (typeof localStorage !== 'undefined') {
        stored = localStorage.getItem(STORAGE_KEY);
      }
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ preference: stored });
      }
    } catch {
      // Default to 'system'
    }
  },
}));
