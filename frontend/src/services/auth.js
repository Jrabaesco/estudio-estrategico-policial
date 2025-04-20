import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.token) {
      localStorage.setItem('profile', JSON.stringify(response.data.result));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    // Extrae el mensaje de error del backend o usa uno por defecto
    const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
    throw new Error(errorMessage);
  }
};

// Iniciar sesión
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('profile', JSON.stringify(response.data.result));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem('profile');
  localStorage.removeItem('token');
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('profile'));
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem('token');
};