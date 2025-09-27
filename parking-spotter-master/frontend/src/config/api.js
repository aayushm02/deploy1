// API Configuration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/me',
      UPDATE_PROFILE: '/auth/me',
      CHANGE_PASSWORD: '/auth/change-password',
      DELETE_ACCOUNT: '/auth/me'
    },
    
    // Parking Spots
    SPOTS: {
      GET_ALL: '/spots',
      SEARCH: '/spots/search',
      NEARBY: '/spots/nearby',
      GET_BY_ID: '/spots',
      CREATE: '/spots',
      UPDATE: '/spots',
      DELETE: '/spots',
      MY_SPOTS: '/spots/owner/my-spots',
      UPDATE_AVAILABILITY: '/spots',
      ADD_RATING: '/spots',
      FAVORITES: '/spots/user/favorites',
      ADD_FAVORITE: '/spots',
      REMOVE_FAVORITE: '/spots',
      REPORT: '/spots'
    },
    
    // Bookings
    BOOKINGS: {
      CREATE: '/bookings',
      GET_USER_BOOKINGS: '/bookings/user',
      CANCEL: '/bookings/cancel'
    },
    
    // Payments
    PAYMENTS: {
      CREATE: '/payments',
      GET_USER_PAYMENTS: '/payments/user',
      GET_BY_ID: '/payments'
    },
    
    // Admin
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      SPOTS: '/admin/spots'
    },
    
    // Location
    LOCATION: {
      PROCESS: '/location',
      GET_SPOTS: '/location/spots'
    }
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to get API endpoint
export const getEndpoint = (category, action) => {
  return API_CONFIG.ENDPOINTS[category][action];
};

export default API_CONFIG;
