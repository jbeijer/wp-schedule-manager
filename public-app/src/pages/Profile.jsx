import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { userApi } from '../services/api';

function Profile() {
  const [profile, setProfile] = useState({
    display_name: '',
    user_email: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Fetch profile data from API
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const profileData = await userApi.getProfile();
      setProfile(profileData);
      
      // Fetch user organizations
      const organizationsData = await userApi.getOrganizations();
      setOrganizations(organizationsData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start editing profile
  const handleStartEditing = () => {
    setEditedProfile({ ...profile });
    setEditing(true);
  };

  // Cancel editing
  const handleCancelEditing = () => {
    setEditing(false);
    setEditedProfile({});
  };

  // Handle profile field change
  const handleProfileChange = (field) => (event) => {
    setEditedProfile({
      ...editedProfile,
      [field]: event.target.value
    });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile(editedProfile);
      
      // Update local state
      setProfile(editedProfile);
      setEditing(false);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to update profile'}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role chip color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'member':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Profile Information</Typography>
                {!editing ? (
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={handleStartEditing}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEditing}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    value={editing ? editedProfile.display_name : profile.display_name}
                    onChange={handleProfileChange('display_name')}
                    fullWidth
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={editing ? editedProfile.user_email : profile.user_email}
                    onChange={handleProfileChange('user_email')}
                    fullWidth
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    value={editing ? editedProfile.phone : profile.phone}
                    onChange={handleProfileChange('phone')}
                    fullWidth
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={editing ? editedProfile.address : profile.address}
                    onChange={handleProfileChange('address')}
                    fullWidth
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    value={editing ? editedProfile.bio : profile.bio}
                    onChange={handleProfileChange('bio')}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Profile Summary and Organizations */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  {getInitials(profile.display_name)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.display_name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {profile.user_email}
                </Typography>
                {profile.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {profile.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="My Organizations" />
              <Divider />
              <CardContent>
                {organizations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    You are not a member of any organizations.
                  </Typography>
                ) : (
                  <List>
                    {organizations.map((org) => (
                      <ListItem key={org.id}>
                        <ListItemIcon>
                          <BusinessIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={org.name} 
                          secondary={
                            <Chip 
                              label={org.role} 
                              color={getRoleColor(org.role)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
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

export default Profile;
