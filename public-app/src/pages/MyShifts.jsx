import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ViewList as ListView,
  Info as InfoIcon
} from '@mui/icons-material';
import { shiftApi } from '../services/api';

function MyShifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedShift, setSelectedShift] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  // Fetch shifts from API
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await shiftApi.getMyShifts();
      setShifts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError('Failed to load shifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle shift cancellation
  const handleCancelShift = (shift) => {
    setSelectedShift(shift);
    setOpenDialog(true);
  };

  // Confirm shift cancellation
  const confirmCancelShift = async () => {
    if (!selectedShift) return;
    
    try {
      await shiftApi.cancelSignUp(selectedShift.id);
      
      // Update shifts list
      setShifts(shifts.filter(shift => shift.id !== selectedShift.id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Shift cancelled successfully',
        severity: 'success'
      });
      
      setOpenDialog(false);
      setSelectedShift(null);
    } catch (err) {
      console.error('Error cancelling shift:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to cancel shift'}`,
        severity: 'error'
      });
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedShift(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  // Filter shifts based on selected tab
  const filteredShifts = () => {
    switch (tabValue) {
      case 0: // All shifts
        return shifts;
      case 1: // Upcoming shifts
        return shifts.filter(shift => 
          new Date(shift.start_time) > new Date() && 
          shift.status !== 'completed'
        );
      case 2: // Completed shifts
        return shifts.filter(shift => 
          shift.status === 'completed' || 
          new Date(shift.end_time) < new Date()
        );
      default:
        return shifts;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">My Shifts</Typography>
        <Box>
          <IconButton 
            color={viewMode === 'list' ? 'primary' : 'default'} 
            onClick={() => handleViewModeChange('list')}
          >
            <ListView />
          </IconButton>
          <IconButton 
            color={viewMode === 'calendar' ? 'primary' : 'default'} 
            onClick={() => handleViewModeChange('calendar')}
          >
            <CalendarIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All Shifts" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Loading shifts...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : filteredShifts().length === 0 ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          p={4}
          sx={{ 
            border: '1px dashed #ccc', 
            borderRadius: 1,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No shifts found
          </Typography>
        </Box>
      ) : viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShifts().map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.organization_name}</TableCell>
                  <TableCell>{shift.title}</TableCell>
                  <TableCell>{formatDate(shift.start_time)}</TableCell>
                  <TableCell>{formatDate(shift.end_time)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={shift.status} 
                      color={getStatusColor(shift.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          // Show shift details
                          console.log('View shift details:', shift);
                        }}
                      >
                        <InfoIcon />
                      </IconButton>
                      {shift.status !== 'completed' && 
                       new Date(shift.start_time) > new Date() && (
                        <Button 
                          size="small" 
                          color="error" 
                          variant="outlined"
                          onClick={() => handleCancelShift(shift)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Calendar view will be implemented here
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Cancel Shift</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this shift? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No, Keep It</Button>
          <Button onClick={confirmCancelShift} color="error" autoFocus>
            Yes, Cancel Shift
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

export default MyShifts;
