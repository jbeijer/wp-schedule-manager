import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import Dashboard from './pages/Dashboard';
import MyShifts from './pages/MyShifts';
import Availability from './pages/Availability';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Import components
import Layout from './components/Layout';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2271b1', // WordPress blue
    },
    secondary: {
      main: '#d23226', // Accent color
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shifts" element={<MyShifts />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
