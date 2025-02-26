import React from 'react';
import { 
  Alert, 
  CircularProgress, 
  Box, 
  Typography,
  Snackbar
} from '@mui/material';

/**
 * Component to handle loading, error, and empty states
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message, if any
 * @param {boolean} props.isEmpty - Whether data is empty
 * @param {string} props.emptyMessage - Message to display when data is empty
 * @param {Object} props.snackbar - Snackbar state
 * @param {Function} props.onSnackbarClose - Function to close snackbar
 * @param {React.ReactNode} props.children - Child components to render when not loading/error/empty
 */
function StatusHandler({ 
  loading, 
  error, 
  isEmpty, 
  emptyMessage = 'No data found', 
  snackbar = { open: false, message: '', severity: 'info' },
  onSnackbarClose,
  children 
}) {
  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
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
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Render children and snackbar
  return (
    <>
      {children}
      
      {/* Snackbar for notifications */}
      {onSnackbarClose && (
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={onSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={onSnackbarClose} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}

export default StatusHandler;
