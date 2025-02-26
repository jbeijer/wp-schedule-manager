import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import StatusHandler from './StatusHandler';

/**
 * Component to manage users in an organization
 * 
 * @param {Object} props - Component props
 * @param {number} props.organizationId - ID of the organization
 * @param {Function} props.fetchUsers - Function to fetch users for the organization
 * @param {Function} props.addUser - Function to add a user to the organization
 * @param {Function} props.removeUser - Function to remove a user from the organization
 * @param {Function} props.fetchAvailableUsers - Function to fetch available users
 */
function UserOrganizationManager({
  organizationId,
  fetchUsers,
  addUser,
  removeUser,
  fetchAvailableUsers
}) {
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch users when organization ID changes
  useEffect(() => {
    if (organizationId) {
      loadUsers();
    }
  }, [organizationId]);

  // Load users for the organization
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(organizationId);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open dialog to add a user
  const handleAddUser = async () => {
    try {
      const availableUsersList = await fetchAvailableUsers(organizationId);
      setAvailableUsers(availableUsersList);
      setOpenDialog(true);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load available users',
        severity: 'error'
      });
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser('');
    setSelectedRole('member');
  };

  // Save user to organization
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await addUser(organizationId, {
        user_id: selectedUser,
        role: selectedRole
      });
      
      setSnackbar({
        open: true,
        message: 'User added to organization successfully',
        severity: 'success'
      });
      
      // Refresh users list
      loadUsers();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to add user'}`,
        severity: 'error'
      });
    }
  };

  // Remove user from organization
  const handleRemoveUser = async (userId) => {
    try {
      await removeUser(organizationId, userId);
      
      setSnackbar({
        open: true,
        message: 'User removed from organization successfully',
        severity: 'success'
      });
      
      // Refresh users list
      loadUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to remove user'}`,
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Organization Users</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          disabled={!organizationId}
        >
          Add User
        </Button>
      </Box>

      <StatusHandler
        loading={loading}
        error={error}
        isEmpty={users.length === 0}
        emptyMessage="No users in this organization yet"
        snackbar={snackbar}
        onSnackbarClose={handleCloseSnackbar}
      >
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
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
                      color="error"
                      onClick={() => handleRemoveUser(user.id)}
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
      </StatusHandler>

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add User to Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                value={selectedUser}
                label="User"
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.ID} value={user.ID}>
                    {user.display_name} ({user.user_email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                label="Role"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            color="primary"
            disabled={!selectedUser}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserOrganizationManager;
