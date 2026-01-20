// API Service for MDRRMO Procurement System
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Purchase API Methods ====================

/**
 * Create a new purchase
 */
export const createPurchase = async (purchaseData) => {
  try {
    const response = await api.post('/api/purchases', purchaseData);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to create purchase' 
    };
  }
};

/**
 * Get all purchases
 */
export const getPurchases = async () => {
  try {
    const response = await api.get('/api/purchases');
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to fetch purchases' 
    };
  }
};

/**
 * Get a single purchase by ID
 */
export const getPurchaseById = async (id) => {
  try {
    const response = await api.get(`/api/purchases/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to fetch purchase' 
    };
  }
};

/**
 * Update an existing purchase
 */
export const updatePurchase = async (id, purchaseData) => {
  try {
    const response = await api.put(`/api/purchases/${id}`, purchaseData);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to update purchase' 
    };
  }
};

/**
 * Update purchase status
 */
export const updatePurchaseStatus = async (id, status) => {
  try {
    const response = await api.patch(`/api/purchases/${id}/status`, { status });
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to update status' 
    };
  }
};

/**
 * Delete a purchase
 */
export const deletePurchase = async (id) => {
  try {
    const response = await api.delete(`/api/purchases/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to delete purchase' 
    };
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/purchases/stats/dashboard');
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Failed to fetch statistics' 
    };
  }
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/');
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.detail || error.message || 'Backend is not responding' 
    };
  }
};

export default api;
