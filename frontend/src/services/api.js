import axios from 'axios';
import { getToken } from './auth';

// Configuración dinámica para desarrollo/producción
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos timeout
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchQuestionsByTopic = async (topicId) => {
  return api.get(`/questions/topic/${topicId}`);
};

export const fetchRandomQuestions = async (topicId, count) => {
  return api.get(`/questions/random/${topicId}/${count}`);
};

export const fetchTopic = async (topicId) => {
  return api.get(`/topics/${topicId}`);
};

export default api;