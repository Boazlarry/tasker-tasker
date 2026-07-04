'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  lightThemeOptions,
  darkThemeOptions,
  getCustomColors,
  saveCustomColors,
  type CustomThemeColors,
} from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  customColors: Partial<CustomThemeColors>;
  setCustomColors: (colors: CustomThemeColors) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [customColors, setCustomColorsState] = useState<Partial<CustomThemeColors>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
    setCustomColorsState(getCustomColors());
    setMounted(true);
  }, []);

  const activeTheme = useMemo(() => {
    const currentLightThemeOptions = {
      ...lightThemeOptions,
      palette: {
        ...lightThemeOptions.palette,
        primary: { ...(lightThemeOptions.palette?.primary as any), ...(customColors.primary ? { main: customColors.primary } : {}) },
        secondary: { ...(lightThemeOptions.palette?.secondary as any), ...(customColors.secondary ? { main: customColors.secondary } : {}) },
        positive: { ...(lightThemeOptions.palette?.positive as any), ...(customColors.positive ? { main: customColors.positive } : {}) },
        important: { ...(lightThemeOptions.palette?.important as any), ...(customColors.important ? { main: customColors.important } : {}) },
        error: { ...(lightThemeOptions.palette?.error as any), ...(customColors.error ? { main: customColors.error } : {}) },
        background: {
          ...(lightThemeOptions.palette?.background as any),
          ...(customColors.background ? { default: customColors.background } : {}),
          ...(customColors.surface ? { paper: customColors.surface } : {}),
        },
      },
    };

    const currentDarkThemeOptions = {
      ...darkThemeOptions,
      palette: {
        ...darkThemeOptions.palette,
        primary: { ...(darkThemeOptions.palette?.primary as any), ...(customColors.primary ? { main: customColors.primary } : {}) },
        secondary: { ...(darkThemeOptions.palette?.secondary as any), ...(customColors.secondary ? { main: customColors.secondary } : {}) },
        positive: { ...(darkThemeOptions.palette?.positive as any), ...(customColors.positive ? { main: customColors.positive } : {}) },
        important: { ...(darkThemeOptions.palette?.important as any), ...(customColors.important ? { main: customColors.important } : {}) },
        error: { ...(darkThemeOptions.palette?.error as any), ...(customColors.error ? { main: customColors.error } : {}) },
        background: {
          ...(darkThemeOptions.palette?.background as any),
          ...(customColors.background ? { default: customColors.background } : {}),
          ...(customColors.surface ? { paper: customColors.surface } : {}),
        },
      },
    };

    let themeToApply;
    if (themeMode === 'system' && mounted) {
      const prefersDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDarkMode ? currentDarkThemeOptions : currentLightThemeOptions;
    } else if (themeMode === 'system') {
      themeToApply = currentLightThemeOptions;
    } else {
      themeToApply = themeMode === 'light' ? currentLightThemeOptions : currentDarkThemeOptions;
    }
    return responsiveFontSizes(createTheme(themeToApply));
  }, [customColors, mounted, themeMode]);

  const contextValue = useMemo(() => ({
    customColors,
    themeMode,
    setCustomColors: (colors: CustomThemeColors) => {
      saveCustomColors(colors);
      setCustomColorsState(colors);
    },
    setThemeMode: (mode: ThemeMode) => {
      localStorage.setItem('themeMode', mode);
      setThemeMode(mode);
    },
  }), [customColors, themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
