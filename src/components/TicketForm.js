// frontend/src/components/TicketForm.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const TicketForm = ({ user, socket }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const isSubmitting = useRef(false);

  // FETCH USERS (ADMIN ONLY)
  useEffect(() => {
    if (user.role === 'admin') {
      const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
          const res = await axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setUsers(res.data);
        } catch (err) {
          toast.error('Failed to load users');
        } finally {
          setFetchingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [user.role, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }

    if (loading || isSubmitting.current) return;

    isSubmitting.current = true;
    setLoading(true);

    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
      };

      await axios.post(
        'http://localhost:5000/api/tickets',
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assignedTo: '',
      });

      toast.success('Ticket created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mb: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: '#1a1a1a',
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          Create New Ticket
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            fullWidth
            disabled={loading}
            variant="outlined"
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            fullWidth
            multiline
            rows={4}
            disabled={loading}
            variant="outlined"
          />

          {/* PRIORITY — ADMIN ONLY */}
          {user.role === 'admin' && (
            <FormControl fullWidth disabled={loading} variant="outlined">
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* ASSIGNEE — ADMIN ONLY — LABEL ON BORDER */}
          {user.role === 'admin' && (
            <FormControl fullWidth disabled={loading || fetchingUsers} variant="outlined">
              <InputLabel>Assign To</InputLabel>
              <Select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                label="Assign To"
                // REMOVED displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return fetchingUsers ? 'Loading users...' : 'Select assignee (optional)';
                  }
                  const user = users.find(u => u._id === selected);
                  return user ? `${user.name} (${user.email})` : '';
                }}
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: '#1976d2',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            {loading ? 'Creating...' : 'CREATE TICKET'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketForm;