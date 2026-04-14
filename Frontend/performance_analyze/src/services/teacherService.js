import apiClient from './apiClient';

export const teacherService = {
  dashboard: () => apiClient.get('/teacher/dashboard'),
  studentDetails: (studentId) => apiClient.get(`/teacher/students/${studentId}`),
  saveRecord: (studentId, payload) => apiClient.post(`/teacher/students/${studentId}/records`, payload),
};
