import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token store (no localStorage)
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

// Response error handler interceptor
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

// Auth Service
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Assessment Service
export const assessmentApi = {
  getQuestions: (skill) => api.get('/assessment/questions', { params: { skill } }),
  submitAssessment: (answers) => api.post('/assessment/submit', { answers }),
};

// Student Exploration & Matching Service
export const studentApi = {
  getSkillGap: (targetRole) => api.get('/student/skill-gap', { params: { target_role: targetRole } }),
  getRecommendations: () => api.get('/student/recommendations'),
  getOpportunities: (params) => api.get('/opportunities', { params }),
  getOpportunity: (id) => api.get(`/opportunities/${id}`),
  applyToOpportunity: (opportunityId) => api.post('/applications', { opportunity_id: opportunityId }),
  getMyApplications: () => api.get('/applications/mine'),
};

// Learning & Mentorship Service
export const learningApi = {
  getPrograms: () => api.get('/learning-programs'),
};

export const mentorshipApi = {
  getMentors: () => api.get('/mentors'),
  bookSlot: (slotId) => api.post(`/mentorship/book/${slotId}`),
  requestSkillExchange: (payload) => api.post('/skill-exchange', payload),
  getMySkillExchanges: () => api.get('/skill-exchange/mine'),
};

// Portfolio Service
export const portfolioApi = {
  list: () => api.get('/portfolio'),
  create: (item) => api.post('/portfolio', item),
  update: (id, item) => api.put(`/portfolio/${id}`, item),
  delete: (id) => api.delete(`/portfolio/${id}`),
};

export default api;
