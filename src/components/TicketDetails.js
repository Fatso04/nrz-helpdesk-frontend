// src/components/TicketDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Button,
  Alert,
  Paper, // Add Paper to imports
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TicketDetails = ({ user, socket }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTicket(response.data);
        setStatus(response.data.status);
        setAssignedTo(response.data.assignedTo?._id || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch ticket');
        if (err.response?.status === 403 || err.response?.status === 404) {
          navigate('/dashboard');
        }
      }
    };

    const fetchUsers = async () => {
      if (user.role === 'admin') {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/users', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setUsers(response.data);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      }
    };

    fetchTicket();
    fetchUsers();
  }, [id, user, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ticket-updated', (updatedTicket) => {
      if (updatedTicket._id === id) {
        setTicket(updatedTicket);
        setStatus(updatedTicket.status);
        setAssignedTo(updatedTicket.assignedTo?._id || '');
        toast.info('Ticket updated in real-time', {
          style: { backgroundColor: '#FFFFFF', color: '#003087' },
        });
      }
    });

    socket.on('ticket-deleted', ({ id: deletedId }) => {
      if (deletedId === id) {
        toast.warn('This ticket has been deleted', {
          style: { backgroundColor: '#000000', color: '#FFFFFF' },
        });
        navigate('/dashboard');
      }
    });

    return () => {
      socket.off('ticket-updated');
      socket.off('ticket-deleted');
    };
  }, [socket, id, navigate]);

  const handleSave = async () => {
    if (!status) {
      toast.error('Please select a status', { style: { backgroundColor: '#000000', color: '#FFFFFF' } });
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        { status, assignedTo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTicket(response.data);
      toast.success('Ticket updated successfully!', {
        style: { backgroundColor: '#FFFFFF', color: '#003087' },
      });
      if (socket) {
        socket.emit('update-ticket', { id, update: { status, assignedTo } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
      toast.error(err.response?.data?.message || 'Failed to update ticket', {
        style: { backgroundColor: '#000000', color: '#FFFFFF' },
      });
    }
  };

  if (!ticket) return <Typography>Loading...</Typography>;

  const canEdit = user.role === 'admin' || ticket.assignedTo?._id === user._id;
  console.log('Debug - Can Edit:', canEdit, 'User Role:', user.role, 'Assigned To:', ticket.assignedTo?._id, 'User ID:', user._id);

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
          Ticket Details
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Ticket ID: {ticket._id}</Typography>
          <Typography>Date Created: {new Date(ticket.createdAt).toLocaleDateString()}</Typography>
          <Typography>Priority: {ticket.priority}</Typography>
          <Typography>Description: {ticket.description}</Typography>
        </Box>
        {canEdit && (
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth margin="normal" variant="outlined">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                displayEmpty
                renderValue={(selected) => selected || 'Select Status'}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            {user.role === 'admin' && (
              <FormControl fullWidth margin="normal" variant="outlined">
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    const userObj = users.find((u) => u._id === selected);
                    return userObj ? userObj.name : 'Unassigned';
                  }}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 2, display: 'block' }}
            >
              Save Changes
            </Button>
          </Box>
        )}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default TicketDetails;