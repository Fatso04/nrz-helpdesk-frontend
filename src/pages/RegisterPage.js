// src/pages/RegisterPage.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  const { user } = useContext(AuthContext);

  // BLOCK NON-ADMINS
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <RegisterForm />;
};

export default RegisterPage;