// File: frontend/src/contexts/APIContext.jsx (Updated)
import React, { createContext, useContext } from 'react';
import axios from 'axios';

const APIContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = '/api/v1';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const APIProvider = ({ children }) => {
  const api = {
    // Existing IOC and feed operations...
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
    
    feeds: {
      getAll: (params = {}) => axios.get('/feeds', { params }),
      getById: (id) => axios.get(`/feeds/${id}`),
      create: (data) => axios.post('/feeds', data),
      update: (id, data) => axios.put(`/feeds/${id}`, data),
      delete: (id) => axios.delete(`/feeds/${id}`),
      triggerUpdate: (id) => axios.post(`/feeds/${id}/update`),
      getUpdates: (id, params = {}) => axios.get(`/feeds/${id}/updates`, { params }),
      getStats: (id) => axios.get(`/feeds/${id}/stats`),
      getOpenSource: () => axios.get('/feeds/open-source'),
    },
    
    // NEW: Threat Intelligence operations
    threatIntel: {
      getThreatFamilies: (params = {}) => axios.get('/threat-intel/threat-families', { params }),
      getFamilyIOCs: (familyId) => axios.get(`/threat-intel/threat-families/${familyId}/iocs`),
      enrichIOC: (iocId) => axios.post(`/threat-intel/iocs/${iocId}/enrich`),
      getIOCEnrichment: (iocId) => axios.get(`/threat-intel/iocs/${iocId}/enrichment`),
      getEnrichmentSources: () => axios.get('/enrichment/sources'),
      createEnrichmentSource: (data) => axios.post('/enrichment/sources', data),
    },
    
    // Setup operations
    setup: {
      setupRecommendedFeeds: () => axios.post('/setup/feeds/recommended'),
      setupAllFeeds: () => axios.post('/setup/feeds/all'),
    },
    
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
