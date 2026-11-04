import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, ThemeColors } from './lightTheme';
import { darkColors } from './darkTheme';
import { typography, fontFamilies, fontSizes, lineHeights, fontWeights } from './typography';
import { spacing, Spacing } from './spacing';
import { radius, Radius } from './radius';
import { PALETTE } from './colors';
import { useThemeStore, ThemePreference } from '../store/useThemeStore';

export interface ThemeContextValue {
  colors: ThemeColors;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  fontWeights: typeof fontWeights;
  spacing: Spacing;
  radius: Radius;
  isDark: boolean;
  mode: ThemePreference;
  setMode: (mode: ThemePreference) => void;
  palette: typeof PALETTE;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const { preference, setPreference, loadPreference } = useThemeStore();

  useEffect(() => {
    loadPreference();
  }, [loadPreference]);

  const isDark = useMemo(() => {
    if (preference === 'dark') return true;
    if (preference === 'light') return false;
    return systemScheme === 'dark';
  }, [preference, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      typography,
      fontFamilies,
      fontSizes,
      lineHeights,
      fontWeights,
      spacing,
      radius,
      isDark,
      mode: preference,
      setMode: setPreference,
      palette: PALETTE,
    }),
    [colors, isDark, preference, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback to light theme if rendered outside ThemeProvider
    return {
      colors: lightColors,
      typography,
      fontFamilies,
      fontSizes,
      lineHeights,
      fontWeights,
      spacing,
      radius,
      isDark: false,
      mode: 'system',
      setMode: () => {},
      palette: PALETTE,
    };
  }
  return context;
};
