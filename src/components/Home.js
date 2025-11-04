// src/components/Home.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={16}
        sx={{
          width: '100%',
          maxWidth: 1000,
          borderRadius: 4,
          p: { xs: 2, sm: 4 },
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <Typography variant="h4" fontWeight={700} color="primary" gutterBottom align="center">
          Welcome to NRZ Helpdesk
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          {user?.role === 'admin'
            ? 'As an admin, you can manage tickets and users from the Dashboard.'
            : 'You can view and manage your tickets from the Dashboard.'}
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Use the sidebar to navigate to the Dashboard or log out.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create-ticket')}
          sx={{ mt: 3 }}
        >
          Create New Ticket
        </Button>
      </Paper>
    </Container>
  );
};

export default Home;