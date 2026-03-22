import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  getLeaderboard: () => api.get('/auth/leaderboard'),
  updateStreak: () => api.post('/auth/streak'),
};

export const labsAPI = {
  getAll: (category) => api.get('/labs', { params: category ? { category } : {} }),
  getBySlug: (slug) => api.get(`/labs/${slug}`),
  start: (labId) => api.post('/labs/start', { labId }),
  execute: (data) => api.post('/labs/execute', data),
  submitFlag: (data) => api.post('/labs/submit', data),
  getHint: (labId) => api.post('/labs/hint', { labId }),
  getLogs: (labId) => api.get(`/labs/${labId}/logs`),
  seed: () => api.post('/labs/seed'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getDetailed: () => api.get('/dashboard/detailed'),
  resetLab: (labId) => api.post('/dashboard/reset', { labId }),
};

export const aiAPI = {
  assist: (data) => api.post('/ai/assist', data),
  chat: (data) => api.post('/ai/chat', data),
};

export const articlesAPI = {
  getAll: (params) => api.get('/articles', { params }),
  getArticles: () => api.get('/articles'),
  getBySlug: (slug) => api.get(`/articles/${slug}`),
};

export const attackAPI = {
  execute: (data) => api.post('/attack/execute', data),
  getHint: (labSlug) => api.post('/attack/hint', { labSlug }),
  getEndpoints: () => api.get('/attack/endpoints'),
};

export const defenseAPI = {
  getStatus: (labSlug) => api.get(`/defense/status/${labSlug}`),
  execute: (data) => api.post('/defense/execute', data),
  complete: (data) => api.post('/defense/complete', data),
  getInfo: (labSlug) => api.get(`/defense/info/${labSlug}`),
  getHint: (labSlug) => api.post('/defense/hint', { labSlug }),
};

export default api;
