import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import RegisterPage from './pages/RegisterPage';
import CreateTicketPage from './pages/CreateTicketPage';

// COMPONENTS
import Login from './components/Login';
import Home from './components/Home';
import Layout from './components/Layout';
import TicketDetails from './components/TicketDetails';
import TicketEdit from './pages/TicketEdit';
import Dashboard from './components/Dashboard';
import SupportDashboard from './components/SupportDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      const newSocket = io('http://localhost:5000', {
        auth: { token: parsed.token },
        transports: ['websocket'],
      });
      setSocket(newSocket);

      function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}


      // Listen for live updates from the server
      newSocket.on('update', (data) => {
        // Handle the update data (e.g., update state, show notifications)
        console.log('Update received:', data);
      });

      // Connect on login
      newSocket.connect();
    }
    setLoading(false); // Set loading to false after checking localStorage
  }, []);

  // Cleanup socket connection on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Only run this effect when socket changes

  // If loading, show a loading message or spinner
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login setUser={setUser} />}
        />
        <Route
          path="/home"
          element={
            user ? (
              <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
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
              <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
                <Dashboard user={user} socket={socket} />
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
      <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
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
      <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
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
              <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
                <TicketDetails user={user} socket={socket} />
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
              <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
                <TicketEdit user={user} socket={socket} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;