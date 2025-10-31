import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import TicketTable from './TicketTable';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Animated Background (optional — keep if you like)
const AnimatedBackground = () => {
  const [gradient, setGradient] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setGradient((prev) => (prev + 1) % 360), 50);
    return () => clearInterval(interval);
  }, []);
  const hue1 = gradient % 360;
  const hue2 = (gradient + 60) % 360;
  const hue3 = (gradient + 120) % 360;
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: `linear-gradient(135deg, hsl(${hue1},70%,95%) 0%, hsl(${hue2},70%,92%) 50%, hsl(${hue3},70%,95%) 100%)`,
        backgroundSize: '200% 200%',
        animation: 'gradientShift 20s ease infinite',
        zIndex: -1,
      }}
    />
  );
};

const ExecutiveStatCard = ({ title, value, subtitle, color, trend, isPositive }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
    <Card sx={{
      p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
      border: `1px solid ${color}30`,
      '&:hover': { boxShadow: '0 8px 30px rgba(77,171,247,0.2)', transform: 'translateY(-2px)' }
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>{title}</Typography>
          {trend && (
            <Chip label={trend} size="small" sx={{
              backgroundColor: isPositive ? '#d1ecf1' : '#f8d7da',
              color: isPositive ? '#0c5460' : '#721c24', fontWeight: 600
            }} />
          )}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2c3e50', mb: 1 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: '#6c757d' }}>{subtitle}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = ({ user, socket, setUser }) => {
  const [tickets, setTickets] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  // FETCH TICKETS ONCE
  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const endpoint = user.role === 'admin' ? '/api/tickets' : '/api/tickets/my-tickets';
        const { data } = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTickets(data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('user');
          setUser(null);
          navigate('/login');
        }
      }
    };
    fetchTickets();
  }, [user, navigate, setUser]);

  // SINGLE SOCKET LISTENER — PERMANENT FIX
  useEffect(() => {
    if (!socket?.connected) return;

    const handleNew = (populatedTicket) => {
      setTickets(prev => {
        if (prev.some(t => t._id === populatedTicket._id)) return prev;
        return [populatedTicket, ...prev]; // Always at top
      });
    };

    const handleUpdate = (updated) => {
      setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
    };

    const handleDelete = ({ id }) => {
      setTickets(prev => prev.filter(t => t._id !== id));
    };

    const handleConnect = () => setSnackbar({ open: true, message: 'Live sync active', severity: 'success' });
    const handleError = () => setSnackbar({ open: true, message: 'Sync offline', severity: 'warning' });

    // Attach
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleError);
    socket.on('new-ticket', handleNew);
    socket.on('ticket-updated', handleUpdate);
    socket.on('ticket-deleted', handleDelete);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
      socket.off('new-ticket', handleNew);
      socket.off('ticket-updated', handleUpdate);
      socket.off('ticket-deleted', handleDelete);
    };
  }, [socket]);

  // STATS
  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const urgent = tickets.filter(t => t.priority === 'high').length;
    const total = tickets.length;
    const resolutionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : 0;
    return { open, inProgress, closed, urgent, total, resolutionRate };
  }, [tickets]);

  // BAR CHART — MATCHES TICKETTABLE STATUS COLORS
  const barData = {
    labels: ['Open', 'In-Progress', 'Closed'],
    datasets: [{
      label: 'Tickets',
      data: [stats.open, stats.inProgress, stats.closed],
      backgroundColor: [
        '#0288d1',  // Open → Ocean Blue
        '#5c6bc0',  // In-Progress → Indigo
        '#2e7d32'   // Closed → Deep Green
      ],
      borderColor: '#fff',
      borderWidth: 1,
      borderRadius: 8,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6c757d' } },
      y: { grid: { color: '#e9ecef' }, ticks: { stepSize: 1, color: '#6c757d' }, beginAtZero: true },
    },
  };

  // DONUT CHART — MATCHES TICKETTABLE PRIORITY COLORS
  const donutData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [
        stats.urgent,
        tickets.filter(t => t.priority === 'medium').length,
        tickets.filter(t => t.priority === 'low').length
      ],
      backgroundColor: [
        '#7b1fa2',  // High → Deep Purple
        '#1976d2',  // Medium → MUI Blue
        '#43a047'   // Low → Sea Green
      ],
      borderColor: '#fff',
      borderWidth: 2,
      hoverOffset: 8,
      cutout: '70%',
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <>
      <AnimatedBackground />
      <Container maxWidth="xl" sx={{ mt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        <Typography variant="h3" align="center" sx={{ mb: 6, fontWeight: 900, color: '#2c3e50' }}>
          NRZ Helpdesk Dashboard
        </Typography>

        {/* STATS */}
        <Grid container spacing={3} sx={{ mb: 6, justifyContent: 'center', alignItems: 'center' }}>
          <Grid item xs={12} sm={6} md={3}>
            <ExecutiveStatCard title="Total Tickets" value={stats.total} subtitle="All time" color="#4dabf7" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ExecutiveStatCard title="Open" value={stats.open} subtitle="Pending" color="#80bdff" trend="+12%" isPositive={true} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ExecutiveStatCard title="In Progress" value={stats.inProgress} subtitle="Active" color="#a5d8ff" trend="-5%" isPositive={false} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ExecutiveStatCard title="Resolution Rate" value={`${stats.resolutionRate}%`} subtitle="Closed" color="#4dabf7" trend="+8%" isPositive={true} />
          </Grid>
        </Grid>

        {/* CHARTS */}
        <Grid container spacing={4} sx={{ mb: 6, justifyContent: 'center' }}>
          <Grid item xs={12} lg={8} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: 400, width: '100%', maxWidth: '600px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2c3e50', textAlign: 'center' }}>Ticket Status</Typography>
              <Bar data={barData} options={barOptions} />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: 400, width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#2c3e50' }}>Priority</Typography>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Doughnut data={donutData} options={donutOptions} />
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 10, left: 0, right: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#7b1fa2', borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">High</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#1976d2', borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">Medium</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: '#43a047', borderRadius: '50%', mr: 1 }} />
                    <Typography variant="body2">Low</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <TicketTable tickets={tickets} user={user} setTickets={setTickets} socket={socket} />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>

      <style>
        {`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}
      </style>
    </>
  );
};

export default Dashboard;