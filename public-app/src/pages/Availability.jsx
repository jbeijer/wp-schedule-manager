import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { availabilityApi } from '../services/api';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

function Availability() {
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [availabilityType, setAvailabilityType] = useState('recurring');

  // Initialize availability state
  useEffect(() => {
    const initialAvailability = {};
    
    // Initialize recurring availability
    DAYS_OF_WEEK.forEach(day => {
      initialAvailability[day.value] = {
        available: false,
        start_time: new Date(new Date().setHours(9, 0, 0, 0)),
        end_time: new Date(new Date().setHours(17, 0, 0, 0))
      };
    });
    
    // Initialize specific dates availability
    initialAvailability.specific_dates = [];
    
    setAvailability(initialAvailability);
    
    // Fetch user's availability
    fetchAvailability();
  }, []);

  // Fetch availability from API
  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const data = await availabilityApi.getMyAvailability();
      
      // Process the data to match our state structure
      const processedData = { ...availability };
      
      // Process recurring availability
      if (data.recurring) {
        Object.keys(data.recurring).forEach(day => {
          if (data.recurring[day]) {
            processedData[day] = {
              available: data.recurring[day].available || false,
              start_time: data.recurring[day].start_time 
                ? new Date(`2023-01-01T${data.recurring[day].start_time}`) 
                : new Date(new Date().setHours(9, 0, 0, 0)),
              end_time: data.recurring[day].end_time 
                ? new Date(`2023-01-01T${data.recurring[day].end_time}`) 
                : new Date(new Date().setHours(17, 0, 0, 0))
            };
          }
        });
      }
      
      // Process specific dates
      if (data.specific_dates) {
        processedData.specific_dates = data.specific_dates.map(date => ({
          date: new Date(date.date),
          available: date.available || false,
          start_time: date.start_time 
            ? new Date(`2023-01-01T${date.start_time}`) 
            : new Date(new Date().setHours(9, 0, 0, 0)),
          end_time: date.end_time 
            ? new Date(`2023-01-01T${date.end_time}`) 
            : new Date(new Date().setHours(17, 0, 0, 0))
        }));
      }
      
      setAvailability(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle availability type change
  const handleAvailabilityTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setAvailabilityType(newValue);
    }
  };

  // Handle day availability change
  const handleDayAvailabilityChange = (day) => (event) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        available: event.target.checked
      }
    });
  };

  // Handle time change
  const handleTimeChange = (day, timeType) => (newTime) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [timeType]: newTime
      }
    });
  };

  // Add specific date
  const handleAddSpecificDate = () => {
    const newDate = {
      date: new Date(),
      available: true,
      start_time: new Date(new Date().setHours(9, 0, 0, 0)),
      end_time: new Date(new Date().setHours(17, 0, 0, 0))
    };
    
    setAvailability({
      ...availability,
      specific_dates: [...(availability.specific_dates || []), newDate]
    });
  };

  // Remove specific date
  const handleRemoveSpecificDate = (index) => {
    const updatedDates = [...availability.specific_dates];
    updatedDates.splice(index, 1);
    
    setAvailability({
      ...availability,
      specific_dates: updatedDates
    });
  };

  // Handle specific date change
  const handleSpecificDateChange = (index, field) => (event) => {
    const updatedDates = [...availability.specific_dates];
    
    if (field === 'available') {
      updatedDates[index].available = event.target.checked;
    } else if (field === 'date') {
      updatedDates[index].date = event.target.value;
    }
    
    setAvailability({
      ...availability,
      specific_dates: updatedDates
    });
  };

  // Handle specific date time change
  const handleSpecificDateTimeChange = (index, timeType) => (newTime) => {
    const updatedDates = [...availability.specific_dates];
    updatedDates[index][timeType] = newTime;
    
    setAvailability({
      ...availability,
      specific_dates: updatedDates
    });
  };

  // Save availability
  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      // Format data for API
      const formattedData = {
        recurring: {},
        specific_dates: []
      };
      
      // Format recurring availability
      DAYS_OF_WEEK.forEach(day => {
        formattedData.recurring[day.value] = {
          available: availability[day.value].available,
          start_time: availability[day.value].start_time.toTimeString().slice(0, 8),
          end_time: availability[day.value].end_time.toTimeString().slice(0, 8)
        };
      });
      
      // Format specific dates
      if (availability.specific_dates) {
        formattedData.specific_dates = availability.specific_dates.map(date => ({
          date: date.date.toISOString().split('T')[0],
          available: date.available,
          start_time: date.start_time.toTimeString().slice(0, 8),
          end_time: date.end_time.toTimeString().slice(0, 8)
        }));
      }
      
      await availabilityApi.updateAvailability(formattedData);
      
      setSnackbar({
        open: true,
        message: 'Availability saved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving availability:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message || 'Failed to save availability'}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Availability
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Set your availability to let your organization know when you can work. 
          You can set recurring availability for each day of the week or specify 
          particular dates.
        </Typography>
      </Paper>
      
      <Box mb={3}>
        <ToggleButtonGroup
          value={availabilityType}
          exclusive
          onChange={handleAvailabilityTypeChange}
          aria-label="availability type"
        >
          <ToggleButton value="recurring" aria-label="recurring availability">
            Recurring Weekly
          </ToggleButton>
          <ToggleButton value="specific" aria-label="specific dates">
            Specific Dates
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {availabilityType === 'recurring' ? (
        <Grid container spacing={3}>
          {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12} md={6} key={day.value}>
              <Card>
                <CardHeader 
                  title={day.label} 
                  action={
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={availability[day.value]?.available || false}
                          onChange={handleDayAvailabilityChange(day.value)}
                          color="primary"
                        />
                      }
                      label="Available"
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Box display="flex" gap={2}>
                    <TimePicker
                      label="Start Time"
                      value={availability[day.value]?.start_time}
                      onChange={handleTimeChange(day.value, 'start_time')}
                      disabled={!availability[day.value]?.available}
                      sx={{ flex: 1 }}
                    />
                    <TimePicker
                      label="End Time"
                      value={availability[day.value]?.end_time}
                      onChange={handleTimeChange(day.value, 'end_time')}
                      disabled={!availability[day.value]?.available}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Specific Dates</Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddSpecificDate}
            >
              Add Date
            </Button>
          </Box>
          
          {availability.specific_dates?.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No specific dates added. Click "Add Date" to add a specific date.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {availability.specific_dates?.map((dateItem, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card>
                    <CardHeader 
                      title={
                        <TextField
                          type="date"
                          value={dateItem.date instanceof Date 
                            ? dateItem.date.toISOString().split('T')[0] 
                            : ''}
                          onChange={handleSpecificDateChange(index, 'date')}
                          fullWidth
                        />
                      }
                      action={
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={dateItem.available}
                              onChange={handleSpecificDateChange(index, 'available')}
                              color="primary"
                            />
                          }
                          label="Available"
                        />
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Box display="flex" gap={2} mb={2}>
                        <TimePicker
                          label="Start Time"
                          value={dateItem.start_time}
                          onChange={handleSpecificDateTimeChange(index, 'start_time')}
                          disabled={!dateItem.available}
                          sx={{ flex: 1 }}
                        />
                        <TimePicker
                          label="End Time"
                          value={dateItem.end_time}
                          onChange={handleSpecificDateTimeChange(index, 'end_time')}
                          disabled={!dateItem.available}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleRemoveSpecificDate(index)}
                        fullWidth
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveAvailability}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </Button>
      </Box>
      
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

export default Availability;
