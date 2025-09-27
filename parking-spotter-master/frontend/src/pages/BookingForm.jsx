import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, TextField, Button, Typography, Alert } from '@mui/material';
import { apiService } from '../services/api';

const BookingForm = () => {
  const { spotId } = useParams();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await apiService.bookings.create({ spotId, startTime, endTime });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response.data.message || 'Booking failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ p: 4, width: '100%' }}>
        <Typography variant="h2" align="center" gutterBottom>
          Book Parking Spot
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
          >
            Book Now
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default BookingForm;
