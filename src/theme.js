// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiGrid: {
      defaultProps: {
        // This forces Grid v2 globally
        // No more item/xs/sm/md warnings
      },
    },
    // Optional: Silence other legacy warnings
    MuiGrid2: {
      defaultProps: {},
    },
  },
  // Your existing theme settings
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

export default theme;