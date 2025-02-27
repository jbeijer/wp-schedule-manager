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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Mock API service for users - replace with actual API calls
const mockUserApi = {
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, display_name: 'John Doe', user_email: 'john@example.com', role: 'admin' },
          { id: 2, display_name: 'Jane Smith', user_email: 'jane@example.com', role: 'schemalaggare' },
          { id: 3, display_name: 'Bob Johnson', user_email: 'bob@example.com', role: 'bas' },
        ]);
      }, 1000);
    });
  },
  createUser: (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 4, ...userData });
      }, 1000);
    });
  },
  updateUser: (userId, userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: userId, ...userData });
      }, 1000);
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

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
    role: 'bas'
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentUser, setCurrentUser] = useState({ role: 'schemalaggare' }); // Mock current user

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
      // Replace with actual API call
      const data = await mockUserApi.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog to create a new user
  const handleCreateUser = () => {
    if (!hasPermission('create', currentUser.role)) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to create users',
        severity: 'error'
      });
      return;
    }
    setDialogMode('create');
    setFormData({
      display_name: '',
      user_email: '',
      role: 'bas'
    });
    setOpenDialog(true);
  };

  // Open dialog to edit a user
  const handleEditUser = (user) => {
    if (!hasPermission('edit', currentUser.role, user.role)) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to edit this user',
        severity: 'error'
      });
      return;
    }
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      display_name: user.display_name,
      user_email: user.user_email,
      role: user.role
    });
    setOpenDialog(true);
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    try {
      if (dialogMode === 'create') {
        // Replace with actual API call
        const newUser = await mockUserApi.createUser(formData);
        setUsers([...users, newUser]);
        
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      } else {
        // Replace with actual API call
        const updatedUser = await mockUserApi.updateUser(selectedUser.id, formData);
        setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
        
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to save user'}`,
        severity: 'error'
      });
    }
  };

  // Confirm user deletion
  const handleConfirmDelete = async () => {
    try {
      // Replace with actual API call
      await mockUserApi.deleteUser(selectedUser.id);
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      
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
          {dialogMode === 'create' ? 'Add User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400, maxWidth: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="user_email"
              value={formData.user_email}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="bas">Bas (Anställd)</MenuItem>
                <MenuItem value="schemalaggare">Schemaläggare</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Add' : 'Save'}
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
