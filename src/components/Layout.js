// src/components/Layout.js
import React, { useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import PersonAdd from '@mui/icons-material/PersonAdd';
import AddCircle from '@mui/icons-material/AddCircle';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Logout,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AnimatedBg = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  background: `linear-gradient(-45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, #1976d2, #9c27b0)`,
  backgroundSize: '400% 400%',
  animation: 'gradientShift 15s ease infinite',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: -1,
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

const Logo = styled('img')({
  height: 40,
  marginRight: 16,
  objectFit: 'contain',
});

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ p: 2, bgcolor: darkMode ? 'grey.900' : 'rgba(255, 255, 255, 0.95)' }}>
      <Typography variant="h6" sx={{ mb: 2, color: darkMode ? 'grey.200' : 'text.primary' }}>
        {user?.name ? `Welcome, ${user.name}` : 'Menu'}
      </Typography>
      <Divider sx={{ bgcolor: darkMode ? 'grey.700' : 'grey.300' }} />
      <List>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/create-ticket">
            <ListItemIcon>
              <AddCircle />
            </ListItemIcon>
            <ListItemText primary="Create Ticket" />
          </ListItemButton>
        </ListItem>

        {user?.role === 'admin' && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/register">
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Register User" />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard"
            sx={{
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: location.pathname === '/dashboard'
                ? (darkMode ? 'grey.800' : 'primary.light')
                : 'transparent',
              '&:hover': {
                bgcolor: darkMode ? 'grey.700' : 'grey.100',
                transform: 'translateX(4px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: darkMode ? 'grey.200' : 'primary.main' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              sx={{ color: darkMode ? 'grey.200' : 'text.primary' }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: darkMode ? 'grey.700' : 'grey.100',
                transform: 'translateX(4px)',
                transition: 'all 0.3s ease',
              },
            }}
          >
            <ListItemIcon sx={{ color: darkMode ? 'grey.200' : 'primary.main' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{ color: darkMode ? 'grey.200' : 'text.primary' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AnimatedBg />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          bgcolor: darkMode ? 'grey.900' : 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Logo
            src="https://logopond.com/logos/4067cdd47c67652f2269a60a2b1e6816.png"
            alt="NRZ Helpdesk Logo"
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            NRZ Helpdesk
          </Typography>
          <Typography variant="body1" sx={{ mr: 2, fontWeight: 500 }}>
            {user?.name} ({user?.role || 'user'})
          </Typography>
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              top: 64,
              bgcolor: darkMode ? 'grey.900' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: 240,
              top: 64,
              bgcolor: darkMode ? 'grey.900' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, sm: '240px' },
          mt: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default Layout;