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
  Divider
} from '@mui/material';
import { 
  Business as OrganizationsIcon,
  People as UsersIcon,
  CalendarMonth as ShiftsIcon
} from '@mui/icons-material';

// This would normally come from an API call
const mockData = {
  stats: {
    organizations: 5,
    users: 25,
    shifts: {
      total: 120,
      open: 45,
      assigned: 65,
      completed: 10
    }
  },
  recentShifts: [
    { id: 1, title: 'Morning Shift', organization: 'Main Office', start: '2025-02-26T08:00:00', end: '2025-02-26T16:00:00', status: 'open' },
    { id: 2, title: 'Evening Shift', organization: 'Branch Office', start: '2025-02-26T16:00:00', end: '2025-02-27T00:00:00', status: 'assigned' },
    { id: 3, title: 'Night Shift', organization: 'Main Office', start: '2025-02-27T00:00:00', end: '2025-02-27T08:00:00', status: 'open' },
  ]
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setStats(mockData.stats);
      setRecentShifts(mockData.recentShifts);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return <Typography>Loading dashboard data...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <OrganizationsIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.organizations}</Typography>
                  <Typography variant="body2" color="text.secondary">Organizations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <UsersIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.users}</Typography>
                  <Typography variant="body2" color="text.secondary">Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShiftsIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h5">{stats.shifts.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Shifts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Shifts */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Shifts" />
            <CardContent>
              <List>
                {recentShifts.map((shift, index) => (
                  <React.Fragment key={shift.id}>
                    <ListItem>
                      <ListItemText 
                        primary={shift.title} 
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {shift.organization}
                            </Typography>
                            {` — ${new Date(shift.start).toLocaleString()} to ${new Date(shift.end).toLocaleString()}`}
                          </>
                        }
                      />
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textTransform: 'capitalize',
                            color: shift.status === 'open' ? 'warning.main' : 
                                  shift.status === 'assigned' ? 'success.main' : 
                                  'info.main'
                          }}
                        >
                          {shift.status}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentShifts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
