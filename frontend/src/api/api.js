import client from './client.js';

export const authAPI = {
  signup: (userData) => client.post('/auth/signup', userData),
  login: (credentials) => client.post('/auth/login', credentials),
  adminLogin: (credentials) => client.post('/auth/admin-login', credentials),
  getMe: () => client.get('/auth/me')
};

export const issueAPI = {
  getAll: (params) => client.get('/issues', { params }),
  getById: (id) => client.get(`/issues/${id}`),
  create: (formData) => client.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleVote: (id) => client.post(`/issues/${id}/vote`),
  getMyDashboard: () => client.get('/issues/my/dashboard')
};

export const adminAPI = {
  getIssues: (params) => client.get('/admin/issues', { params }),
  updateIssue: (id, data) => client.patch(`/admin/issues/${id}`, data),
  getAnalytics: () => client.get('/admin/analytics')
};
