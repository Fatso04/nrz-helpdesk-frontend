// src/components/StatsSection.js
import React, { useMemo } from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, color, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Paper
      elevation={6}
      sx={{
        p: 3,
        textAlign: 'center',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1px solid ${color}44`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Icon sx={{ fontSize: 40, color }} />
      </Box>
      <Typography variant="h4" fontWeight={700} color={color}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  </motion.div>
);

export default function StatsSection({ tickets, user }) {
  const theme = useTheme();

  // --- Calculate Stats ---
  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const urgent = tickets.filter(t => t.priority === 'high').length;

    return { open, inProgress, closed, urgent };
  }, [tickets]);

  // --- Chart Data ---
  const statusData = [
    { name: 'Open', value: stats.open, color: '#f39c12' },
    { name: 'In Progress', value: stats.inProgress, color: '#3498db' },
    { name: 'Closed', value: stats.closed, color: '#27ae60' },
  ];

  const priorityData = [
    { name: 'Low', value: tickets.filter(t => t.priority === 'low').length, color: '#95a5a6' },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'medium').length, color: '#f1c40f' },
    { name: 'High', value: stats.urgent, color: '#e74c3c' },
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={700} color="primary" gutterBottom align="center">
        Ticket Statistics
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={6} sm={3}>
          <StatCard title="Open" value={stats.open} color="#f39c12" icon={() => <span role="img">Open</span>} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="In Progress" value={stats.inProgress} color="#3498db" icon={() => <span role="img">In Progress</span>} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Closed" value={stats.closed} color="#27ae60" icon={() => <span role="img">Closed</span>} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard title="Urgent" value={stats.urgent} color="#e74c3c" icon={() => <span role="img">Urgent</span>} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4}>
        {/* Bar Chart: Status Over Time (Mock) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={6} sx={{ p: 3, borderRadius: 3, height: 320 }}>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#003087" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart: Priority */}
        <Grid item xs={12} md={6}>
          <Paper elevation={6} sx={{ p: 3, borderRadius: 3, height: 320 }}>
            <Typography variant="h6" gutterBottom>Priority Breakdown</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 
