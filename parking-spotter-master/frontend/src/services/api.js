import axios from 'axios';
import { getApiUrl, getAuthHeaders, getEndpoint } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post(getEndpoint('AUTH', 'LOGIN'), credentials),
    register: (userData) => api.post(getEndpoint('AUTH', 'REGISTER'), userData),
    logout: () => api.post(getEndpoint('AUTH', 'LOGOUT')),
    getProfile: () => api.get(getEndpoint('AUTH', 'PROFILE')),
    updateProfile: (userData) => api.put(getEndpoint('AUTH', 'UPDATE_PROFILE'), userData),
    changePassword: (passwordData) => api.put(getEndpoint('AUTH', 'CHANGE_PASSWORD'), passwordData),
    deleteAccount: () => api.delete(getEndpoint('AUTH', 'DELETE_ACCOUNT'))
  },

  // Parking Spots
  spots: {
    getAll: (params) => api.get(getEndpoint('SPOTS', 'GET_ALL'), { params }),
    search: (params) => api.get(getEndpoint('SPOTS', 'SEARCH'), { params }),
    getNearby: (params) => api.get(getEndpoint('SPOTS', 'NEARBY'), { params }),
    getById: (id) => api.get(`${getEndpoint('SPOTS', 'GET_BY_ID')}/${id}`),
    create: (spotData) => api.post(getEndpoint('SPOTS', 'CREATE'), spotData),
    update: (id, spotData) => api.put(`${getEndpoint('SPOTS', 'UPDATE')}/${id}`, spotData),
    delete: (id) => api.delete(`${getEndpoint('SPOTS', 'DELETE')}/${id}`),
    getMySpots: () => api.get(getEndpoint('SPOTS', 'MY_SPOTS')),
    updateAvailability: (id, availability) => api.put(`${getEndpoint('SPOTS', 'UPDATE_AVAILABILITY')}/${id}/availability`, availability),
    addRating: (id, ratingData) => api.post(`${getEndpoint('SPOTS', 'ADD_RATING')}/${id}/rating`, ratingData),
    getFavorites: () => api.get(getEndpoint('SPOTS', 'FAVORITES')),
    addToFavorites: (id) => api.post(`${getEndpoint('SPOTS', 'ADD_FAVORITE')}/${id}/favorite`),
    removeFromFavorites: (id) => api.delete(`${getEndpoint('SPOTS', 'REMOVE_FAVORITE')}/${id}/favorite`),
    report: (id, reportData) => api.post(`${getEndpoint('SPOTS', 'REPORT')}/${id}/report`, reportData)
  },

  // Bookings
  bookings: {
    create: (bookingData) => api.post(getEndpoint('BOOKINGS', 'CREATE'), bookingData),
    getUserBookings: () => api.get(getEndpoint('BOOKINGS', 'GET_USER_BOOKINGS')),
    cancel: (id) => api.put(`${getEndpoint('BOOKINGS', 'CANCEL')}/${id}`)
  },

  // Payments
  payments: {
    create: (paymentData) => api.post(getEndpoint('PAYMENTS', 'CREATE'), paymentData),
    getUserPayments: () => api.get(getEndpoint('PAYMENTS', 'GET_USER_PAYMENTS')),
    getById: (id) => api.get(`${getEndpoint('PAYMENTS', 'GET_BY_ID')}/${id}`)
  },

  // Admin
  admin: {
    getDashboard: () => api.get(getEndpoint('ADMIN', 'DASHBOARD')),
    getUsers: () => api.get(getEndpoint('ADMIN', 'USERS')),
    getUserById: (id) => api.get(`${getEndpoint('ADMIN', 'USERS')}/${id}`),
    deleteUser: (id) => api.delete(`${getEndpoint('ADMIN', 'USERS')}/${id}`),
    getSpots: () => api.get(getEndpoint('ADMIN', 'SPOTS')),
    getSpotById: (id) => api.get(`${getEndpoint('ADMIN', 'SPOTS')}/${id}`)
  },

  // Location
  location: {
    process: (locationData) => api.post(getEndpoint('LOCATION', 'PROCESS'), locationData),
    getSpots: () => api.get(getEndpoint('LOCATION', 'GET_SPOTS'))
  }
};

export default api;
