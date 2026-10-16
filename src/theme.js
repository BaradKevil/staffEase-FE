import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#23A4E8',
      light: '#70CFFC',
      dark: '#1B8ECB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2F73B7',
      light: '#5390D9',
      dark: '#215386',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, fontSize: '15px', color: '#64748B' },
    subtitle2: { fontWeight: 500, fontSize: '13px', color: '#64748B' },
    body1: { fontSize: '14px', lineHeight: 1.5 },
    body2: { fontSize: '13px', lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(35, 164, 232, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: '#23A4E8',
          '&:hover': {
            backgroundColor: '#1B8ECB',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#FFFFFF',
          '& fieldset': {
            borderColor: '#E2E8F0',
            transition: 'border-color 0.2s ease',
          },
          '&:hover fieldset': {
            borderColor: '#CBD5E1',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#23A4E8',
            borderWidth: '1.5px',
          },
        },
        input: {
          padding: '12px 14px',
          fontSize: '14px',
          '&::placeholder': {
            color: '#94A3B8',
            opacity: 1,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          padding: '14px 16px',
          fontSize: '13px',
          color: '#334155',
        },
        head: {
          backgroundColor: '#F8FAFC',
          color: '#64748B',
          fontWeight: 700,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          color: '#64748B',
          minHeight: '44px',
          '&.Mui-selected': {
            color: '#23A4E8',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;
