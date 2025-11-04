// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const AuthContext = createContext();

// === PRODUCTION & LOCAL BACKEND URL ===
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = `${API_BASE}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // === AUTO-LOGIN + SOCKET ON APP LOAD ===
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved && !socket) {
      const parsed = JSON.parse(saved);
      setUser(parsed);

      const newSocket = io(API_BASE, {
        auth: { token: parsed.token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('update', (data) => {
        console.log('Live update:', data);
        // Add real-time UI updates here
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(newSocket);
    }
    setLoading(false);
  }, []);

  // === LOGIN FUNCTION ===
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      const userData = res.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Connect socket after login
      const newSocket = io(API_BASE, {
        auth: { token: userData.token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected after login:', newSocket.id);
      });

      setSocket(newSocket);

      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  // === REGISTER FUNCTION ===
  const register = async (name, email, password, department, role) => {
    try {
      const res = await axios.post(`${API}/register`, {
        name,
        email,
        password,
        department,
        role,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  // === LOGOUT FUNCTION ===
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // === CLEANUP ON UNMOUNT ===
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [socket]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        socket,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};