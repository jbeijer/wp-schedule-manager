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

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [currentUser, setCurrentUser] = useState({ role: 'schemalaggare' }); // Mock current user
  const [formLoading, setFormLoading] = useState(false);

  // Add permission utility function
  const hasPermission = (action, currentUserRole, targetUserRole) => {
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'schemalaggare') {
      return action !== 'delete' && targetUserRole === 'bas';
    }
    return false;
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
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
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.user_email.trim()) {
      setSnackbar({
        open: true,
        message: 'Förnamn, efternamn och e-post måste anges',
        severity: 'error'
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      setSnackbar({
        open: true,
        message: 'Ange en giltig e-postadress',
        severity: 'error'
      });
      return;
    }

    // Validate role
    const validRoles = ['bas', 'schemalaggare', 'admin'];
    if (!validRoles.includes(formData.role)) {
      setSnackbar({
        open: true,
        message: 'Ogiltig roll tilldelad',
        severity: 'error'
      });
      return;
    }

    setFormLoading(true);
    try {
      setSnackbar({
        open: true,
        message: dialogMode === 'create' ? 'Skapar användare...' : 'Uppdaterar användare...',
        severity: 'info'
      });
      
      // Prepare data to send to the API
      const userData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        display_name: formData.display_name || `${formData.first_name.trim()} ${formData.last_name.trim()}`,
        user_email: formData.user_email,
        role: formData.role
      };
      
      if (dialogMode === 'create') {
        const newUser = await userApi.createUser(userData);
        await fetchUsers();
        setSnackbar({
          open: true,
          message: 'Användare skapad',
          severity: 'success'
        });
      } else {
        await userApi.updateUser(selectedUser.id, userData);
        await fetchUsers();
        setSnackbar({
          open: true,
          message: 'Användare uppdaterad',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: `Fel: ${err.message || 'Kunde inte spara användare'}`,
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
        >
          Add User
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
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
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditUser(user)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                  onChange={(e) => {
                    handleInputChange('first_name', e.target.value);
                    handleInputChange('display_name', `${e.target.value} ${formData.last_name}`.trim());
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Efternamn"
                  value={formData.last_name}
                  onChange={(e) => {
                    handleInputChange('last_name', e.target.value);
                    handleInputChange('display_name', `${formData.first_name} ${e.target.value}`.trim());
                  }}
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
                    value={formData.role}
                    label="Roll"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <MenuItem value="bas">Bas (Anställd)</MenuItem>
                    <MenuItem value="schemalaggare">Schemaläggare</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
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