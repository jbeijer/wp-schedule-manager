import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { organizationApi } from '../services/api';

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState({ name: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetch all organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await organizationApi.getAll();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load organizations. Please try again.');
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrganization({ ...currentOrganization, [name]: value });
  };

  // Open dialog for creating a new organization
  const handleAddNew = () => {
    setCurrentOrganization({ name: '', description: '' });
    setOpenDialog(true);
  };

  // Open dialog for editing an organization
  const handleEdit = (organization) => {
    setCurrentOrganization(organization);
    setOpenDialog(true);
  };

  // Open dialog for deleting an organization
  const handleDeleteClick = (organization) => {
    setCurrentOrganization(organization);
    setOpenDeleteDialog(true);
  };

  // Close all dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(false);
  };

  // Save organization (create or update)
  const handleSave = async () => {
    try {
      if (currentOrganization.id) {
        // Update existing organization
        await organizationApi.update(currentOrganization.id, currentOrganization);
        setSnackbar({ 
          open: true, 
          message: 'Organization updated successfully', 
          severity: 'success' 
        });
      } else {
        // Create new organization
        await organizationApi.create(currentOrganization);
        setSnackbar({ 
          open: true, 
          message: 'Organization created successfully', 
          severity: 'success' 
        });
      }
      
      // Refresh the organizations list
      fetchOrganizations();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message || 'Something went wrong'}`, 
        severity: 'error' 
      });
    }
  };

  // Delete organization
  const handleDelete = async () => {
    try {
      await organizationApi.delete(currentOrganization.id);
      setSnackbar({ 
        open: true, 
        message: 'Organization deleted successfully', 
        severity: 'success' 
      });
      
      // Refresh the organizations list
      fetchOrganizations();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message || 'Something went wrong'}`, 
        severity: 'error' 
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Organizations</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add Organization
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Organizations table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No organizations found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.id}</TableCell>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.description}</TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(org)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(org)}
                      size="small"
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

      {/* Create/Edit Organization Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentOrganization.id ? 'Edit Organization' : 'Create Organization'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Organization Name"
            type="text"
            fullWidth
            value={currentOrganization.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentOrganization.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={!currentOrganization.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the organization "{currentOrganization.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
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

export default Organizations;
