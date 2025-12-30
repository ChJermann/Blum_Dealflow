import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Setup axios interceptor to always include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blum_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Deals API
export const dealsApi = {
  getAll: (params = {}) => axios.get(`${API}/deals`, { params }),
  getById: (id) => axios.get(`${API}/deals/${id}`),
  create: (data) => axios.post(`${API}/deals`, data),
  update: (id, data) => axios.put(`${API}/deals/${id}`, data),
  updateStatus: (id, status) => axios.patch(`${API}/deals/${id}/status`, { status }),
  delete: (id) => axios.delete(`${API}/deals/${id}`),
  validate: (id) => axios.get(`${API}/deals/${id}/validate`),
};

// Templates API
export const templatesApi = {
  getAll: (dealType = null) => axios.get(`${API}/templates`, { params: { deal_type: dealType } }),
  getById: (id) => axios.get(`${API}/templates/${id}`),
  create: (data) => axios.post(`${API}/templates`, data),
  delete: (id) => axios.delete(`${API}/templates/${id}`),
};

// Documents API
export const documentsApi = {
  getByDeal: (dealId) => axios.get(`${API}/deals/${dealId}/documents`),
  generate: (dealId, templateId) => axios.post(`${API}/deals/${dealId}/documents/generate/${templateId}`),
  download: (documentId) => axios.get(`${API}/documents/${documentId}/download`, { responseType: 'blob' }),
};

// Attachments API
export const attachmentsApi = {
  getByDeal: (dealId) => axios.get(`${API}/deals/${dealId}/attachments`),
  upload: (dealId, formData) => axios.post(`${API}/deals/${dealId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (attachmentId) => axios.delete(`${API}/attachments/${attachmentId}`),
};

// Chat API
export const chatApi = {
  send: (message, dealId = null) => axios.post(`${API}/chat`, { message, deal_id: dealId }),
};

// Stats API
export const statsApi = {
  get: () => axios.get(`${API}/stats`),
};

export default {
  deals: dealsApi,
  templates: templatesApi,
  documents: documentsApi,
  attachments: attachmentsApi,
  chat: chatApi,
  stats: statsApi,
};
