import apiClient from './apiClient';

export const studentService = {
  dashboard: () => apiClient.get('/student/dashboard'),
  records: () => apiClient.get('/student/records'),
};
