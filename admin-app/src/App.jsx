import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Import API service
import { userApi } from './services/api';

// Import pages
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Shifts from './pages/Shifts';
import Settings from './pages/Settings';

// Import components
import Layout from './components/Layout';

// Create a theme instance that matches WordPress admin
const theme = createTheme({
  palette: {
    primary: {
      main: '#2271b1', // WordPress admin blue
    },
    secondary: {
      main: '#135e96',
    },
    background: {
      default: '#f0f0f1', // WordPress admin background
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
          border: '1px solid #c3c4c7',
        },
      },
    },
    // Add specific overrides for tabs to ensure they work well in WordPress admin
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          width: '100%',
        },
        flexContainer: {
          width: '100%',
        },
        scroller: {
          width: '100%',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          padding: '6px 16px',
        },
      },
    },
  },
});

function App({ initialPage = 'dashboard' }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userCapabilities, setUserCapabilities] = useState(null);

  // Load user capabilities and navigate to initial page
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize wpScheduleManager if it doesn't exist
        if (!window.wpScheduleManager) {
          window.wpScheduleManager = {};
        }

        // Set basic user data
        if (window.wpScheduleManager.userId) {
          setUserData({
            id: window.wpScheduleManager.userId,
            nonce: window.wpScheduleManager.nonce,
          });
        }

        // Fetch user capabilities if not already provided
        if (!window.wpScheduleManager.userCapabilities) {
          console.log('Fetching user capabilities...');
          const capabilities = await userApi.getUserCapabilities();
          
          // Store capabilities in both state and global object
          setUserCapabilities(capabilities);
          window.wpScheduleManager.userCapabilities = capabilities;
          
          console.log('User capabilities loaded:', capabilities);
        } else {
          // Use existing capabilities
          setUserCapabilities(window.wpScheduleManager.userCapabilities);
        }
        
        // Navigate to the initial page based on the data-page attribute
        if (initialPage) {
          navigate(`/${initialPage}`);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, [initialPage, navigate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout userCapabilities={userCapabilities}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/users" element={<Users />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
