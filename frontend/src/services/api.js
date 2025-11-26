import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Report API
export const reportAPI = {
  upload: (formData) => {
    return API.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyReports: (params) => API.get('/reports/my-reports', { params }),
  getReport: (id) => API.get(`/reports/${id}`),
  downloadReport: (id) => API.get(`/reports/${id}/download`, { responseType: 'blob' }),
  deleteReport: (id) => API.delete(`/reports/${id}`),
  accessWithShareCode: (shareCode) => API.post('/reports/access', { shareCode }),
  addNotes: (id, data) => API.put(`/reports/${id}/notes`, data),
  updateStatus: (id, status) => API.put(`/reports/${id}/status`, { status })
};

// Reminder API
export const reminderAPI = {
  create: (data) => API.post('/reminders', data),
  getAll: (params) => API.get('/reminders', { params }),
  getOne: (id) => API.get(`/reminders/${id}`),
  update: (id, data) => API.put(`/reminders/${id}`, data),
  delete: (id) => API.delete(`/reminders/${id}`),
  toggle: (id) => API.put(`/reminders/${id}/toggle`)
};

// Admin API
export const adminAPI = {
  getUsers: (params) => API.get('/admin/users', { params }),
  getPendingDoctors: () => API.get('/admin/pending-doctors'),
  verifyDoctor: (id) => API.put(`/admin/verify-doctor/${id}`),
  rejectDoctor: (id) => API.delete(`/admin/reject-doctor/${id}`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getStats: () => API.get('/admin/stats'),
  getAllReports: (params) => API.get('/admin/reports', { params })
};

// Named export for convenience
export const api = API;

export default API;