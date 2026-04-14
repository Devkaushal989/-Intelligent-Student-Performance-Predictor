import apiClient from './apiClient';

export const adminService = {
  dashboard: () => apiClient.get('/admin/dashboard'),
  users: () => apiClient.get('/admin/users'),
  createUser: (payload) => apiClient.post('/admin/users', payload),
  updateUser: (id, payload) => apiClient.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
};
