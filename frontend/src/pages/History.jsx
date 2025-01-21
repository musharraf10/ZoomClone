import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '../utils/Background';
export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (err) {
        setError('Failed to fetch history.');
        setOpenSnackbar(true); // Open Snackbar on error
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formTime = (Time) => {
    const time = new Date(Time);
  
    // Convert to IST (UTC +5:30)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
    const istTime = new Date(time.getTime() + istOffset);
  
    // Get hours, minutes, and seconds in IST
    const hours = istTime.getUTCHours().toString().padStart(2, '0');
    const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = istTime.getUTCSeconds().toString().padStart(2, '0');
  
    // Format the time as "HH:MM:SS"
    const timeString = `${hours}:${minutes}:${seconds}`;
  
    return timeString;
  };
  

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <IconButton
        onClick={() => {
          routeTo('/home');
        }}
        style={{ marginBottom: '20px' }}
      >
        <HomeIcon />
      </IconButton>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : meetings.length === 0 ? (
        <Typography variant="h6" align="center">
          No meeting history available.
        </Typography>
      ) : (
        meetings.map((e, i) => (
          <Card key={i} variant="outlined" sx={{ marginBottom: '20px', padding: '15px' }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Meeting Code: {e.meeting_code}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }} color="text.secondary">
                Username: {e.user_id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }} color="text.secondary">
                Date: {formatDate(e.date)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5 }} color="text.secondary">
                Time: {formTime(e.date)}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      {/* Snackbar for error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Duration for which snackbar stays visible
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error} 
        </Alert>
      </Snackbar>
    </div>
  );
}
