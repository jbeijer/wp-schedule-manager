import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Grid,
  Typography,
  FormHelperText
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { canUserPerformAction, getUserRoleInOrganization } from '../utils/permissions';

function ShiftDialog({ open, onClose, onSave, shift, users, organizations, resources }) {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000), // Default 1 hour
    user_id: '',
    organization_id: '',
    resource_id: '',
    status: 'available'
  });

  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Hämta användarens roll i den valda organisationen
  const userRole = formData.organization_id 
    ? getUserRoleInOrganization(formData.organization_id) 
    : null;
  
  // Kontrollera om användaren kan tilldela pass till andra
  const canAssignToOthers = userRole === 'scheduler' || userRole === 'admin' || 
    window.wpScheduleManager?.userCapabilities?.isAdmin;

  useEffect(() => {
    if (shift) {
      setFormData({
        id: shift.id || null,
        title: shift.title || '',
        description: shift.description || '',
        start_time: shift.start_time ? new Date(shift.start_time) : new Date(),
        end_time: shift.end_time ? new Date(shift.end_time) : new Date(new Date().getTime() + 60 * 60 * 1000),
        user_id: shift.user_id || '',
        organization_id: shift.organization_id || '',
        resource_id: shift.resource_id || '',
        status: shift.status || 'available'
      });
    } else {
      // Reset form for new shift
      setFormData({
        id: null,
        title: '',
        description: '',
        start_time: new Date(),
        end_time: new Date(new Date().getTime() + 60 * 60 * 1000),
        user_id: window.wpScheduleManager?.userId || '',
        organization_id: '',
        resource_id: '',
        status: 'available'
      });
    }
  }, [shift]);

  // Filtrera användare baserat på vald organisation
  useEffect(() => {
    if (formData.organization_id && users.length > 0) {
      // Här skulle vi egentligen filtrera användare baserat på organisationstillhörighet
      // För enkelhetens skull visar vi alla användare just nu
      setFilteredUsers(users);
    } else {
      setFilteredUsers([]);
    }
  }, [formData.organization_id, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }
    
    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{formData.id ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                fullWidth
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.organization_id}>
                <InputLabel>Organization</InputLabel>
                <Select
                  name="organization_id"
                  value={formData.organization_id}
                  onChange={handleChange}
                  label="Organization"
                >
                  <MenuItem value="">
                    <em>Select an organization</em>
                  </MenuItem>
                  {organizations.map(org => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.organization_id && (
                  <FormHelperText>{errors.organization_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!formData.organization_id}>
                <InputLabel>Resource</InputLabel>
                <Select
                  name="resource_id"
                  value={formData.resource_id}
                  onChange={handleChange}
                  label="Resource"
                >
                  <MenuItem value="">
                    <em>Select a resource</em>
                  </MenuItem>
                  {resources
                    .filter(res => !formData.organization_id || res.organization_id === formData.organization_id)
                    .map(resource => (
                      <MenuItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.start_time}
                  onChange={(date) => handleDateChange('start_time', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={formData.end_time}
                  onChange={(date) => handleDateChange('end_time', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.end_time}
                      helperText={errors.end_time}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!formData.organization_id || !canAssignToOthers}>
                <InputLabel>Assigned User</InputLabel>
                <Select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  label="Assigned User"
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {filteredUsers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.display_name || user.user_email}
                    </MenuItem>
                  ))}
                </Select>
                {!canAssignToOthers && formData.organization_id && (
                  <FormHelperText>
                    You can only assign shifts to yourself with your current role
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="locked">Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShiftDialog;
