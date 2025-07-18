// File: frontend/src/contexts/APIContext.jsx
import React, { createContext, useContext } from 'react';
import axios from 'axios';

const APIContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = '/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
    return Promise.reject(error);
  }
);

export const APIProvider = ({ children }) => {
  const api = {
    // IOC operations
    iocs: {
      getAll: (params = {}) => axios.get('/iocs', { params }),
      getById: (id) => axios.get(`/iocs/${id}`),
      create: (data) => axios.post('/iocs', data),
      update: (id, data) => axios.put(`/iocs/${id}`, data),
      delete: (id) => axios.delete(`/iocs/${id}`),
      search: (searchParams) => axios.post('/iocs/search', searchParams),
      lookup: (value) => axios.get(`/iocs/lookup/${encodeURIComponent(value)}`),
      bulkCreate: (data) => axios.post('/iocs/bulk', data),
    },
    
    // Feed operations
    feeds: {
      getAll: (params = {}) => axios.get('/feeds', { params }),
      getById: (id) => axios.get(`/feeds/${id}`),
      create: (data) => axios.post('/feeds', data),
      update: (id, data) => axios.put(`/feeds/${id}`, data),
      delete: (id) => axios.delete(`/feeds/${id}`),
      triggerUpdate: (id) => axios.post(`/feeds/${id}/update`),
      getUpdates: (id, params = {}) => axios.get(`/feeds/${id}/updates`, { params }),
      getStats: (id) => axios.get(`/feeds/${id}/stats`),
    },
    
    // System operations
    system: {
      getStatus: () => axios.get('/status'),
      getHealth: () => axios.get('/health'),
    },
  };

  return (
    <APIContext.Provider value={api}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};
