// I admin-app/src/components/Layout.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  Container // Lägg till Container-importen här
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Business as OrganizationsIcon,
  People as UsersIcon,
  Inventory as ResourcesIcon,
  CalendarMonth as ShiftsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { canUserPerformAction, userHasRoleAnywhere } from '../utils/permissions';

// Define menu items with paths that match the hash router format
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', requiredPermission: null },
  { text: 'Organizations', icon: <OrganizationsIcon />, path: '/organizations', requiredPermission: 'manageResources' },
  { text: 'Users', icon: <UsersIcon />, path: '/users', requiredPermission: 'manageResources' },
  { text: 'Resources', icon: <ResourcesIcon />, path: '/resources', requiredPermission: 'manageResources' },
  { text: 'Shifts', icon: <ShiftsIcon />, path: '/shifts', requiredPermission: 'viewSchedule' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', requiredPermission: 'manageResources' },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current path from the hash part of the URL
  const getCurrentPath = () => {
    const hashPath = location.hash.replace('#', '');
    return hashPath || '/dashboard';
  };

  const handleTabChange = (event, newPath) => {
    // Navigate to the selected path
    navigate(newPath);
  };

  // Filtrera menypunkter baserat på användarens behörigheter
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return canUserPerformAction(item.requiredPermission);
  });

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
            value={getCurrentPath()} 
            onChange={handleTabChange}
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
            {filteredMenuItems.map((item) => (
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