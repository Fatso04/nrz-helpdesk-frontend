// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c3e50', // Deep slate blue-gray (professional, neutral)
    },
    background: {
      default: '#f8f9fa',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
          backgroundImage: 
            'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px), ' +
            'radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px, 80px 80px',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;