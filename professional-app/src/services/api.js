import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => inMemoryToken;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status,
      message: error.response?.data?.detail || error.message || 'An unexpected error occurred',
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const proOpportunityApi = {
  list: (params) => api.get('/opportunities', { params }),
  create: (oppData) => api.post('/opportunities', oppData),
  update: (id, oppData) => api.put(`/opportunities/${id}`, oppData),
  delete: (id) => api.delete(`/opportunities/${id}`),
  getCandidates: (oppId) => api.get(`/opportunities/${oppId}/candidates`),
  updateApplicationStatus: (appId, payload) => api.patch(`/applications/${appId}`, payload),
};

export const mentorshipApi = {
  createSlot: (slotData) => api.post('/mentorship/slots', slotData),
  getMySlots: () => api.get('/mentorship/mine'),
  completeSlot: (slotId, feedback) => api.patch(`/mentorship/${slotId}/complete`, { feedback }),
  getSkillExchangeRequests: () => api.get('/skill-exchange/requests'),
  updateSkillExchange: (id, status) => api.patch(`/skill-exchange/${id}`, { status }),
};

export const learningApi = {
  createProgram: (progData) => api.post('/learning-programs', progData),
  listPrograms: () => api.get('/learning-programs'),
};

export const talentApi = {
  search: (params) => api.get('/talent/search', { params }),
};

export const collaborationApi = {
  list: () => api.get('/collaborations'),
  create: (data) => api.post('/collaborations', data),
  updateStatus: (id, status) => api.patch(`/collaborations/${id}`, { status }),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getSkillDemand: () => api.get('/analytics/skill-demand'),
};

export const demoApi = {
  resetDatabase: () => api.post('/demo/reset'),
};

export default api;
