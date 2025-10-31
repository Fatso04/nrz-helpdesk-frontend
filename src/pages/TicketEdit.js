// frontend/src/components/TicketEditForm.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const TicketEditForm = ({ user, socket }) => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const ticket = ticketRes.data;
        setForm({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assignedTo: ticket.assignedTo?._id || '',
        });

        if (user.role === 'admin') {
          const usersRes = await axios.get('http://localhost:5000/api/users', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setUsers(usersRes.data);
        }
      } catch (err) {
        toast.error('Failed to load ticket');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
      };

      await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success('Ticket updated');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Edit Ticket #{id.slice(-6).toUpperCase()}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* TITLE */}
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            fullWidth
            variant="outlined"
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />

          {/* STATUS — GAP LIKE TITLE */}
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            fullWidth
            variant="outlined"
            SelectProps={{
              native: false,
            }}
          >
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>

          {/* PRIORITY — GAP LIKE TITLE */}
          <TextField
            select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            fullWidth
            variant="outlined"
            SelectProps={{
              native: false,
            }}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>

          {/* ASSIGN TO — GAP LIKE TITLE */}
          {user.role === 'admin' && (
            <TextField
              select
              label="Assign To"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              fullWidth
              variant="outlined"
              SelectProps={{
                native: false,
                renderValue: (selected) => {
                  if (!selected) return 'Select assignee (optional)';
                  const u = users.find((u) => u._id === selected);
                  return u ? `${u.name} (${u.email})` : '';
                },
              }}
            >
              {users.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </MenuItem>
              ))}
            </TextField>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" disabled={saving} sx={{ flex: 1 }}>
              {saving ? 'Saving...' : 'SAVE CHANGES'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ flex: 1 }}>
              CANCEL
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketEditForm;