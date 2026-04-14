import apiClient from './apiClient';

export const authService = {
  login: (payload) => apiClient.post('/auth/login', payload),
  me: () => apiClient.get('/auth/me'),
  seedDemo: () => apiClient.post('/auth/seed-demo'),
};
