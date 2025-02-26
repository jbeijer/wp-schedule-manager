import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs,
  Tab,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'WP Schedule Manager',
    adminEmail: 'admin@example.com',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    enableNotifications: true
  });
  const [emailSettings, setEmailSettings] = useState({
    fromName: 'WP Schedule Manager',
    fromEmail: 'noreply@example.com',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    enableSmtp: false
  });
  const [notificationSettings, setNotificationSettings] = useState({
    newShiftTemplate: 'A new shift has been created: {{shift_title}}',
    cancelledShiftTemplate: 'A shift has been cancelled: {{shift_title}}',
    reminderTemplate: 'Reminder: You have a shift coming up: {{shift_title}}',
    enableEmailNotifications: true,
    enableBrowserNotifications: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGeneralSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: name === 'enableNotifications' ? checked : value
    });
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: name === 'enableSmtp' ? checked : value
    });
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: name.startsWith('enable') ? checked : value
    });
  };

  const handleSaveSettings = (settingsType) => {
    // Mock API call to save settings
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: `${settingsType} settings saved successfully`,
        severity: 'success'
      });
    }, 500);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>Settings</Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="General" />
          <Tab label="Email" />
          <Tab label="Notifications" />
          <Tab label="Advanced" />
        </Tabs>
        
        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" mb={2}>General Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Site Name"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Admin Email"
                name="adminEmail"
                type="email"
                value={generalSettings.adminEmail}
                onChange={handleGeneralSettingsChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Date Format"
                name="dateFormat"
                value={generalSettings.dateFormat}
                onChange={handleGeneralSettingsChange}
                helperText="Format: YYYY-MM-DD, MM/DD/YYYY, etc."
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Time Format"
                name="timeFormat"
                value={generalSettings.timeFormat}
                onChange={handleGeneralSettingsChange}
                helperText="24h or 12h (AM/PM)"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={generalSettings.enableNotifications}
                    onChange={handleGeneralSettingsChange}
                    name="enableNotifications"
                    color="primary"
                  />
                }
                label="Enable Notifications"
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Usage Statistics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Collect anonymous usage data to help improve the plugin.
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Share anonymous usage data"
                  />
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Debug Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Enable debug mode to help troubleshoot issues.
                  </Typography>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Enable debug mode"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('General')}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>
        
        {/* Email Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" mb={2}>Email Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="From Name"
                name="fromName"
                value={emailSettings.fromName}
                onChange={handleEmailSettingsChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="From Email"
                name="fromEmail"
                type="email"
                value={emailSettings.fromEmail}
                onChange={handleEmailSettingsChange}
              />
              
              <Divider sx={{ my: 3 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={emailSettings.enableSmtp}
                    onChange={handleEmailSettingsChange}
                    name="enableSmtp"
                    color="primary"
                  />
                }
                label="Use SMTP for sending emails"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="SMTP Host"
                name="smtpHost"
                value={emailSettings.smtpHost}
                onChange={handleEmailSettingsChange}
                disabled={!emailSettings.enableSmtp}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="SMTP Port"
                name="smtpPort"
                value={emailSettings.smtpPort}
                onChange={handleEmailSettingsChange}
                disabled={!emailSettings.enableSmtp}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="SMTP Username"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailSettingsChange}
                disabled={!emailSettings.enableSmtp}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="SMTP Password"
                name="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={handleEmailSettingsChange}
                disabled={!emailSettings.enableSmtp}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Test Email Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Send a test email to verify your email settings are working correctly.
                  </Typography>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Test Email Address"
                    placeholder="Enter email address"
                  />
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Send Test Email
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('Email')}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>
        
        {/* Notification Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" mb={2}>Notification Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableEmailNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="enableEmailNotifications"
                    color="primary"
                  />
                }
                label="Enable Email Notifications"
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.enableBrowserNotifications}
                    onChange={handleNotificationSettingsChange}
                    name="enableBrowserNotifications"
                    color="primary"
                  />
                }
                label="Enable Browser Notifications"
                sx={{ mb: 2, display: 'block' }}
              />
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Email Templates
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="New Shift Notification"
                name="newShiftTemplate"
                value={notificationSettings.newShiftTemplate}
                onChange={handleNotificationSettingsChange}
                multiline
                rows={3}
                helperText="Available variables: {{shift_title}}, {{shift_date}}, {{shift_time}}, {{user_name}}"
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Cancelled Shift Notification"
                name="cancelledShiftTemplate"
                value={notificationSettings.cancelledShiftTemplate}
                onChange={handleNotificationSettingsChange}
                multiline
                rows={3}
                helperText="Available variables: {{shift_title}}, {{shift_date}}, {{shift_time}}, {{user_name}}"
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Shift Reminder Notification"
                name="reminderTemplate"
                value={notificationSettings.reminderTemplate}
                onChange={handleNotificationSettingsChange}
                multiline
                rows={3}
                helperText="Available variables: {{shift_title}}, {{shift_date}}, {{shift_time}}, {{user_name}}"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Notification Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure when notifications are sent to users.
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom mt={2}>
                    Shift Reminders
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Send reminder 24 hours before shift"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Send reminder 1 hour before shift"
                  />
                  
                  <Typography variant="subtitle2" gutterBottom mt={2}>
                    Digest Emails
                  </Typography>
                  <FormControlLabel
                    control={<Switch color="primary" />}
                    label="Send weekly schedule digest"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSettings('Notification')}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>
        
        {/* Advanced Settings */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" mb={2}>Advanced Settings</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Data Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Manage your plugin data and settings.
                  </Typography>
                  <Box mt={2}>
                    <Button variant="outlined" color="primary" sx={{ mr: 2, mb: 1 }}>
                      Export Data
                    </Button>
                    <Button variant="outlined" color="primary" sx={{ mb: 1 }}>
                      Import Data
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Button variant="outlined" color="error">
                    Reset All Settings
                  </Button>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Cache Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clear cached data to refresh the application.
                  </Typography>
                  <Button variant="outlined" color="primary">
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    API Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure API access and permissions.
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked color="primary" />}
                    label="Enable API access"
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="API Key"
                    value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <Box mt={2}>
                    <Button variant="outlined" color="primary" size="small">
                      Regenerate API Key
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
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

export default Settings;
