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
      <div
        style={{
          textAlign: 'center',
          padding: '50px',
          fontSize: '18px',
          color: '#555',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/home"
          element={
            user ? (
              <Layout>
                <Home />
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
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/register"
          element={
            user?.role === 'admin' ? (
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
                <TicketDetails />
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
                <TicketEdit />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* CATCH-ALL */}
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