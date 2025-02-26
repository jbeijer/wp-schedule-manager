import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Tabs,
  Tab,
  Container,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Business as OrganizationsIcon,
  People as UsersIcon,
  Inventory as ResourcesIcon,
  CalendarMonth as ShiftsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Define menu items with paths that match the hash router format
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Organizations', icon: <OrganizationsIcon />, path: '/organizations' },
  { text: 'Users', icon: <UsersIcon />, path: '/users' },
  { text: 'Resources', icon: <ResourcesIcon />, path: '/resources' },
  { text: 'Shifts', icon: <ShiftsIcon />, path: '/shifts' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (event, newValue) => {
    // Navigate to the selected path
    navigate(newValue);
  };

  // Find the current tab value based on the location pathname
  const getCurrentTabValue = () => {
    // Get the pathname without the hash
    const currentPath = location.pathname;
    
    // Find the matching menu item
    const item = menuItems.find(item => item.path === currentPath);
    
    // Return the path or default to dashboard
    return item ? item.path : '/dashboard';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar disableGutters sx={{ px: 2 }}>
          <Tabs 
            value={getCurrentTabValue()} 
            onChange={handleNavigation}
            aria-label="WP Schedule Manager navigation"
            variant="standard"
            sx={{ 
              width: '100%',
              '& .MuiTab-root': { 
                textTransform: 'none',
                fontSize: '14px',
                minHeight: '48px',
                padding: '6px 16px',
                minWidth: 0,
                flex: 'none',
                marginRight: '8px'
              },
              '& .MuiTabs-indicator': {
                height: '3px'
              }
            }}
          >
            {menuItems.map((item) => (
              <Tab 
                key={item.text} 
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexDirection: 'row'
                  }}>
                    <Box sx={{ mr: 1 }}>{item.icon}</Box>
                    <Typography variant="body2" component="span">
                      {item.text}
                    </Typography>
                  </Box>
                } 
                value={item.path} 
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
