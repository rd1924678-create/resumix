import axios from 'axios';

// Get API URL securely from environment variables
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized API Services
export const authService = {
  register: (name, email) => api.post('/api/auth/register', { name, email }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  checkSecretCode: (code) => api.post('/api/auth/check-secret-code', { code }),
  getProfile: () => api.get('/api/auth/profile'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
};

export const resumeService = {
  getAll: () => api.get('/api/resumes'),
  getById: (id) => api.get(`/api/resumes/${id}`),
  create: (data) => api.post('/api/resumes', data),
  update: (id, data) => api.put(`/api/resumes/${id}`, data),
  delete: (id) => api.delete(`/api/resumes/${id}`),
  recordDownload: (id) => api.post(`/api/resumes/${id}/download`),
  downloadPdf: (id, html) => api.post(`/api/resumes/${id}/pdf`, { html }, { responseType: 'blob' }),
};

export const adminService = {
  getAnalytics: () => api.get('/api/admin/analytics'),
  getUsers: () => api.get('/api/admin/users'),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getResumes: () => api.get('/api/admin/resumes'),
};

export const atsService = {
  scoreResume: (formData) => api.post('/api/ats/score', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  scoreBuilderResume: (resume) => api.post('/api/ats/score-builder', { resume }),
  generateRolePreset: (role, customDetails) => api.post('/api/ats/preset', { role, customDetails }),
  generateSkills: (context, currentSkills) => api.post('/api/ats/generate-skills', { context, currentSkills }),
  generateExperienceBullets: (role, company, context, type = 'experience', extra = {}) => 
    api.post('/api/ats/generate-bullets', { role, company, context, type, ...extra }),
  chatResume: (resumeText, messages) => api.post('/api/ats/chat', { resumeText, messages }),
  getPublicStats: () => api.get('/api/ats/public-stats'),
};

export default api;
