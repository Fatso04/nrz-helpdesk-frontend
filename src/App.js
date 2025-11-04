// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// PAGES
import RegisterPage from './pages/RegisterPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketEdit from './pages/TicketEdit';

// COMPONENTS
import Login from './components/Login';
import Home from './components/Home';
import Layout from './components/Layout';
import TicketDetails from './components/TicketDetails';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            user ? (
              <Layout>
                <Home user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <Layout>
                <Dashboard user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/register"
          element={
            user && user.role === 'admin' ? (
              <Layout>
                <RegisterPage />
              </Layout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/create-ticket"
          element={
            user ? (
              <Layout>
                <CreateTicketPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/ticket/:id"
          element={
            user ? (
              <Layout>
                <TicketDetails user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/ticket/:id/edit"
          element={
            user ? (
              <Layout>
                <TicketEdit user={user} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;