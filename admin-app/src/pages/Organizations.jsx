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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { organizationApi } from '../services/api';

function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationsTree, setOrganizationsTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState({ name: '', description: '', parent_id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('flat'); // 'flat' or 'tree'
  const [expandedRows, setExpandedRows] = useState({});

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, [viewMode]);

  // Fetch all organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      if (viewMode === 'tree') {
        const data = await organizationApi.getAll({ hierarchical: true });
        setOrganizationsTree(data);
      } else {
        const data = await organizationApi.getAll();
        setOrganizations(data);
      }
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
    setCurrentOrganization({ name: '', description: '', parent_id: null });
    setOpenDialog(true);
  };

  // Open dialog for editing an organization
  const handleEdit = async (organization) => {
    try {
      // Get full organization details with hierarchy
      const orgDetails = await organizationApi.getById(organization.id, { include_hierarchy: true });
      setCurrentOrganization(orgDetails);
      setOpenDialog(true);
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message || 'Failed to load organization details'}`, 
        severity: 'error' 
      });
    }
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

  // Toggle row expansion in tree view
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Render a row in the tree view
  const renderTreeRow = (org, level = 0) => {
    const isExpanded = expandedRows[org.id] || false;
    const hasChildren = org.children && org.children.length > 0;
    
    return (
      <React.Fragment key={org.id}>
        <TableRow sx={{ backgroundColor: level === 0 ? 'inherit' : `rgba(0, 0, 0, ${0.03 * level})` }}>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 2 }}>
              {hasChildren ? (
                <IconButton size="small" onClick={() => toggleRowExpansion(org.id)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              ) : (
                <Box sx={{ width: 28, height: 28 }} />
              )}
              {org.id}
            </Box>
          </TableCell>
          <TableCell>{org.name}</TableCell>
          <TableCell>{org.description}</TableCell>
          <TableCell>{org.parent_id ? org.parent_id : '-'}</TableCell>
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
        {hasChildren && isExpanded && (
          <TableRow>
            <TableCell colSpan={6} padding="0">
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Table size="small">
                  <TableBody>
                    {org.children.map(child => renderTreeRow(child, level + 1))}
                  </TableBody>
                </Table>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Organizations</Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'tree'}
                onChange={() => setViewMode(viewMode === 'flat' ? 'tree' : 'flat')}
                color="primary"
              />
            }
            label="Hierarchical View"
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ ml: 2 }}
          >
            Add Organization
          </Button>
        </Box>
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
              {viewMode === 'tree' && <TableCell>Parent ID</TableCell>}
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={viewMode === 'tree' ? 6 : 5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : viewMode === 'tree' ? (
              organizationsTree.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No organizations found. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                organizationsTree.map(org => renderTreeRow(org))
              )
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
            value={currentOrganization.name || ''}
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
            value={currentOrganization.description || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel id="parent-organization-label">Parent Organization</InputLabel>
            <Select
              labelId="parent-organization-label"
              id="parent-organization"
              name="parent_id"
              value={currentOrganization.parent_id || ''}
              onChange={handleInputChange}
              label="Parent Organization"
            >
              <MenuItem value="">
                <em>None (Root Organization)</em>
              </MenuItem>
              {organizations
                .filter(org => org.id !== currentOrganization.id) // Can't be its own parent
                .map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
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
