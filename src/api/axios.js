// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Change to your backend URL
  // For production (Vercel), use: process.env.REACT_APP_API_URL
});

export default API;