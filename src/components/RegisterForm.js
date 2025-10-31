// src/components/RegisterForm.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const RegisterForm = () => {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form.name, form.email, form.password, form.department, form.role);
      alert('User created successfully!');
      setForm({ name: '', email: '', password: '', department: '', role: 'user' });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Register New User
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            fullWidth
          />
          

        <FormControl fullWidth variant="outlined">
  <InputLabel id="role-label">Role</InputLabel>
  <Select
    labelId="role-label"
    value={form.role}
    label="Role"
    onChange={(e) => setForm({ ...form, role: e.target.value })}
  >
    <MenuItem value="user">User</MenuItem>
    <MenuItem value="admin">Admin</MenuItem>
  </Select>
</FormControl>

          <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? 'Creating...' : 'REGISTER USER'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterForm;