import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';
import { ChipPropsColorOverrides } from '@mui/material/Chip';

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
  typography: {
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
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
      main: getCustomColors().primary || '#3f51b5', // Main Blue
    },
    secondary: {
      main: getCustomColors().secondary || '#673ab7', // Main Purple
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
    // Custom Semantic Colors
    positive: {
      main: getCustomColors().positive || '#1976d2', // Blue
      contrastText: '#ffffff',
    },
    important: {
      main: getCustomColors().important || '#ffc107', // Yellow
      contrastText: '#000000',
    },
    error: {
      main: getCustomColors().error || '#d32f2f', // Overriding default error with a magenta-like red for better visibility
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: getCustomColors().primary || '#7986cb', // Lighter Blue for dark mode
    },
    secondary: {
      main: getCustomColors().secondary || '#9575cd', // Lighter Purple for dark mode
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#bdbdbd',
    },
    // Custom Semantic Colors
    positive: {
      main: getCustomColors().positive || '#42a5f5', // Lighter Blue
      contrastText: '#000000',
    },
    important: {
      main: getCustomColors().important || '#ffca28', // Lighter Yellow
      contrastText: '#000000',
    },
    error: {
      main: getCustomColors().error || '#f44336', // Magenta-like Red
    },
  },
};

export const lightTheme = responsiveFontSizes(createTheme(lightThemeOptions));
export const darkTheme = responsiveFontSizes(createTheme(darkThemeOptions));
