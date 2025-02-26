import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import Dashboard from './pages/Dashboard';
import Organizations from './pages/Organizations';
import Users from './pages/Users';
import Resources from './pages/Resources';
import Shifts from './pages/Shifts';
import Settings from './pages/Settings';

// Import components
import Layout from './components/Layout';

// Create a theme instance
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
});

function App({ initialPage = 'dashboard' }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Navigate to the initial page based on the data-page attribute
    if (initialPage) {
      navigate(`/${initialPage}`);
    }

    // Get user data from WordPress global variable
    if (window.wpScheduleManager) {
      setUserData({
        id: window.wpScheduleManager.userId,
        nonce: window.wpScheduleManager.nonce,
      });
    }

    setIsLoading(false);
  }, [initialPage, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/users" element={<Users />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
