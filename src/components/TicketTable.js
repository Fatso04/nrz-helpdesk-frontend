// src/components/TicketTable.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Edit, Delete, Visibility, Search } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// MOVE HELPER FUNCTIONS TO TOP
const getCreatorName = (ticket) => {
  const possible = [
    ticket.createdBy?.name,
    ticket.creator?.name,
    ticket.author?.name,
    ticket.createdBy,
    ticket.creator,
    ticket.author,
    ticket.user?.name,
    ticket.user
  ];
  for (const val of possible) {
    if (val && typeof val === 'string' && val.trim()) return val.trim();
  }
  const id = ticket.createdBy?._id || ticket.creator?._id || ticket._id;
  return id ? `User ${id.slice(-4)}` : 'Unknown';
};

const getAssigneeName = (ticket) => {
  const possible = [
    ticket.assignedTo?.name,
    ticket.assignee?.name,
    ticket.assignedTo,
    ticket.assignee
  ];
  for (const val of possible) {
    if (val && typeof val === 'string' && val.trim()) return val.trim();
  }
  const id = ticket.assignedTo?._id || ticket.assignee?._id;
  return id ? `User ${id.slice(-4)}` : 'Unassigned';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'open': return '#0288d1';
    case 'in-progress': return '#5c6bc0';
    case 'closed': return '#2e7d32';
    default: return '#607d8b';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#7b1fa2';
    case 'medium': return '#1976d2';
    case 'low': return '#43a047';
    default: return '#607d8b';
  }
};

const TicketTable = ({ tickets, user, setTickets, socket }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const rowsPerPage = 15;

  // RESET PAGE ON FILTER CHANGE
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, priorityFilter, tickets.length]);

  // FILTERED + SEARCHED TICKETS
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket._id.toLowerCase().includes(search.toLowerCase()) ||
        (ticket.title?.toLowerCase().includes(search.toLowerCase()) || false) ||
        getCreatorName(ticket).toLowerCase().includes(search.toLowerCase()) ||
        getAssigneeName(ticket).toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  // PAGINATED
  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTickets, page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;

    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setTickets(prev => prev.filter(t => t._id !== id));

      if (socket?.connected) {
        socket.emit('ticket-deleted', { id });
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          color: '#004d40',
          fontWeight: 700,
          textAlign: 'center',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        All Tickets
      </Typography>

      {/* SEARCH + FILTERS */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 77, 64, 0.15)',
          border: 'none',
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#006064' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ticket ID</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date Created</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Time</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Created By</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Assignee</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Priority</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedTickets.map((ticket, index) => {
              const date = new Date(ticket.createdAt);
              const shortId = ticket._id.slice(-6).toUpperCase();

              return (
                <TableRow
                  key={ticket._id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { backgroundColor: 'rgba(128, 222, 234, 0.4)' },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell
                    sx={{
                      color: '#006064',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/ticket/${ticket._id}`)}
                  >
                    #{shortId}
                  </TableCell>

                  <TableCell sx={{ color: '#004d40' }}>
                    {format(date, 'MMM dd, yyyy')}
                  </TableCell>

                  <TableCell sx={{ color: '#006064', fontWeight: 600 }}>
                    {format(date, 'HH:mm')}
                  </TableCell>

                  <TableCell sx={{ color: '#004d40' }}>
                    {getCreatorName(ticket)}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={ticket.status.replace('-', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(ticket.status),
                        color: '#fff',
                        fontWeight: 600,
                        height: 28,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ color: '#004d40' }}>
                    {getAssigneeName(ticket)}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={ticket.priority.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getPriorityColor(ticket.priority),
                        color: '#fff',
                        fontWeight: 600,
                        height: 28,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton size="small" sx={{ color: '#006064' }} onClick={() => navigate(`/ticket/${ticket._id}`)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {user.role === 'admin' && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" sx={{ color: '#006064' }} onClick={() => navigate(`/ticket/${ticket._id}/edit`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            sx={{ color: '#6a1b9a' }}
                            onClick={() => handleDelete(ticket._id)}
                            disabled={deleting === ticket._id}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredTickets.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15]}
          labelRowsPerPage="Tickets per page:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.92)',
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default TicketTable;