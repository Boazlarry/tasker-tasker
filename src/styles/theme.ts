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

export const getCustomColors = () => {
  if (typeof window === 'undefined') return {};
  return {
    primary: localStorage.getItem('customPrimaryColor') || undefined,
    secondary: localStorage.getItem('customSecondaryColor') || undefined,
    positive: localStorage.getItem('customPositiveColor') || undefined,
    important: localStorage.getItem('customImportantColor') || undefined,
    error: localStorage.getItem('customErrorColor') || undefined,
  };
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
      main: '#22665b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4f658b',
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
      main: '#b7791f',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c2413d',
    },
    divider: '#d9ded8',
  },
};

export const darkThemeOptions: ThemeOptions = {
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#5fb7a7',
      contrastText: '#10201d',
    },
    secondary: {
      main: '#9bb5df',
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
      main: '#d8a23a',
      contrastText: '#1f1605',
    },
    error: {
      main: '#f07167',
    },
    divider: '#31413b',
  },
};

export const lightTheme = responsiveFontSizes(createTheme(lightThemeOptions));
export const darkTheme = responsiveFontSizes(createTheme(darkThemeOptions));
