import axios from 'axios';

// Configuración dinámica para desarrollo/producción
const baseURL = import.meta.env.VITE_API_URL //|| 'http://localhost:10000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('[API] Token añadido a la petición:', 
      token.substring(0, 15) + '...', 
      'a', config.url);
  } else {
    console.warn('[API] Petición sin token:', config.url);
  }
  
  return config;
}, (error) => {
  console.error('[API] Error en interceptor de request:', error);
  return Promise.reject(error);
});

// Interceptor de respuestas
api.interceptors.response.use(
  response => {
    console.debug('[API] Respuesta exitosa:', {
      status: response.status,
      url: response.config.url,
      data: response.data ? '(datos recibidos)' : 'sin datos'
    });
    return response;
  },
  error => {
    const errorInfo = {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    };
    
    console.error('[API] Error en respuesta:', errorInfo);
    
    // Manejo específico de errores 401 (No autorizado)
    if (error.response?.status === 401) {
      console.warn('[API] Token inválido/vencido - Limpiando almacenamiento');
      localStorage.removeItem('token');
      localStorage.removeItem('profile');
      // Aquí podrías redirigir al login si lo prefieres
    }
    
    return Promise.reject(error);
  }
);

// API de Topics
export const fetchTopics = async () => {
  console.debug('[API] Obteniendo lista de topics...');
  return api.get('/api/topics');
};

export const fetchTopicDetails = async (topicId) => {
  return api.get(`/api/topics/${topicId}`);
};

// API de Questions
export const fetchQuestionsByTopic = async (topicId) => {
  return api.get(`/api/questions/topic/${topicId}`);
};

export const fetchRandomQuestions = async (topicId, count) => {
  return api.get(`/api/questions/random/${topicId}/${count}`);
};

// API de Autenticación (opcional, si no usas auth.js)
export const login = async (credentials) => {
  return api.post('/api/auth/login', credentials);
};

export const register = async (userData) => {
  return api.post('/api/auth/register', userData);
};

export default api;