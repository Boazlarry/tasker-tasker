import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightThemeOptions, darkThemeOptions, getCustomColors } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const activeTheme = useMemo(() => {
    const customColors = getCustomColors();

    const currentLightThemeOptions = {
      ...lightThemeOptions,
      palette: {
        ...lightThemeOptions.palette,
        primary: { main: customColors.primary || (lightThemeOptions.palette?.primary as any)?.main },
        secondary: { main: customColors.secondary || (lightThemeOptions.palette?.secondary as any)?.main },
        positive: { main: customColors.positive || (lightThemeOptions.palette?.positive as any)?.main },
        important: { main: customColors.important || (lightThemeOptions.palette?.important as any)?.main },
        error: { main: customColors.error || (lightThemeOptions.palette?.error as any)?.main },
      },
    };

    const currentDarkThemeOptions = {
      ...darkThemeOptions,
      palette: {
        ...darkThemeOptions.palette,
        primary: { main: customColors.primary || (darkThemeOptions.palette?.primary as any)?.main },
        secondary: { main: customColors.secondary || (darkThemeOptions.palette?.secondary as any)?.main },
        positive: { main: customColors.positive || (darkThemeOptions.palette?.positive as any)?.main },
        important: { main: customColors.important || (darkThemeOptions.palette?.important as any)?.main },
        error: { main: customColors.error || (darkThemeOptions.palette?.error as any)?.main },
      },
    };

    let themeToApply;
    if (themeMode === 'system') {
      const prefersDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDarkMode ? currentDarkThemeOptions : currentLightThemeOptions;
    } else {
      themeToApply = themeMode === 'light' ? currentLightThemeOptions : currentDarkThemeOptions;
    }
    return responsiveFontSizes(createTheme(themeToApply));
  }, [themeMode]);

  const contextValue = useMemo(() => ({
    themeMode,
    setThemeMode: (mode: ThemeMode) => {
      localStorage.setItem('themeMode', mode);
      setThemeMode(mode);
    },
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
