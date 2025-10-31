// src/pages/TicketEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Container, // ← THIS WAS MISSING
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TicketEdit = ({ user, socket }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assignedTo: '',
  });

  // FETCH TICKET + USERS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/tickets/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const fetchedTicket = ticketRes.data;
        setTicket(fetchedTicket);
        setForm({
          title: fetchedTicket.title,
          description: fetchedTicket.description,
          status: fetchedTicket.status,
          priority: fetchedTicket.priority,
          assignedTo: fetchedTicket.assignedTo?._id || '',
        });
        setUsers(usersRes.data);
      } catch (err) {
        toast.error('Failed to load ticket');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchData();
    else {
      toast.error('Access denied');
      navigate('/dashboard');
    }
  }, [id, user, navigate]);

  // HANDLE SAVE
  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error('Title and description required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
      };

      const res = await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updatedTicket = res.data;

      // Live sync
      if (socket?.connected) {
        socket.emit('ticket-updated', updatedTicket);
      }

      toast.success('Ticket updated!');
      setTimeout(() => navigate(`/ticket/${id}`), 1500);
    } catch (err) {
        toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: '#0ff' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1f 0%, #1a0033 100%)',
        p: 3,
        fontFamily: '"Orbitron", sans-serif',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={12}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(10, 10, 31, 0.95)',
            border: '1px solid #0ff3',
            boxShadow: '0 0 40px #0ff2',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: '#0ff', mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                color: '#0ff',
                fontWeight: 800,
                textShadow: '0 0 12px #0ff',
              }}
            >
              Edit Ticket #{id.slice(-6).toUpperCase()}
            </Typography>
          </Box>

          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* TITLE */}
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              required
              disabled={saving}
              InputProps={{ style: { color: '#0ff' } }}
              InputLabelProps={{ style: { color: '#0ff8' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#0ff4' },
                  '&:hover fieldset': { borderColor: '#0ff8' },
                  '&.Mui-focused fieldset': { borderColor: '#0ff', boxShadow: '0 0 15px #0ff4' },
                },
              }}
            />

            {/* DESCRIPTION */}
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={5}
              disabled={saving}
              InputProps={{ style: { color: '#0ff' } }}
              InputLabelProps={{ style: { color: '#0ff8' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#0ff4' },
                  '&:hover fieldset': { borderColor: '#0ff8' },
                  '&.Mui-focused fieldset': { borderColor: '#0ff', boxShadow: '0 0 15px #0ff4' },
                },
              }}
            />

            {/* STATUS */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#0ff8' }}>Status</InputLabel>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={saving}
                sx={{
                  color: '#0ff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff4' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0ff',
                    boxShadow: '0 0 15px #0ff4',
                  },
                }}
              >
                <MenuItem value="open" sx={{ color: '#0f8' }}>Open</MenuItem>
                <MenuItem value="in-progress" sx={{ color: '#ffaa00' }}>In Progress</MenuItem>
                <MenuItem value="closed" sx={{ color: '#0ff' }}>Closed</MenuItem>
              </Select>
            </FormControl>

            {/* PRIORITY */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#0ff8' }}>Priority</InputLabel>
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                disabled={saving}
                sx={{
                  color: '#0ff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff4' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0ff',
                    boxShadow: '0 0 15px #0ff4',
                  },
                }}
              >
                <MenuItem value="low" sx={{ color: '#0f8' }}>Low</MenuItem>
                <MenuItem value="medium" sx={{ color: '#ff0' }}>Medium</MenuItem>
                <MenuItem value="high" sx={{ color: '#f00' }}>High</MenuItem>
              </Select>
            </FormControl>

            {/* ASSIGNEE */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#0ff8' }}>Assignee</InputLabel>
              <Select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                disabled={saving}
                sx={{
                  color: '#0ff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff4' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0ff8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0ff',
                    boxShadow: '0 0 15px #0ff4',
                  },
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* BUTTONS */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                  color: '#000',
                  fontWeight: 700,
                  py: 1.5,
                  boxShadow: '0 0 20px #0ff4',
                  '&:hover': {
                    boxShadow: '0 0 30px #0ff8',
                    background: 'linear-gradient(45deg, #00ccff, #cc00ff)',
                  },
                  '&:disabled': { background: '#333', color: '#666' },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={saving}
                sx={{
                  flex: 1,
                  borderColor: '#0ff',
                  color: '#0ff',
                  fontWeight: 700,
                  '&:hover': { borderColor: '#0ff8', color: '#0ff8', boxShadow: '0 0 15px #0ff4' },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <ToastContainer position="bottom-center" theme="dark" />
    </Box>
  );
};

export default TicketEdit;