import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip
} from '@mui/material';
import { 
  CalendarMonth as ShiftsIcon,
  AccessTime as AvailabilityIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { shiftApi } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch upcoming shifts for the current user
        const myShifts = await shiftApi.getMyShifts({ 
          limit: 5, 
          status: 'assigned',
          sort: 'start_time',
          direction: 'asc'
        });
        
        // Fetch available shifts
        const available = await shiftApi.getAvailableShifts({ 
          limit: 5,
          sort: 'start_time',
          direction: 'asc'
        });
        
        setUpcomingShifts(myShifts);
        setAvailableShifts(available);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Quick Links */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<ShiftsIcon />}
              onClick={() => navigate('/shifts')}
            >
              My Shifts
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AvailabilityIcon />}
              onClick={() => navigate('/availability')}
            >
              Set Availability
            </Button>
            <Button 
              variant="contained" 
              startIcon={<NotificationsIcon />}
              onClick={() => navigate('/notifications')}
            >
              Notifications
            </Button>
          </Paper>
        </Grid>
        
        {/* Upcoming Shifts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Upcoming Shifts" />
            <CardContent>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : upcomingShifts.length === 0 ? (
                <Typography>You have no upcoming shifts.</Typography>
              ) : (
                <List>
                  {upcomingShifts.map((shift, index) => (
                    <React.Fragment key={shift.id}>
                      <ListItem>
                        <ListItemText 
                          primary={shift.title} 
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {shift.organization_name}
                              </Typography>
                              {` — ${formatDate(shift.start_time)} to ${formatDate(shift.end_time)}`}
                            </>
                          }
                        />
                        <Chip 
                          label={shift.status} 
                          color={getStatusColor(shift.status)}
                          size="small"
                        />
                      </ListItem>
                      {index < upcomingShifts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Box mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/shifts')}
                  fullWidth
                >
                  View All Shifts
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Available Shifts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Available Shifts" />
            <CardContent>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : availableShifts.length === 0 ? (
                <Typography>There are no available shifts at the moment.</Typography>
              ) : (
                <List>
                  {availableShifts.map((shift, index) => (
                    <React.Fragment key={shift.id}>
                      <ListItem>
                        <ListItemText 
                          primary={shift.title} 
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {shift.organization_name}
                              </Typography>
                              {` — ${formatDate(shift.start_time)} to ${formatDate(shift.end_time)}`}
                            </>
                          }
                        />
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={() => {
                            // Handle sign up logic
                            console.log('Sign up for shift:', shift.id);
                          }}
                        >
                          Sign Up
                        </Button>
                      </ListItem>
                      {index < availableShifts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Box mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/shifts')}
                  fullWidth
                >
                  View All Available Shifts
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
