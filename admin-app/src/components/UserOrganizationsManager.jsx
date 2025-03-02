import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { userApi } from '../services/api';

function UserOrganizationsManager({ userId }) {
  const [organizations, setOrganizations] = useState([]);
  const [availableOrganizations, setAvailableOrganizations] = useState([]);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState('bas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    if (userId) {
      fetchUserOrganizations();
      fetchOrganizations();
    }
  }, [userId]);

  // Fetch user's organizations
  const fetchUserOrganizations = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUserOrganizations(userId);
      setUserOrganizations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user organizations:', err);
      setError('Failed to load user organizations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all organizations
  const fetchOrganizations = async () => {
    try {
      const data = await userApi.getAllOrganizations();
      setOrganizations(data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  // Filter available organizations
  useEffect(() => {
    if (organizations.length > 0 && userOrganizations.length > 0) {
      const userOrgIds = userOrganizations.map(uo => uo.organization_id);
      const available = organizations.filter(org => !userOrgIds.includes(org.id));
      setAvailableOrganizations(available);
    } else {
      setAvailableOrganizations(organizations);
    }
  }, [organizations, userOrganizations]);

  // Open dialog
  const handleOpenDialog = () => {
    setSelectedOrganization('');
    setSelectedRole('bas');
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Add user to organization
  const handleAddOrganization = async () => {
    if (!selectedOrganization) return;
    
    setLoading(true);
    try {
      await userApi.addUserToOrganization(userId, selectedOrganization, selectedRole);
      fetchUserOrganizations();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error adding user to organization:', err);
      setError('Failed to add user to organization');
    } finally {
      setLoading(false);
    }
  };

  // Remove user from organization
  const handleRemoveFromOrganization = async (organizationId) => {
    setLoading(true);
    try {
      await userApi.removeUserFromOrganization(userId, organizationId);
      fetchUserOrganizations();
    } catch (err) {
      console.error('Error removing user from organization:', err);
      setError('Failed to remove user from organization');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'schemaläggare':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Användarens organisationer</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog}
          disabled={availableOrganizations.length === 0}
        >
          Lägg till i organisation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organisation</TableCell>
                <TableCell>Roll</TableCell>
                <TableCell>Åtgärder</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userOrganizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Användaren är inte medlem i några organisationer
                  </TableCell>
                </TableRow>
              ) : (
                userOrganizations.map((userOrg) => (
                  <TableRow key={userOrg.organization_id}>
                    <TableCell>{userOrg.organization_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={userOrg.role} 
                        color={getRoleColor(userOrg.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveFromOrganization(userOrg.organization_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Lägg till användare i organisation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Organisation</InputLabel>
            <Select
              value={selectedOrganization}
              label="Organisation"
              onChange={(e) => setSelectedOrganization(e.target.value)}
            >
              {availableOrganizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Roll</InputLabel>
            <Select
              value={selectedRole}
              label="Roll"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="bas">Bas</MenuItem>
              <MenuItem value="schemaläggare">Schemaläggare</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Avbryt</Button>
          <Button 
            onClick={handleAddOrganization} 
            color="primary" 
            disabled={!selectedOrganization}
          >
            Lägg till
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserOrganizationsManager;
