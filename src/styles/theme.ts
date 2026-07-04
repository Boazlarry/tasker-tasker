import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    positive: Palette['primary'];
    important: Palette['primary'];
  }
  interface PaletteOptions {
    positive?: PaletteOptions['primary'];
    important?: PaletteOptions['primary'];
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    positive: true;
    important: true;
  }
}

export interface CustomThemeColors {
  primary: string;
  secondary: string;
  positive: string;
  important: string;
  error: string;
  background: string;
  surface: string;
}

export const defaultCustomThemeColors: CustomThemeColors = {
  primary: '#21665c',
  secondary: '#3f63a2',
  positive: '#2f7d52',
  important: '#bd7622',
  error: '#b94157',
  background: '#f6f7f4',
  surface: '#ffffff',
};

const customColorStorageKeys: Record<keyof CustomThemeColors, string> = {
  primary: 'customPrimaryColor',
  secondary: 'customSecondaryColor',
  positive: 'customPositiveColor',
  important: 'customImportantColor',
  error: 'customErrorColor',
  background: 'customBackgroundColor',
  surface: 'customSurfaceColor',
};

export const getCustomColors = (): Partial<CustomThemeColors> => {
  if (typeof window === 'undefined') return {};

  return Object.fromEntries(
    Object.entries(customColorStorageKeys)
      .map(([key, storageKey]) => [key, localStorage.getItem(storageKey)])
      .filter(([, value]) => Boolean(value))
  ) as Partial<CustomThemeColors>;
};

export const getCustomColorsWithDefaults = (
  defaults: CustomThemeColors = defaultCustomThemeColors
): CustomThemeColors => {
  if (typeof window === 'undefined') return defaults;

  return {
    primary: localStorage.getItem(customColorStorageKeys.primary) || defaults.primary,
    secondary: localStorage.getItem(customColorStorageKeys.secondary) || defaults.secondary,
    positive: localStorage.getItem(customColorStorageKeys.positive) || defaults.positive,
    important: localStorage.getItem(customColorStorageKeys.important) || defaults.important,
    error: localStorage.getItem(customColorStorageKeys.error) || defaults.error,
    background: localStorage.getItem(customColorStorageKeys.background) || defaults.background,
    surface: localStorage.getItem(customColorStorageKeys.surface) || defaults.surface,
  };
};

export const saveCustomColors = (colors: CustomThemeColors) => {
  Object.entries(customColorStorageKeys).forEach(([key, storageKey]) => {
    localStorage.setItem(storageKey, colors[key as keyof CustomThemeColors]);
  });
};

const baseThemeOptions: ThemeOptions = {
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 160ms ease',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          letterSpacing: 0,
          textTransform: 'none',
          fontWeight: 700,
          minHeight: 40,
        },
      },
    },
  },
};

export const lightThemeOptions: ThemeOptions = {
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#21665c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f63a2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f7f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2933',
      secondary: '#667085',
    },
    positive: {
      main: '#2f7d52',
      contrastText: '#ffffff',
    },
    important: {
      main: '#bd7622',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b94157',
    },
    divider: '#d9ded8',
  },
};

export const darkThemeOptions: ThemeOptions = {
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#65d3c4',
      contrastText: '#10201d',
    },
    secondary: {
      main: '#9ebcff',
      contrastText: '#111827',
    },
    background: {
      default: '#111614',
      paper: '#18201d',
    },
    text: {
      primary: '#eef3ef',
      secondary: '#a9b5ad',
    },
    positive: {
      main: '#66c18d',
      contrastText: '#102016',
    },
    important: {
      main: '#e1a640',
      contrastText: '#1f1605',
    },
    error: {
      main: '#ff7a8f',
    },
    divider: '#31413b',
  },
};

export const lightTheme = responsiveFontSizes(createTheme(lightThemeOptions));
export const darkTheme = responsiveFontSizes(createTheme(darkThemeOptions));
