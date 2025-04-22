import axios from 'axios';

// Configuración dinámica para desarrollo/producción
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/auth`;

// Configuración común de axios para todas las solicitudes
const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario {username, mail, password}
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const register = async (userData) => {
  try {
    const response = await authAxios.post('/register', userData);

    if (response.data.token) {
      // Almacenar datos del usuario y token en localStorage
      localStorage.setItem('profile', JSON.stringify(response.data.result));
      localStorage.setItem('token', response.data.token);
      
      // Configurar el token en los headers para futuras peticiones
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  } catch (error) {
    let errorMessage = 'Error al registrar usuario';
    
    if (error.response) {
      // Error de respuesta del servidor
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      errorMessage = 'No se recibió respuesta del servidor';
    } else {
      // Error al configurar la solicitud
      errorMessage = error.message;
    }

    console.error('Error en registro:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Inicia sesión con un usuario existente
 * @param {Object} credentials - Credenciales {mail, password}
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const login = async (credentials) => {
  try {
    const response = await authAxios.post('/login', credentials);

    if (response.data.token) {
      // Almacenar datos del usuario y token en localStorage
      localStorage.setItem('profile', JSON.stringify(response.data.result));
      localStorage.setItem('token', response.data.token);
      
      // Configurar el token en los headers para futuras peticiones
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  } catch (error) {
    let errorMessage = 'Error al iniciar sesión';
    
    if (error.response) {
      // Error de respuesta del servidor
      errorMessage = error.response.data?.message || errorMessage;
      
      // Mensajes más específicos para códigos comunes
      if (error.response.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.response.status === 404) {
        errorMessage = 'Usuario no encontrado';
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      errorMessage = 'No se recibió respuesta del servidor';
    } else {
      // Error al configurar la solicitud
      errorMessage = error.message;
    }

    console.error('Error en login:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logout = () => {
  // Remover datos de usuario y token
  localStorage.removeItem('profile');
  localStorage.removeItem('token');
  
  // Eliminar el header de autorización
  delete authAxios.defaults.headers.common['Authorization'];
};

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Object|null} Datos del usuario o null si no hay sesión
 */
export const getCurrentUser = () => {
  const profile = localStorage.getItem('profile');
  return profile ? JSON.parse(profile) : null;
};

/**
 * Obtiene el token JWT almacenado
 * @returns {string|null} Token JWT o null si no existe
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} True si hay un usuario logueado, false en caso contrario
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Configura el token en las cabeceras de axios
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete authAxios.defaults.headers.common['Authorization'];
  }
};

// Configurar el token si ya existe al cargar el módulo
const existingToken = getToken();
if (existingToken) {
  setAuthToken(existingToken);
}