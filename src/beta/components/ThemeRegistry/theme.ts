import { deepmerge } from '@mui/utils';
import { createTheme, type ThemeOptions } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

/* eslint @typescript-eslint/no-magic-numbers: 0 -- A theme file will have numbers and hex codes in it, this is normal. */

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#CDEAF7',
      contrastText: '#292C34',
      light: '#E0F2FA',
      dark: '#7DCAEE',
    },
    secondary: {
      main: '#105C7E',
      contrastText: '#F1FAFD',
      light: '#198DC2',
      dark: '#082E3F',
    },
    background: {
      default: '#22242b',
      paper: '#292C34',
    },
    text: {
      primary: '#FAFDFF',
      secondary: '#A7ACB9',
      disabled: '#C6C9D2',
    },
    divider: '#3f4350',
    error: {
      main: '#ff666a',
      contrastText: '#FFA3A6',
    },
    success: {
      main: '#80ffa2',
      contrastText: '#292C34',
    },
  },
  typography: {
    fontFamily: 'inherit',
    fontWeightBold: 800,
    fontWeightMedium: 600,
    fontWeightRegular: 500,
    fontWeightLight: 300,
    h1: {
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2.4rem',
      },
    },
    h3: {
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.7rem',
      },
    },
    button: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 400,
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h6: {
      fontWeight: 400,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    caption: {
      fontWeight: 300,
      fontSize: '0.65rem',
      lineHeight: 1,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: 'none',
          '&:hover': {
            backgroundColor: 'primary.light',
          },
          '&:active': {
            backgroundColor: 'primary.light',
          },
          fontWeight: 700,
        },
      },
      styleOverrides: {
        root: {
          '&.MuiButton-containedSuccess:hover': {
            backgroundColor: '#B3FFC7',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 'inherit !important',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;

const subsectionThemeOptions: ThemeOptions = {
  typography: {
    // Top-level headers don't exist in subsections.
    // They are for page-wide titles.
    h1: undefined,
    // Second-level headers also don't exist in subsection.
    // They only make sense as top-level section headers.
    h2: undefined,
    // h3 is where subsection headers start to make sense.
    h3: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    // h4 is used inside accordion headers.
    h4: {
      fontWeight: 400,
      fontSize: '0.9rem',
    },
    caption: {
      fontWeight: 500,
      fontSize: '0.75rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '0.85rem',
    },
    body2: {
      fontWeight: 300,
      fontSize: '0.8rem',
    },
  },
};

export const subsectionTheme = createTheme(deepmerge(themeOptions, subsectionThemeOptions));
