
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
      const PUBLIC_ROUTES = ['/public', '/login', '/register'];
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        window.location.pathname.startsWith(route)
      );

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Only redirect if NOT already on a public page
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
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
  },

  condos: {
    getAll: () => axiosInstance.get('/condos'),
    getById: (id) => axiosInstance.get(`/condos/${id}`),
    getByCode: (code) => axiosInstance.get(`/condos/code/${code}`),
    create: (data) => axiosInstance.post('/condos', data),
    update: (id, data) => axiosInstance.patch(`/condos/${id}`, data),
    toggleStatus: (id) => axiosInstance.patch(`/condos/${id}/status`),
    delete: (id) => axiosInstance.delete(`/condos/${id}`),
  },

  users: {
    getAll: () => axiosInstance.get('/users'), // Super admin only (we will still loop to be safe)
    getByCondo: (condoId, params) => axiosInstance.get(`/users/${condoId}`, { params }),
    verify: (condoId, userId) => axiosInstance.patch(`/users/${condoId}/${userId}/verify`),
    update: (condoId, userId, data) => axiosInstance.patch(`/users/${condoId}/${userId}`, data),
    delete: (condoId, userId) => axiosInstance.delete(`/users/${condoId}/${userId}`),
    search: (condoId, search) => axiosInstance.get(`/users/${condoId}/search`, { params: { search } }),
  },

  reports: {
    getMy: (params) => axiosInstance.get('/reports/my', { params }),
    getAdminAll: (params) => axiosInstance.get('/reports/admin/all', { params }),
    getById: (id) => axiosInstance.get(`/reports/${id}`),
    updateStatus: (id, data) => axiosInstance.put(`/reports/${id}/status`, data),
    addResponse: (id, data) => axiosInstance.post(`/reports/${id}/response`, data),
  },

  payments: {
    getMy: (params) => axiosInstance.get('/payments/my', { params }),
    getAll: (params) => axiosInstance.get('/payments', { params }),
    getStatistics: () => axiosInstance.get('/payments/statistics'),
    approve: (id, data) => axiosInstance.patch(`/payments/${id}/approve`, data),
    reject: (id, data) => axiosInstance.patch(`/payments/${id}/reject`, data),
  },

  promotions: {
    getAll: (params) => axiosInstance.get('/promotions', { params }),
    create: (data) => axiosInstance.post('/promotions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    review: (id, data) => axiosInstance.put(`/promotions/${id}/review`, data),
    delete: (id) => axiosInstance.delete(`/promotions/${id}`),
  },
    rooms: {
    getAll: (params) => axiosInstance.get('/rooms', { params }), // Admin
    getPublic: (params) => axiosInstance.get('/rooms/public', { params }), // Public
    getByCondo: (condoId, params) => axiosInstance.get(`/rooms/${condoId}`, { params }),
    updateStatus: (condoId, roomId, data) => axiosInstance.patch(`/rooms/${condoId}/${roomId}/status`, data),
  },

  announcements: {
    getAll: (params) => axiosInstance.get('/announncement', { params }), // 3 n's!
    create: (data) => axiosInstance.post('/announncement', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id) => axiosInstance.delete(`/announncement/${id}`),
  },

  equbs: {
    getAll: (params) => axiosInstance.get('/equbs', { params }), // Super admin
    getByCondo: (condoId, params) => axiosInstance.get(`/equbs/${condoId}/equbs`, { params }),
    getPublic: (condoId, params) => axiosInstance.get(`/equbs/${condoId}/equbs/public`, { params }),
    create: (condoId, data) => axiosInstance.post(`/equbs/${condoId}/equbs`, data),
    update: (condoId, id, data) => axiosInstance.patch(`/equbs/${condoId}/equbs/${id}`, data),
    delete: (condoId, id) => axiosInstance.delete(`/equbs/${condoId}/equbs/${id}`),
  },

  iddirs: {
    getAll: (params) => axiosInstance.get('/iddirs', { params }),
    getByCondo: (condoId, params) => axiosInstance.get(`/iddirs/${condoId}/iddirs`, { params }),
    create: (condoId, data) => axiosInstance.post(`/iddirs/${condoId}/iddirs`, data),
  },

  equbMembers: {
    add: (data) => axiosInstance.post('/equb-members', data),
    getByCondo: (condoId) => axiosInstance.get(`/equb-members/${condoId}`),
    remove: (condoId, id) => axiosInstance.delete(`/equb-members/${condoId}/${id}`),
  },

  iddirMembers: {
    add: (data) => axiosInstance.post('/iddir-members', data),
    getByCondo: (condoId) => axiosInstance.get(`/iddir-members/${condoId}`),
    remove: (condoId, id) => axiosInstance.delete(`/iddir-members/${condoId}/${id}`),
  },
};