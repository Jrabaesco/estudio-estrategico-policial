import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchQuestionsByTopic = async (topicId) => {
  try {
    const response = await api.get(`/questions/topic/${topicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const fetchRandomQuestions = async (topicId, count) => {
  try {
    const response = await api.get(`/questions/random/${topicId}/${count}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
};

export const fetchTopic = async (topicId) => {
  try {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
};

export default api;