import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { userApi } from '../services/api';
import UserOrganizationsManager from '../components/UserOrganizationsManager';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserForOrg, setSelectedUserForOrg] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    user_email: '',
    role: 'bas',
    first_name: '',
    last_name: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentUser, setCurrentUser] = useState({ role: 'admin' }); // Mock current user
  const [formLoading, setFormLoading] = useState(false);

  // Add permission utility function
  const hasPermission = (action, currentUserRole, targetUserRole = 'bas') => {
    console.log(`Checking permission for action: ${action}, current role: ${currentUserRole}, target role: ${targetUserRole}`);
    
    // Admin has full permissions
    if (currentUserRole === 'admin') return true;
    
    // Schemaläggare can create Bas users
    if (currentUserRole === 'schemaläggare') {
        return action === 'create' && targetUserRole === 'bas';
    }
    
    // Bas users have no user management permissions
    return false;
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    
    // Get current user role from WordPress
    if (window.wpScheduleManager && window.wpScheduleManager.userCapabilities) {
        console.log('Fetched user capabilities:', window.wpScheduleManager.userCapabilities);
        setCurrentUser({ 
            role: window.wpScheduleManager.userCapabilities.role,
            capabilities: window.wpScheduleManager.userCapabilities
        });
    }
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users');
      const data = await userApi.getAllUsers();
      console.log('Users fetched successfully:', data);
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users. Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Open dialog to create a new user
  const handleCreateUser = () => {
    console.log('Current user role:', currentUser.role);
    console.log('Permission check result:', hasPermission('create', currentUser.role));
    
    if (!hasPermission('create', currentUser.role)) {
        setSnackbar({
            open: true,
            message: 'Du har inte behörighet att skapa användare',
            severity: 'error'
        });
        return;
    }
    setDialogMode('create');
    setFormData({
      display_name: '',
      user_email: '',
      role: 'bas',
      first_name: '',
      last_name: ''
    });
    setOpenDialog(true);
  };

  // Open dialog to edit a user
  const handleEditUser = (user) => {
    try {
      setSnackbar({
        open: true,
        message: 'Laddar användardata...',
        severity: 'info'
      });
      
      console.log('Editing user:', user);
      
      setDialogMode('edit');
      setSelectedUser(user);
      
      let firstName = user.first_name || '';
      let lastName = user.last_name || '';
      
      if ((!firstName || !lastName) && user.display_name) {
        const nameParts = user.display_name.split(' ');
        if (nameParts.length > 1) {
          firstName = firstName || nameParts[0];
          lastName = lastName || nameParts.slice(1).join(' ');
        } else {
          firstName = firstName || user.display_name;
        }
      }
      
      setFormData({
        display_name: `${firstName} ${lastName}`.trim(),
        user_email: user.user_email || '',
        role: user.role || 'bas',
        first_name: firstName,
        last_name: lastName
      });
      
      setSnackbar({
        ...snackbar,
        open: false
      });
      
      setOpenDialog(true);
    } catch (err) {
      console.error('Error preparing edit form:', err);
      setSnackbar({
        open: true,
        message: `Fel vid förberedelse av redigeringsformuläret: ${err.message || 'Okänt fel'}`,
        severity: 'error'
      });
    }
  };

  // Open dialog to confirm user deletion
  const handleDeleteUser = (user) => {
    if (!hasPermission('delete', currentUser.role, user.role)) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to delete users',
        severity: 'error'
      });
      return;
    }
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  // Handle form input change
  const handleInputChange = (name, value) => {
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    if (name === 'first_name' || name === 'last_name') {
      const firstName = name === 'first_name' ? value : formData.first_name || '';
      const lastName = name === 'last_name' ? value : formData.last_name || '';
      updatedFormData.display_name = `${firstName} ${lastName}`.trim();
    }
    
    setFormData(updatedFormData);
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    // Validate required fields
    if (!formData.first_name?.trim() || !formData.last_name?.trim() || !formData.user_email?.trim()) {
      setSnackbar({
        open: true,
        message: 'Förnamn, efternamn och e-post måste anges',
        severity: 'error'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      setSnackbar({
        open: true,
        message: 'Ange en giltig e-postadress',
        severity: 'error'
      });
      return;
    }

    try {
      setFormLoading(true);
      
      // Prepare user data
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        display_name: formData.display_name || `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        user_email: formData.user_email,
        role: formData.role || 'bas' // Default to 'bas' role
      };

      // Make API request
      const response = await fetch(`${window.wpScheduleManager.apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpScheduleManager.nonce
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Kunde inte skapa användare');
      }

      setSnackbar({
        open: true,
        message: 'Användaren skapades framgångsrikt',
        severity: 'success'
      });
      
      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Fel: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm user deletion
  const handleConfirmDelete = async () => {
    try {
      setSnackbar({
        open: true,
        message: 'Deleting user...',
        severity: 'info'
      });
      
      console.log('Deleting user:', selectedUser.id);
      await userApi.deleteUser(selectedUser.id);
      console.log('User deleted successfully');
      
      await fetchUsers();
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to delete user'}`,
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get role chip color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'schemalaggare':
        return 'primary';
      case 'bas':
        return 'success';
      default:
        return 'default';
    }
  };

  // Role options for the select input
  const roleOptions = [
    { value: 'bas', label: 'Bas (Anställd)' },
    { value: 'schemaläggare', label: 'Schemaläggare' },
    { value: 'admin', label: 'Admin' }
  ];

  // Handle role change
  const handleRoleChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      role: selectedOption.value
    }));
  };

  // Handle clicking on a user's organizations
  const handleManageOrganizations = (user) => {
    setSelectedUserForOrg(user);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Användare</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Lägg till användare
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={selectedUserForOrg ? 6 : 12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Namn</TableCell>
                    <TableCell>E-post</TableCell>
                    <TableCell>Roll</TableCell>
                    <TableCell>Åtgärder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.display_name}</TableCell>
                      <TableCell>{user.user_email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'admin' 
                              ? 'error' 
                              : user.role === 'schemaläggare' 
                                ? 'primary' 
                                : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditUser(user)}
                          disabled={!hasPermission('edit', currentUser.role, user.role)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleDeleteUser(user)}
                          disabled={!hasPermission('delete', currentUser.role, user.role)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <Button
                          size="small"
                          onClick={() => handleManageOrganizations(user)}
                        >
                          Organisationer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {selectedUserForOrg && (
            <Grid item xs={12} md={6}>
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Organisationer för {selectedUserForOrg.display_name}
                </Typography>
                <IconButton onClick={() => setSelectedUserForOrg(null)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <UserOrganizationsManager userId={selectedUserForOrg.id} />
            </Grid>
          )}
        </Grid>
      )}

      {/* Create/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'create' ? 'Lägg till användare' : 'Redigera användare'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400, maxWidth: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Förnamn"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Efternamn"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Visningsnamn"
                  value={formData.display_name}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-post"
                  value={formData.user_email}
                  onChange={(e) => handleInputChange('user_email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Roll</InputLabel>
                  <Select
                    value={roleOptions.find(option => option.value === formData.role)}
                    label="Roll"
                    onChange={(e) => handleRoleChange(e.target.value)}
                    isClearable={false}
                  >
                    {roleOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>Avbryt</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
            disabled={formLoading || !formData.first_name.trim() || !formData.last_name.trim() || !formData.user_email.includes('@')}
          >
            {formLoading 
              ? (dialogMode === 'create' ? 'Skapar...' : 'Uppdaterar...') 
              : (dialogMode === 'create' ? 'Lägg till' : 'Spara')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUser?.display_name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
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

export default Users;