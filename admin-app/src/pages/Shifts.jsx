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
  Chip
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { shiftApi, organizationApi } from '../services/api';

function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentShift, setCurrentShift] = useState({ 
    title: '', 
    description: '', 
    organization_id: '',
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour later
    status: 'open'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch shifts and organizations on component mount
  useEffect(() => {
    fetchShifts();
    fetchOrganizations();
  }, []);

  // Fetch all shifts
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await shiftApi.getAll();
      setShifts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load shifts. Please try again.');
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all organizations for the dropdown
  const fetchOrganizations = async () => {
    try {
      const data = await organizationApi.getAll();
      setOrganizations(data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentShift({ ...currentShift, [name]: value });
  };

  // Handle date changes
  const handleDateChange = (name, value) => {
    setCurrentShift({ ...currentShift, [name]: value });
  };

  // Open dialog for creating a new shift
  const handleAddNew = () => {
    setCurrentShift({ 
      title: '', 
      description: '', 
      organization_id: '',
      start_time: new Date(),
      end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
      status: 'open'
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a shift
  const handleEdit = (shift) => {
    // Convert string dates to Date objects
    const shiftWithDates = {
      ...shift,
      start_time: new Date(shift.start_time),
      end_time: new Date(shift.end_time)
    };
    setCurrentShift(shiftWithDates);
    setOpenDialog(true);
  };

  // Open dialog for deleting a shift
  const handleDeleteClick = (shift) => {
    setCurrentShift(shift);
    setOpenDeleteDialog(true);
  };

  // Close all dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeleteDialog(false);
  };

  // Save shift (create or update)
  const handleSave = async () => {
    try {
      // Format the data for API
      const shiftData = {
        ...currentShift,
        // Convert Date objects to ISO strings
        start_time: currentShift.start_time.toISOString(),
        end_time: currentShift.end_time.toISOString()
      };

      if (currentShift.id) {
        // Update existing shift
        await shiftApi.update(currentShift.id, shiftData);
        setSnackbar({ 
          open: true, 
          message: 'Shift updated successfully', 
          severity: 'success' 
        });
      } else {
        // Create new shift
        await shiftApi.create(shiftData);
        setSnackbar({ 
          open: true, 
          message: 'Shift created successfully', 
          severity: 'success' 
        });
      }
      
      // Refresh the shifts list
      fetchShifts();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.message || 'Something went wrong'}`, 
        severity: 'error' 
      });
    }
  };

  // Delete shift
  const handleDelete = async () => {
    try {
      await shiftApi.delete(currentShift.id);
      setSnackbar({ 
        open: true, 
        message: 'Shift deleted successfully', 
        severity: 'success' 
      });
      
      // Refresh the shifts list
      fetchShifts();
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

  // Get organization name by ID
  const getOrganizationName = (id) => {
    const org = organizations.find(org => org.id === id);
    return org ? org.name : 'Unknown';
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'warning';
      case 'assigned':
        return 'success';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Shifts</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add Shift
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Shifts table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No shifts found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.id}</TableCell>
                  <TableCell>{shift.title}</TableCell>
                  <TableCell>{getOrganizationName(shift.organization_id)}</TableCell>
                  <TableCell>{new Date(shift.start_time).toLocaleString()}</TableCell>
                  <TableCell>{new Date(shift.end_time).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={shift.status} 
                      color={getStatusColor(shift.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(shift)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(shift)}
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

      {/* Create/Edit Shift Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentShift.id ? 'Edit Shift' : 'Create Shift'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Shift Title"
              type="text"
              fullWidth
              value={currentShift.title}
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
              rows={2}
              value={currentShift.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="organization-select-label">Organization</InputLabel>
              <Select
                labelId="organization-select-label"
                name="organization_id"
                value={currentShift.organization_id}
                label="Organization"
                onChange={handleInputChange}
                required
              >
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <DateTimePicker
                label="Start Time"
                value={currentShift.start_time}
                onChange={(newValue) => handleDateChange('start_time', newValue)}
                sx={{ flex: 1 }}
              />
              
              <DateTimePicker
                label="End Time"
                value={currentShift.end_time}
                onChange={(newValue) => handleDateChange('end_time', newValue)}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                name="status"
                value={currentShift.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
              disabled={!currentShift.title || !currentShift.organization_id}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Shift</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the shift "{currentShift.title}"? 
            This action cannot be undone.
          </Typography>
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

export default Shifts;
