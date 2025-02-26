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
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Mock API service for resources - replace with actual API calls
const mockResourceApi = {
  getResources: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Conference Room A', organization_id: 1, organization_name: 'Main Organization' },
          { id: 2, title: 'Conference Room B', organization_id: 1, organization_name: 'Main Organization' },
          { id: 3, title: 'Vehicle 1', organization_id: 2, organization_name: 'Secondary Organization' },
        ]);
      }, 1000);
    });
  },
  getOrganizations: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Main Organization' },
          { id: 2, name: 'Secondary Organization' },
        ]);
      }, 500);
    });
  },
  createResource: (resourceData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          id: 4, 
          ...resourceData,
          organization_name: resourceData.organization_id === 1 ? 'Main Organization' : 'Secondary Organization'
        });
      }, 1000);
    });
  },
  updateResource: (resourceId, resourceData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          id: resourceId, 
          ...resourceData,
          organization_name: resourceData.organization_id === 1 ? 'Main Organization' : 'Secondary Organization'
        });
      }, 1000);
    });
  },
  deleteResource: (resourceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};

function Resources() {
  const [resources, setResources] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization_id: '',
    description: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch resources and organizations on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace with actual API calls
        const [resourcesData, organizationsData] = await Promise.all([
          mockResourceApi.getResources(),
          mockResourceApi.getOrganizations()
        ]);
        
        setResources(resourcesData);
        setOrganizations(organizationsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open dialog to create a new resource
  const handleCreateResource = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      organization_id: '',
      description: ''
    });
    setOpenDialog(true);
  };

  // Open dialog to edit a resource
  const handleEditResource = (resource) => {
    setDialogMode('edit');
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      organization_id: resource.organization_id,
      description: resource.description || ''
    });
    setOpenDialog(true);
  };

  // Open dialog to confirm resource deletion
  const handleDeleteResource = (resource) => {
    setSelectedResource(resource);
    setOpenDeleteDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResource(null);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedResource(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save resource (create or update)
  const handleSaveResource = async () => {
    try {
      if (dialogMode === 'create') {
        // Replace with actual API call
        const newResource = await mockResourceApi.createResource(formData);
        setResources([...resources, newResource]);
        
        setSnackbar({
          open: true,
          message: 'Resource created successfully',
          severity: 'success'
        });
      } else {
        // Replace with actual API call
        const updatedResource = await mockResourceApi.updateResource(selectedResource.id, formData);
        setResources(resources.map(resource => resource.id === selectedResource.id ? updatedResource : resource));
        
        setSnackbar({
          open: true,
          message: 'Resource updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving resource:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to save resource'}`,
        severity: 'error'
      });
    }
  };

  // Confirm resource deletion
  const handleConfirmDelete = async () => {
    try {
      // Replace with actual API call
      await mockResourceApi.deleteResource(selectedResource.id);
      
      setResources(resources.filter(resource => resource.id !== selectedResource.id));
      
      setSnackbar({
        open: true,
        message: 'Resource deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting resource:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to delete resource'}`,
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Resources</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateResource}
        >
          Add Resource
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
                <TableCell>Title</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.title}</TableCell>
                  <TableCell>{resource.organization_name}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditResource(resource)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteResource(resource)}
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

      {/* Create/Edit Resource Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add Resource' : 'Edit Resource'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, width: 400, maxWidth: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="organization-select-label">Organization</InputLabel>
              <Select
                labelId="organization-select-label"
                name="organization_id"
                value={formData.organization_id}
                label="Organization"
                onChange={handleInputChange}
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveResource} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedResource?.title}? This action cannot be undone.
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

export default Resources;
