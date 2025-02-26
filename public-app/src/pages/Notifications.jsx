import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  IconButton,
  Chip,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NewNotificationIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Sms as SmsIcon
} from '@mui/icons-material';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    title: 'New Shift Available',
    message: 'A new shift is available for you to sign up.',
    date: '2023-04-01T10:00:00',
    read: false,
    type: 'shift_available'
  },
  {
    id: 2,
    title: 'Shift Reminder',
    message: 'Your shift starts tomorrow at 9:00 AM.',
    date: '2023-03-31T15:00:00',
    read: true,
    type: 'shift_reminder'
  },
  {
    id: 3,
    title: 'Shift Cancelled',
    message: 'Your shift on April 5th has been cancelled.',
    date: '2023-03-30T12:00:00',
    read: true,
    type: 'shift_cancelled'
  },
  {
    id: 4,
    title: 'Organization Update',
    message: 'New policies have been added to your organization.',
    date: '2023-03-29T09:00:00',
    read: false,
    type: 'organization_update'
  },
  {
    id: 5,
    title: 'Schedule Change',
    message: 'Your shift on April 3rd has been rescheduled to April 4th.',
    date: '2023-03-28T14:00:00',
    read: true,
    type: 'schedule_change'
  }
];

// Mock notification settings
const initialSettings = {
  email: {
    shift_available: true,
    shift_reminder: true,
    shift_cancelled: true,
    organization_update: false,
    schedule_change: true
  },
  sms: {
    shift_available: false,
    shift_reminder: true,
    shift_cancelled: true,
    organization_update: false,
    schedule_change: false
  }
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(initialSettings);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch notifications on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Mark notification as read
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
  };

  // Delete notification
  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    
    setSnackbar({
      open: true,
      message: 'Notification deleted',
      severity: 'success'
    });
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    
    setSnackbar({
      open: true,
      message: 'All notifications marked as read',
      severity: 'success'
    });
  };

  // Open settings dialog
  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  // Close settings dialog
  const handleCloseSettings = () => {
    setOpenSettings(false);
  };

  // Save notification settings
  const handleSaveSettings = () => {
    // In a real app, you would save these settings to the server
    console.log('Saving notification settings:', notificationSettings);
    
    setSnackbar({
      open: true,
      message: 'Notification settings saved',
      severity: 'success'
    });
    
    setOpenSettings(false);
  };

  // Handle settings change
  const handleSettingsChange = (channel, type) => (event) => {
    setNotificationSettings({
      ...notificationSettings,
      [channel]: {
        ...notificationSettings[channel],
        [type]: event.target.checked
      }
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'shift_available':
        return 'Available Shift';
      case 'shift_reminder':
        return 'Reminder';
      case 'shift_cancelled':
        return 'Cancelled';
      case 'organization_update':
        return 'Update';
      case 'schedule_change':
        return 'Schedule Change';
      default:
        return 'Notification';
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'shift_available':
        return 'success';
      case 'shift_reminder':
        return 'info';
      case 'shift_cancelled':
        return 'error';
      case 'organization_update':
        return 'primary';
      case 'schedule_change':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Notifications
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
            sx={{ mr: 1 }}
          >
            Settings
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Loading notifications...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any notifications at the moment.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemButton 
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{ 
                      bgcolor: notification.read ? 'inherit' : 'action.hover',
                      py: 1
                    }}
                  >
                    <ListItemIcon>
                      {notification.read ? (
                        <NotificationsIcon />
                      ) : (
                        <NewNotificationIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="subtitle1"
                            fontWeight={notification.read ? 'normal' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={getNotificationTypeLabel(notification.type)} 
                            color={getNotificationTypeColor(notification.type)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.primary"
                            display="block"
                          >
                            {notification.message}
                          </Typography>
                          <Typography 
                            component="span" 
                            variant="caption" 
                            color="text.secondary"
                          >
                            {formatDate(notification.date)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Notification Settings Dialog */}
      <Dialog open={openSettings} onClose={handleCloseSettings} maxWidth="md" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
              <EmailIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.email.shift_available} 
                    onChange={handleSettingsChange('email', 'shift_available')}
                  />
                }
                label="Available Shifts"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.email.shift_reminder} 
                    onChange={handleSettingsChange('email', 'shift_reminder')}
                  />
                }
                label="Shift Reminders"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.email.shift_cancelled} 
                    onChange={handleSettingsChange('email', 'shift_cancelled')}
                  />
                }
                label="Cancelled Shifts"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.email.organization_update} 
                    onChange={handleSettingsChange('email', 'organization_update')}
                  />
                }
                label="Organization Updates"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.email.schedule_change} 
                    onChange={handleSettingsChange('email', 'schedule_change')}
                  />
                }
                label="Schedule Changes"
              />
            </FormGroup>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              SMS Notifications
              <SmsIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.sms.shift_available} 
                    onChange={handleSettingsChange('sms', 'shift_available')}
                  />
                }
                label="Available Shifts"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.sms.shift_reminder} 
                    onChange={handleSettingsChange('sms', 'shift_reminder')}
                  />
                }
                label="Shift Reminders"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.sms.shift_cancelled} 
                    onChange={handleSettingsChange('sms', 'shift_cancelled')}
                  />
                }
                label="Cancelled Shifts"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.sms.organization_update} 
                    onChange={handleSettingsChange('sms', 'organization_update')}
                  />
                }
                label="Organization Updates"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationSettings.sms.schedule_change} 
                    onChange={handleSettingsChange('sms', 'schedule_change')}
                  />
                }
                label="Schedule Changes"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Notifications;
