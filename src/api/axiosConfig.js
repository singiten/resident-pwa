// src/api/axiosConfig.js
import axios from 'axios';

const API_URL = 'https://backend-nzav.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;

export const api = {
  auth: {
    login: (data) => axiosInstance.post('/auth/login', data),
    register: (data) => axiosInstance.post('/auth/register', data),
    logout: () => axiosInstance.post('/auth/logout'),
    me: () => axiosInstance.get('/auth/me'),
    updateProfile: (data) =>
      axiosInstance.patch('/auth/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
    resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  },

  condos: {
    getAll: () => axiosInstance.get('/condos'),
    getById: (id) => axiosInstance.get(`/condos/${id}`),
    getByCode: (code) => axiosInstance.get(`/condos/code/${code}`),
    search: (search) => axiosInstance.get('/condos/search', { params: { search } }),
    create: (data) => axiosInstance.post('/condos', data),
    update: (id, data) => axiosInstance.patch(`/condos/${id}`, data),
    toggleStatus: (id) => axiosInstance.patch(`/condos/${id}/status`),
    delete: (id) => axiosInstance.delete(`/condos/${id}`),
  },

  users: {
    // For Super Admin - all users
    getAll: (params) => axiosInstance.get('/users', { params }),
    // For Condo Admin - users in their condo
    getByCondo: (condoId, params) =>
      axiosInstance.get(`/users/${condoId}`, { params }),
    getById: (condoId, userId) =>
      axiosInstance.get(`/users/${condoId}/${userId}`),
    search: (condoId, search) =>
      axiosInstance.get(`/users/${condoId}/search`, { params: { search } }),
    verify: (condoId, userId) =>
      axiosInstance.patch(`/users/${condoId}/${userId}/verify`),
    update: (condoId, userId, data) =>
      axiosInstance.patch(`/users/${condoId}/${userId}`, data),
    delete: (condoId, userId) =>
      axiosInstance.delete(`/users/${condoId}/${userId}`),
  },

  reports: {
    getMy: (params) => axiosInstance.get('/reports/my', { params }),
    getAdminAll: (params) =>
      axiosInstance.get('/reports/admin/all', { params }),
    getById: (id) => axiosInstance.get(`/reports/${id}`),
    create: (data) =>
      axiosInstance.post('/reports', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id, data) => axiosInstance.put(`/reports/${id}`, data),
    delete: (id) => axiosInstance.delete(`/reports/${id}`),
    assign: (id, data) => axiosInstance.put(`/reports/${id}/assign`, data),
    updateStatus: (id, data) =>
      axiosInstance.put(`/reports/${id}/status`, data),
    addResponse: (id, data) =>
      axiosInstance.post(`/reports/${id}/response`, data),
  },

  payments: {
    getMy: (params) => axiosInstance.get('/payments/my', { params }),
    getAll: (params) => axiosInstance.get('/payments', { params }),
    getById: (id) => axiosInstance.get(`/payments/${id}`),
    getStatistics: (params) =>
      axiosInstance.get('/payments/statistics', { params }),
    approve: (id, data) => axiosInstance.patch(`/payments/${id}/approve`, data),
    reject: (id, data) => axiosInstance.patch(`/payments/${id}/reject`, data),
    cancel: (id) => axiosInstance.patch(`/payments/${id}/cancel`),
  },

  lostFound: {
    getAll: (params) => axiosInstance.get('/lost-found', { params }),
    getById: (id) => axiosInstance.get(`/lost-found/${id}`),
    create: (data) =>
      axiosInstance.post('/lost-found', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id, data) => axiosInstance.put(`/lost-found/${id}`, data),
    delete: (id) => axiosInstance.delete(`/lost-found/${id}`),
    claim: (id, data) => axiosInstance.post(`/lost-found/${id}/claim`, data),
    verifyClaim: (id) => axiosInstance.put(`/lost-found/${id}/verify-claim`),
  },

  promotions: {
    getAll: (params) => axiosInstance.get('/promotions', { params }),
    getById: (id) => axiosInstance.get(`/promotions/${id}`),
    create: (data) =>
      axiosInstance.post('/promotions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id, data) =>
      axiosInstance.put(`/promotions/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    delete: (id) => axiosInstance.delete(`/promotions/${id}`),
    review: (id, data) => axiosInstance.put(`/promotions/${id}/review`, data),
    trackClick: (id) => axiosInstance.post(`/promotions/${id}/click`),
  },

  announcements: {
    // ⚠️ 3 'n's in route - matches backend
    getAll: (params) => axiosInstance.get('/announncement', { params }),
    getById: (id) => axiosInstance.get(`/announncement/${id}`),
    getPinned: () => axiosInstance.get('/announncement/pinned'),
    create: (data) =>
      axiosInstance.post('/announncement', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id, data) =>
      axiosInstance.put(`/announncement/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    delete: (id) => axiosInstance.delete(`/announncement/${id}`),
  },

  equbs: {
    // Super Admin - all equbs (route has no condoId)
    getAll: (params) => axiosInstance.get('/equbs', { params }),
    // By condo
    getByCondo: (condoId, params) =>
      axiosInstance.get(`/equbs/${condoId}/equbs`, { params }),
    getPublic: (condoId, params) =>
      axiosInstance.get(`/equbs/${condoId}/equbs/public`, { params }),
    getById: (condoId, id) =>
      axiosInstance.get(`/equbs/${condoId}/equbs/${id}`),
    getPublicById: (condoId, id) =>
      axiosInstance.get(`/equbs/${condoId}/equbs/${id}/public`),
    create: (condoId, data) =>
      axiosInstance.post(`/equbs/${condoId}/equbs`, data),
    update: (condoId, id, data) =>
      axiosInstance.patch(`/equbs/${condoId}/equbs/${id}`, data),
    delete: (condoId, id) =>
      axiosInstance.delete(`/equbs/${condoId}/equbs/${id}`),
  },

  iddirs: {
    getAll: (condoId, params) =>
      condoId
        ? axiosInstance.get(`/iddirs/${condoId}/iddirs`, { params })
        : axiosInstance.get('/iddirs', { params }),
    getById: (id) => axiosInstance.get(`/iddirs/${id}`),
    create: (condoId, data) => axiosInstance.post(`/iddirs/${condoId}/iddirs`, data),
    update: (condoId, id, data) =>
      axiosInstance.patch(`/iddirs/${condoId}/iddirs/${id}`, data),
    delete: (condoId, id) =>
      axiosInstance.delete(`/iddirs/${condoId}/iddirs/${id}`),
  },
};